# Phase 2 开发计划 - 实时进度条 + 桌面通知 + PDF类型检测

## 📋 Phase 2 概述

**目标**: 大幅提升用户体验，降低等待焦虑  
**时间**: 本周完成（3天）  
**优先级**: 高

### 核心功能

1. **实时进度条** ⭐⭐⭐⭐⭐
   - 显示当前解析阶段
   - 百分比进度显示
   - 预计剩余时间
   
2. **桌面通知** ⭐⭐⭐⭐
   - 解析完成时推送通知
   - 浏览器 Notification API
   - 友好的提示文案

3. **PDF 类型检测** ⭐⭐⭐
   - 区分数字 PDF vs 扫描 PDF
   - 自动选择最优解析策略
   - 前端提示用户 PDF 类型

### 预期效果

| 指标 | 当前 | Phase 2 | 提升 |
|------|------|---------|------|
| 透明度 | ⭐⭐ | ⭐⭐⭐⭐⭐ | 综合提升 |
| 用户满意度 | 基准 | +50% | 显著提升 |
| 等待焦虑 | 中等 | 低 | 降低 |
| 用户离开率 | 30% | 10% | 降低 67% |

---

## 🎯 Feature 2.1: 实时进度条

### 设计目标

**用户价值:**
- 清楚知道当前处理到哪一步
- 了解大概还需要多久
- 降低等待焦虑

**技术目标:**
- 实时更新进度（每秒刷新）
- 准确显示当前阶段
- 流畅的动画效果

### UI 设计

```html
<!-- 进度条组件 -->
<div class="progress-container">
  <div class="progress-header">
    <h3>正在解析简历</h3>
    <span class="progress-percent">45%</span>
  </div>
  
  <div class="progress-bar-wrapper">
    <div class="progress-bar" style="width: 45%"></div>
  </div>
  
  <div class="progress-stage">
    <span class="stage-icon">⚡</span>
    <span class="stage-text">MinerU 文档解析中...</span>
  </div>
  
  <div class="progress-time">
    <span>已用时: 23秒</span>
    <span>预计剩余: 22秒</span>
  </div>
  
  <div class="progress-stages">
    <div class="stage completed">
      <i class="fas fa-check-circle"></i>
      <span>上传文件</span>
    </div>
    <div class="stage active">
      <i class="fas fa-spinner fa-spin"></i>
      <span>文档解析</span>
    </div>
    <div class="stage pending">
      <i class="fas fa-circle"></i>
      <span>简历结构化</span>
    </div>
  </div>
</div>
```

### 阶段定义

```javascript
const PARSE_STAGES = {
  UPLOAD: {
    name: '上传文件',
    icon: 'fa-cloud-upload-alt',
    progress: [0, 20],
    estimatedTime: 5, // 秒
  },
  PARSING: {
    name: 'MinerU 文档解析',
    icon: 'fa-file-alt',
    progress: [20, 80],
    estimatedTime: 35, // 秒
  },
  STRUCTURING: {
    name: '简历结构化',
    icon: 'fa-magic',
    progress: [80, 100],
    estimatedTime: 5, // 秒
  },
};
```

### 实现步骤

#### 步骤 2.1.1: 后端进度 API

**新增接口: GET /api/resume/progress/:id**

```typescript
// src/routes/resume.ts
resumeRoutes.get('/progress/:id', async (c) => {
  const resumeId = c.req.param('id');
  const resume = resumeStorage.get(resumeId);
  
  if (!resume) {
    return c.json({ success: false, error: '简历不存在' }, 404);
  }
  
  return c.json({
    success: true,
    progress: {
      status: resume.status, // 'parsing' | 'completed' | 'error'
      stage: resume.current_stage, // 'upload' | 'parsing' | 'structuring'
      percent: resume.progress_percent || 0,
      message: resume.progress_message || '',
      elapsed_time: resume.elapsed_time || 0,
      estimated_remaining: resume.estimated_remaining || 0,
    },
  });
});
```

**后端进度更新逻辑:**

