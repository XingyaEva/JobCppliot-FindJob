/**
 * PDF 解析引擎 - 分层策略
 * 
 * 解析策略：
 * 1. 快速解析：pdfplumber（适合数字 PDF，约 5-10s）
 * 2. 视觉识别：Gemini Vision（适合扫描件，约 15-20s）
 * 3. 备选方案：MinerU（最慢但最全面，约 45-60s）
 */

export interface PDFParseResult {
  success: boolean;
  text?: string;
  method?: 'pdfplumber' | 'vision' | 'mineru';
  duration_ms?: number;
  error?: string;
  metadata?: {
    pages?: number;
    isScanned?: boolean;
  };
}

export interface PDFParseOptions {
  /**
   * 是否跳过快速解析，直接使用高级方法
   * 当已知是扫描件时可设为 true
   */
  skipFastParse?: boolean;
  
  /**
   * 文件类型提示（从文件名推断）
   */
  fileName?: string;
  
  /**
   * 进度回调
   */
  onProgress?: (stage: string, progress: number, message: string) => void;
}

/**
 * 使用 pdf.js 快速解析数字 PDF
 * 适用于 90% 的简历（纯文本 PDF）
 * 
 * 注意：pdf.js 是纯 JavaScript 库，可在 Cloudflare Workers 中运行
 */
async function parsePDFWithPdfJS(
  fileBuffer: ArrayBuffer,
  options: PDFParseOptions
): Promise<PDFParseResult> {
  const startTime = Date.now();
  
  try {
    options.onProgress?.('pdfjs', 10, '正在使用 pdf.js 快速解析...');
    
    // 动态导入 pdf.js（需要安装：npm install pdfjs-dist）
    const pdfjsLib = await import('pdfjs-dist');
    
    // 加载 PDF 文档
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(fileBuffer),
    });
    
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    
    console.log(`[pdf.js] 文档共 ${numPages} 页`);
    
    // 提取所有页面的文本
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      options.onProgress?.(
        'pdfjs',
        10 + (pageNum / numPages) * 80,
        `正在解析第 ${pageNum}/${numPages} 页...`
      );
      
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // 拼接文本内容
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    options.onProgress?.('pdfjs', 100, 'pdf.js 解析完成');
    
    return {
      success: true,
      text: fullText.trim(),
      method: 'pdfplumber',  // 兼容原有类型定义
      duration_ms: Date.now() - startTime,
      metadata: {
        pages: numPages,
        isScanned: false,
      },
    };
  } catch (error) {
    console.error('[pdf.js] 解析失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      method: 'pdfplumber',
      duration_ms: Date.now() - startTime,
    };
  }
}

/**
 * 使用 Gemini Vision 识别 PDF（转图片后识别）
 * 适用于扫描件或复杂布局的 PDF
 * 
 * 注意：需要先将 PDF 转为图片，可使用 pdf.js 的 canvas 渲染功能
 */
async function parsePDFWithVision(
  fileBuffer: ArrayBuffer,
  options: PDFParseOptions
): Promise<PDFParseResult> {
  const startTime = Date.now();
  
  try {
    options.onProgress?.('vision', 20, '正在使用 Gemini Vision 识别...');
    
    // Step 1: 将 PDF 第一页转换为图片（使用 pdf.js）
    const imageDataUrl = await convertPDFPageToImage(fileBuffer, 1);
    
    if (!imageDataUrl) {
      throw new Error('PDF 转图片失败');
    }
    
    options.onProgress?.('vision', 50, '正在识别图片内容...');
    
    // Step 2: 使用 Gemini Vision 识别
    const { chatWithImage } = await import('./api-client');
    
    const systemPrompt = `你是一个专业的简历识别专家。

任务：识别图片中的简历内容，完整提取所有文字信息。

要求：
1. 完整识别简历中的所有内容
2. 保持原有的结构和层次（基本信息、教育背景、工作经历、项目经历、技能等）
3. 准确识别姓名、联系方式、学校、公司、职位等关键信息
4. 保留项目描述、工作职责、成果数据等详细内容
5. 直接输出识别到的简历文本内容，保持原有结构

输出格式：直接输出文字，不要添加额外说明。`;

    const text = await chatWithImage(
      systemPrompt,
      '请识别这份简历中的所有内容。',
      imageDataUrl,
      { agentId: 'resume-parse-image' }
    );
    
    options.onProgress?.('vision', 100, 'Gemini Vision 识别完成');
    
    return {
      success: true,
      text,
      method: 'vision',
      duration_ms: Date.now() - startTime,
      metadata: {
        isScanned: true,
      },
    };
  } catch (error) {
    console.error('[Gemini Vision] 识别失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      method: 'vision',
      duration_ms: Date.now() - startTime,
    };
  }
}

