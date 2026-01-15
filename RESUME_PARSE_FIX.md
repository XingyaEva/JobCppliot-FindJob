# 简历解析失败问题 - 根本原因分析与解决方案

## 📊 问题现象

从截图和日志看到：
- ✅ 后端 MinerU 解析成功：`[MinerU] 简历结构化完成，ID: mkezonlvyzdsrm7ny, 姓名: 兰兴娅`
- ❌ 前端显示：`Failed to fetch`
- ❌ 旧接口报错：`The image format is illegal and cannot be opened`

## 🔍 根本原因

### 问题1：旧API不支持PDF格式 ❌

**错误链路：**
```
前端上传PDF → Base64编码 → /api/resume/parse (type='file') 
→ resume-preprocess.ts 标记为 'application/pdf' 
→ qwen-vl-max 视觉模型 
→ 百炼API报错：图片格式非法
```

**技术原因：**
- `qwen-vl-max` 只支持图片格式（PNG/JPG/WebP）
- 不支持 `application/pdf` 的 Base64 数据
- 旧代码错误地将PDF标记为 `data:application/pdf;base64,...`

### 问题2：MinerU解析成功但前端超时 ⚠️

**现状：**
- 后端 MinerU API 已经成功解析PDF（耗时50-70秒）
- 前端可能设置的超时太短（默认30-60秒）
- 或者前端调用了错误的API接口

## ✅ 解决方案

### 方案A：使用MinerU API（强烈推荐⭐⭐⭐⭐⭐）

#### 1. 前端代码实现

**正确的PDF上传流程：**

```javascript
/**
 * 使用 MinerU 解析PDF简历
 * @param {File} file - PDF文件对象
 * @returns {Promise<Resume>} 解析后的简历对象
 */
async function parseResumeWithMinerU(file) {
  try {
    // ==================== 步骤1: 上传文件 ====================
    showLoading('正在上传简历...');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isOcr', 'true'); // 开启OCR，提高识别准确率
    
    const uploadResponse = await fetch('/api/resume/mineru/upload', {
      method: 'POST',
      body: formData,
      // 上传阶段timeout可以短一些
      signal: AbortSignal.timeout(30000), // 30秒
    });
    
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.error || '文件上传失败');
    }
    
    const uploadResult = await uploadResponse.json();
    
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || '上传失败');
    }
    
    const { batchId, fileName } = uploadResult;
    
    // ==================== 步骤2: 轮询解析结果 ====================
    showLoading(`正在解析简历，预计需要1-2分钟...<br><small>文件：${fileName}</small>`);
    
    const parseResponse = await fetch('/api/resume/mineru/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId, fileName }),
      // ⚠️ 关键：MinerU解析需要50-70秒，必须设置足够长的超时
      signal: AbortSignal.timeout(120000), // 120秒
    });
    
    if (!parseResponse.ok) {
      const errorData = await parseResponse.json();
      throw new Error(errorData.error || '简历解析失败');
    }
    
    const parseResult = await parseResponse.json();
    
    if (!parseResult.success) {
      throw new Error(parseResult.error || '解析失败');
    }
    
    hideLoading();
    showSuccess(`简历解析成功：${parseResult.resume.name}`);
    
    return parseResult.resume;
    
  } catch (error) {
    hideLoading();
    
    // 错误处理
    if (error.name === 'TimeoutError') {
      showError('⏱️ 解析超时（超过2分钟），可能是：<br>1. 文件过大<br>2. 网络不稳定<br>3. 服务繁忙<br><br>请稍后重试或联系技术支持');
    } else if (error.name === 'AbortError') {
      showError('❌ 请求被取消');
    } else {
      showError('❌ 解析失败: ' + error.message);
    }
    
    console.error('[简历解析] 失败:', error);
    throw error;
  }
}

// 使用示例
document.getElementById('resumeFileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  
  if (!file) return;
  
  // 验证文件类型
  if (!file.name.match(/\.(pdf|docx?)$/i)) {
    showError('仅支持 PDF 和 Word 文档');
    return;
  }
  
  // 验证文件大小（最大10MB）
  if (file.size > 10 * 1024 * 1024) {
    showError('文件大小不能超过 10MB');
    return;
  }
  
  try {
    const resume = await parseResumeWithMinerU(file);
    console.log('解析成功:', resume);
    
    // 刷新简历列表或跳转到简历详情页
    window.location.href = `/resume?id=${resume.id}`;
  } catch (error) {
    // 错误已在函数内处理
  }
});
```

#### 2. 全局Fetch超时配置

```javascript
// 创建一个带超时的fetch wrapper
function fetchWithTimeout(url, options = {}, timeout = 30000) {
  const defaultOptions = {
    ...options,
    signal: options.signal || AbortSignal.timeout(timeout),
  };
  
  return fetch(url, defaultOptions);
}

// 针对不同API设置不同超时
const API_TIMEOUTS = {
  '/api/resume/mineru/upload': 30000,   // 30秒
  '/api/resume/mineru/parse': 120000,   // 120秒
  '/api/job/parse': 60000,               // 60秒
  default: 30000,                        // 默认30秒
};

function smartFetch(url, options = {}) {
  const timeout = API_TIMEOUTS[url] || API_TIMEOUTS.default;
  return fetchWithTimeout(url, options, timeout);
}
```

#### 3. 用户体验优化

