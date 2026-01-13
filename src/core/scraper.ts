/**
 * URL 爬虫模块 - 支持从招聘网站 URL 提取 JD 内容
 * 
 * 支持平台：Boss直聘、拉勾、猎聘
 * 技术方案：ScrapingBee API（处理动态渲染和反爬）
 */

// ScrapingBee API 配置（备用）
const SCRAPING_BEE_API_KEY = '9V8189UIYC695NDDB9YPKI83YE41N7YCWH7GQKYH7XJO9FD0FH5SQLE2KZ66V0Q2ALTWBCO1ZUJUKJDW';
const SCRAPING_BEE_URL = 'https://app.scrapingbee.com/api/v1/';

// ScraperAPI 配置（主用）
const SCRAPER_API_KEY = 'c26749f29bbd48724ba093687f310b2e';
const SCRAPER_API_URL = 'https://api.scraperapi.com';

// 使用哪个 API
const USE_SCRAPER_API = true;

/**
 * 平台配置接口
 */
interface PlatformConfig {
  name: string;
  displayName: string;
  domains: string[];
  selectors: {
    title: string[];           // 岗位标题选择器（按优先级）
    company: string[];         // 公司名称选择器
    jd: string[];              // JD 内容选择器
    salary?: string[];         // 薪资选择器
    location?: string[];       // 地点选择器
    requirements?: string[];   // 任职要求选择器
  };
  // 是否需要 JS 渲染
  requiresJsRender: boolean;
  // 是否需要 Cookie（登录态）
  requiresCookie: boolean;
  // 额外配置
  extraConfig?: {
    waitFor?: string;         // 等待某个元素出现
    blockResources?: boolean; // 是否屏蔽图片等资源
  };
}

/**
 * 已支持的招聘平台配置
 */
export const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    name: 'zhipin',
    displayName: 'Boss直聘',
    domains: ['zhipin.com', 'www.zhipin.com', 'm.zhipin.com'],
    selectors: {
      // PC端 + 移动端选择器
      title: ['.job-banner .name h1', '.job-title', '.info-primary .name h1', 'h1.name', '.job-name', '.position-name', '.name'],
      company: ['.job-banner .name .company', '.company-info .name', '.info-company .name', '.company-name a', '.company-name', '.company'],
      jd: ['.job-detail .job-sec-text', '.job-detail-section', '.job-sec .text', '.detail-content', '.job-detail', '.text', '.job-description', '.description'],
      salary: ['.job-banner .salary', '.salary', '.info-primary .salary', '.job-salary', '.red'],
      location: ['.job-banner .location', '.location-address', '.info-primary .sider-in', '.job-address', '.address'],
      requirements: ['.job-detail .job-sec-text', '.detail-content', '.job-detail', '.job-description'],
    },
    requiresJsRender: true,
    requiresCookie: true,  // Boss直聘需要 Cookie
    extraConfig: {
      // 不等待特定元素，避免超时
      blockResources: false,
    },
  },
  {
    name: 'lagou',
    displayName: '拉勾',
    domains: ['lagou.com', 'www.lagou.com'],
    selectors: {
      title: ['.position-head .name', '.job-name', 'h1.name', '.position-title'],
      company: ['.position-head .company', '.company-name', '.company a'],
      jd: ['.job-detail', '.position-content', '.job_bt div', '.job-description'],
      salary: ['.position-head .salary', '.salary', '.money'],
      location: ['.position-head .address', '.work_addr', '.address'],
      requirements: ['.position-content .job_request', '.job-requirement'],
    },
    requiresJsRender: true,
    requiresCookie: false,
    extraConfig: {
      waitFor: '.job-detail',
      blockResources: true,
    },
  },
  {
    name: 'liepin',
    displayName: '猎聘',
    domains: ['liepin.com', 'www.liepin.com'],
    selectors: {
      title: ['.job-title h1', '.title-info h1', '.job-name', 'h1.title'],
      company: ['.company-info .name', '.company-name a', '.name a[data-nick]'],
      jd: ['.job-intro-container', '.content.content-word', '.job-description', '.job-intro'],
      salary: ['.job-title .salary', '.job-item-salary', '.salary-text'],
      location: ['.job-title .area', '.address', '.basic-info .city'],
      requirements: ['.job-intro-container', '.job-qualifications'],
    },
    requiresJsRender: true,
    requiresCookie: false,
    extraConfig: {
      waitFor: '.job-intro-container',
      blockResources: true,
    },
  },
];