```typescript
// 在解析过程中更新进度
async function updateResumeProgress(
  resumeId: string, 
  stage: string, 
  percent: number, 
  message: string
) {
  const resume = resumeStorage.get(resumeId);
  if (!resume) return;
  
  const startTime = new Date(resume.created_at).getTime();
  const now = Date.now();
  const elapsedTime = Math.floor((now - startTime) / 1000);
  
  // 根据当前进度估算剩余时间
  const totalEstimated = 45; // 总预计时间
  const estimatedRemaining = Math.max(0, Math.floor(totalEstimated * (1 - percent / 100)));
  
  resume.current_stage = stage;
  resume.progress_percent = percent;
  resume.progress_message = message;
  resume.elapsed_time = elapsedTime;
  resume.estimated_remaining = estimatedRemaining;
  
  resumeStorage.set(resumeId, resume);
}

// 使用示例
await updateResumeProgress(resumeId, 'upload', 20, '文件上传完成');
await updateResumeProgress(resumeId, 'parsing', 50, 'MinerU 解析中...');
await updateResumeProgress(resumeId, 'structuring', 90, '正在结构化...');
```

#### 步骤 2.1.2: 前端进度组件

**创建进度条 HTML（在 /resume 页面）:**

```html
<!-- 在解析进度区域添加详细进度条 -->
<div id="parse-progress" class="hidden mb-8">
  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
    <!-- 标题和百分比 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <i class="fas fa-spinner loading-spinner text-white text-lg"></i>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">正在解析简历</h3>
          <p id="progress-message" class="text-sm text-gray-500 mt-0.5">准备中...</p>
        </div>
      </div>
      <div class="text-right">
        <div id="progress-percent" class="text-2xl font-bold text-blue-600">0%</div>
        <div id="progress-time" class="text-xs text-gray-500 mt-1">--</div>
      </div>
    </div>
    
    <!-- 进度条 -->
    <div class="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
      <div 
        id="progress-bar" 
        class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
        style="width: 0%"
      ></div>
    </div>
    
    <!-- 阶段指示器 -->
    <div class="flex items-center justify-between text-xs">
      <div id="stage-upload" class="flex flex-col items-center gap-1">
        <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <i class="fas fa-circle text-gray-400"></i>
        </div>
        <span class="text-gray-500">上传</span>
      </div>
      <div class="flex-1 h-px bg-gray-200 mx-2"></div>
      <div id="stage-parsing" class="flex flex-col items-center gap-1">
        <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <i class="fas fa-circle text-gray-400"></i>
        </div>
        <span class="text-gray-500">解析</span>
      </div>
      <div class="flex-1 h-px bg-gray-200 mx-2"></div>
      <div id="stage-structuring" class="flex flex-col items-center gap-1">
        <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <i class="fas fa-circle text-gray-400"></i>
        </div>
        <span class="text-gray-500">结构化</span>
      </div>
    </div>
  </div>
</div>
```

**前端轮询逻辑:**

