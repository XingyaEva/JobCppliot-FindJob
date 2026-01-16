# PDF 解析优化方案 - 完整实施指南

## 当前问题

您提到的问题核心是：**现在所有 PDF 都使用 MinerU 解析，速度慢（45-60秒）且不分类型**。

从代码分析：
- 前端代码（2453行）：直接调用 `/api/resume/mineru/upload`
- 后端路由（resume.ts 141行）：所有 PDF 都走 MinerU 流程
- 缺少快速路径：没有针对数字 PDF 的快速解析方案

## 您建议的三层解析策略

1. **第一层：快速工具** - 针对数字 PDF（90%的简历），5-10秒
2. **第二层：视觉模型** - 针对扫描件，15-20秒  
3. **第三层：MinerU** - 备选方案，45-60秒

## Cloudflare Workers 环境限制分析

经过分析，Cloudflare Workers 有以下限制：

### ❌ 不支持的方案
- **Python 库（pdfplumber）** - Workers 只支持 JavaScript
- **pdf.js 渲染图片** - Workers 没有 Canvas API
- **后端 PDF 转图片** - 需要 Canvas 或外部服务

### ✅ 可行的方案  
- **pdf.js 文本提取** - 纯 JS，可在 Workers 运行（但有限制）
- **前端 pdf.js** - 完整功能，包括 Canvas 渲染
- **调用外部 API** - Fetch 调用第三方服务
- **MinerU API** - 已实现，作为备选

## 最佳实施方案：前端主导架构

### 核心思路

**让前端完成 PDF 预处理，后端只负责文本解析和结构化**

### 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    用户上传 PDF 文件                          │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│             前端 pdf.js 快速文本提取 (2-5秒)                 │
│                                                              │
│  - 使用 pdf.js 的 getTextContent() API                       │
│  - 提取所有页面的纯文本                                       │
│  - 无需 Canvas，纯文本操作                                   │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              前端质量检测 (1秒内)                             │
│                                                              │
│  检测维度：                                                   │
│  1. 文本长度（< 100字符 = 扫描件）                           │
│  2. 关键字段（姓名、电话、教育、工作）                        │
│  3. 乱码检测（特殊字符比例）                                  │
│  4. 结构完整性（段落数量）                                    │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
              ┌────────┴────────┐
              ▼                 ▼
     质量良好 (80%)      质量不佳 (20%)
              │                 │
              ▼                 ▼
┌──────────────────────┐  ┌──────────────────────┐
│  路径 1: 文本模式     │  │  路径 2: 图片模式     │
│                      │  │                      │
│  发送到后端:         │  │  前端 pdf.js 渲染:   │
│  POST /api/resume/   │  │  - 将 PDF 渲染为    │
│      parse           │  │    PNG 图片         │
│  {                   │  │  - 使用 Canvas API  │
│    type: 'text',     │  │  - 5-10秒完成       │
│    content: '...',   │  │                      │
│    method: 'pdfjs'   │  │  发送到后端:         │
│  }                   │  │  POST /api/resume/   │
│                      │  │      parse           │
│  后端处理 (5-10s):   │  │  {                   │
│  - 简单文本清洗      │  │    type: 'image',    │
│  - LLM 结构化提取    │  │    images: ['...']   │
│                      │  │  }                   │
│  ✅ 总耗时: 5-10秒  │  │                      │
└──────────────────────┘  │  后端处理 (15-20s):  │
                          │  - Gemini Vision识别 │
                          │  - LLM 结构化提取    │
                          │                      │
                          │  ✅ 总耗时: 20-30秒 │
                          └──────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           路径 3: MinerU 备选 (手动触发或自动降级)            │
│                                                              │
│  触发条件：                                                   │
│  - 用户勾选"使用深度解析"选项                                 │
│  - 前端解析失败自动降级                                       │
│  - 复杂文档（超过 10 页，多图表）                            │
│                                                              │
│  POST /api/resume/mineru/upload                             │
│  - 上传 PDF 到 MinerU                                        │
│  - 等待解析完成                                              │
│  - 返回 Markdown 格式                                        │
│                                                              │
│  ⚠️ 总耗时: 45-60秒                                         │
└─────────────────────────────────────────────────────────────┘
```

### 详细实施步骤

#### Step 1: 前端添加 pdf.js 文本提取

```javascript
// public/static/resume-upload.js