/**
 * 爬取结果接口
 */
export interface ScrapeResult {
  success: boolean;
  data?: {
    title: string;
    company: string;
    salary: string;
    location: string;
    jdContent: string;        // 原始 JD 内容
    rawHtml?: string;         // 原始 HTML（调试用）
  };
  error?: string;
  meta: {
    url: string;
    platform: string;
    platformName: string;
    fetchMethod: 'scrapingbee' | 'direct';
    fetchTime: number;        // 耗时 ms
  };
}

/**
 * 识别 URL 对应的平台
 */
export function identifyPlatform(url: string): PlatformConfig | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    for (const config of PLATFORM_CONFIGS) {
      if (config.domains.some(domain => hostname.includes(domain))) {
        return config;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * 校验 URL 是否有效
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url || url.trim() === '') {
    return { valid: false, error: '请输入 URL' };
  }
  
  try {
    const parsed = new URL(url);
    
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL 必须以 http:// 或 https:// 开头' };
    }
    
    const platform = identifyPlatform(url);
    if (!platform) {
      return { 
        valid: false, 
        error: '暂不支持该平台，目前支持：Boss直聘、拉勾、猎聘' 
      };
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: '请输入有效的 URL 格式' };
  }
}

/**
 * 获取支持的平台列表
 */
export function getSupportedPlatforms(): Array<{ name: string; displayName: string; domains: string[] }> {
  return PLATFORM_CONFIGS.map(p => ({
    name: p.name,
    displayName: p.displayName,
    domains: p.domains,
  }));
}

/**
 * 使用 ScraperAPI 爬取页面
 */
