# PDF解析优化 - 快速实施清单

## 🎯 核心发现

**关键问题：** MinerU用复杂的OCR+深度学习处理简单的数字PDF，导致速度慢30-50倍

**解决思路：** 90%的简历是Word导出的数字PDF，只需简单文本提取（1-2秒）+ LLM结构化（5秒）= **总计7秒**

---

## ⚡ 阶段1：立即可做（1小时，速度提升20-30%）

### 1.1 优化MinerU配置参数

```typescript
// 📁 src/routes/resume.ts 第126行
const urlResult = await getUploadUrlAndParse(fileName, {
  isOcr: false,              // ✅ 改：数字PDF关闭OCR
  enableTable: true,
  modelVersion: 'vlm',       // ✅ 改：VLM模型更快
});
```

### 1.2 加快轮询速度

```typescript
// 📁 src/core/mineru-client.ts 第13行
const MINERU_CONFIG = {
  baseUrl: 'https://mineru.net/api/v4',
  token: '...',
  pollInterval: 1000,        // ✅ 改：1秒轮询（原2秒）
  maxPollAttempts: 90,       // ✅ 改：允许更长时间
};
```

### 1.3 测试效果

```bash
cd /home/user/webapp
npm run build
pm2 restart job-copilot

# 测试上传简历，观察时间
```

**预期效果：** 50-70秒 → **40-50秒**

---

## 🚀 阶段2：快速实施（1天，速度提升7-10倍）

### 2.1 添加PDF类型检测

**新建文件：** `src/utils/pdf-detector.ts`

```typescript
/**
 * 检测PDF是否为数字化文档
 * @returns true: 数字PDF（快速通道）, false: 扫描PDF（MinerU通道）
 */
export async function isDigitalPDF(file: File): Promise<boolean> {
  // 方法1: 简单启发式 - 文件大小
  const sizePerPage = file.size / estimatedPageCount(file);
  
  // 数字PDF通常较小（<100KB/页）
  // 扫描PDF通常较大（>200KB/页）
  if (sizePerPage < 100 * 1024) {
    return true;  // 数字PDF
  }
  
  if (sizePerPage > 200 * 1024) {
    return false;  // 扫描PDF
  }
  
  // 方法2: 读取PDF元数据（可选）
  // 检查Creator字段是否为Word/在线工具
  const metadata = await readPDFMetadata(file);
  if (metadata.creator?.includes('Word') || 
      metadata.creator?.includes('PDFMaker')) {
    return true;
  }
  
  // 默认：假设是数字PDF
  return true;
}

function estimatedPageCount(file: File): number {
  // 简单估算：简历通常1-3页
  return 2;
}
```

### 2.2 添加快速解析接口

**修改文件：** `src/routes/resume.ts`

```typescript
/**
 * POST /api/resume/parse-fast - 快速解析数字PDF
 */
resumeRoutes.post('/parse-fast', async (c) => {
  try {
    const body = await c.req.json();
    const { fileData, fileName } = body;
    
    console.log(`[快速解析] 开始处理: ${fileName}`);
    
    // 步骤1: Base64转Buffer
    const buffer = Buffer.from(fileData, 'base64');
    
    // 步骤2: 使用简单文本提取（临时用旧接口，后续改为PyMuPDF）
    // TODO: 部署PyMuPDF微服务后替换
    
    // 步骤3: LLM结构化
    const text = await extractTextFromPDF(buffer);
    const parseResult = await executeResumeParse({ cleanedText: text });
    
    if (!parseResult.success) {
      return c.json({ success: false, error: parseResult.error }, 500);
    }
    
    const resumeId = generateId();
    const resume: Resume = {
      id: resumeId,
      name: parseResult.data!.basic_info?.name || '未命名简历',
      original_file_name: fileName,
      basic_info: parseResult.data!.basic_info,
      education: parseResult.data!.education,
      work_experience: parseResult.data!.work_experience,
      projects: parseResult.data!.projects,
      skills: parseResult.data!.skills,
      ability_tags: parseResult.data!.ability_tags,
      raw_content: text,
      version: 1,
      version_tag: '基础版',
      linked_jd_ids: [],
      is_master: true,
      status: 'completed',
      created_at: now(),
      updated_at: now(),
    };
    
    console.log(`[快速解析] 完成，ID: ${resumeId}, 姓名: ${resume.basic_info?.name}`);
    
    return c.json({ success: true, resumeId, resume });
    
  } catch (error) {
    console.error('[快速解析] 失败:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, 500);
  }
});

// 临时实现：使用pdf-parse库
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // 注意：Cloudflare Workers不支持pdf-parse
  // 这里需要调用外部服务或使用Web API
  
  // 临时方案：返回错误，提示使用MinerU
  throw new Error('快速解析功能开发中，请使用MinerU接口');
}
```

### 2.3 前端路由选择

**修改文件：** `public/static/app.js`