/**
 * 使用 pdf.js 提取 PDF 文本
 * 注意：只提取文本，不渲染图片，速度快
 */
async function extractPDFText(file) {
  const startTime = Date.now();
  console.log('[pdf.js] 开始提取文本...');
  
  try {
    // 加载 pdf.js 库
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    
    // 读取文件
    const arrayBuffer = await file.arrayBuffer();
    
    // 加载 PDF 文档
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    console.log(\`[pdf.js] 文档加载成功，共 \${pdf.numPages} 页\`);
    
    let fullText = '';
    
    // 提取所有页面的文本
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // 拼接文本，保留空格
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      
      fullText += pageText + '\\n\\n';
    }
    
    const duration = Date.now() - startTime;
    console.log(\`[pdf.js] 文本提取完成，耗时 \${duration}ms，长度 \${fullText.length}\`);
    
    return {
      success: true,
      text: fullText.trim(),
      pages: pdf.numPages,
      duration,
    };
  } catch (error) {
    console.error('[pdf.js] 文本提取失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 检测文本质量
 */
function assessTextQuality(text) {
  // 1. 检查文本长度
  if (text.length < 100) {
    return {
      isGood: false,
      isScanned: true,
      confidence: 0.9,
      reason: '文本过短，可能是扫描件或图片PDF',
    };
  }
  
  // 2. 检查关键字段
  const keywords = ['姓名', '电话', '邮箱', '教育', '工作', '项目', '技能', '经验'];
  const matches = keywords.filter(k => text.includes(k)).length;
  
  if (matches < 2) {
    return {
      isGood: false,
      isScanned: true,
      confidence: 0.7,
      reason: \`缺少关键字段（仅匹配 \${matches}/\${keywords.length}）\`,
    };
  }
  
  // 3. 检查乱码（特殊字符比例）
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const normalChars = chineseChars + englishChars;
  const normalRatio = normalChars / text.length;
  
  if (normalRatio < 0.7) {
    return {
      isGood: false,
      isScanned: false,
      confidence: 0.8,
      reason: \`文本质量差（正常字符占比 \${(normalRatio * 100).toFixed(1)}%）\`,
    };
  }
  
  // 4. 检查结构化程度
  const lines = text.split('\\n').filter(l => l.trim().length > 0);
  
  if (lines.length < 10) {
    return {
      isGood: false,
      isScanned: true,
      confidence: 0.6,
      reason: '段落过少，可能缺少结构信息',
    };
  }
  
  return {
    isGood: true,
    isScanned: false,
    confidence: 0.9,
    reason: '文本质量良好',
  };
}

/**
 * 渲染 PDF 为图片（用于扫描件）
 */
async function renderPDFToImages(file) {
  console.log('[pdf.js] 开始渲染为图片...');
  
  try {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const images = [];
    
    // 渲染每一页（可选择只渲染前几页以节省时间）
    const maxPages = Math.min(pdf.numPages, 5); // 最多渲染5页
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // 2倍分辨率
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
      
      const dataUrl = canvas.toDataURL('image/png');
      images.push(dataUrl);
      
      console.log(\`[pdf.js] 页面 \${pageNum}/\${maxPages} 渲染完成\`);
    }
    
    return {
      success: true,
      images,
      pages: pdf.numPages,
    };
  } catch (error) {
    console.error('[pdf.js] 渲染失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 智能 PDF 处理主流程
 */
async function smartPDFParse(file, options = {}) {
  const { forceMineru = false } = options;
  
  // 如果用户强制使用 MinerU，直接跳转
  if (forceMineru) {
    console.log('[Smart Parse] 用户选择使用 MinerU 深度解析');
    return await uploadToMineru(file);
  }
  
  // Step 1: 尝试快速文本提取
  console.log('[Smart Parse] Phase 1: 尝试 pdf.js 快速提取...');
  const extractResult = await extractPDFText(file);
  
  if (!extractResult.success) {
    console.warn('[Smart Parse] pdf.js 提取失败，降级到 MinerU');
    return await uploadToMineru(file);
  }
  
  // Step 2: 质量检测
  console.log('[Smart Parse] Phase 2: 检测文本质量...');
  const quality = assessTextQuality(extractResult.text);
  
  console.log(\`[Smart Parse] 质量评估: \${quality.reason}（置信度 \${quality.confidence}）\`);
  
  // Step 3: 根据质量选择路径
  if (quality.isGood) {
    // 路径 1: 文本模式（快速）
    console.log('[Smart Parse] ✅ 使用快速文本模式');
    
    return await fetch('/api/resume/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'text',
        content: extractResult.text,
        metadata: {
          method: 'pdfjs-text',
          pages: extractResult.pages,
          extractionTime: extractResult.duration,
        },
      }),
    }).then(res => res.json());
  }
  
  if (quality.isScanned) {
    // 路径 2: 图片模式（扫描件）
    console.log('[Smart Parse] 📷 检测到扫描件，渲染为图片...');
    
    const renderResult = await renderPDFToImages(file);
    
    if (!renderResult.success) {
      console.warn('[Smart Parse] 渲染失败，降级到 MinerU');
      return await uploadToMineru(file);
    }
    
    return await fetch('/api/resume/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'image',
        images: renderResult.images,
        metadata: {
          method: 'pdfjs-vision',
          pages: renderResult.pages,
        },
      }),
    }).then(res => res.json());
  }
  
  // 路径 3: 质量不确定，使用 MinerU
  console.log('[Smart Parse] ⚠️ 文本质量不确定，使用 MinerU 深度解析');
  return await uploadToMineru(file);
}

/**
 * 上传到 MinerU（备选方案）
 */
async function uploadToMineru(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const uploadRes = await fetch('/api/resume/mineru/upload', {
    method: 'POST',
    body: formData,
  });
  
  const uploadData = await uploadRes.json();
  
  if (!uploadData.success) {
    throw new Error(uploadData.error || 'MinerU 上传失败');
  }
  
  // 轮询解析结果
  const parseRes = await fetch('/api/resume/mineru/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      batchId: uploadData.batchId,
      fileName: file.name,
      resumeId: uploadData.resumeId,
    }),
  });
  
  return await parseRes.json();
}
```

#### Step 2: 修改前端上传页面

```typescript
// src/index.tsx (2419行开始的 parseBtn 点击事件)

// 修改后的代码：
parseBtn.addEventListener('click', async function() {
  const text = textInput.value.trim();
  
  if (!text && !selectedFile) {
    alert('请上传简历文件或粘贴简历文本');
    return;
  }
  
  if (isParsing) return;
  isParsing = true;

  parseBtn.disabled = true;
  parseBtn.innerHTML = '<i class="fas fa-spinner loading-spinner mr-2"></i>解析中...';
  progressArea.classList.remove('hidden');
  errorArea.classList.add('hidden');

  try {
    let result;
    
    if (text) {
      // 文本模式：直接发送
      result = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'text',
          content: text,
        }),
      }).then(res => res.json());
    } else if (selectedFile) {
      // 文件模式：使用智能解析
      const forceMinerU = document.getElementById('force-mineru-checkbox')?.checked || false;
      result = await smartPDFParse(selectedFile, { forceMineru: forceMinerU });
    }
    
    if (result.success) {
      // 保存到 localStorage
      const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
      resumes.unshift(result.resume);
      localStorage.setItem('jobcopilot_resumes', JSON.stringify(resumes));
      
      // 显示成功提示
      alert(\`简历解析成功！\\n方法: \${result.parseMethod || 'unknown'}\\n耗时: \${result.duration_ms || 0}ms\`);
      
      // 跳转到详情页
      window.location.href = '/resume/' + result.resumeId;
    } else {
      throw new Error(result.error || '解析失败');
    }
  } catch (error) {
    console.error('[解析] 失败:', error);
    errorMessage.textContent = error.message;
    errorArea.classList.remove('hidden');
  } finally {
    isParsing = false;
    parseBtn.disabled = false;
    parseBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>解析简历';
    progressArea.classList.add('hidden');
  }
});
```

#### Step 3: 在 HTML 中添加选项

```tsx
// src/index.tsx (上传区域增加选项)

{/* 文件上传 */}
<div 
  id="upload-area"
  class="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer mb-4"
>
  {/* ... 现有的上传代码 ... */}
</div>

{/* 新增：MinerU 选项 */}
<div class="mb-6 flex items-center justify-center gap-2 text-sm">
  <label class="flex items-center gap-2 cursor-pointer">
    <input 
      type="checkbox" 
      id="force-mineru-checkbox" 
      class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
    />
    <span class="text-gray-600">
      使用深度解析 
      <span class="text-gray-400">(速度慢但更全面，适合复杂文档)</span>
    </span>
  </label>
</div>
```

#### Step 4: 修改后端 parse 接口

```typescript
// src/routes/resume.ts

/**
 * POST /api/resume/parse - 统一解析接口（新增图片模式支持）
 */
resumeRoutes.post('/parse', async (c) => {
  try {
    const body = await c.req.json();
    const { type, content, images, metadata } = body;

    const resumeId = generateId();
    let cleanedText = '';
    let parseMethod = '';

    // 情况 1: 文本模式（前端已提取，最快）
    if (type === 'text' && content) {
      console.log('[Parse] 文本模式，直接结构化');
      parseMethod = metadata?.method || 'text';
      
      // 简单清洗
      cleanedText = content
        .replace(/\\r\\n/g, '\\n')
        .replace(/\\n{3,}/g, '\\n\\n')
        .trim();
      
      updateParseProgress(resumeId, 50, 'structuring', '正在提取结构化信息...');
    }
    
    // 情况 2: 图片模式（扫描件，使用 Vision）
    else if (type === 'image' && images && images.length > 0) {
      console.log('[Parse] 图片模式，使用 Gemini Vision');
      parseMethod = 'gemini-vision';
      
      updateParseProgress(resumeId, 20, 'vision', '正在识别图片内容...');
      
      const { chatWithImage } = await import('../core/api-client');
      
      const systemPrompt = \`你是专业的简历识别专家。请完整识别图片中的所有简历内容，包括姓名、联系方式、教育背景、工作经历、项目经验、技能等。保持原有的结构和层次。\`;
      
      // 如果有多页，只识别第一页（或合并多页）
      const imageUrl = images[0];
      
      cleanedText = await chatWithImage(
        systemPrompt,
        '请识别这份简历中的所有内容。',
        imageUrl,
        { agentId: 'resume-parse-image' }
      );
      
      updateParseProgress(resumeId, 70, 'structuring', '正在提取结构化信息...');
    }
    
    else {
      return c.json({ success: false, error: '无效的参数' }, 400);
    }

    // 结构化提取
    const parseResult = await executeResumeParse({ cleanedText });

    if (!parseResult.success) {
      clearParseProgress(resumeId);
      return c.json({ success: false, error: parseResult.error }, 500);
    }

    // 创建简历记录
    const resume: Resume = {
      id: resumeId,
      name: parseResult.data!.basic_info?.name || '未命名简历',
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

    console.log(\`[Parse] 解析完成，方法: \${parseMethod}, 耗时: \${metadata?.extractionTime || 0}ms\`);

    return c.json({
      success: true,
      resumeId,
      resume,
      parseMethod,
      duration_ms: metadata?.extractionTime || 0,
    });
  } catch (error) {
    console.error('[Parse] 解析失败:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, 500);
  }
});
```

#### Step 5: 在 HTML 中引入 pdf.js

```tsx
// src/index.tsx (在 head 部分添加)

<script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js"></script>
<script src="/static/resume-upload.js"></script>
```

## 预期效果

| 文档类型 | 处理方法 | 耗时 | 占比 | 说明 |
|---------|----------|------|------|------|
| 数字 PDF（清晰） | pdf.js 文本提取 | 5-10秒 | 80% | 纯文本 PDF，无需 OCR |
| 数字 PDF（复杂布局） | pdf.js + Gemini Vision | 20-30秒 | 10% | 文本质量差，渲染后识别 |
| 扫描件 | pdf.js 渲染 + Gemini Vision | 20-30秒 | 5% | 图片 PDF，需要 OCR |
| 复杂文档/手动选择 | MinerU | 45-60秒 | 5% | 用户勾选或自动降级 |

**平均解析时间：从 45秒 降低到 10秒 左右（约 78% 提升）**

## 实施建议

1. **先实施 Step 1-3**（前端智能解析）
2. **测试文本模式和图片模式**
3. **保留 MinerU 作为备选**（用户可手动选择）
4. **收集数据分析各路径的使用率**

## 兼容性

- ✅ 完全向后兼容
- ✅ 现有 MinerU 接口不变
- ✅ 用户可自由选择解析方式
- ✅ 自动降级机制保证成功率