async function fetchWithScraperAPI(
  url: string,
  config: PlatformConfig,
  cookie?: string
): Promise<{ html: string; statusCode: number }> {
  const params = new URLSearchParams({
    api_key: SCRAPER_API_KEY,
    url: url,
    render: config.requiresJsRender ? 'true' : 'false',
    country_code: 'cn',       // 中国代理
    premium: 'true',          // 使用高级代理
    session_number: '123',    // 保持会话
  });
  
  // 添加 Cookie
  if (cookie && cookie.trim()) {
    // ScraperAPI 通过 header 传递 Cookie
    params.append('keep_headers', 'true');
  }
  
  console.log(`[Scraper] ScraperAPI 请求 URL: ${url}`);
  
  const headers: Record<string, string> = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  };
  
  // 添加 Cookie 到请求头
  if (cookie && cookie.trim()) {
    headers['Cookie'] = cookie;
    console.log(`[Scraper] 添加 Cookie，长度: ${cookie.length}`);
  }
  
  const response = await fetch(`${SCRAPER_API_URL}?${params.toString()}`, {
    headers,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ScraperAPI 错误: ${response.status} - ${errorText}`);
  }
  
  const html = await response.text();
  console.log(`[Scraper] 获取到 HTML 长度: ${html.length}`);
  return { html, statusCode: response.status };
}

/**
 * 使用 ScrapingBee 爬取页面（备用）
 */
async function fetchWithScrapingBee(
  url: string, 
  config: PlatformConfig,
  cookie?: string
): Promise<{ html: string; statusCode: number }> {
  const params = new URLSearchParams({
    api_key: SCRAPING_BEE_API_KEY,
    url: url,
    render_js: config.requiresJsRender ? 'true' : 'false',
    block_resources: config.extraConfig?.blockResources ? 'true' : 'false',
    premium_proxy: 'true',
    country_code: 'cn',
  });
  
  if (cookie && cookie.trim()) {
    const cleanCookie = cookie.split(';').map(c => c.trim()).filter(c => c.length > 0).join(';');
    params.append('forward_headers', 'true');
    console.log(`[Scraper] Cookie 长度: ${cleanCookie.length}`);
  }
  
  params.append('timeout', '60000');
  params.append('wait', '8000');
  params.append('wait_browser', 'networkidle2');
  
  console.log(`[Scraper] ScrapingBee 请求 URL: ${url}`);
  
  const response = await fetch(`${SCRAPING_BEE_URL}?${params.toString()}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ScrapingBee API 错误: ${response.status} - ${errorText}`);
  }
  
  const html = await response.text();
  console.log(`[Scraper] 获取到 HTML 长度: ${html.length}`);
  return { html, statusCode: response.status };
}

/**
 * 统一的页面爬取函数
 */
async function fetchPage(
  url: string,
  config: PlatformConfig,
  cookie?: string
): Promise<{ html: string; statusCode: number }> {
  if (USE_SCRAPER_API) {
    return fetchWithScraperAPI(url, config, cookie);
  } else {
    return fetchWithScrapingBee(url, config, cookie);
  }
}

/**
 * 从 HTML 中提取文本内容
 * 简化版：使用正则表达式提取（Cloudflare Workers 环境无 DOM 解析器）
 */
function extractText(html: string, selectors: string[]): string {
  // 尝试每个选择器
  for (const selector of selectors) {
    // 将 CSS 选择器转换为简化的正则匹配
    // 这是一个简化实现，处理常见情况
    
    // 处理 class 选择器，如 .job-detail
    if (selector.startsWith('.')) {
      const className = selector.slice(1).split(/[.\s>]/)[0];
      // 匹配带有该 class 的标签内容
      const regex = new RegExp(
        `<[^>]+class\\s*=\\s*["'][^"']*\\b${escapeRegex(className)}\\b[^"']*["'][^>]*>([\\s\\S]*?)</`,
        'i'
      );
      const match = html.match(regex);
      if (match && match[1]) {
        const text = cleanHtml(match[1]);
        if (text.length > 20) {
          return text;
        }
      }
    }
    
    // 处理标签选择器，如 h1.name
    if (selector.includes('h1') || selector.includes('h2')) {
      const tagMatch = selector.match(/^(h[1-6])/);
      if (tagMatch) {
        const tag = tagMatch[1];
        const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
        const matches = html.matchAll(regex);
        for (const match of matches) {
          const text = cleanHtml(match[1]);
          if (text.length > 2 && text.length < 200) {
            return text;
          }
        }
      }
    }
  }
  
  return '';
}

/**
 * 提取 JD 详细内容（较长文本）
 */
function extractJdContent(html: string, selectors: string[]): string {
  for (const selector of selectors) {
    if (selector.startsWith('.')) {
      const className = selector.slice(1).split(/[.\s>]/)[0];
      
      // 匹配整个元素块
      const regex = new RegExp(
        `<(?:div|section|article)[^>]+class\\s*=\\s*["'][^"']*\\b${escapeRegex(className)}\\b[^"']*["'][^>]*>([\\s\\S]*?)</(?:div|section|article)>`,
        'i'
      );
      
      const match = html.match(regex);
      if (match && match[1]) {
        const text = cleanHtml(match[1]);
        if (text.length > 100) {
          return text;
        }
      }
    }
  }
  
  // 备选方案：查找包含"岗位职责"或"职位描述"的区域
  const jdKeywords = ['岗位职责', '职位描述', '工作职责', '工作内容', '任职要求', '岗位要求'];
  for (const keyword of jdKeywords) {
    const index = html.indexOf(keyword);
    if (index !== -1) {
      // 提取该关键词周围的内容
      const start = Math.max(0, html.lastIndexOf('<div', index));
      const end = html.indexOf('</div>', index + 500);
      if (start !== -1 && end !== -1) {
        const text = cleanHtml(html.substring(start, end + 6));
        if (text.length > 100) {
          return text;
        }
      }
    }
  }
  
  return '';
}

/**
 * 清理 HTML，提取纯文本
 */
