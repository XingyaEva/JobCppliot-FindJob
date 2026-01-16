# PDF 解析策略 V2 - 前后端协作方案

## 问题分析

当前方案的主要问题：
1. **全部使用 MinerU**：速度慢（45-60秒），成本高
2. **未区分文档类型**：数字 PDF 和扫描件用同一个方法
3. **缺少快速路径**：90% 的数字 PDF 可以 5-10 秒解析完成

## Cloudflare Workers 环境限制

**不支持的功能：**
- ❌ Python 代码（pdfplumber）
- ❌ Canvas API（pdf.js 渲染图片）
- ❌ 文件系统操作
- ❌ 长时间运行的进程

**支持的功能：**
- ✅ Fetch API（调用外部服务）
- ✅ ArrayBuffer 操作
- ✅ 纯 JavaScript 库（pdf.js 文本提取）

## 新策略：三层解析方案

### 方案 A：前端主导（推荐）

**前端负责：**
1. **快速检测**：使用 pdf.js 尝试文本提取（2-5秒）
2. **质量评估**：检测提取文本是否完整
3. **分支选择**：
   - 如果文本完整 → 直接发送文本到后端
   - 如果文本不完整 → 使用 pdf.js 渲染为图片
   - 如果是扫描件 → 直接渲染为图片

**后端负责：**
1. **文本模式**：接收前端提取的文本，直接结构化（快速）
2. **图片模式**：接收图片 Base64，调用 Gemini Vision 识别（中速）
3. **MinerU 模式**：接收 PDF 文件，上传到 MinerU（慢速，备选）

### 方案 B：后端主导（当前）

**后端负责所有解析：**
1. **pdf.js 文本提取**：仅提取文本，不渲染图片（受限）
2. **MinerU 解析**：全功能解析（慢速但可靠）

**限制：**
- 无法处理扫描件（没有 Vision 能力）
- 无法将 PDF 转为图片（没有 Canvas）

## 推荐实现方案

### 架构设计

```
前端 (Browser)                后端 (Cloudflare Workers)
     |                                  |
     | 1. 用户上传 PDF                  |
     |                                  |
     | 2. pdf.js 快速提取文本           |
     |    (2-5秒)                       |
     |                                  |
     | 3. 质量检测                      |
     |    - 文本长度                    |
     |    - 关键字段                    |
     |    - 结构完整性                  |
     |                                  |
     |----[分支决策]---------------------|
     |                                  |
情况1: 文本完整 ✅                     |
     | POST /api/resume/parse          |
     | { type: 'text', content: '...'} |
     |                                  |----> 文本清洗
     |                                  |----> 结构化提取
     |                                  |<---- 返回结果 (5s)
     |                                  |
情况2: 需要视觉识别 👁                 |
     | pdf.js 渲染为图片                |
     | (Canvas API, 5-10秒)             |
     |                                  |
     | POST /api/resume/parse          |
     | { type: 'image', data: '...' }  |
     |                                  |----> Gemini Vision
     |                                  |----> 结构化提取
     |                                  |<---- 返回结果 (15-20s)
     |                                  |
情况3: MinerU 备选方案 📄              |
     | POST /api/resume/mineru/upload  |
     | FormData(file)                  |
     |                                  |----> MinerU API
     |                                  |----> 等待解析
     |                                  |----> 结构化提取
     |                                  |<---- 返回结果 (45-60s)
```

### API 接口设计

#### 1. 统一解析接口（推荐）

```typescript
POST /api/resume/parse

// 情况 1: 文本模式（前端已提取）
{
  "type": "text",
  "content": "姓名：张三\n电话：138...",
  "metadata": {
    "method": "pdfjs",
    "pages": 2,
    "extractionTime": 3000
  }
}

// 情况 2: 图片模式（扫描件或复杂布局）
{
  "type": "image",
  "images": ["data:image/png;base64,..."],
  "metadata": {
    "method": "pdfjs-render",
    "pages": 2
  }
}

// 情况 3: 文件模式（需要 MinerU）
{
  "type": "file",
  "fileUrl": "https://...",
  "fileName": "resume.pdf",
  "forceMineru": true
}

返回：
{
  "success": true,
  "resumeId": "xxx",
  "resume": { ... },
  "parseMethod": "pdfjs" | "vision" | "mineru",
  "duration_ms": 5000
}
```

#### 2. MinerU 专用接口（备选）

```typescript
POST /api/resume/mineru/upload
- 保持当前逻辑不变
- 用于复杂文档或前端解析失败时
```

### 前端实现关键代码