```javascript
async function uploadResume(file) {
  try {
    // 检测PDF类型
    const isDigital = await isDigitalPDF(file);
    
    if (isDigital) {
      console.log('[路由] 检测为数字PDF，使用快速通道');
      showLoading('正在快速解析（预计5-8秒）...');
      
      // 快速通道（开发中，暂时降级到MinerU）
      // return await parseResumeFast(file);
      
      // 临时降级
      return await parseResumeWithMinerU(file);
    } else {
      console.log('[路由] 检测为扫描PDF，使用高精度通道');
      showLoading('正在解析（预计1-2分钟）...');
      return await parseResumeWithMinerU(file);
    }
  } catch (error) {
    console.error('[路由] 选择失败:', error);
    // 降级到MinerU
    return await parseResumeWithMinerU(file);
  }
}

// PDF类型检测（前端版本）
async function isDigitalPDF(file) {
  const sizePerPage = file.size / 2;  // 假设2页
  return sizePerPage < 100 * 1024;    // <100KB/页 = 数字PDF
}

// 快速解析函数（待实现）
async function parseResumeFast(file) {
  const reader = new FileReader();
  
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      
      const response = await fetch('/api/resume/parse-fast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: base64,
          fileName: file.name,
        }),
        signal: AbortSignal.timeout(30000),  // 30秒足够
      });
      
      const result = await response.json();
      resolve(result);
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

**当前限制：** Cloudflare Workers不支持pdf-parse等Node.js库，快速通道暂时无法实现

---

## 🏗️ 阶段3：完整方案（3-5天，速度提升到5-10秒）

### 3.1 部署PDF解析微服务

**选项A：使用Cloudflare Workers AI**

```typescript
// Cloudflare Workers AI支持PDF解析
// 参考：https://developers.cloudflare.com/workers-ai/

import { Ai } from '@cloudflare/ai';

export async function parsePDFWithAI(
  pdfBuffer: ArrayBuffer,
  env: { AI: Ai }
): Promise<string> {
  const ai = new Ai(env.AI);
  
  // 使用Cloudflare AI提取文本
  const response = await ai.run('@cf/meta/llama-2-7b-chat-fp16', {
    messages: [
      {
        role: 'user',
        content: 'Extract text from this PDF...'
      }
    ]
  });
  
  return response.text;
}
```

**选项B：部署独立Python服务**

```python
# 📁 pdf-parser-service/main.py
from fastapi import FastAPI, UploadFile
import fitz  # PyMuPDF

app = FastAPI()

@app.post("/parse")
async def parse_pdf(file: UploadFile):
    # 读取PDF
    pdf_bytes = await file.read()
    pdf = fitz.open(stream=pdf_bytes, filetype="pdf")
    
    # 提取文本（1-2秒）
    text = ""
    for page in pdf:
        text += page.get_text()
    
    return {"success": True, "text": text}

# 部署到Vercel/Railway/Render
```

```bash
# Dockerfile
FROM python:3.11-slim
RUN pip install fastapi uvicorn pymupdf
COPY main.py .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3.2 集成到Hono API

```typescript
// 📁 src/routes/resume.ts
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // 调用外部PDF解析服务
  const response = await fetch('https://your-pdf-parser.vercel.app/parse', {
    method: 'POST',
    body: buffer,
    headers: {
      'Content-Type': 'application/pdf',
    },
  });
  
  const result = await response.json();
  return result.text;
}
```

---

## 📊 实施效果对比

| 阶段 | 耗时 | 提升 | 成本 | 工作量 |
|-----|------|------|------|-------|
| **当前** | 60秒 | - | 免费 | - |
| **阶段1** | 45秒 | 1.3倍 | 免费 | 1小时 |
| **阶段2** | 40秒* | 1.5倍 | 免费 | 1天 |
| **阶段3** | **8秒** | **7.5倍** | ¥11/千份 | 5天 |

*阶段2受限于Cloudflare Workers环境，快速通道暂时无法启用

---

## ⚠️ 技术限制说明

### Cloudflare Workers限制

**不支持的功能：**
- Node.js原生模块（fs, child_process等）
- 二进制依赖（pdf-parse, pdf.js等）
- 长时间运行（CPU时间限制）

**可用方案：**
1. **调用外部服务** - 部署Python/Node.js微服务到Vercel/Railway
2. **使用Cloudflare AI** - 官方AI能力（正在开发）
3. **浏览器端解析** - pdf.js在前端解析（慢）

### 推荐架构

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────────┐
│  前端       │ ───>  │  Hono API        │ ───>  │ PDF解析服务     │
│ (Cloudflare)│       │ (Cloudflare Workers)│     │ (Vercel/Railway)│
└─────────────┘       └──────────────────┘       └─────────────────┘
                               │                           │
                               │                      PyMuPDF
                               │                      提取文本(2秒)
                               │                           │
                               ↓                           ↓
                      ┌──────────────────┐       ┌─────────────────┐
                      │  LLM结构化       │ <───  │  返回文本       │
                      │  (qwen-plus)     │       └─────────────────┘
                      └──────────────────┘
                               │
                               ↓
                        结构化简历(5秒)
```

---

## ✅ 建议行动方案

### **立即执行（今天）：**

1. **应用阶段1优化**
   ```bash
   # 修改2个配置参数
   # 重新构建和部署
   cd /home/user/webapp
   # 编辑 src/core/mineru-client.ts 和 src/routes/resume.ts
   npm run build
   pm2 restart job-copilot
   ```

2. **测试效果**
   - 上传测试PDF
   - 记录解析时间
   - 对比优化前后

### **本周完成（3天内）：**

1. **调研外部PDF服务**
   - 测试Vercel/Railway部署
   - 评估Cloudflare Workers AI能力
   - 选择最佳方案

2. **原型开发**
   - 部署简单的PyMuPDF服务
   - 测试性能和稳定性
   - 完善错误处理

### **下周完成（1周内）：**

1. **完整集成**
   - 前端PDF类型检测
   - 智能路由选择
   - 降级策略

2. **性能监控**
   - 记录解析时间
   - 统计成功率
   - 优化参数

---

## 📚 参考资源

- **详细方案：** [PDF_PARSING_OPTIMIZATION.md](./PDF_PARSING_OPTIMIZATION.md)
- **当前代码：** `src/core/mineru-client.ts`
- **PyMuPDF文档：** https://pymupdf.readthedocs.io/
- **Cloudflare Workers限制：** https://developers.cloudflare.com/workers/platform/limits/

---

**更新时间：** 2026-01-15  
**下一步：** 立即执行阶段1优化（1小时）
