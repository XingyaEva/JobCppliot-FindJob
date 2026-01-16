# PDF 解析完整方案 - 使用 Python 微服务

## 架构设计

```
┌─────────────┐
│  前端浏览器  │
│  (上传PDF)  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────┐
│  Cloudflare Workers (后端)        │
│                                  │
│  1. 接收 PDF 文件                 │
│  2. 调用 Python 微服务            │
│  3. 获取提取的文本                │
│  4. LLM 结构化处理                │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Python 微服务 (Flask)            │
│  - pdfplumber 快速提取            │
│  - 部署在 Railway/Render          │
│  - 公网可访问                     │
└──────────────────────────────────┘
```

## 完整流程

### 1. 用户上传 PDF

前端将文件发送到 Cloudflare Workers：

```javascript
// 前端代码
const formData = new FormData();
formData.append('file', selectedFile);

const response = await fetch('/api/resume/upload', {
  method: 'POST',
  body: formData,
});
```

### 2. Workers 调用 Python 服务

```typescript
// src/routes/resume.ts

import { parsePDFWithPython, analyzePDFType, checkPythonServiceHealth } from '../core/python-client';

/**
 * POST /api/resume/upload - 智能 PDF 上传
 */
resumeRoutes.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ success: false, error: '缺少文件' }, 400);
    }
    
    console.log(`[Upload] 收到文件: ${file.name}, 大小: ${file.size}`);
    
    const resumeId = generateId();
    updateParseProgress(resumeId, 5, 'analyzing', '正在分析文档类型...');
    
    // Step 1: 快速分析 PDF 类型
    const fileBuffer = await file.arrayBuffer();
    const analysis = await analyzePDFType(fileBuffer, file.name);
    
    let cleanedText = '';
    let parseMethod = '';
    
    if (analysis.success && !analysis.is_scanned) {
      // 数字 PDF - 使用 Python 快速提取
      console.log('[Upload] 检测到数字 PDF，使用 pdfplumber 快速提取');
      updateParseProgress(resumeId, 20, 'extracting', '正在快速提取文本...');
      
      const parseResult = await parsePDFWithPython(fileBuffer, file.name);
      
      if (parseResult.success && parseResult.text) {
        cleanedText = parseResult.text;
        parseMethod = 'pdfplumber';
        console.log(`[Upload] pdfplumber 提取成功: ${parseResult.pages} 页, ${parseResult.duration_ms}ms`);
      } else {
        // pdfplumber 失败，降级到 MinerU
        console.warn('[Upload] pdfplumber 失败，降级到 MinerU');
        return await fallbackToMineru(c, file, resumeId);
      }
    } else {
      // 扫描件 - 使用 MinerU（包含 OCR）
      console.log('[Upload] 检测到扫描件，使用 MinerU + OCR');
      return await fallbackToMineru(c, file, resumeId);
    }
    
    // Step 2: LLM 结构化提取
    updateParseProgress(resumeId, 70, 'structuring', '正在提取结构化信息...');
    
    const parseResult = await executeResumeParse({ 
      cleanedText,
      fileName: file.name.replace(/\.[^/.]+$/, '').split(/[_\-\s]+/)[0]
    });
    
    if (!parseResult.success) {
      clearParseProgress(resumeId);
      return c.json({ success: false, error: parseResult.error }, 500);
    }
    
    // Step 3: 保存简历
    const resume: Resume = {
      id: resumeId,
      name: parseResult.data!.basic_info?.name || '未命名简历',
      original_file_name: file.name,
      basic_info: parseResult.data!.basic_info,
      education: parseResult.data!.education,
      work_experience: parseResult.data!.work_experience,
      projects: parseResult.data!.projects,
      skills: parseResult.data!.skills,
      ability_tags: parseResult.data!.ability_tags,
      raw_content: cleanedText,
      version: 1,
      version_tag: '基础版',
      linked_jd_ids: [],
      is_master: true,
      status: 'completed',
      created_at: now(),
      updated_at: now(),
    };
    
    updateParseProgress(resumeId, 100, 'completed', '解析完成！');
    setTimeout(() => clearParseProgress(resumeId), 5000);
    
    return c.json({
      success: true,
      resumeId,
      resume,
      parseMethod,
      message: `使用 ${parseMethod} 解析成功`,
    });
    
  } catch (error) {
    console.error('[Upload] 处理失败:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, 500);
  }
});

/**
 * 降级到 MinerU
 */
async function fallbackToMineru(c: any, file: File, resumeId: string) {
  // 调用现有的 MinerU 逻辑
  // ... （保持原有代码不变）
}
```