/**
 * 将 PDF 页面转换为图片（Base64 Data URL）
 * 使用 pdf.js 渲染到 Canvas
 */
async function convertPDFPageToImage(
  fileBuffer: ArrayBuffer,
  pageNum: number = 1,
  scale: number = 2.0
): Promise<string | null> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // 加载 PDF
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(fileBuffer),
    });
    
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(pageNum);
    
    // 获取页面尺寸
    const viewport = page.getViewport({ scale });
    
    // 创建 Canvas（注意：Cloudflare Workers 不支持 Canvas API）
    // 这里需要使用浏览器环境或外部服务
    // 方案：返回 PDF 原始数据，让前端转换后再识别
    
    // TODO: 实现真正的 PDF 转图片逻辑
    // 由于 Cloudflare Workers 限制，这部分需要：
    // 1. 在前端完成转换（使用 pdf.js + Canvas）
    // 2. 或调用外部图片转换服务
    
    console.warn('[convertPDFPageToImage] 在 Cloudflare Workers 中无法使用 Canvas，需要前端支持或外部服务');
    
    return null;
  } catch (error) {
    console.error('[convertPDFPageToImage] 转换失败:', error);
    return null;
  }
}

/**
 * 使用 MinerU 解析 PDF（备选方案）
 * 最慢但最全面，适合复杂文档
 */
async function parsePDFWithMinerU(
  fileBuffer: ArrayBuffer,
  fileName: string,
  options: PDFParseOptions
): Promise<PDFParseResult> {
  const startTime = Date.now();
  
  try {
    options.onProgress?.('mineru', 30, '正在使用 MinerU 解析（较慢但更全面）...');
    
    const { getUploadUrlAndParse, waitForBatchCompletion } = await import('./mineru-client');
    
    // 获取上传 URL
    const urlResult = await getUploadUrlAndParse(fileName, {
      isOcr: false,  // 快速模式
      enableTable: true,
      modelVersion: 'vlm',
    });
    
    if (!urlResult.success || !urlResult.uploadUrl || !urlResult.batchId) {
      throw new Error(urlResult.error || '获取上传 URL 失败');
    }
    
    // 上传文件
    options.onProgress?.('mineru', 40, '正在上传文件到 MinerU...');
    
    const uploadRes = await fetch(urlResult.uploadUrl, {
      method: 'PUT',
      body: fileBuffer,
    });
    
    if (!uploadRes.ok) {
      throw new Error(`上传失败: ${uploadRes.status}`);
    }
    
    // 等待解析完成
    options.onProgress?.('mineru', 50, '等待 MinerU 解析完成...');
    
    const mineruResult = await waitForBatchCompletion(
      urlResult.batchId,
      fileName,
      (progress) => {
        if (progress.extractedPages && progress.totalPages) {
          const percent = 50 + (progress.extractedPages / progress.totalPages) * 40;
          options.onProgress?.(
            'mineru',
            Math.floor(percent),
            `解析中 ${progress.extractedPages}/${progress.totalPages} 页...`
          );
        }
      }
    );
    
    if (!mineruResult.success) {
      throw new Error(mineruResult.error || 'MinerU 解析失败');
    }
    
    options.onProgress?.('mineru', 100, 'MinerU 解析完成');
    
    return {
      success: true,
      text: mineruResult.markdown || '',
      method: 'mineru',
      duration_ms: Date.now() - startTime,
    };
  } catch (error) {
    console.error('[MinerU] 解析失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      method: 'mineru',
      duration_ms: Date.now() - startTime,
    };
  }
}

/**
 * 辅助函数：将 PDF 转换为图片（已废弃，见 convertPDFPageToImage）
 */
async function convertPDFToImage(fileBuffer: ArrayBuffer): Promise<string> {
  // 已由 convertPDFPageToImage 替代
  throw new Error('请使用 convertPDFPageToImage 函数');
}

/**
 * 检测文本质量（判断是否为扫描件）
 */
