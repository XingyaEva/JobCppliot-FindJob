/**
 * Job Copilot - 前端交互脚本
 */

// ==================== 工具函数 ====================

/**
 * 复制文本到剪贴板
 */
async function copyToClipboard(text, buttonEl) {
  try {
    await navigator.clipboard.writeText(text);
    // 显示成功反馈
    if (buttonEl) {
      const originalText = buttonEl.innerHTML;
      buttonEl.innerHTML = '<i class="fas fa-check"></i> 已复制';
      buttonEl.classList.add('copy-success');
      setTimeout(() => {
        buttonEl.innerHTML = originalText;
        buttonEl.classList.remove('copy-success');
      }, 2000);
    }
    return true;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
}

/**
 * 切换折叠面板
 */
function toggleCollapse(targetId) {
  const content = document.getElementById(targetId);
  const icon = document.querySelector(`[data-collapse="${targetId}"] i`);
  
  if (content) {
    content.classList.toggle('open');
    if (icon) {
      icon.classList.toggle('fa-chevron-down');
      icon.classList.toggle('fa-chevron-up');
    }
  }
}

/**
 * 切换Tab
 */
function switchTab(tabGroup, tabId) {
  // 隐藏所有内容
  document.querySelectorAll(`[data-tab-group="${tabGroup}"]`).forEach(el => {
    el.classList.add('hidden');
  });
  // 显示目标内容
  const target = document.getElementById(tabId);
  if (target) {
    target.classList.remove('hidden');
  }
  
  // 更新Tab样式
  document.querySelectorAll(`[data-tab-btn="${tabGroup}"]`).forEach(btn => {
    btn.classList.remove('tab-active', 'font-semibold');
    btn.classList.add('text-gray-500');
  });
  const activeBtn = document.querySelector(`[data-tab-btn="${tabGroup}"][data-tab-target="${tabId}"]`);
  if (activeBtn) {
    activeBtn.classList.add('tab-active', 'font-semibold');
    activeBtn.classList.remove('text-gray-500');
  }
}

// ==================== LocalStorage 操作 ====================

const STORAGE_KEYS = {
  JOBS: 'jobcopilot_jobs',
  RESUMES: 'jobcopilot_resumes',
  MATCHES: 'jobcopilot_matches',
  INTERVIEWS: 'jobcopilot_interviews',
  OPTIMIZATIONS: 'jobcopilot_optimizations'
};

/**
 * 获取存储数据
 */
function getStorageData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('读取存储失败:', err);
    return [];
  }
}

/**
 * 保存存储数据
 */
function setStorageData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('保存存储失败:', err);
    return false;
  }
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==================== API 调用 ====================

/**
 * 调用后端API
 */
async function callAPI(endpoint, data = {}) {
  try {
    const response = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error('API调用失败:', err);
    throw err;
  }
}

// ==================== UI 组件 ====================

/**
 * 显示加载状态
 */
function showLoading(containerId, message = '加载中...') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <i class="fas fa-spinner loading-spinner text-3xl text-gray-400 mb-4"></i>
        <p class="text-gray-500">${message}</p>
      </div>
    `;
  }
}

/**
 * 显示错误信息
 */
function showError(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <i class="fas fa-exclamation-circle text-3xl text-red-400 mb-4"></i>
        <p class="text-red-500">${message}</p>
        <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
          重试
        </button>
      </div>
    `;
  }
}

/**
 * 显示Toast提示
 */
function showToast(message, type = 'info') {
  const colors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };
  
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ==================== 页面初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Job Copilot 前端已加载');
  
  // 初始化Tab点击事件
  document.querySelectorAll('[data-tab-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-tab-btn');
      const target = btn.getAttribute('data-tab-target');
      switchTab(group, target);
    });
  });
  
  // 初始化折叠面板点击事件
  document.querySelectorAll('[data-collapse]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('data-collapse');
      toggleCollapse(targetId);
    });
  });
  
  // 初始化复制按钮
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy');
      const target = document.getElementById(targetId);
      if (target) {
        copyToClipboard(target.textContent, btn);
      }
    });
  });
});

// 导出到全局
window.JobCopilot = {
  copyToClipboard,
  toggleCollapse,
  switchTab,
  getStorageData,
  setStorageData,
  generateId,
  callAPI,
  showLoading,
  showError,
  showToast,
  STORAGE_KEYS
};