### 3. 前端更新

前端直接调用新接口：

```javascript
// 修改 parseBtn 点击事件
parseBtn.addEventListener('click', async function() {
  if (selectedFile) {
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    const response = await fetch('/api/resume/upload', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(`解析成功！方法: ${result.parseMethod}`);
      window.location.href = '/resume/' + result.resumeId;
    }
  }
});
```

## 部署 Python 微服务

### 方案 A: Railway.app（推荐 - 免费且简单）

1. **注册 Railway**: https://railway.app/
2. **创建项目**:
   ```bash
   cd /home/user/pdf-parser-service
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. **连接 GitHub**:
   - 在 Railway 创建新项目
   - 连接 GitHub 仓库
   - Railway 自动检测 Python 并部署
4. **获取 URL**: 
   - 例如: `https://pdf-parser-production.up.railway.app`
5. **配置环境变量**:
   在 Cloudflare Workers 的 `wrangler.jsonc` 中：
   ```jsonc
   {
     "vars": {
       "PYTHON_SERVICE_URL": "https://pdf-parser-production.up.railway.app"
     }
   }
   ```

### 方案 B: Render.com

1. 注册 Render.com
2. 创建 Web Service
3. 连接 GitHub 仓库
4. 设置构建命令: `pip install -r requirements.txt`
5. 设置启动命令: `gunicorn -w 4 -b 0.0.0.0:$PORT app:app`
6. 获取公网 URL

### 方案 C: Docker + 云服务器

如果有云服务器（阿里云、腾讯云等）：

```bash
# SSH 到服务器
ssh user@your-server.com

# 克隆代码
git clone https://github.com/your-repo/pdf-parser-service
cd pdf-parser-service

# 构建并运行 Docker
docker build -t pdf-parser .
docker run -d -p 8080:8080 --name pdf-parser pdf-parser

# 配置 Nginx 反向代理（可选）
```

## 本地测试

在部署前，先本地测试：

```bash
cd /home/user/pdf-parser-service

# 安装依赖
pip install -r requirements.txt

# 启动服务
python app.py

# 测试（另一个终端）
curl -X POST http://localhost:8080/parse \
  -F "file=@/path/to/resume.pdf"
```

## 成本估算

### Railway.app 免费额度
- ✅ 500 小时/月免费运行时间
- ✅ 足够支持 1000+ 次解析/月
- ✅ 自动休眠，按需唤醒

### Render.com 免费版
- ✅ 750 小时/月
- ⚠️ 15 分钟无请求后休眠
- ⚠️ 冷启动需要 30-60 秒

## 性能对比

| 方案 | 速度 | 成本 | 维护 | 推荐度 |
|------|------|------|------|--------|
| Python 微服务 (pdfplumber) | ⭐⭐⭐⭐⭐ 5-10s | 免费 | 中 | ⭐⭐⭐⭐⭐ |
| 前端 pdf.js | ⭐⭐⭐⭐ 5-10s | 免费 | 低 | ⭐⭐⭐⭐ |
| MinerU | ⭐⭐ 45-60s | 付费 | 低 | ⭐⭐⭐ |

## 优势总结

### ✅ 使用 Python 微服务的好处

1. **专业工具**: pdfplumber 比 pdf.js 更强大
2. **速度快**: 5-10 秒完成 90% 的简历
3. **独立扩展**: 不占用 Workers 资源
4. **易于维护**: Python 生态成熟
5. **免费部署**: Railway、Render 都有免费额度

### ⚠️ 注意事项

1. **冷启动**: 免费服务可能有冷启动延迟
2. **网络延迟**: Workers → Python 服务有网络开销
3. **可用性**: 依赖第三方平台

## 最终推荐方案

**三层架构 + Python 微服务**：

1. **第一层（80%）**: Python pdfplumber → 5-10秒
2. **第二层（10%）**: 前端 pdf.js + Gemini Vision → 20-30秒
3. **第三层（10%）**: MinerU 备选 → 45-60秒

这样结合了三种方案的优点，达到最佳性能！