function cleanHtml(html: string): string {
  let text = html
    // 移除 script 和 style
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    // 移除 HTML 注释
    .replace(/<!--[\s\S]*?-->/g, '')
    // 将 br 和 p 转换为换行
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    // 移除所有 HTML 标签
    .replace(/<[^>]+>/g, '')
    // 解码 HTML 实体
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)))
    // 清理多余空白
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return text;
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 主爬取函数
 */
export async function scrapeJobUrl(
  url: string,
  options?: {
    cookie?: string;
    debug?: boolean;
  }
): Promise<ScrapeResult> {
  const startTime = Date.now();
  
  // 识别平台
  const platform = identifyPlatform(url);
  if (!platform) {
    return {
      success: false,
      error: '暂不支持该平台',
      meta: {
        url,
        platform: 'unknown',
        platformName: '未知平台',
        fetchMethod: 'scrapingbee',
        fetchTime: Date.now() - startTime,
      },
    };
  }
  
  console.log(`[Scraper] 开始爬取: ${url}`);
  console.log(`[Scraper] 识别平台: ${platform.displayName}`);
  
  try {
    // 使用爬虫 API 获取页面
    const { html } = await fetchPage(url, platform, options?.cookie);
    
    console.log(`[Scraper] 页面获取成功，HTML 长度: ${html.length}`);
    
    // 提取内容
    const title = extractText(html, platform.selectors.title);
    const company = extractText(html, platform.selectors.company);
    const salary = platform.selectors.salary ? extractText(html, platform.selectors.salary) : '';
    const location = platform.selectors.location ? extractText(html, platform.selectors.location) : '';
    const jdContent = extractJdContent(html, platform.selectors.jd);
    
    console.log(`[Scraper] 提取结果: title="${title}", company="${company}", jd长度=${jdContent.length}`);
    
    // 验证提取结果
    if (!jdContent || jdContent.length < 50) {
      // 调试时输出 HTML 前 2000 字符
      console.log(`[Scraper] 提取失败，HTML 前 2000 字符: ${html.substring(0, 2000)}`);
      
      return {
        success: false,
        error: '无法提取 JD 内容，页面结构可能已变化',
        data: options?.debug ? {
          title: title || '',
          company: company || '',
          salary: '',
          location: '',
          jdContent: '',
          rawHtml: html.substring(0, 5000),  // 返回部分 HTML 用于调试
        } : undefined,
        meta: {
          url,
          platform: platform.name,
          platformName: platform.displayName,
          fetchMethod: 'scrapingbee',
          fetchTime: Date.now() - startTime,
        },
      };
    }
    
    return {
      success: true,
      data: {
        title: title || '未知岗位',
        company: company || '未知公司',
        salary: salary || '面议',
        location: location || '未知',
        jdContent,
        rawHtml: options?.debug ? html : undefined,
      },
      meta: {
        url,
        platform: platform.name,
        platformName: platform.displayName,
        fetchMethod: 'scrapingbee',
        fetchTime: Date.now() - startTime,
      },
    };
  } catch (error) {
    console.error(`[Scraper] 爬取失败:`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '爬取失败',
      meta: {
        url,
        platform: platform.name,
        platformName: platform.displayName,
        fetchMethod: 'scrapingbee',
        fetchTime: Date.now() - startTime,
      },
    };
  }
}

/**
 * Cookie 存储（内存缓存，重启后失效）
 */
const cookieStore: Record<string, string> = {};

/**
 * 设置平台 Cookie
 */
export function setPlatformCookie(platform: string, cookie: string): void {
  cookieStore[platform] = cookie;
  console.log(`[Scraper] 已设置 ${platform} Cookie`);
}

/**
 * 获取平台 Cookie
 */
export function getPlatformCookie(platform: string): string | undefined {
  return cookieStore[platform];
}

/**
 * 获取所有已配置的 Cookie
 */
export function getAllCookies(): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const platform of PLATFORM_CONFIGS) {
    result[platform.name] = !!cookieStore[platform.name];
  }
  return result;
}