```javascript
// 显示进度条和预计时间
function showParsingProgress() {
  const progressHtml = `
    <div class="parsing-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="animation: progress 70s linear forwards;"></div>
      </div>
      <p class="text-gray-600 mt-2">
        ⏳ 正在解析简历中...
        <br>
        <small>预计需要 1-2 分钟，请耐心等待</small>
      </p>
    </div>
    
    <style>
      @keyframes progress {
        from { width: 0%; }
        to { width: 95%; }
      }
      .progress-bar {
        width: 100%;
        height: 4px;
        background: #e5e7eb;
        border-radius: 2px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      }
    </style>
  `;
  
  document.getElementById('loadingContent').innerHTML = progressHtml;
}
```

---

### 方案B：使用旧接口（仅支持图片）

**注意：** 旧接口已修复，现在会明确拒绝PDF文件。

```javascript
// ❌ 此接口仅支持图片格式，不支持PDF
async function parseResumeImage(imageFile) {
  const reader = new FileReader();
  
  reader.onload = async () => {
    const base64 = reader.result.split(',')[1];
    
    const response = await fetch('/api/resume/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'file',
        fileData: base64,
        fileName: imageFile.name,
      }),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      // 如果是PDF错误，提示使用MinerU
      if (result.error.includes('MinerU')) {
        showError('PDF文件请使用"上传PDF"按钮');
      } else {
        showError(result.error);
      }
    }
  };
  
  reader.readAsDataURL(imageFile);
}
```

---

## 📝 后端已修复

### 修复内容

**文件：** `src/agents/resume-preprocess.ts`

```typescript
// ✅ 修复后：明确拒绝PDF，提示使用MinerU
if (input.fileName?.toLowerCase().endsWith('.pdf')) {
  throw new Error('此接口不支持PDF文件，请使用 MinerU API (/api/resume/mineru/upload)');
}
```

**效果：**
- 旧接口尝试上传PDF会立即返回清晰的错误提示
- 前端可以根据错误信息引导用户使用正确的接口

---

## 🎯 推荐方案总结

| 文件类型 | 推荐API | 接口路径 | 超时设置 |
|---------|---------|----------|---------|
| **PDF文档** | MinerU | `/api/resume/mineru/*` | 120秒 |
| **Word文档** | MinerU | `/api/resume/mineru/*` | 120秒 |
| **图片截图** | 旧接口 | `/api/resume/parse` | 30秒 |
| **文本粘贴** | 旧接口 | `/api/resume/parse` | 30秒 |

---

## ⚡ 快速检查清单

### 前端检查项

- [ ] PDF上传是否使用 `/api/resume/mineru/upload` + `/parse` 流程
- [ ] 解析接口超时是否设置为 120秒以上
- [ ] 是否有清晰的加载提示（预计1-2分钟）
- [ ] 错误处理是否区分了超时、取消、服务错误等场景
- [ ] 是否限制了文件大小（建议≤10MB）

### 后端检查项

- [x] MinerU接口已实现且工作正常 ✅
- [x] 旧接口已添加PDF拒绝逻辑 ✅
- [x] 错误信息清晰明确 ✅

---

## 🐛 调试方法

### 1. 查看浏览器控制台

```javascript
// 在开发者工具Console中执行
console.log('API Timeouts:', API_TIMEOUTS);

// 监控所有fetch请求
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('[Fetch]', args[0], 'started at', new Date().toISOString());
  const start = Date.now();
  
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('[Fetch]', args[0], 'completed in', Date.now() - start, 'ms');
      return response;
    })
    .catch(error => {
      console.error('[Fetch]', args[0], 'failed after', Date.now() - start, 'ms:', error);
      throw error;
    });
};
```

### 2. 查看后端日志

```bash
# 实时查看MinerU解析日志
pm2 logs job-copilot --nostream | grep MinerU

# 查看最近的错误
pm2 logs job-copilot --nostream --err | tail -50
```

### 3. 测试MinerU API

```bash
# 测试上传（使用真实PDF文件）
curl -X POST http://localhost:3000/api/resume/mineru/upload \
  -F "file=@test.pdf" \
  -F "isOcr=true"

# 测试解析（使用返回的batchId）
curl -X POST http://localhost:3000/api/resume/mineru/parse \
  -H "Content-Type: application/json" \
  -d '{"batchId":"your-batch-id","fileName":"test.pdf"}' \
  --max-time 120
```

---

## 📚 相关文档

- MinerU API 文档：`src/core/mineru-client.ts`
- 简历路由：`src/routes/resume.ts`
- 前端代码：`public/static/app.js`

---

## ✅ 验证步骤

1. **清除浏览器缓存** - 确保使用最新前端代码
2. **上传PDF测试** - 使用真实简历PDF文件
3. **观察加载时间** - 应该在50-70秒内完成
4. **检查解析结果** - 姓名、联系方式、工作经历等是否正确

---

## 🎉 总结

**问题已解决：**
- ✅ 后端已修复旧接口的PDF误导问题
- ✅ MinerU接口工作正常，可以成功解析PDF
- ⚠️ 前端需要确认是否使用了正确的API和超时设置

**下一步行动：**
1. 检查前端代码是否按照本文档实现
2. 测试PDF上传功能
3. 如有问题，查看浏览器控制台和后端日志

---

**最后更新：** 2026-01-15
**状态：** ✅ 后端已修复，等待前端验证
