/**
 * FindJob 2.0 - Opportunities Workspace Alpine.js Component
 * 
 * Full API integration: loads jobs from /api/jobs, supports delete, 
 * add to application list, detail view with all tabs, and real-time filtering.
 */

document.addEventListener('alpine:init', function () {

  Alpine.data('oppWorkspace', function () {
    return {
      // === Job list ===
      jobs: [],
      filteredJobs: [],
      loading: true,
      searchTerm: '',
      activeFilter: 'all',
      sortMode: 'recent',  // 'recent' | 'match' | 'salary'
      errorMessage: '',

      filterOptions: [
        { label: '全部', value: 'all', count: 0 },
        { label: '待研究', value: 'completed', count: 0 },
        { label: '待投递', value: 'pending_apply', count: 0 },
        { label: '面试中', value: 'interviewing', count: 0 },
        { label: '已淘汰', value: 'rejected', count: 0 },
      ],

      get sortLabel() {
        if (this.sortMode === 'match') return '匹配度';
        if (this.sortMode === 'salary') return '薪资';
        return '最近添加';
      },

      // === Selected job & detail ===
      selectedJob: null,
      activeTab: 'overview',
      tabs: [
        { id: 'overview', label: '概览' },
        { id: 'jd', label: 'JD 解析' },
        { id: 'capability', label: '能力模型' },
        { id: 'match', label: '匹配诊断' },
        { id: 'company', label: '公司分析' },
        { id: 'application', label: '投递记录' },
      ],

      // === JD parse tab data ===
      jdFields: [],
      deepPanels: [],

      // === Capability model ===
      capabilityDims: [],

      // === Company analysis ===
      companyBlocks: [],

      // === Application record ===
      applicationStatuses: [
        { label: '待投递', done: false, active: true },
        { label: '已投递', done: false, active: false },
        { label: '一面', done: false, active: false },
        { label: '二面', done: false, active: false },
        { label: 'HR面', done: false, active: false },
        { label: 'Offer', done: false, active: false },
        { label: '入职', done: false, active: false },
      ],
      applicationData: null,

      // === Add drawer ===
      showAddDrawer: false,
      addTab: 'text',
      addJobTitle: '',
      addJobText: '',
      addJobUrl: '',
      showFilter: false,

      // === Delete confirmation ===
      showDeleteConfirm: false,
      deleteTargetJob: null,

      // === Toast ===
      toastMessage: '',
      toastType: 'info', // 'info' | 'success' | 'error' | 'warning'
      toastVisible: false,

      // === Submitting state ===
      submitting: false,
      addingToApplication: false,

      // ========================
      // Lifecycle
      // ========================
      init() {
        this.loadJobsFromAPI();

        // Watch for tab changes to render charts
        this.$watch('activeTab', (val) => {
          if (val === 'capability') {
            this.$nextTick(() => this.renderRadar());
          }
          if (val === 'application' && this.selectedJob) {
            this.loadApplicationData(this.selectedJob.id);
          }
        });
      },

      // ========================
      // Toast helper
      // ========================
      showToast(message, type) {
        type = type || 'info';
        this.toastMessage = message;
        this.toastType = type;
        this.toastVisible = true;
        var self = this;
        setTimeout(function() {
          self.toastVisible = false;
        }, 3000);
      },

      // ========================
      // Data Loading from API
      // ========================
      async loadJobsFromAPI() {
        this.loading = true;
        this.errorMessage = '';
        try {
          var response = await fetch('/api/jobs');
          var data = await response.json();
          
          if (data.success && data.jobs) {
            this.jobs = data.jobs.map(function(j) {
              // Normalize and enrich job data
              var tags = [];
              if (j.b_analysis || j.analysis_b) {
                var ab = j.b_analysis || j.analysis_b;
                if (ab.tech_keywords) tags = tags.concat(ab.tech_keywords.slice(0, 3));
                if (ab.industry) tags.push(ab.industry);
              }
              if (j.structured_jd || j.basic_info) {
                var info = j.structured_jd || j.basic_info || {};
                if (info.job_type) tags.push(info.job_type);
              }
              if (tags.length === 0 && j.tags) tags = j.tags;

              var basicInfo = j.structured_jd || j.basic_info || {};
              
              return {
                id: j.id,
                title: j.title || basicInfo.title || basicInfo.job_name || '\u672a\u547d\u540d\u5c97\u4f4d',
                company: j.company || basicInfo.company || '',
                location: basicInfo.location || j.location || '',
                salary: basicInfo.salary || j.salary || '',
                source: j.source || j.source_type || j.platform || '',
                status: j.status || 'completed',
                tags: tags.slice(0, 4),
                matchScore: j.matchScore || (j.match_result && j.match_result.score) || null,
                matchGrade: j.matchGrade || (j.match_result && j.match_result.grade) || null,
                isNew: j.status === 'completed' && j.created_at && (Date.now() - new Date(j.created_at).getTime() < 3600000),
                created_at: j.created_at || j.updated_at || null,
                basic_info: basicInfo,
                analysis: j.a_analysis || j.analysis || j.analysis_a || null,
                analysis_b: j.b_analysis || j.analysis_b || null,
                structured: j.structured_jd || j.structured || null,
                conclusion: j.conclusion || null,
                job_url: j.job_url || null,
                favorited: false,
                applicationStatus: j.application_status || null,
                raw: j
              };
            });
            // Load favorites from localStorage
            try {
              var favs = JSON.parse(localStorage.getItem('jobcopilot_favorites') || '{}');
              this.jobs.forEach(function(j) {
                if (favs[j.id]) j.favorited = true;
              });
            } catch(e) {}
            this.filterJobs();
            
            // Also sync to localStorage for home page compatibility
            try {
              localStorage.setItem('jobcopilot_jobs', JSON.stringify(data.jobs));
            } catch(e) { /* ignore */ }
          } else {
            this.errorMessage = data.error || '加载岗位失败';
            this.jobs = [];
            this.filteredJobs = [];
          }
        } catch(e) {
          console.error('Failed to load jobs from API:', e);
          this.errorMessage = '网络请求失败，请检查连接';
          // Fallback to localStorage
          this.loadJobsFromLocalStorage();
        }
        this.loading = false;
      },

      loadJobsFromLocalStorage() {
        try {
          var rawJobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
          this.jobs = rawJobs.map(function(j) {
            var tags = [];
            if (j.b_analysis || j.analysis_b) {
              var ab = j.b_analysis || j.analysis_b;
              if (ab.tech_keywords) tags = tags.concat(ab.tech_keywords.slice(0, 3));
              if (ab.industry) tags.push(ab.industry);
            }
            if (tags.length === 0 && j.tags) tags = j.tags;
            
            var basicInfo = j.structured_jd || j.basic_info || {};
            return {
              id: j.id,
              title: j.title || basicInfo.title || '未命名岗位',
              company: j.company || basicInfo.company || '',
              location: basicInfo.location || '',
              salary: basicInfo.salary || '',
              source: j.source_type || '',
              status: j.status || 'completed',
              tags: tags.slice(0, 4),
              matchScore: null,
              matchGrade: null,
              isNew: false,
              created_at: j.created_at || null,
              basic_info: basicInfo,
              analysis: j.a_analysis || null,
              analysis_b: j.b_analysis || null,
              structured: j.structured_jd || null,
              conclusion: null,
              job_url: j.job_url || null,
              raw: j
            };
          });
          this.filterJobs();
        } catch(e) {
          console.error('Failed to load jobs from localStorage:', e);
          this.jobs = [];
          this.filteredJobs = [];
        }
      },

      // ========================
      // Filter & Sort
      // ========================
      filterJobs() {
        var self = this;
        var result = this.jobs.slice();

        // Status filter - Figma v2 filter tabs
        if (this.activeFilter === 'completed') {
          // "待研究" = completed jobs without application status
          result = result.filter(function(j) { return j.status === 'completed' && !j.applicationStatus; });
        } else if (this.activeFilter === 'pending_apply') {
          result = result.filter(function(j) { return j.applicationStatus === 'pending' || j.applicationStatus === '\u5f85\u6295\u9012'; });
        } else if (this.activeFilter === 'interviewing') {
          result = result.filter(function(j) { return j.applicationStatus === 'interviewing' || j.applicationStatus === '\u9762\u8bd5\u4e2d'; });
        } else if (this.activeFilter === 'rejected') {
          result = result.filter(function(j) { return j.applicationStatus === 'rejected' || j.applicationStatus === '\u5df2\u6dd8\u6c70'; });
        }
        // 'all' shows everything

        // Search term
        if (this.searchTerm.trim()) {
          var q = this.searchTerm.toLowerCase();
          result = result.filter(function(j) {
            return (j.title && j.title.toLowerCase().includes(q)) ||
                   (j.company && j.company.toLowerCase().includes(q)) ||
                   (j.location && j.location.toLowerCase().includes(q)) ||
                   (j.tags && j.tags.some(function(t) { return t.toLowerCase().includes(q); }));
          });
        }

        // Sort
        if (this.sortMode === 'match') {
          result.sort(function(a, b) { return (b.matchScore || 0) - (a.matchScore || 0); });
        } else if (this.sortMode === 'salary') {
          result.sort(function(a, b) {
            return self.parseSalary(b.salary) - self.parseSalary(a.salary);
          });
        } else {
          // Recent first
          result.sort(function(a, b) {
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          });
        }

        this.filteredJobs = result;
        this.updateFilterCounts();
      },

      cycleSortMode() {
        var modes = ['recent', 'match', 'salary'];
        var idx = modes.indexOf(this.sortMode);
        this.sortMode = modes[(idx + 1) % modes.length];
        this.filterJobs();
      },

      parseSalary(s) {
        if (!s) return 0;
        var match = s.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      },

      // ========================
      // Job Selection & Detail Loading
      // ========================
      async selectJob(job) {
        this.selectedJob = job;
        this.activeTab = 'overview';
        this.applicationData = null;
        this.populateDetailData(job);

        // If job detail might be richer from API, fetch it
        if (job.id) {
          try {
            var response = await fetch('/api/job/' + job.id);
            var data = await response.json();
            if (data.success && data.job) {
              // Merge richer data from API
              var apiJob = data.job;
              var basicInfo = apiJob.structured_jd || apiJob.basic_info || {};
              job.analysis = apiJob.a_analysis || apiJob.analysis || job.analysis;
              job.analysis_b = apiJob.b_analysis || apiJob.analysis_b || job.analysis_b;
              job.structured = apiJob.structured_jd || job.structured;
              job.basic_info = basicInfo;
              job.raw = apiJob;
              this.selectedJob = job;
              this.populateDetailData(job);
            }
          } catch(e) {
            console.warn('Could not fetch job detail from API:', e);
          }
        }
      },

      populateDetailData(job) {
        var bi = job.basic_info || {};
        var analysis = job.analysis || {};
        var structured = job.structured || {};
        var ab = job.analysis_b || {};

        // JD fields for parse tab
        this.jdFields = [
          { label: '岗位名称', value: bi.title || bi.job_name || job.title },
          { label: '公司', value: bi.company || job.company },
          { label: '薪资', value: bi.salary || job.salary },
          { label: '地点', value: bi.location || job.location },
          { label: '经验要求', value: bi.experience || structured.experience || '-' },
          { label: '学历要求', value: bi.education || structured.education || '-' },
          { label: '核心职责', value: this.formatArrayOrString(structured.core_responsibilities || bi.responsibilities) },
          { label: '关键要求', value: this.formatArrayOrString(structured.key_requirements || bi.requirements) },
          { label: '优先项', value: this.formatArrayOrString(structured.preferred || bi.preferred) },
        ];

        // Deep analysis panels
        this.deepPanels = [
          { title: '行业背景要求', content: ab.industry_background || analysis.industry_background || '暂无分析数据', open: false },
          { title: '技术背景要求', content: ab.tech_background || analysis.tech_background || '暂无分析数据', open: false },
          { title: '产品经验要求', content: ab.product_experience || analysis.product_experience || '暂无分析数据', open: false },
          { title: '能力模型要求', content: ab.capability_model || analysis.capability_model || '暂无分析数据', open: false },
        ];

        // Capability dimensions
        var capDims = ab.capability_dimensions || ab.dimensions || [];
        if (capDims.length > 0) {
          this.capabilityDims = capDims.map(function(d) {
            return {
              name: d.name || d.dimension,
              weight: d.weight || '中',
              evidence: d.evidence || d.description || '',
              score: d.score || 0
            };
          });
        } else {
          this.capabilityDims = [
            { name: '行业理解', weight: ab.industry_weight || '高', evidence: ab.industry_evidence || '', score: 0 },
            { name: '产品经验', weight: ab.product_weight || '中', evidence: ab.product_evidence || '', score: 0 },
            { name: '技术理解', weight: ab.tech_weight || '高', evidence: ab.tech_evidence || '', score: 0 },
            { name: '数据能力', weight: ab.data_weight || '中', evidence: ab.data_evidence || '', score: 0 },
            { name: '协作推动', weight: ab.collaboration_weight || '中', evidence: ab.collaboration_evidence || '', score: 0 },
            { name: '0-1 / 平台适配度', weight: ab.platform_weight || '高', evidence: ab.platform_evidence || '', score: 0 },
          ];
        }

        // Company blocks
        this.companyBlocks = [
          { title: '公司一句话画像', content: analysis.company_profile || analysis.company_summary || bi.company || '暂无数据' },
          { title: '发展阶段 / 业务定位', content: analysis.company_stage || analysis.stage || '暂无数据' },
          { title: 'AI 场景与布局', content: analysis.ai_landscape || analysis.ai_strategy || '暂无数据' },
          { title: '竞品与差异', content: analysis.competitors || analysis.competition || '暂无数据' },
          { title: '面试情报', content: analysis.interview_intel || analysis.interview_tips || '暂无数据' },
        ];

        // Conclusion - try to extract from analysis
        if (!job.conclusion && analysis) {
          job.conclusion = {
            recommendation: analysis.recommendation || analysis.verdict || '待分析',
            recReason: analysis.rec_reason || analysis.summary || '',
            matchReason: analysis.match_reason || '',
            strength: analysis.top_strength || analysis.strength || '待分析',
            strengthDetail: analysis.strength_detail || '',
            risk: analysis.top_risk || analysis.risk || '待分析',
            riskDetail: analysis.risk_detail || '',
          };
        }
      },

      formatArrayOrString(val) {
        if (!val) return '-';
        if (Array.isArray(val)) return val.join('；');
        return String(val);
      },

      // ========================
      // Delete Job
      // ========================
      confirmDeleteJob(job) {
        this.deleteTargetJob = job;
        this.showDeleteConfirm = true;
      },

      async deleteJob() {
        if (!this.deleteTargetJob) return;
        var jobId = this.deleteTargetJob.id;
        var jobTitle = this.deleteTargetJob.title;
        this.showDeleteConfirm = false;

        try {
          var response = await fetch('/api/job/' + jobId, { method: 'DELETE' });
          var data = await response.json();
          
          if (data.success) {
            // Remove from local list
            this.jobs = this.jobs.filter(function(j) { return j.id !== jobId; });
            this.filterJobs();
            
            // Clear selection if deleted
            if (this.selectedJob && this.selectedJob.id === jobId) {
              this.selectedJob = null;
            }

            // Update localStorage
            try {
              var stored = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
              stored = stored.filter(function(j) { return j.id !== jobId; });
              localStorage.setItem('jobcopilot_jobs', JSON.stringify(stored));
            } catch(e) { /* ignore */ }

            this.showToast('已删除「' + jobTitle + '」', 'success');
          } else {
            this.showToast('删除失败：' + (data.error || '未知错误'), 'error');
          }
        } catch(e) {
          console.error('Delete job failed:', e);
          this.showToast('删除请求失败，请重试', 'error');
        }
        this.deleteTargetJob = null;
      },

      // ========================
      // Add to Application List
      // ========================
      async addToApplicationList(job) {
        if (this.addingToApplication) return;
        this.addingToApplication = true;

        try {
          var response = await fetch('/api/applications/from-job/' + job.id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: job.source || 'direct' })
          });
          var data = await response.json();

          if (data.success) {
            this.showToast('已将「' + job.title + '」加入投递清单', 'success');
            // Reload application data if on that tab
            if (this.activeTab === 'application') {
              this.loadApplicationData(job.id);
            }
          } else {
            if (data.error && data.error.includes('已有投递记录')) {
              this.showToast('该岗位已在投递清单中', 'warning');
            } else {
              this.showToast('加入失败：' + (data.error || '未知错误'), 'error');
            }
          }
        } catch(e) {
          console.error('Add to application failed:', e);
          this.showToast('请求失败，请重试', 'error');
        }
        this.addingToApplication = false;
      },

      // ========================
      // Load Application Data
      // ========================
      async loadApplicationData(jobId) {
        try {
          var response = await fetch('/api/applications?search=');
          var data = await response.json();
          if (data.success && data.applications) {
            var app = data.applications.find(function(a) { return a.job_id === jobId; });
            if (app) {
              this.applicationData = app;
              // Update application statuses based on real data
              this.updateApplicationStatuses(app);
            } else {
              this.applicationData = null;
              this.resetApplicationStatuses();
            }
          }
        } catch(e) {
          console.warn('Could not load application data:', e);
        }
      },

      updateApplicationStatuses(app) {
        var statusOrder = ['applied', 'screening', 'interview', 'offer'];
        var currentIdx = statusOrder.indexOf(app.status);
        
        this.applicationStatuses = [
          { label: '已投递', done: currentIdx >= 0, active: currentIdx === 0 },
          { label: '筛选中', done: currentIdx >= 1, active: currentIdx === 1 },
          { label: '面试中', done: currentIdx >= 2, active: currentIdx === 2 },
          { label: '已获Offer', done: currentIdx >= 3, active: currentIdx === 3 },
        ];

        if (app.status === 'rejected') {
          this.applicationStatuses.push({ label: '已拒绝', done: true, active: true });
        }
        if (app.status === 'withdrawn') {
          this.applicationStatuses.push({ label: '已撤回', done: true, active: true });
        }
      },

      resetApplicationStatuses() {
        this.applicationStatuses = [
          { label: '待投递', done: false, active: true },
          { label: '已投递', done: false, active: false },
          { label: '一面', done: false, active: false },
          { label: '二面', done: false, active: false },
          { label: 'HR面', done: false, active: false },
          { label: 'Offer', done: false, active: false },
          { label: '入职', done: false, active: false },
        ];
      },

      // ========================
      // ECharts Radar
      // ========================
      renderRadar() {
        var el = document.getElementById('opp-radar-chart');
        if (!el) return;

        try {
          var chart = echarts.init(el);
          var dims = this.capabilityDims;
          chart.setOption({
            tooltip: {},
            radar: {
              indicator: dims.map(function(d) { return { name: d.name, max: 100 }; }),
              shape: 'polygon',
              splitNumber: 4,
              axisName: { color: '#1d1d1f', fontSize: 11 },
              splitLine: { lineStyle: { color: '#e5e7eb' } },
              splitArea: { areaStyle: { color: ['rgba(59,130,246,0.02)', 'rgba(59,130,246,0.04)'] } },
            },
            series: [{
              type: 'radar',
              data: [{
                value: dims.map(function(d) { 
                  if (d.score > 0) return d.score;
                  return d.weight === '高' ? 85 : d.weight === '中' ? 60 : 40; 
                }),
                name: '岗位要求',
                areaStyle: { color: 'rgba(59,130,246,0.15)' },
                lineStyle: { color: '#3b82f6', width: 2 },
                itemStyle: { color: '#3b82f6' },
              }]
            }]
          });
          window.addEventListener('resize', function() { chart.resize(); });
        } catch(e) {
          console.error('Radar chart error:', e);
        }
      },

      // ========================
      // Add Job (Submit)
      // ========================
      async submitNewJob() {
        if (this.submitting) return;
        
        if (this.addTab === 'text') {
          if (!this.addJobText.trim()) {
            this.showToast('请粘贴岗位描述', 'warning');
            return;
          }
          this.submitting = true;
          try {
            var response = await fetch('/api/job/parse-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'text',
                content: this.addJobText,
                jobUrl: null
              })
            });
            var data = await response.json();
            if (data.success && data.job) {
              this.showToast('岗位「' + (data.job.title || '新岗位') + '」解析成功！', 'success');
              this.showAddDrawer = false;
              this.addJobText = '';
              this.addJobTitle = '';
              // Reload job list
              await this.loadJobsFromAPI();
              // Auto-select the new job
              if (this.filteredJobs.length > 0) {
                this.selectJob(this.filteredJobs[0]);
              }
            } else {
              this.showToast('解析失败：' + (data.error || '未知错误'), 'error');
            }
          } catch(e) {
            console.error('Submit job failed:', e);
            this.showToast('请求失败，请重试', 'error');
          }
          this.submitting = false;
          
        } else if (this.addTab === 'url') {
          if (!this.addJobUrl.trim()) {
            this.showToast('请输入岗位链接', 'warning');
            return;
          }
          this.submitting = true;
          try {
            var response = await fetch('/api/job/parse-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: this.addJobUrl })
            });
            var data = await response.json();
            if (data.success && data.job) {
              this.showToast('岗位「' + (data.job.title || '新岗位') + '」解析成功！', 'success');
              this.showAddDrawer = false;
              this.addJobUrl = '';
              await this.loadJobsFromAPI();
              if (this.filteredJobs.length > 0) {
                this.selectJob(this.filteredJobs[0]);
              }
            } else {
              this.showToast('解析失败：' + (data.error || '未知错误'), 'error');
            }
          } catch(e) {
            console.error('Submit URL job failed:', e);
            this.showToast('请求失败，请重试', 'error');
          }
          this.submitting = false;
          
        } else {
          // Screenshot mode - redirect
          window.location.href = '/job/new';
        }
      },

      // ========================
      // Refresh
      // ========================
      async refreshJobs() {
        this.showToast('正在刷新...', 'info');
        await this.loadJobsFromAPI();
        this.showToast('已刷新岗位列表', 'success');
      },

      // ========================
      // Helpers
      // ========================
      formatTime(dateStr) {
        if (!dateStr) return '';
        try {
          var d = new Date(dateStr);
          var now = new Date();
          var diff = now.getTime() - d.getTime();
          var mins = Math.floor(diff / 60000);
          if (mins < 1) return '刚刚';
          if (mins < 60) return mins + ' 分钟前';
          var hours = Math.floor(mins / 60);
          if (hours < 24) return hours + ' 小时前';
          var days = Math.floor(hours / 24);
          if (days < 30) return days + ' 天前';
          return d.toLocaleDateString('zh-CN');
        } catch(e) { return ''; }
      },

      statusClass(status) {
        var m = {
          processing: 'bg-blue-500/10 text-blue-700',
          completed: 'bg-emerald-500/10 text-emerald-700',
          error: 'bg-red-500/10 text-red-600',
          pending: 'bg-amber-500/10 text-amber-700',
        };
        return m[status] || 'bg-black/[0.04] text-secondary';
      },

      statusLabel(status) {
        var m = {
          processing: '解析中',
          completed: '已完成',
          error: '解析失败',
          pending: '等待中',
        };
        return m[status] || status || '';
      },

      sourceLabel(source) {
        var m = {
          text: '\u6587\u672c\u89e3\u6790',
          url: 'URL \u722c\u53d6',
          image: '\u622a\u56fe\u89e3\u6790',
          boss: 'Boss\u76f4\u8058',
          lagou: '\u62c9\u52fe',
          liepin: '\u730e\u8058',
        };
        return m[source] || source || '';
      },

      // === Figma v2: Favorite toggle ===
      toggleFavorite(job) {
        job.favorited = !job.favorited;
        // Persist to localStorage if needed
        try {
          var favs = JSON.parse(localStorage.getItem('jobcopilot_favorites') || '{}');
          if (job.favorited) {
            favs[job.id] = true;
          } else {
            delete favs[job.id];
          }
          localStorage.setItem('jobcopilot_favorites', JSON.stringify(favs));
        } catch(e) {}
      },

      // === Figma v2: Job context menu ===
      showJobMenu(job, event) {
        // Simple: use confirm dialog for actions
        var actions = [
          '\u52a0\u5165\u6295\u9012\u6e05\u5355',
          '\u751f\u6210\u5b9a\u5411\u7b80\u5386',
          '\u5f00\u59cb\u9762\u8bd5\u51c6\u5907',
          '\u5220\u9664\u5c97\u4f4d',
        ];
        // For now, show delete confirmation
        this.confirmDeleteJob(job);
      },

      // === Figma v2: Application status helpers ===
      appStatusClass(status) {
        var m = {
          'pending': 'bg-amber-50 text-amber-600',
          'applied': 'bg-blue-50 text-blue-600',
          'interviewing': 'bg-purple-50 text-purple-600',
          'offer': 'bg-emerald-50 text-emerald-600',
          'rejected': 'bg-red-50 text-red-600',
          '\u5f85\u6295\u9012': 'bg-amber-50 text-amber-600',
          '\u5df2\u6295\u9012': 'bg-blue-50 text-blue-600',
          '\u9762\u8bd5\u4e2d': 'bg-purple-50 text-purple-600',
        };
        return m[status] || 'bg-gray-50 text-gray-600';
      },

      appStatusLabel(status) {
        var m = {
          'pending': '\u5f85\u6295\u9012',
          'applied': '\u5df2\u6295\u9012',
          'interviewing': '\u9762\u8bd5\u4e2d',
          'offer': '\u5df2Offer',
          'rejected': '\u5df2\u6dd8\u6c70',
        };
        return m[status] || status || '';
      },

      // === Figma v2: Update filter counts ===
      updateFilterCounts() {
        var self = this;
        var allCount = this.jobs.length;
        this.filterOptions.forEach(function(f) {
          if (f.value === 'all') {
            f.count = allCount;
          } else if (f.value === 'completed') {
            f.count = self.jobs.filter(function(j) { return j.status === 'completed' && !j.applicationStatus; }).length;
          } else if (f.value === 'pending_apply') {
            f.count = self.jobs.filter(function(j) { return j.applicationStatus === 'pending' || j.applicationStatus === '\u5f85\u6295\u9012'; }).length;
          } else if (f.value === 'interviewing') {
            f.count = self.jobs.filter(function(j) { return j.applicationStatus === 'interviewing' || j.applicationStatus === '\u9762\u8bd5\u4e2d'; }).length;
          } else if (f.value === 'rejected') {
            f.count = self.jobs.filter(function(j) { return j.applicationStatus === 'rejected' || j.applicationStatus === '\u5df2\u6dd8\u6c70'; }).length;
          }
        });
      },
    };
  });

});