```typescript
// 1. PDF 上传后的处理流程
async function handlePDFUpload(file: File) {
  // Step 1: 使用 pdf.js 快速提取文本
  const extractResult = await extractTextFromPDF(file);
  
  if (!extractResult.success) {
    // 提取失败，回退到 MinerU
    return uploadToMineru(file);
  }
  
  // Step 2: 质量检测
  const quality = assessTextQuality(extractResult.text);
  
  if (quality.isGood) {
    // 情况 1: 文本质量好，直接发送到后端
    console.log('✅ 文本提取成功，使用快速模式');
    return parseByText(extractResult.text);
  }
  
  if (quality.isScanned) {
    // 情况 2: 检测到扫描件，渲染为图片
    console.log('📷 检测到扫描件，使用视觉识别模式');
    const images = await renderPDFToImages(file);
    return parseByImages(images);
  }
  
  // 情况 3: 质量不确定，使用 MinerU
  console.log('📄 使用 MinerU 深度解析');
  return uploadToMineru(file);
}

// 2. 使用 pdf.js 提取文本
async function extractTextFromPDF(file: File): Promise<{
  success: boolean;
  text?: string;
  pages?: number;
  error?: string;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    
    return {
      success: true,
      text: fullText.trim(),
      pages: pdf.numPages,
    };
  } catch (error) {
    console.error('pdf.js 提取失败:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// 3. 文本质量评估
function assessTextQuality(text: string): {
  isGood: boolean;
  isScanned: boolean;
  confidence: number;
  reason: string;
} {
  // 检查 1: 文本长度
  if (text.length < 100) {
    return {
      isGood: false,
      isScanned: true,
      confidence: 0.9,
      reason: '文本过短，可能是扫描件',
    };
  }
  
  // 检查 2: 关键字段
  const keywords = ['姓名', '电话', '邮箱', '教育', '工作', '项目'];
  const matches = keywords.filter(k => text.includes(k)).length;
  
  if (matches < 2) {
    return {
      isGood: false,
      isScanned: true,
      confidence: 0.7,
      reason: '缺少关键字段',
    };
  }
  
  // 检查 3: 乱码检测
  const specialChars = text.match(/[^\u4e00-\u9fa5a-zA-Z0-9\s\.\,\;\:\-\+\@\(\)]/g) || [];
  const specialCharRatio = specialChars.length / text.length;
  
  if (specialCharRatio > 0.1) {
    return {
      isGood: false,
      isScanned: false,
      confidence: 0.8,
      reason: '存在大量特殊字符',
    };
  }
  
  return {
    isGood: true,
    isScanned: false,
    confidence: 0.9,
    reason: '文本质量良好',
  };
}

// 4. 渲染 PDF 为图片（用于扫描件）
async function renderPDFToImages(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const images: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({ canvasContext: context, viewport }).promise;
    
    const dataUrl = canvas.toDataURL('image/png');
    images.push(dataUrl);
  }
  
  return images;
}
```

### 后端实现调整

```typescript
// src/routes/resume.ts

/**
 * POST /api/resume/parse - 统一解析接口
 */
resumeRoutes.post('/parse', async (c) => {
  try {
    const body = await c.req.json();
    const { type, content, images, fileUrl, fileName, metadata } = body;

    const resumeId = generateId();
    let cleanedText = '';
    let parseMethod = '';

    // 情况 1: 文本模式（前端已提取，最快）
    if (type === 'text' && content) {
      console.log('[Parse] 文本模式，直接结构化');
      parseMethod = metadata?.method || 'pdfjs-text';
      
      // 简单清洗即可
      cleanedText = content
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      updateParseProgress(resumeId, 50, 'structuring', '正在提取结构化信息...');
    }
    
    // 情况 2: 图片模式（扫描件，使用 Vision）
    else if (type === 'image' && images && images.length > 0) {
      console.log('[Parse] 图片模式，使用 Gemini Vision');
      parseMethod = 'gemini-vision';
      
      updateParseProgress(resumeId, 20, 'vision', '正在识别图片内容...');
      
      // 调用 Vision API
      const { chatWithImage } = await import('../core/api-client');
      
      const systemPrompt = `你是专业的简历识别专家。请完整识别图片中的所有简历内容。`;
      
      // 如果有多页，可以合并或只识别第一页
      const imageUrl = images[0];
      
      cleanedText = await chatWithImage(
        systemPrompt,
        '请识别这份简历中的所有内容。',
        imageUrl,
        { agentId: 'resume-parse-image' }
      );
      
      updateParseProgress(resumeId, 70, 'structuring', '正在提取结构化信息...');
    }
    
    // 情况 3: 文件模式（需要 MinerU）
    else if (type === 'file' && (fileUrl || fileName)) {
      console.log('[Parse] 文件模式，使用 MinerU');
      parseMethod = 'mineru';
      
      // 重定向到 MinerU 接口
      return c.json({
        success: false,
        error: '文件模式请使用 /api/resume/mineru/upload 接口',
        redirect: '/api/resume/mineru/upload',
      }, 400);
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

    console.log(`[Parse] 解析完成，方法: ${parseMethod}, 耗时: ${metadata?.extractionTime || 0}ms`);

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

## 实施步骤

### Phase 1: 前端快速路径 ✅
1. 集成 pdf.js 库到前端
2. 实现文本提取 + 质量检测
3. 文本模式直接调用后端（5-10s）

### Phase 2: 视觉识别路径 🔄
1. 实现 PDF 转图片（Canvas）
2. 图片模式调用后端 Gemini Vision（15-20s）

### Phase 3: MinerU 保留为备选 📄
1. 保持现有 MinerU 接口不变
2. 仅在前端解析失败时使用（45-60s）

## 预期效果

| 文档类型 | 方法 | 耗时 | 占比 |
|---------|------|------|------|
| 数字 PDF（清晰）| pdf.js 文本提取 | 5-10s | 80% |
| 数字 PDF（复杂布局）| pdf.js + Vision | 15-20s | 10% |
| 扫描件 | pdf.js 渲染 + Vision | 20-30s | 5% |
| 复杂文档 | MinerU | 45-60s | 5% |

**平均解析时间：从 45s 降低到 10s 左右**

## 兼容性说明

- 保留现有所有接口
- 前端可逐步升级，不影响现有功能
- MinerU 作为备选方案持续可用
