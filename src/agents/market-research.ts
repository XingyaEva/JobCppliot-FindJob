/**
 * Market Research Agent
 * 
 * Searches for job market data, extracts structured job listings,
 * and generates market analysis with charts data.
 */

import { callLLM } from '../core/llm/client';
import { tavilyMultiSearch, TavilySearchResult } from '../core/tavily-client';

export interface MarketJob {
  title: string;
  company: string;
  salary?: string;
  location?: string;
  requirements?: string[];
  platform?: string;
  sourceUrl?: string;
  summary?: string;
}

export interface MarketOverview {
  totalJobs: number;
  avgSalary: string;
  salaryRange: string;
  topCompanies: string[];
  mainCities: string[];
  hotSkills: string[];
}

export interface SalaryDistItem {
  range: string;
  count: number;
}

export interface RadarDimItem {
  dimension: string;
  score: number;
}

export interface MarketResearchResult {
  overview: MarketOverview;
  jobs: MarketJob[];
  salaryDistribution: SalaryDistItem[];
  radarData: RadarDimItem[];
}

/**
 * Run full market research pipeline
 */
export async function runMarketResearch(query: string): Promise<MarketResearchResult> {
  console.log(`[Market] Starting research for: ${query}`);

  // Step 1: Multi-query search via Tavily
  const searchQueries = [
    `${query} 招聘 JD 2026 薪资`,
    `${query} BOSS直聘 猎聘 岗位`,
    `${query} 岗位要求 能力 技能`,
    `${query} 行业趋势 就业市场`,
  ];

  console.log(`[Market] Searching with ${searchQueries.length} queries...`);
  const searchResults = await tavilyMultiSearch(searchQueries);
  console.log(`[Market] Got ${searchResults.length} unique search results`);

  // Step 2: LLM extracts structured job data + analysis
  const extractionResult = await extractAndAnalyze(query, searchResults);

  console.log(`[Market] Research complete: ${extractionResult.jobs.length} jobs found`);
  return extractionResult;
}

/**
 * Extract structured jobs and generate analysis from search results
 */
async function extractAndAnalyze(
  query: string,
  searchResults: TavilySearchResult[]
): Promise<MarketResearchResult> {
  const searchContent = searchResults
    .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}`)
    .join('\n\n---\n\n');

  const systemPrompt = `你是一位资深的就业市场分析师。你的任务是从搜索结果中提取岗位信息，并生成市场分析报告。

输出要求（严格JSON格式）：
{
  "overview": {
    "totalJobs": 数字,
    "avgSalary": "如: 35-50K",
    "salaryRange": "如: 15K-80K",
    "topCompanies": ["公司名1", "公司名2", ...],
    "mainCities": ["城市1", "城市2", ...],
    "hotSkills": ["技能1", "技能2", ...]
  },
  "jobs": [
    {
      "title": "岗位名称",
      "company": "公司名",
      "salary": "薪资范围",
      "location": "城市",
      "requirements": ["要求1", "要求2"],
      "platform": "来源平台(如BOSS直聘/猎聘/官网)",
      "sourceUrl": "原始链接",
      "summary": "一句话概述"
    }
  ],
  "salaryDistribution": [
    { "range": "15-20K", "count": 数字 },
    { "range": "20-30K", "count": 数字 },
    { "range": "30-40K", "count": 数字 },
    { "range": "40-50K", "count": 数字 },
    { "range": "50K+", "count": 数字 }
  ],
  "radarData": [
    { "dimension": "行业经验", "score": 0-100 },
    { "dimension": "技术深度", "score": 0-100 },
    { "dimension": "产品能力", "score": 0-100 },
    { "dimension": "管理经验", "score": 0-100 },
    { "dimension": "沟通协作", "score": 0-100 },
    { "dimension": "数据分析", "score": 0-100 }
  ]
}

注意：
1. 从搜索结果中尽可能提取真实的岗位信息
2. 如果搜索结果中没有足够的具体岗位，根据你对该领域的知识补充典型岗位
3. 薪资分布要合理，基于搜索结果和行业认知
4. 雷达图分数代表市场对该维度能力的平均要求程度(0-100)
5. 确保所有字段都有值，不要留空`;

  const userMessage = `请分析「${query}」的就业市场情况。

以下是搜索到的相关信息：

${searchContent}

请提取岗位信息，生成市场分析报告。`;

  const response = await callLLM({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    agentId: 'market-research',
    jsonMode: true,
  });

  try {
    const parsed = JSON.parse(response.content);
    return {
      overview: parsed.overview || { totalJobs: 0, avgSalary: '-', salaryRange: '-', topCompanies: [], mainCities: [], hotSkills: [] },
      jobs: parsed.jobs || [],
      salaryDistribution: parsed.salaryDistribution || [],
      radarData: parsed.radarData || [],
    };
  } catch (e) {
    console.error('[Market] Failed to parse LLM response:', e);
    // Return minimal result
    return {
      overview: { totalJobs: 0, avgSalary: '-', salaryRange: '-', topCompanies: [], mainCities: [], hotSkills: [] },
      jobs: [],
      salaryDistribution: [],
      radarData: [],
    };
  }
}