```javascript
// 轮询进度
async function pollProgress(resumeId) {
  const startTime = Date.now();
  const pollInterval = 1000; // 1秒轮询一次
  const maxWaitTime = 180000; // 3分钟超时
  
  const intervalId = setInterval(async () => {
    try {
      const res = await fetch('/api/resume/progress/' + resumeId);
      const data = await res.json();
      
      if (data.success) {
        const { progress } = data;
        
        // 更新UI
        updateProgressUI(progress);
        
        // 检查是否完成
        if (progress.status === 'completed') {
          clearInterval(intervalId);
          showCompletedState();
          
          // 发送桌面通知（Feature 2.2）
          sendDesktopNotification('简历解析完成！', {
            body: '您的简历已成功解析，点击查看详情',
            icon: '/favicon.ico',
          });
        } else if (progress.status === 'error') {
          clearInterval(intervalId);
          showErrorState(progress.message);
        }
      }
      
      // 超时检查
      if (Date.now() - startTime > maxWaitTime) {
        clearInterval(intervalId);
        showTimeoutState();
      }
    } catch (err) {
      console.error('[进度轮询] 失败:', err);
    }
  }, pollInterval);
}

// 更新进度UI
function updateProgressUI(progress) {
  // 更新百分比
  document.getElementById('progress-percent').textContent = progress.percent + '%';
  document.getElementById('progress-bar').style.width = progress.percent + '%';
  
  // 更新消息
  document.getElementById('progress-message').textContent = progress.message;
  
  // 更新时间
  const timeText = `已用时 ${progress.elapsed_time}秒 · 预计剩余 ${progress.estimated_remaining}秒`;
  document.getElementById('progress-time').textContent = timeText;
  
  // 更新阶段指示器
  updateStageIndicators(progress.stage, progress.percent);
}

// 更新阶段指示器
function updateStageIndicators(currentStage, percent) {
  const stages = ['upload', 'parsing', 'structuring'];
  
  stages.forEach(stage => {
    const element = document.getElementById('stage-' + stage);
    const icon = element.querySelector('i');
    const circle = element.querySelector('div');
    const text = element.querySelector('span');
    
    if (stage === currentStage) {
      // 当前阶段
      icon.className = 'fas fa-spinner fa-spin text-blue-500';
      circle.className = 'w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center';
      text.className = 'text-blue-600 font-medium';
    } else if (stages.indexOf(stage) < stages.indexOf(currentStage)) {
      // 已完成阶段
      icon.className = 'fas fa-check text-green-500';
      circle.className = 'w-8 h-8 rounded-full bg-green-100 flex items-center justify-center';
      text.className = 'text-green-600';
    } else {
      // 待处理阶段
      icon.className = 'fas fa-circle text-gray-400';
      circle.className = 'w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center';
      text.className = 'text-gray-500';
    }
  });
}
```

---

## 🔔 Feature 2.2: 桌面通知

### 设计目标

**用户价值:**
- 解析完成后即使切换标签页也能收到通知
- 快速返回查看结果
- 提升用户体验

### 实现步骤

#### 步骤 2.2.1: 请求通知权限

```javascript
// 在页面加载时请求通知权限
document.addEventListener('DOMContentLoaded', async function() {
  // 检查浏览器支持
  if ('Notification' in window) {
    // 如果尚未授权，请求权限
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('[通知权限]', permission);
    }
  }
});
```

#### 步骤 2.2.2: 发送桌面通知

```javascript
/**
 * 发送桌面通知
 */
function sendDesktopNotification(title, options = {}) {
  // 检查权限
  if (!('Notification' in window)) {
    console.warn('[桌面通知] 浏览器不支持');
    return;
  }
  
  if (Notification.permission !== 'granted') {
    console.warn('[桌面通知] 未授权');
    return;
  }
  
  // 默认选项
  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'job-copilot-notification',
    requireInteraction: false,
    ...options,
  };
  
  // 发送通知
  const notification = new Notification(title, defaultOptions);
  
  // 点击通知时聚焦窗口
  notification.onclick = function() {
    window.focus();
    notification.close();
  };
  
  // 5秒后自动关闭
  setTimeout(() => {
    notification.close();
  }, 5000);
}

// 使用示例
sendDesktopNotification('简历解析完成！', {
  body: '您的简历已成功解析，点击查看详情',
  icon: '/favicon.ico',
});
```

#### 步骤 2.2.3: 集成到解析流程

```javascript
// 在轮询成功时发送通知
if (progress.status === 'completed') {
  clearInterval(intervalId);
  showCompletedState();
  
  // 发送桌面通知
  sendDesktopNotification('✅ 简历解析完成！', {
    body: `${progress.resume_name || '您的简历'}已成功解析，点击查看详情`,
    icon: '/favicon.ico',
  });
}
```

---

## 📄 Feature 2.3: PDF 类型检测

### 设计目标

**用户价值:**
- 了解自己的PDF类型
- 知道为什么解析需要这么久
- 更好的心理预期

**技术目标:**
- 前端快速检测（< 1秒）
- 准确区分数字 PDF vs 扫描 PDF
- 给出友好提示

### 检测方法

