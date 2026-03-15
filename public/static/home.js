/**
 * Job Copilot V2 - Home Page Alpine.js Component
 * 
 * Dashboard mode (new/returning user) → Explore mode (market search) → Focus mode (job detail)
 * Includes: rotating placeholder, journey progress, suggestion engine, market search, charts
 */

document.addEventListener('alpine:init', function () {

  Alpine.data('homeV2', function () {
    return {
      // === State Machine ===
      phase: 'dashboard', // 'dashboard' | 'explore' | 'focus'

      // === User state (C1) ===
      isNewUser: true,
      targetRole: '',
      targetRoleInput: '',
      showTargetRolePicker: false,
      lastTask: null,

      // === Welcome ===
      welcomeTitle: '',
      welcomeSubtitle: '',

      // === Input ===
      userInput: '',
      inputFocused: false,
      chatInput: '',
      activeSegment: 0,

      // === Rotating placeholder (C2) ===
      placeholderTexts: [
        '上传简历，我们先生成你的求职画像',
        '我想找 AI 产品经理岗位',
        '帮我优化简历的项目经历部分',
        '分析一下字节跳动的 AI 岗位',
        '准备产品经理的面试'
      ],
      currentPlaceholderIndex: 0,
      currentPlaceholder: '',
      placeholderTimer: null,

      // === Search ===
      searchQuery: '',
      isSearching: false,
      searchStatus: '正在搜索中...',
      marketData: null,

      // === Chat ===
      messages: [],
      isTyping: false,
      showMobileChat: false,

      // === Focus ===
      focusedJob: null,

      // === Stats & data ===
      recentJobs: [],
      recentResumes: [],
      recentInterviews: [],

      // === Journey progress (C3) ===
      journeyStages: [],
      journeySummaryText: '你已经完成了前期准备的主要部分，接下来建议收窄岗位范围。',
      journeyHighlight: '岗位池建立 68%',
      journeyHighlightDesc: '已保存 18 个岗位，建议开始聚焦 6-8 个高优先级机会',

      // === Suggestions (C4) ===
      suggestions: [],

      // === Today's Tasks (Figma: numbered list) ===
      todayTasks: [
        { title: '有 3 个岗位建议优先投递', desc: '与你当前简历匹配度更高，且薪资区间更集中', cta: '查看', url: '/opportunities' },
        { title: '你的定向简历还缺少成果量化', desc: '已有 4 处经历可进一步强化结果表达', cta: '优化', url: '/assets' },
        { title: '明天有一场一面，建议先做 20 分钟模拟', desc: '系统已为你生成高概率问题清单', cta: '开始', url: '/interviews' },
      ],

      // === Companion ===
      companionMessage: '今天先别着急海投，我们先把最优先的三个岗位筛出来。',

      // === Agent roles ===
      agentRoles: {
        market: { name: '市场分析师', icon: 'fa-chart-line', color: '#0071e3', bgClass: 'bg-blue-500/10' },
        coach: { name: '面试教练', icon: 'fa-chalkboard-teacher', color: '#AF52DE', bgClass: 'bg-purple-500/10' },
        advisor: { name: '职业顾问', icon: 'fa-compass', color: '#34C759', bgClass: 'bg-emerald-500/10' },
        optimizer: { name: '简历优化师', icon: 'fa-magic', color: '#FF9F0A', bgClass: 'bg-amber-500/10' },
      },
      currentRole: 'market',

      get agentRole() {
        return this.agentRoles[this.currentRole] || this.agentRoles.market;
      },

      // ========================
      // Lifecycle
      // ========================
      init() {
        this.loadUserData();
        this.updateWelcome();
        this.calculateJourney();
        this.generateSuggestions();

        // Set the current placeholder immediately
        this.currentPlaceholder = this.placeholderTexts[0];

        // Only rotate placeholder for returning users; new users see fixed text per Figma
        if (!this.isNewUser) {
          this.startPlaceholderRotation();
        }

        // Auto-show target role picker for first-time users who haven't set a role
        var self = this;
        if (!this.targetRole) {
          setTimeout(function () { self.showTargetRolePicker = false; }, 800);
        }
      },

      // ========================
      // C1: User state detection
      // ========================
      loadUserData() {
        try {
          this.recentJobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
          this.recentResumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
          this.recentInterviews = JSON.parse(localStorage.getItem('jobcopilot_interviews') || '[]');
          this.targetRole = localStorage.getItem('jobcopilot_target_role') || '';
          this.targetRoleInput = this.targetRole;

          // Determine new vs returning user
          this.isNewUser = (this.recentJobs.length === 0 && this.recentResumes.length === 0 && this.recentInterviews.length === 0);

          // Determine last task for returning users
          if (!this.isNewUser) {
            this.lastTask = this.determineLastTask();
          }
        } catch (e) {
          this.isNewUser = true;
        }
      },

      determineLastTask() {
        // Find the most recently updated item and suggest continuing
        var latest = null;
        var latestTime = 0;

        if (this.recentJobs.length > 0) {
          var lastJob = this.recentJobs[this.recentJobs.length - 1];
          var jobTime = new Date(lastJob.created_at || lastJob.updated_at || 0).getTime();
          if (jobTime > latestTime) {
            latestTime = jobTime;
            latest = { label: (lastJob.basic_info?.job_name || lastJob.title || '岗位分析').substring(0, 12), url: '/job/' + lastJob.id };
          }
        }
        if (this.recentResumes.length > 0) {
          var lastRes = this.recentResumes[this.recentResumes.length - 1];
          var resTime = new Date(lastRes.created_at || lastRes.updated_at || 0).getTime();
          if (resTime > latestTime) {
            latestTime = resTime;
            latest = { label: '简历优化', url: '/resume/' + lastRes.id };
          }
        }
        return latest;
      },

      updateWelcome() {
        if (this.isNewUser) {
          this.welcomeTitle = '开始组织你的求职';
          this.welcomeSubtitle = '先做一步，系统会在后续给出今天最值得做的下一步。';
        } else {
          this.welcomeTitle = '继续推进你的求职旅程';
          this.welcomeSubtitle = '从岗位洞察到面试通关，你下一步该做什么，我们已经帮你梳理好了。';
        }
      },

      // ========================
      // C2: Rotating placeholder
      // ========================
      startPlaceholderRotation() {
        if (this.placeholderTimer) return;
        var self = this;
        this.placeholderTimer = setInterval(function () {
          self.currentPlaceholderIndex = (self.currentPlaceholderIndex + 1) % self.placeholderTexts.length;
          self.currentPlaceholder = self.placeholderTexts[self.currentPlaceholderIndex];
        }, 3000);
      },

      stopPlaceholderRotation() {
        if (this.placeholderTimer) {
          clearInterval(this.placeholderTimer);
          this.placeholderTimer = null;
        }
      },

      // ========================
      // Target role
      // ========================
      saveTargetRole() {
        try {
          var role = this.targetRoleInput.trim();
          if (!role) return;
          this.targetRole = role;
          localStorage.setItem('jobcopilot_target_role', role);
          this.showTargetRolePicker = false;
          this.calculateJourney();
          this.generateSuggestions();
          this.updateWelcome();
          if (window.JobCopilot && typeof JobCopilot.showToast === 'function') {
            JobCopilot.showToast('目标角色已保存: ' + role);
          }
          console.log('[Home] Target role saved:', role);
        } catch (e) {
          console.error('[Home] saveTargetRole error:', e);
          // Force close picker even on error
          this.showTargetRolePicker = false;
        }
      },

      // ========================
      // C3: Journey progress calculation
      // ========================
      calculateJourney() {
        var hasTarget = !!this.targetRole;
        var jobCount = this.recentJobs.length;
        var hasResume = this.recentResumes.length > 0;
        var hasOptimizedResume = this.recentResumes.some(function (r) { return r.optimized || r.versions; });
        var interviewCount = this.recentInterviews.length;
        var applications = [];
        try { applications = JSON.parse(localStorage.getItem('jobcopilot_applications') || '[]'); } catch (e) { }
        var hasAcceptedOffer = applications.some(function (a) { return a.status === 'offer_accepted'; });

        // Calculate percentages
        var pct1 = hasTarget ? 100 : 0;
        var pct2 = Math.min(Math.round((jobCount / 10) * 100), 100);
        var pct3 = hasOptimizedResume ? 100 : (hasResume ? 50 : 0);
        var pct4 = Math.min(Math.round((interviewCount / 20) * 100), 100);
        var pct5 = hasAcceptedOffer ? 100 : 0;

        this.journeyStages = [
          { name: '目标明确', pct: pct1, desc: hasTarget ? '已设定: ' + this.targetRole : '设定目标角色', action: hasTarget ? '' : '去设定', actionUrl: '#' },
          { name: '岗位池建立', pct: pct2, desc: jobCount + '/10 个岗位', action: pct2 < 100 ? '添加岗位' : '', actionUrl: '/job/new' },
          { name: '简历准备', pct: pct3, desc: hasResume ? (hasOptimizedResume ? '已优化' : '待优化') : '未上传', action: pct3 < 100 ? (hasResume ? '优化简历' : '上传简历') : '', actionUrl: hasResume ? '/resumes' : '/resume' },
          { name: '面试准备', pct: pct4, desc: interviewCount + '/20 道题', action: pct4 < 100 ? '去准备' : '', actionUrl: '/questions' },
          { name: 'Offer 决策', pct: pct5, desc: hasAcceptedOffer ? '已确定' : '等待中', action: pct5 < 100 ? '查看投递' : '', actionUrl: '/applications' },
        ];

        // Update Figma-style summary texts
        // Find the most active stage
        var stages = this.journeyStages;
        var activeIdx = 0;
        for (var i = stages.length - 1; i >= 0; i--) {
          if (stages[i].pct > 0 && stages[i].pct < 100) { activeIdx = i; break; }
          if (stages[i].pct >= 100) { activeIdx = i + 1; break; }
        }
        if (activeIdx >= stages.length) activeIdx = stages.length - 1;

        var activeStage = stages[activeIdx];
        this.journeyHighlight = activeStage.name + ' ' + activeStage.pct + '%';
        this.journeyHighlightDesc = activeStage.desc;
        
        // Summary text based on progress
        if (pct1 === 0) {
          this.journeySummaryText = '第一步是明确你的目标岗位方向，这会让后续所有步骤更高效。';
        } else if (pct2 < 50) {
          this.journeySummaryText = '你已经明确了方向，接下来多积累一些岗位，建立你的岗位池。';
        } else if (pct3 < 50) {
          this.journeySummaryText = '你已经完成了前期准备的主要部分，接下来建议收窄岗位范围。';
        } else if (pct4 < 50) {
          this.journeySummaryText = '简历已经就位，下一步是开始面试准备，积累经验和信心。';
        } else {
          this.journeySummaryText = '你的求职准备非常充分，接下来专注在面试表现和 Offer 决策。';
        }
      },

      // ========================
      // C4: Suggestion engine
      // ========================
      generateSuggestions() {
        var sug = [];
        var hasResume = this.recentResumes.length > 0;
        var jobCount = this.recentJobs.length;
        var interviewCount = this.recentInterviews.length;

        // Rule 1: No resume → suggest upload
        if (!hasResume) {
          sug.push({
            title: '上传你的简历',
            desc: '上传简历后才能使用匹配、优化、面试准备等全部功能',
            icon: 'fa-cloud-arrow-up',
            iconBg: 'bg-emerald-500/10 text-emerald-500',
            url: '/resume'
          });
        }

        // Rule 2: Has unmatched jobs
        if (jobCount > 0 && hasResume) {
          sug.push({
            title: '匹配你的岗位',
            desc: '你有 ' + jobCount + ' 个岗位，去看看哪些最匹配你的简历',
            icon: 'fa-link',
            iconBg: 'bg-blue-500/10 text-blue-500',
            url: '/jobs'
          });
        }

        // Rule 3: No target role
        if (!this.targetRole) {
          sug.push({
            title: '设定目标角色',
            desc: '明确方向是高效求职的第一步',
            icon: 'fa-crosshairs',
            iconBg: 'bg-amber-500/10 text-amber-500',
            action: 'setTarget'
          });
        }

        // Rule 4: Few interview questions
        if (interviewCount < 5) {
          sug.push({
            title: '准备面试题',
            desc: interviewCount === 0 ? '开始积累面试题库' : '已有 ' + interviewCount + ' 题，继续添加',
            icon: 'fa-comments',
            iconBg: 'bg-purple-500/10 text-purple-500',
            url: '/questions'
          });
        }

        // Rule 5: Add more jobs
        if (jobCount < 5) {
          sug.push({
            title: '扩充岗位池',
            desc: jobCount === 0 ? '添加第一个岗位' : '已有 ' + jobCount + ' 个，建议至少收集 10 个',
            icon: 'fa-compass',
            iconBg: 'bg-blue-500/10 text-blue-500',
            url: '/job/new'
          });
        }

        // Rule 6: Resume optimization
        if (hasResume && !this.recentResumes.some(function (r) { return r.optimized; })) {
          sug.push({
            title: '优化简历',
            desc: '让 AI 帮你提升简历质量',
            icon: 'fa-wand-magic-sparkles',
            iconBg: 'bg-emerald-500/10 text-emerald-500',
            url: '/resumes'
          });
        }

        // Take top 3
        this.suggestions = sug.slice(0, 3);

        // Fallback if no suggestions
        if (this.suggestions.length === 0) {
          this.suggestions = [
            { title: '探索市场', desc: '搜索感兴趣的岗位方向', icon: 'fa-chart-line', iconBg: 'bg-blue-500/10 text-blue-500', action: 'search' },
            { title: '查看评测', desc: '查看你的求职数据分析', icon: 'fa-chart-bar', iconBg: 'bg-amber-500/10 text-amber-500', url: '/metrics' },
            { title: '面试训练', desc: '模拟面试提升表现', icon: 'fa-headset', iconBg: 'bg-purple-500/10 text-purple-500', url: '/questions/import' },
          ];
        }

        // Update companion message
        this.updateCompanionMessage();
      },

      handleSuggestionAction(sug, event) {
        if (sug.action === 'setTarget') {
          event.preventDefault();
          this.showTargetRolePicker = true;
        } else if (sug.action === 'search') {
          event.preventDefault();
          this.userInput = this.targetRole || '热门岗位';
          this.submitQuery();
        }
      },

      updateCompanionMessage() {
        var msgs = [];
        var jobCount = this.recentJobs.length;
        var resumeCount = this.recentResumes.length;

        if (jobCount === 0 && resumeCount === 0) {
          msgs.push('你还没有开始求职准备，让我们一起迈出第一步吧！');
        } else if (jobCount > 0 && resumeCount === 0) {
          msgs.push('你已经收集了 ' + jobCount + ' 个岗位，下一步建议上传简历进行匹配。');
        } else if (resumeCount > 0 && jobCount < 5) {
          msgs.push('简历已就位！建议多收集一些岗位，扩大选择范围。');
        } else {
          msgs.push('进展不错！你有 ' + jobCount + ' 个岗位和 ' + resumeCount + ' 份简历，继续保持。');
        }
        this.companionMessage = msgs[0];
      },

      // ========================
      // State transitions
      // ========================
      async submitQuery() {
        var q = this.userInput.trim();
        if (!q) return;

        this.searchQuery = q;
        this.currentRole = 'market';
        this.phase = 'explore';
        this.isSearching = true;
        this.searchStatus = '正在搜索「' + q + '」相关岗位...';
        this.marketData = null;
        this.stopPlaceholderRotation();

        // Add body class for explore mode
        document.body.classList.remove('is-home');
        document.body.classList.add('is-home-explore');

        this.messages = [];
        this.addAIMessage('收到！我来帮你搜索「' + q + '」的市场情况。', '市场分析师', []);

        try {
          await this.performMarketSearch(q);
        } catch (e) {
          console.error('Search failed:', e);
          this.addAIMessage('搜索出现了问题: ' + e.message + '。你可以换个关键词试试。', '市场分析师');
          this.isSearching = false;
        }
      },

      backToDashboard() {
        if (this.phase === 'focus') {
          this.phase = 'explore';
          this.focusedJob = null;
          return;
        }
        this.phase = 'dashboard';
        this.marketData = null;
        this.messages = [];
        this.searchQuery = '';
        this.userInput = '';
        this.isSearching = false;
        document.body.classList.remove('is-home-explore');
        document.body.classList.add('is-home');
        this.startPlaceholderRotation();
      },

      focusJob(job) {
        this.focusedJob = job;
        this.phase = 'focus';
        this.currentRole = 'market';
        this.addAIMessage(
          '让我来分析一下「<b>' + (job.company || '') + ' - ' + (job.title || '') + '</b>」这个岗位。' +
          (job.salary ? '<br>薪资范围: ' + job.salary : ''),
          '市场分析师',
          [
            { label: '匹配简历', action: 'chat', text: '帮我分析这个岗位和我简历的匹配度' },
            { label: '准备面试', action: 'chat', text: '帮我准备这个岗位的面试' },
            { label: '深入分析', action: 'chat', text: '帮我深入分析这个岗位的JD' },
          ]
        );
      },

      // ========================
      // Market Search
      // ========================
      async performMarketSearch(query) {
        this.searchStatus = '正在搜索相关岗位信息...';

        var response = await fetch('/api/market/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query })
        });

        if (!response.ok) {
          throw new Error('搜索失败 (' + response.status + ')');
        }

        var data = await response.json();

        if (data.success) {
          this.marketData = data.data;
          this.isSearching = false;

          var jobCount = (data.data.jobs || []).length;
          var overview = data.data.overview || {};

          this.addAIMessage(
            '搜索完成！找到了 <b>' + jobCount + '</b> 个相关岗位。' +
            (overview.avgSalary ? '<br>平均薪资约 <b>' + overview.avgSalary + '</b>' : '') +
            (overview.topCompanies ? '<br>主要招聘公司: ' + overview.topCompanies.slice(0, 5).join('、') : '') +
            '<br><br>左侧已展示市场概览，你可以点击「进入机会工作台」深入管理这些岗位。',
            '市场分析师',
            [
              { label: '分析能力要求', action: 'chat', text: '帮我总结这些岗位的核心能力要求' },
              { label: '对比薪资水平', action: 'chat', text: '帮我对比不同公司的薪资水平' },
              { label: '推荐最匹配的', action: 'chat', text: '结合我的简历，推荐最匹配的岗位' },
            ]
          );

          this.$nextTick(() => {
            this.renderSalaryChart();
            this.renderRadarChart();
          });
        } else {
          throw new Error(data.error || '未知错误');
        }
      },

      // ========================
      // Chat
      // ========================
      addAIMessage(html, roleName, actions) {
        this.messages.push({
          role: 'ai',
          html: html, text: '',
          roleName: roleName || this.agentRole.name,
          actions: actions || [],
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        });
        this.scrollChat();
      },

      addUserMessage(text) {
        this.messages.push({
          role: 'user', text: text, html: '',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        });
        this.scrollChat();
      },

      async sendChatMessage() {
        var text = this.chatInput.trim();
        if (!text) return;
        this.chatInput = '';
        this.addUserMessage(text);
        this.isTyping = true;

        try {
          var response = await fetch('/api/market/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              context: {
                searchQuery: this.searchQuery,
                phase: this.phase,
                focusedJob: this.focusedJob,
                marketOverview: this.marketData?.overview || null,
              }
            })
          });

          this.isTyping = false;
          if (response.ok) {
            var data = await response.json();
            if (data.success) {
              this.addAIMessage(data.reply, data.roleName || this.agentRole.name, data.actions || []);
            } else {
              this.addAIMessage('抱歉，处理你的问题时出了点问题。请换个方式试试？', this.agentRole.name);
            }
          } else {
            this.addAIMessage('服务暂时不可用，请稍后再试。', this.agentRole.name);
          }
        } catch (e) {
          this.isTyping = false;
          this.addAIMessage('网络连接出现问题: ' + e.message, this.agentRole.name);
        }
      },

      sendMessage(text) {
        this.chatInput = text;
        this.sendChatMessage();
      },

      handleAction(action) {
        if (action.action === 'navigate') {
          window.location.href = action.url;
        } else if (action.action === 'chat') {
          this.chatInput = action.text;
          this.sendChatMessage();
        }
      },

      clearChat() {
        this.messages = [];
        if (this.searchQuery) {
          this.addAIMessage('对话已重置。你可以继续提问，或者点击左侧岗位查看详情。', this.agentRole.name);
        }
      },

      scrollChat() {
        setTimeout(function () {
          var el = document.getElementById('chat-messages');
          if (el) el.scrollTop = el.scrollHeight;
        }, 50);
      },

      // ========================
      // Charts
      // ========================
      renderSalaryChart() {
        var el = document.getElementById('salary-chart');
        if (!el || !this.marketData?.salaryDistribution) return;

        var chart = echarts.init(el);
        var dist = this.marketData.salaryDistribution;

        chart.setOption({
          tooltip: { trigger: 'axis', formatter: '{b}: {c} 个岗位' },
          grid: { top: 20, right: 20, bottom: 40, left: 50 },
          xAxis: {
            type: 'category',
            data: dist.map(function (d) { return d.range; }),
            axisLabel: { fontSize: 11, color: '#86868b' },
            axisLine: { lineStyle: { color: '#e5e7eb' } },
          },
          yAxis: {
            type: 'value',
            axisLabel: { fontSize: 11, color: '#86868b' },
            splitLine: { lineStyle: { color: '#f3f4f6' } },
          },
          series: [{
            type: 'bar',
            data: dist.map(function (d) { return d.count; }),
            itemStyle: {
              borderRadius: [8, 8, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#60a5fa' },
                { offset: 1, color: '#3b82f6' }
              ])
            },
            barWidth: '60%',
          }]
        });

        window.addEventListener('resize', function () { chart.resize(); });
      },

      renderRadarChart() {
        var el = document.getElementById('radar-chart');
        if (!el || !this.marketData?.radarData) return;

        var chart = echarts.init(el);
        var radar = this.marketData.radarData;

        chart.setOption({
          tooltip: {},
          radar: {
            indicator: radar.map(function (d) { return { name: d.dimension, max: 100 }; }),
            shape: 'polygon',
            splitNumber: 4,
            axisName: { color: '#1d1d1f', fontSize: 12 },
            splitLine: { lineStyle: { color: '#e5e7eb' } },
            splitArea: { areaStyle: { color: ['rgba(59,130,246,0.02)', 'rgba(59,130,246,0.04)'] } },
          },
          series: [{
            type: 'radar',
            data: [{
              value: radar.map(function (d) { return d.score; }),
              name: '市场要求',
              areaStyle: { color: 'rgba(59,130,246,0.15)' },
              lineStyle: { color: '#3b82f6', width: 2 },
              itemStyle: { color: '#3b82f6' },
            }]
          }]
        });

        window.addEventListener('resize', function () { chart.resize(); });
      },
    };
  });

});
