/**
 * FindJob 2.0 - 全局 AI 对话 Agent
 * 
 * 方案 B：可折叠右侧面板
 * - 默认展开（360px）
 * - 收起时 48px 窄条
 * - 上下文感知 + 联网搜索
 * - 使用百炼 qwen-plus
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('chatAgent', () => ({
    // === UI State ===
    expanded: true,           // 面板展开状态（默认展开）
    messages: [],             // 消息列表
    inputText: '',            // 输入框内容
    isStreaming: false,        // 是否正在流式响应
    abortController: null,    // 用于取消请求
    currentStreamText: '',    // 当前流式文本
    
    // === Context ===
    currentPage: '/',
    pageLabel: '首页',

    // === 页面上下文映射 ===
    pageMap: {
      '/': { label: '首页', icon: 'fa-home', color: 'text-primary' },
      '/opportunities': { label: '机会探索', icon: 'fa-compass', color: 'text-blue-600' },
      '/assets': { label: '资产管理', icon: 'fa-folder-open', color: 'text-emerald-600' },
      '/interviews': { label: '面试准备', icon: 'fa-comments', color: 'text-purple-600' },
      '/decisions': { label: 'Offer决策', icon: 'fa-scale-balanced', color: 'text-amber-600' },
      '/growth': { label: '技能成长', icon: 'fa-seedling', color: 'text-rose-500' },
      '/monitor': { label: '数据监控', icon: 'fa-gauge-high', color: 'text-cyan-600' },
    },

    // === 快捷操作映射 ===
    quickActions: {
      '/': [
        { label: '今日建议', prompt: '根据我的求职进度，给我今天的求职建议' },
        { label: '规划下一步', prompt: '帮我规划接下来的求职行动' },
        { label: '状态分析', prompt: '分析一下我目前的求职整体状态' },
      ],
      '/opportunities': [
        { label: '分析岗位', prompt: '帮我分析一下当前关注的岗位' },
        { label: '匹配度评估', prompt: '评估一下我和这个岗位的匹配度' },
        { label: '投递建议', prompt: '给我一些投递策略建议' },
      ],
      '/assets': [
        { label: '优化简历', prompt: '帮我优化当前简历的表达' },
        { label: '提取STAR', prompt: '帮我用STAR方法提炼工作经历' },
        { label: '补充证据', prompt: '建议我补充哪些成就证据' },
      ],
      '/interviews': [
        { label: '模拟面试', prompt: '给我出几道面试题，模拟一下面试' },
        { label: '准备计划', prompt: '帮我制定面试准备计划' },
        { label: '复盘分析', prompt: '帮我复盘最近的面试表现' },
      ],
      '/decisions': [
        { label: '对比Offer', prompt: '帮我对比手头的Offer' },
        { label: '薪资谈判', prompt: '给我一些薪资谈判技巧' },
        { label: '选择建议', prompt: '帮我做Offer选择分析' },
      ],
      '/growth': [
        { label: '学习计划', prompt: '帮我制定本周学习计划' },
        { label: '技能建议', prompt: '分析我需要提升哪些技能' },
        { label: '差距分析', prompt: '分析一下我的技能差距' },
      ],
      '/monitor': [
        { label: '数据解读', prompt: '帮我解读当前的求职数据' },
        { label: '异常分析', prompt: '看看有没有需要注意的异常指标' },
        { label: '优化建议', prompt: '基于数据给我优化投递策略的建议' },
      ],
    },

    // === Init ===
    init() {
      this.detectPage();
      this.loadHistory();
      
      // 监听路由变化
      window.addEventListener('popstate', () => this.detectPage());
      
      // 监听浏览器存储恢复状态
      const savedState = sessionStorage.getItem('chat_agent_expanded');
      if (savedState !== null) {
        this.expanded = savedState === 'true';
      }

      // 首页默认收起
      if (this.currentPage === '/') {
        this.expanded = false;
      }
    },

    // === 检测当前页面 ===
    detectPage() {
      const path = window.location.pathname;
      // 找到匹配的基础路径
      const matchedPath = Object.keys(this.pageMap).find(p => {
        if (p === '/') return path === '/';
        return path.startsWith(p);
      }) || '/';
      
      this.currentPage = matchedPath;
      this.pageLabel = this.pageMap[matchedPath]?.label || '首页';
    },

    // === 获取当前页面快捷操作 ===
    getQuickActions() {
      return this.quickActions[this.currentPage] || this.quickActions['/'];
    },

    // === 获取当前页面信息 ===
    getPageInfo() {
      return this.pageMap[this.currentPage] || this.pageMap['/'];
    },

    // === 切换展开/收起 ===
    toggle() {
      this.expanded = !this.expanded;
      sessionStorage.setItem('chat_agent_expanded', String(this.expanded));
    },

    // === 加载历史消息 ===
    loadHistory() {
      try {
        const key = 'chat_agent_history_' + this.currentPage;
        const saved = sessionStorage.getItem(key);
        if (saved) {
          this.messages = JSON.parse(saved);
        }
      } catch(e) {}
    },

    // === 保存历史消息 ===
    saveHistory() {
      try {
        const key = 'chat_agent_history_' + this.currentPage;
        // 最多保存 40 条
        const toSave = this.messages.slice(-40);
        sessionStorage.setItem(key, JSON.stringify(toSave));
      } catch(e) {}
    },

    // === 发送消息 ===
    async sendMessage(text) {
      const content = text || this.inputText.trim();
      if (!content || this.isStreaming) return;

      this.inputText = '';
      
      // 添加用户消息
      this.messages.push({
        role: 'user',
        content: content,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      });

      // 添加 AI 占位消息
      this.messages.push({
        role: 'assistant',
        content: '',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true,
      });

      this.isStreaming = true;
      this.currentStreamText = '';
      this.scrollToBottom();

      try {
        // 构建请求消息（只发送 role 和 content）
        const apiMessages = this.messages
          .filter(m => m.content && !m.isStreaming)
          .map(m => ({ role: m.role, content: m.content }));

        // 收集页面数据上下文
        const pageData = this.collectPageData();

        this.abortController = new AbortController();

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            context: {
              page: this.currentPage,
              pageData: pageData,
            },
          }),
          signal: this.abortController.signal,
        });

        if (!response.ok) {
          throw new Error('请求失败: ' + response.status);
        }

        // 处理 SSE 流
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            const data = trimmed.slice(5).trim();
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                this.currentStreamText += parsed.content;
                // 更新最后一条消息
                const lastMsg = this.messages[this.messages.length - 1];
                if (lastMsg && lastMsg.role === 'assistant') {
                  lastMsg.content = this.currentStreamText;
                }
                this.scrollToBottom();
              }
            } catch (e) {}
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          // 用户取消
          const lastMsg = this.messages[this.messages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content) {
            lastMsg.content = '（已取消）';
          }
        } else {
          console.error('[Chat Agent] Error:', error);
          const lastMsg = this.messages[this.messages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content = '抱歉，请求出现了问题，请稍后再试。';
          }
        }
      } finally {
        this.isStreaming = false;
        this.abortController = null;
        // 标记最后一条消息不再是 streaming
        const lastMsg = this.messages[this.messages.length - 1];
        if (lastMsg) lastMsg.isStreaming = false;
        this.saveHistory();
        this.scrollToBottom();
      }
    },

    // === 停止生成 ===
    stopGeneration() {
      if (this.abortController) {
        this.abortController.abort();
      }
    },

    // === 收集页面数据 ===
    collectPageData() {
      const data = {};
      try {
        // 尝试从 Alpine 组件获取数据
        if (this.currentPage === '/assets') {
          const workspace = document.querySelector('[x-data="assetsWorkspace"]');
          if (workspace && workspace._x_dataStack) {
            const d = workspace._x_dataStack[0];
            if (d.currentResume) {
              data.resumeName = d.currentResume.name;
              data.resumeSections = d.resumeSections?.map(s => s.title).join(', ');
            }
          }
        }
        // 获取目标岗位
        const roleLabel = document.getElementById('nav-role-label');
        if (roleLabel && roleLabel.textContent !== '目标岗位') {
          data.jobTitle = roleLabel.textContent;
        }
      } catch(e) {}
      return data;
    },

    // === 滚动到底部 ===
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatMessages;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },

    // === 清空对话 ===
    clearChat() {
      this.messages = [];
      this.currentStreamText = '';
      const key = 'chat_agent_history_' + this.currentPage;
      sessionStorage.removeItem(key);
    },

    // === 快捷操作点击 ===
    quickAction(prompt) {
      this.sendMessage(prompt);
    },

    // === 格式化消息内容（简单 markdown） ===
    formatContent(content) {
      if (!content) return '';
      
      let html = content;
      
      // 转义HTML
      html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // 粗体 **text**
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      
      // 行内代码 `code`
      html = html.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-black/[0.04] rounded text-[12px] font-mono">$1</code>');
      
      // 编号列表
      html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="flex gap-2 my-0.5"><span class="text-accent/60 font-medium flex-shrink-0">$1.</span><span>$2</span></div>');
      
      // 无序列表
      html = html.replace(/^[-•]\s+(.+)$/gm, '<div class="flex gap-2 my-0.5"><span class="text-accent/60 flex-shrink-0">•</span><span>$1</span></div>');
      
      // 换行
      html = html.replace(/\n/g, '<br>');
      
      return html;
    },

    // === 输入框键盘事件 ===
    handleKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    },
  }));
});