function assessTextQuality(text: string): {
  isGood: boolean;
  confidence: number;
  reason: string;
} {
  // 检查 1：文本长度
  if (text.length < 100) {
    return {
      isGood: false,
      confidence: 0.9,
      reason: '文本过短，可能是扫描件或解析失败',
    };
  }
  
  // 检查 2：识别关键字段（姓名、联系方式、教育、工作）
  const keywords = ['姓名', '电话', '邮箱', '教育', '工作', '项目', '技能'];
  const keywordMatches = keywords.filter(k => text.includes(k)).length;
  
  if (keywordMatches < 2) {
    return {
      isGood: false,
      confidence: 0.7,
      reason: '缺少关键字段，可能是扫描件或布局复杂',
    };
  }
  
  // 检查 3：乱码或特殊字符比例
  const specialChars = text.match(/[^\u4e00-\u9fa5a-zA-Z0-9\s\.\,\;\:\-\+\@\(\)]/g) || [];
  const specialCharRatio = specialChars.length / text.length;
  
  if (specialCharRatio > 0.1) {
    return {
      isGood: false,
      confidence: 0.8,
      reason: '特殊字符过多，可能存在乱码',
    };
  }
  
  // 检查 4：结构化程度（是否有换行、段落）
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  
  if (lines.length < 10) {
    return {
      isGood: false,
      confidence: 0.6,
      reason: '段落过少，可能缺少结构信息',
    };
  }
  
  return {
    isGood: true,
    confidence: 0.9,
    reason: '文本质量良好',
  };
}

/**
 * 智能 PDF 解析器 - 自动选择最佳解析方法
 * 
 * 策略：
 * 1. 先用 pdfplumber 快速尝试（5-10s）
 * 2. 检测文本质量，如果不佳，则使用 Gemini Vision（15-20s）
 * 3. 如果仍然失败，最后使用 MinerU（45-60s）
 */
export async function parseResumePDF(
  fileBuffer: ArrayBuffer,
  fileName: string,
  options: PDFParseOptions = {}
): Promise<PDFParseResult> {
  const startTime = Date.now();
  
  console.log('[PDF Parser] 开始智能解析:', fileName);
  
  // Phase 1: 尝试快速解析（pdf.js）
  if (!options.skipFastParse) {
    console.log('[PDF Parser] Phase 1: 尝试 pdf.js 快速解析...');
    options.onProgress?.('analyzing', 5, '正在分析文档类型...');
    
    const fastResult = await parsePDFWithPdfJS(fileBuffer, options);
    
    if (fastResult.success && fastResult.text) {
      // 检测文本质量
      const quality = assessTextQuality(fastResult.text);
      
      console.log(`[PDF Parser] pdfplumber 质量评估:`, quality);
      
      if (quality.isGood) {
        console.log(`[PDF Parser] ✅ pdf.js 解析成功，耗时 ${fastResult.duration_ms}ms`);
        return {
          ...fastResult,
          metadata: {
            ...fastResult.metadata,
            qualityAssessment: quality,
          },
        };
      }
      
      console.log(`[PDF Parser] ⚠️ pdf.js 解析质量不佳: ${quality.reason}`);
    } else {
      console.log(`[PDF Parser] ⚠️ pdf.js 解析失败: ${fastResult.error}`);
    }
  }
  
  // Phase 2: 使用 Gemini Vision 识别
  console.log('[PDF Parser] Phase 2: 尝试 Gemini Vision 识别...');
  options.onProgress?.('vision', 20, '正在使用视觉识别（适合扫描件）...');
  
  const visionResult = await parsePDFWithVision(fileBuffer, options);
  
  if (visionResult.success && visionResult.text) {
    const quality = assessTextQuality(visionResult.text);
    
    console.log(`[PDF Parser] Gemini Vision 质量评估:`, quality);
    
    if (quality.isGood) {
      console.log(`[PDF Parser] ✅ Gemini Vision 识别成功，耗时 ${visionResult.duration_ms}ms`);
      return {
        ...visionResult,
        metadata: {
          ...visionResult.metadata,
          qualityAssessment: quality,
        },
      };
    }
    
    console.log(`[PDF Parser] ⚠️ Gemini Vision 识别质量不佳: ${quality.reason}`);
  } else {
    console.log(`[PDF Parser] ⚠️ Gemini Vision 识别失败: ${visionResult.error}`);
  }
  
  // Phase 3: 备选方案 - MinerU（最慢但最全面）
  console.log('[PDF Parser] Phase 3: 使用 MinerU 备选方案...');
  options.onProgress?.('mineru', 30, '正在使用 MinerU 深度解析（较慢）...');
  
  const mineruResult = await parsePDFWithMinerU(fileBuffer, fileName, options);
  
  if (mineruResult.success) {
    console.log(`[PDF Parser] ✅ MinerU 解析成功，耗时 ${mineruResult.duration_ms}ms`);
    return mineruResult;
  }
  
  // 所有方法都失败
  console.error('[PDF Parser] ❌ 所有解析方法都失败');
  
  return {
    success: false,
    error: '文档解析失败：已尝试所有可用方法（pdf.js、Gemini Vision、MinerU）',
    duration_ms: Date.now() - startTime,
  };
}