```javascript
/**
 * 检测 PDF 类型（数字 PDF vs 扫描 PDF）
 * 
 * 原理：数字PDF包含文本层，可以直接提取文本
 *      扫描PDF是纯图片，需要OCR识别
 */
async function detectPDFType(file) {
  try {
    // 使用 PDF.js 库检测
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // 检查第一页
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    
    // 统计文本内容
    const textLength = textContent.items
      .map(item => item.str)
      .join('')
      .trim()
      .length;
    
    // 判断类型
    if (textLength > 100) {
      return {
        type: 'digital', // 数字PDF
        confidence: 'high',
        message: '这是一份数字PDF，解析速度较快（约45秒）',
        icon: 'fa-file-alt',
        color: 'green',
      };
    } else {
      return {
        type: 'scanned', // 扫描PDF
        confidence: 'high',
        message: '这是一份扫描PDF，需要OCR识别，解析时间较长（约60-90秒）',
        icon: 'fa-file-image',
        color: 'yellow',
      };
    }
  } catch (error) {
    console.error('[PDF检测] 失败:', error);
    return {
      type: 'unknown',
      confidence: 'low',
      message: '无法检测PDF类型，将使用标准解析流程',
      icon: 'fa-question-circle',
      color: 'gray',
    };
  }
}
```

### UI 显示

```javascript
// 在文件选择后立即检测并显示
async function handleFileSelect(file) {
  selectedFile = file;
  fileName.textContent = file.name;
  uploadPlaceholder.classList.add('hidden');
  filePreview.classList.remove('hidden');
  
  // PDF 类型检测
  if (file.type === 'application/pdf') {
    const pdfType = await detectPDFType(file);
    
    // 显示类型提示
    const typeHint = document.createElement('div');
    typeHint.className = `mt-2 p-2 bg-${pdfType.color}-50 border border-${pdfType.color}-200 rounded-lg flex items-center gap-2 text-sm`;
    typeHint.innerHTML = `
      <i class="fas ${pdfType.icon} text-${pdfType.color}-500"></i>
      <span class="text-${pdfType.color}-700">${pdfType.message}</span>
    `;
    filePreview.appendChild(typeHint);
  }
}
```

---

## 📦 Phase 2 实施清单

### Day 1: 实时进度条
- [ ] 后端进度 API (`/api/resume/progress/:id`)
- [ ] 后端进度更新逻辑（在解析过程中调用）
- [ ] 前端进度条 HTML/CSS
- [ ] 前端轮询逻辑
- [ ] 阶段指示器动画
- [ ] 测试：上传 → 实时进度 → 完成

### Day 2: 桌面通知
- [ ] 请求通知权限逻辑
- [ ] 发送通知函数
- [ ] 集成到解析完成回调
- [ ] 测试：解析完成时收到通知
- [ ] 跨浏览器兼容性测试

### Day 3: PDF 类型检测
- [ ] 引入 PDF.js 库
- [ ] PDF 类型检测函数
- [ ] UI 类型提示显示
- [ ] 测试：数字PDF vs 扫描PDF
- [ ] 整体功能联调测试

---

## 📊 Phase 2 效果评估

### 量化指标

| 指标 | 当前 | Phase 2 目标 | 评估方法 |
|------|------|-------------|---------|
| 用户离开率 | 30% | < 10% | 统计解析期间关闭页面的比例 |
| 用户满意度 | 3.5/5 | 4.5/5 | 用户反馈评分 |
| 支持工单 | 10/周 | < 3/周 | 统计"解析慢"相关工单 |
| 进度查询次数 | N/A | 记录 | 统计用户刷新页面次数 |

### 用户反馈收集

**简单问卷（解析完成后显示）:**
```
📋 简历解析完成！

请为您的体验打分：
⭐⭐⭐⭐⭐

等待过程中您的感受：
○ 很清楚进度，体验良好
○ 能看到进度，但还是有点焦虑
○ 不太清楚发生了什么

最满意的功能：
☐ 实时进度条
☐ 桌面通知
☐ PDF类型检测

[提交反馈]
```

---

## 🚀 下一步：Phase 3

完成 Phase 2 后，立即启动 Phase 3:
- 部署 PyMuPDF 微服务
- 实现智能路由
- 实际速度 45s → 8s（数字 PDF）

**预期综合效果:**
- 感知速度：0.1秒（Phase 1.2）
- 实际速度：8秒（Phase 3，数字PDF）
- 用户体验：⭐⭐⭐⭐⭐

---

**文档创建时间**: 2026-01-15  
**预计完成时间**: 2026-01-18（3天）  
**当前状态**: 规划完成，待开发
