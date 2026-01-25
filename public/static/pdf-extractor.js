/**
 * 前端 PDF 文本提取模块
 * 使用 pdf.js 在浏览器端提取 PDF 文本，无需后端 Python 服务
 * 
 * 优点：
 * - 秒级响应，无网络延迟
 * - 无冷启动问题
 * - 减少服务器负载
 */

// pdf.js CDN
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs';
const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';

let pdfjsLib = null;

/**
 * 动态加载 pdf.js 库
 */
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  
  try {
    // 动态导入 pdf.js
    pdfjsLib = await import(PDFJS_CDN);
    
    // 设置 worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
    
    console.log('[PDF.js] 库加载成功');
    return pdfjsLib;
  } catch (error) {
    console.error('[PDF.js] 加载失败:', error);
    throw new Error('PDF.js 加载失败');
  }
}

/**
 * 从 PDF 文件提取文本
 * @param {File|ArrayBuffer} input - PDF 文件或 ArrayBuffer
 * @returns {Promise<{success: boolean, text?: string, pages?: number, isScanned?: boolean, error?: string}>}
 */
async function extractTextFromPDF(input) {
  const startTime = Date.now();
  
  try {
    const pdfjs = await loadPdfJs();
    
    // 获取 ArrayBuffer
    let arrayBuffer;
    if (input instanceof File) {
      arrayBuffer = await input.arrayBuffer();
    } else if (input instanceof ArrayBuffer) {
      arrayBuffer = input;
    } else {
      throw new Error('输入必须是 File 或 ArrayBuffer');
    }
    
    // 加载 PDF 文档
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const numPages = pdf.numPages;
    const textParts = [];
    let totalChars = 0;
    let hasImages = false;
    
    // 逐页提取文本
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // 提取文本项
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      
      textParts.push(pageText);
      totalChars += pageText.length;
      
      // 检查是否有操作符（可能包含图片）
      const ops = await page.getOperatorList();
      if (ops.fnArray.includes(pdfjs.OPS.paintImageXObject)) {
        hasImages = true;
      }
    }
    
    const fullText = textParts.join('\n\n');
    const duration = Date.now() - startTime;
    
    // 判断是否为扫描件（文字太少但有图片）
    const avgCharsPerPage = totalChars / numPages;
    const isScanned = avgCharsPerPage < 100 && hasImages;
    
    console.log(`[PDF.js] 提取完成: ${numPages} 页, ${totalChars} 字符, ${duration}ms, 扫描件: ${isScanned}`);
    
    return {
      success: true,
      text: fullText,
      pages: numPages,
      totalChars,
      avgCharsPerPage: Math.round(avgCharsPerPage),
      hasImages,
      isScanned,
      duration_ms: duration,
      method: 'pdf.js'
    };
    
  } catch (error) {
    console.error('[PDF.js] 提取失败:', error);
    return {
      success: false,
      error: error.message || '提取失败',
      method: 'pdf.js'
    };
  }
}

/**
 * 快速分析 PDF 类型（不提取全文）
 * @param {File|ArrayBuffer} input - PDF 文件
 * @returns {Promise<{success: boolean, isScanned?: boolean, pages?: number}>}
 */
async function analyzePDFType(input) {
  const startTime = Date.now();
  
  try {
    const pdfjs = await loadPdfJs();
    
    let arrayBuffer;
    if (input instanceof File) {
      arrayBuffer = await input.arrayBuffer();
    } else {
      arrayBuffer = input;
    }
    
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // 只检查第一页
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    const ops = await page.getOperatorList();
    
    const pageText = textContent.items.map(item => item.str).join('');
    const hasImages = ops.fnArray.includes(pdfjs.OPS.paintImageXObject);
    
    // 扫描件判定：文字少于 50 字符且有图片
    const isScanned = pageText.length < 50 && hasImages;
    
    const duration = Date.now() - startTime;
    
    console.log(`[PDF.js] 类型分析: ${isScanned ? '扫描件' : '数字PDF'}, ${duration}ms`);
    
    return {
      success: true,
      isScanned,
      pages: pdf.numPages,
      firstPageChars: pageText.length,
      hasImages,
      duration_ms: duration
    };
    
  } catch (error) {
    console.error('[PDF.js] 分析失败:', error);
    return {
      success: false,
      error: error.message || '分析失败'
    };
  }
}

// 导出到全局
window.PDFExtractor = {
  extractTextFromPDF,
  analyzePDFType,
  loadPdfJs
};

console.log('[PDF.js] 前端 PDF 提取模块已加载');
