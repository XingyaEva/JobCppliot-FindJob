/**
 * FindJob 2.0 - Decisions Center Alpine.js Logic
 * 5 sub-modules: tracking, list, compare, negotiate, advice
 * localStorage persistence for offers, applications, preferences
 */

(function () {
  'use strict';

  var OFFERS_KEY = 'jobcopilot_offers';
  var APPS_KEY = 'jobcopilot_applications';
  var DECISIONS_KEY = 'jobcopilot_decisions';

  function loadJSON(key, fallback) {
    try { var d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
    catch (e) { return fallback; }
  }

  function saveJSON(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* quota */ }
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* ---- Stage/status helpers ---- */
  var stageMap = {
    applied:   { text: '已投递', cls: 'bg-blue-50 text-blue-600' },
    screening: { text: '筛选中', cls: 'bg-amber-50 text-amber-600' },
    interview: { text: '面试中', cls: 'bg-violet-50 text-violet-600' },
    offer:     { text: '已拿Offer', cls: 'bg-emerald-50 text-emerald-600' },
    rejected:  { text: '未通过', cls: 'bg-red-50 text-red-500' },
    accepted:  { text: '已接受', cls: 'bg-emerald-100 text-emerald-700' }
  };

  var offerStatusMap = {
    pending:   { text: '待处理', cls: 'bg-amber-50 text-amber-600' },
    comparing: { text: '对比中', cls: 'bg-blue-50 text-blue-600' },
    negotiating: { text: '谈薪中', cls: 'bg-violet-50 text-violet-600' },
    accepted:  { text: '已接受', cls: 'bg-emerald-50 text-emerald-600' },
    declined:  { text: '已拒绝', cls: 'bg-red-50 text-red-500' }
  };

  var stageBarColors = {
    applied: 'bg-blue-400',
    screening: 'bg-amber-400',
    interview: 'bg-violet-400',
    offer: 'bg-emerald-400',
    rejected: 'bg-red-300'
  };

  var stageOrder = ['applied', 'screening', 'interview', 'offer', 'accepted'];

  /* ---- Sample data generators ---- */
  function sampleOffers() {
    return [
      { company: '字节跳动', position: '高级前端工程师', city: '北京', salary: '45-65K×16薪', status: 'comparing', deadline: '2026-03-15', tags: ['大厂', '成长快', '加班多'], score: 82 },
      { company: '蚂蚁集团', position: '全栈工程师', city: '杭州', salary: '40-55K×15薪', status: 'pending', deadline: '2026-03-20', tags: ['福利好', '技术强'], score: 78 },
      { company: 'PingCAP', position: 'Senior Engineer', city: '远程', salary: '35-50K×14薪', status: 'negotiating', deadline: '', tags: ['开源', 'WLB', '远程'], score: 75 }
    ];
  }

  function sampleApplications() {
    return [
      { company: '字节跳动', position: '高级前端工程师', city: '北京', stage: 'offer', appliedDate: '2026-02-10', channel: 'Boss直聘', nextAction: '等Offer确认', salary: '45-65K', notes: '' },
      { company: '蚂蚁集团', position: '全栈工程师', city: '杭州', stage: 'interview', appliedDate: '2026-02-15', channel: '内推', nextAction: '三面 3/5', salary: '40-55K', notes: '' },
      { company: '腾讯', position: '前端开发', city: '深圳', stage: 'screening', appliedDate: '2026-02-20', channel: '官网', nextAction: '等通知', salary: '35-50K', notes: '' },
      { company: 'PingCAP', position: 'Senior Engineer', city: '远程', stage: 'applied', appliedDate: '2026-02-25', channel: 'LinkedIn', nextAction: '', salary: '35-50K', notes: '' },
      { company: '美团', position: '前端架构师', city: '北京', stage: 'rejected', appliedDate: '2026-02-01', channel: '猎头', nextAction: '', salary: '50-70K', notes: '二面未通过' }
    ];
  }

  /* ---- Alpine component ---- */
  document.addEventListener('alpine:init', function () {
    Alpine.data('decisionsWorkspace', function () {
      return {
        /* --- State --- */
        activeModule: 'tracking',
        searchTerm: '',

        /* Module tabs */
        moduleTabs: [
          { label: '投递跟踪', value: 'tracking' },
          { label: 'Offer 列表', value: 'list' },
          { label: 'Offer 对比', value: 'compare' },
          { label: '谈薪助手', value: 'negotiate' },
          { label: '选择建议', value: 'advice' }
        ],

        /* --- Tracking data --- */
        applications: [],
        filteredApplications: [],
        activeTrackingStage: 'all',
        selectedAppIndex: -1,
        selectedApp: null,
        recentActivities: [],
        trackingInsights: [],

        trackingStages: [],

        trackingSteps: [
          { value: 'applied', label: '投递', icon: 'fas fa-paper-plane' },
          { value: 'screening', label: '筛选', icon: 'fas fa-filter' },
          { value: 'interview', label: '面试', icon: 'fas fa-comments' },
          { value: 'offer', label: 'Offer', icon: 'fas fa-file-signature' },
          { value: 'accepted', label: '入职', icon: 'fas fa-check-circle' }
        ],

        /* --- Offer data --- */
        offers: [],
        filteredOffers: [],
        activeFilter: 'all',
        selectedOfferIndex: -1,
        selectedOffer: null,

        offerFilters: [
          { label: '全部', value: 'all' },
          { label: '待处理', value: 'pending' },
          { label: '对比中', value: 'comparing' },
          { label: '谈薪中', value: 'negotiating' },
          { label: '已接受', value: 'accepted' },
          { label: '已拒绝', value: 'declined' }
        ],

        /* --- Compare data --- */
        compareOffers: [],
        preferences: [
          { label: '薪资水平', value: 30 },
          { label: '成长空间', value: 25 },
          { label: '城市偏好', value: 20 },
          { label: '工作平衡', value: 25 }
        ],
        compareDimensions: [],
        comprehensiveJudgment: '',
        systemSuggestion: { title: '', reason: '', risk: '' },
        riskAlerts: [],
        negotiationTip: '',

        /* --- Negotiate data --- */
        negotiation: {
          currentOffer: '',
          targetRange: '',
          floor: '',
          items: [],
          scripts: [],
          riskBoundary: '',
          counterResponses: [],
          strategies: [],
          pitfalls: []
        },

        /* --- Advice data --- */
        adviceData: {
          recommendation: '',
          reason: '',
          costOfGivingUp: '',
          futureImpacts: [],
          preferenceExplanation: '',
          riskChecklist: []
        },

        /* Offer detail sections */
        offerDetailSections: [],
        offerHighlights: [],
        offerRisks: [],

        /* ===== Init ===== */
        init: function () {
          var self = this;

          // Read tab from URL
          var params = new URLSearchParams(window.location.search);
          var tab = params.get('tab');
          if (tab && ['tracking', 'list', 'compare', 'negotiate', 'advice'].indexOf(tab) !== -1) {
            self.activeModule = tab;
          }

          // Load data
          self.applications = loadJSON(APPS_KEY, null) || sampleApplications();
          self.offers = loadJSON(OFFERS_KEY, null) || sampleOffers();

          // Enhance with display properties
          self.applications.forEach(function (a) {
            var info = stageMap[a.stage] || stageMap.applied;
            a.stageText = info.text;
            a.stageClass = info.cls;
          });

          self.offers.forEach(function (o) {
            var info = offerStatusMap[o.status] || offerStatusMap.pending;
            o.statusText = info.text;
            o.statusClass = info.cls;
          });

          self.refreshTrackingStages();
          self.filterApplications();
          self.filterOffers();
          self.generateRecentActivities();
          self.generateInsights();
          self.refreshCompareData();
          self.refreshNegotiateData();
          self.refreshAdviceData();
        },

        /* ===== Module switching ===== */
        switchModule: function (mod) {
          this.activeModule = mod;
          var url = new URL(window.location);
          if (mod === 'tracking') { url.searchParams.delete('tab'); }
          else { url.searchParams.set('tab', mod); }
          history.replaceState(null, '', url.toString());
        },

        /* ===== Tracking ===== */
        refreshTrackingStages: function () {
          var apps = this.applications;
          var counts = { all: apps.length, applied: 0, screening: 0, interview: 0, offer: 0, rejected: 0 };
          apps.forEach(function (a) { if (counts[a.stage] !== undefined) counts[a.stage]++; });

          this.trackingStages = [
            { label: '全部', value: 'all', count: counts.all, barClass: 'bg-gray-400' },
            { label: '已投递', value: 'applied', count: counts.applied, barClass: 'bg-blue-400' },
            { label: '筛选中', value: 'screening', count: counts.screening, barClass: 'bg-amber-400' },
            { label: '面试中', value: 'interview', count: counts.interview, barClass: 'bg-violet-400' },
            { label: '已Offer', value: 'offer', count: counts.offer, barClass: 'bg-emerald-400' },
            { label: '未通过', value: 'rejected', count: counts.rejected, barClass: 'bg-red-300' }
          ];
        },

        filterApplications: function () {
          var self = this;
          var term = self.searchTerm.toLowerCase();
          self.filteredApplications = self.applications.filter(function (a) {
            var stageMatch = self.activeTrackingStage === 'all' || a.stage === self.activeTrackingStage;
            var textMatch = !term || a.company.toLowerCase().indexOf(term) !== -1 || a.position.toLowerCase().indexOf(term) !== -1;
            return stageMatch && textMatch;
          });
        },

        filterItems: function () {
          if (this.activeModule === 'tracking') this.filterApplications();
          else this.filterOffers();
        },

        selectApplication: function (idx) {
          this.selectedAppIndex = idx;
          this.selectedApp = this.filteredApplications[idx] || null;
        },

        createApplication: function () {
          var newApp = {
            company: '新公司',
            position: '新岗位',
            city: '待填写',
            stage: 'applied',
            appliedDate: today(),
            channel: '',
            nextAction: '',
            salary: '',
            notes: '',
            stageText: stageMap.applied.text,
            stageClass: stageMap.applied.cls
          };
          this.applications.unshift(newApp);
          this.refreshTrackingStages();
          this.filterApplications();
          this.saveApplications();
          this.selectApplication(0);
        },

        advanceStage: function () {
          if (!this.selectedApp) return;
          var idx = stageOrder.indexOf(this.selectedApp.stage);
          if (idx < stageOrder.length - 1) {
            this.selectedApp.stage = stageOrder[idx + 1];
            var info = stageMap[this.selectedApp.stage] || stageMap.applied;
            this.selectedApp.stageText = info.text;
            this.selectedApp.stageClass = info.cls;
            this.refreshTrackingStages();
            this.filterApplications();
            this.saveApplications();
          }
        },

        moveToOffer: function () {
          if (!this.selectedApp) return;
          this.selectedApp.stage = 'offer';
          var info = stageMap.offer;
          this.selectedApp.stageText = info.text;
          this.selectedApp.stageClass = info.cls;
          // Also add to offers
          var exists = this.offers.some(function (o) { return o.company === this.selectedApp.company; }.bind(this));
          if (!exists) {
            this.offers.unshift({
              company: this.selectedApp.company,
              position: this.selectedApp.position,
              city: this.selectedApp.city,
              salary: this.selectedApp.salary || '待确认',
              status: 'pending',
              deadline: '',
              tags: [],
              score: 70,
              statusText: offerStatusMap.pending.text,
              statusClass: offerStatusMap.pending.cls
            });
            this.saveOffers();
          }
          this.refreshTrackingStages();
          this.filterApplications();
          this.saveApplications();
        },

        markRejected: function () {
          if (!this.selectedApp) return;
          this.selectedApp.stage = 'rejected';
          var info = stageMap.rejected;
          this.selectedApp.stageText = info.text;
          this.selectedApp.stageClass = info.cls;
          this.refreshTrackingStages();
          this.filterApplications();
          this.saveApplications();
        },

        stagePct: function (stage) {
          var total = this.applications.length;
          if (!total) return 0;
          var count = this.applications.filter(function (a) { return a.stage === stage; }).length;
          return Math.round(count / total * 100);
        },

        getStepClass: function (step, currentStage) {
          var ci = stageOrder.indexOf(currentStage);
          var si = stageOrder.indexOf(step.value);
          if (si < ci) return 'bg-accent text-white';
          if (si === ci) return 'bg-accent/20 text-accent ring-2 ring-accent/30';
          return 'bg-black/[0.04] text-secondary/40';
        },

        isStepDone: function (stepValue, currentStage) {
          return stageOrder.indexOf(stepValue) < stageOrder.indexOf(currentStage);
        },

        conversionRate: function (from, to) {
          var fromCount = this.applications.filter(function (a) { return stageOrder.indexOf(a.stage) >= stageOrder.indexOf(from); }).length;
          var toCount = this.applications.filter(function (a) { return stageOrder.indexOf(a.stage) >= stageOrder.indexOf(to); }).length;
          if (!fromCount) return 0;
          return Math.round(toCount / fromCount * 100);
        },

        generateRecentActivities: function () {
          var acts = [];
          this.applications.slice(0, 5).forEach(function (a) {
            acts.push({
              text: a.company + ' - ' + (stageMap[a.stage] ? stageMap[a.stage].text : a.stage),
              time: a.appliedDate,
              dotClass: stageBarColors[a.stage] || 'bg-gray-300'
            });
          });
          this.recentActivities = acts;
        },

        generateInsights: function () {
          var insights = [];
          var total = this.applications.length;
          if (total >= 3) {
            var offerCount = this.applications.filter(function (a) { return a.stage === 'offer'; }).length;
            insights.push('当前 Offer 转化率为 ' + (total ? Math.round(offerCount / total * 100) : 0) + '%');
          }
          var interviewCount = this.applications.filter(function (a) { return a.stage === 'interview'; }).length;
          if (interviewCount > 0) {
            insights.push('有 ' + interviewCount + ' 个面试正在进行中，注意准备');
          }
          var rejectedCount = this.applications.filter(function (a) { return a.stage === 'rejected'; }).length;
          if (rejectedCount > 0 && total > 0) {
            insights.push('未通过率 ' + Math.round(rejectedCount / total * 100) + '%，建议优化简历和面试策略');
          }
          if (total < 10) {
            insights.push('投递量偏少，建议增加投递范围');
          }
          this.trackingInsights = insights;
        },

        prepareInterview: function () { if (this.selectedApp) window.location.href = '/interviews'; },
        viewJobDetail: function () { window.location.href = '/opportunities'; },
        setReminder: function () { alert('提醒已设置（功能开发中）'); },

        saveApplications: function () {
          saveJSON(APPS_KEY, this.applications.map(function (a) {
            return { company: a.company, position: a.position, city: a.city, stage: a.stage, appliedDate: a.appliedDate, channel: a.channel, nextAction: a.nextAction, salary: a.salary, notes: a.notes };
          }));
        },

        /* ===== Offer ===== */
        filterOffers: function () {
          var self = this;
          var term = self.searchTerm.toLowerCase();
          self.filteredOffers = self.offers.filter(function (o) {
            var statusMatch = self.activeFilter === 'all' || o.status === self.activeFilter;
            var textMatch = !term || o.company.toLowerCase().indexOf(term) !== -1 || o.position.toLowerCase().indexOf(term) !== -1;
            return statusMatch && textMatch;
          });
        },

        selectOffer: function (idx) {
          this.selectedOfferIndex = idx;
          this.selectedOffer = this.filteredOffers[idx] || null;
          if (this.selectedOffer) {
            this.refreshOfferDetail();
          }
        },

        createOffer: function () {
          var newOffer = {
            company: '新公司',
            position: '新岗位',
            city: '待填写',
            salary: '待确认',
            status: 'pending',
            deadline: '',
            tags: [],
            score: 70,
            statusText: offerStatusMap.pending.text,
            statusClass: offerStatusMap.pending.cls
          };
          this.offers.unshift(newOffer);
          this.filterOffers();
          this.saveOffers();
          this.selectOffer(0);
          if (this.activeModule === 'tracking') this.switchModule('list');
        },

        importFromJobs: function () { window.location.href = '/opportunities'; },

        saveOffers: function () {
          saveJSON(OFFERS_KEY, this.offers.map(function (o) {
            return { company: o.company, position: o.position, city: o.city, salary: o.salary, status: o.status, deadline: o.deadline, tags: o.tags, score: o.score };
          }));
        },

        refreshOfferDetail: function () {
          var o = this.selectedOffer;
          if (!o) return;
          this.offerDetailSections = [
            { title: '薪资构成', icon: 'fas fa-money-bill-wave text-emerald-500', content: '总包 ' + o.salary + '，具体构成包括基础薪资、绩效奖金、签字费、股票/期权等。' },
            { title: '岗位职责', icon: 'fas fa-briefcase text-blue-500', content: o.position + ' @ ' + o.company + '，负责核心业务开发与技术方案设计。' },
            { title: '团队与文化', icon: 'fas fa-users text-violet-500', content: '技术团队规模中等，注重工程文化和持续交付。' },
            { title: '发展路径', icon: 'fas fa-road text-amber-500', content: '技术专家路线或管理路线均可发展，公司内部转岗机制完善。' }
          ];
          this.offerHighlights = [
            o.company + ' 的行业影响力较强',
            '薪资 ' + o.salary + ' 具有竞争力',
            '城市 ' + o.city + ' 发展机遇多'
          ];
          this.offerRisks = [
            '工作生活平衡需关注',
            '股票/期权变现周期较长'
          ];
        },

        addToCompare: function () {
          if (this.selectedOffer && this.compareOffers.length < 3) {
            var exists = this.compareOffers.some(function (c) { return c.company === this.selectedOffer.company; }.bind(this));
            if (!exists) {
              this.compareOffers.push(JSON.parse(JSON.stringify(this.selectedOffer)));
              this.refreshCompareData();
            }
          }
        },

        /* ===== Compare ===== */
        addCompareTarget: function () {
          if (this.offers.length > this.compareOffers.length) {
            for (var i = 0; i < this.offers.length; i++) {
              var o = this.offers[i];
              var exists = this.compareOffers.some(function (c) { return c.company === o.company; });
              if (!exists) {
                this.compareOffers.push(JSON.parse(JSON.stringify(o)));
                this.refreshCompareData();
                break;
              }
            }
          }
        },

        recalcPreferences: function (changedIdx) {
          // Rebalance to sum ~100
          var total = this.preferences.reduce(function (s, p) { return s + p.value; }, 0);
          if (total > 100) {
            var excess = total - 100;
            for (var i = 0; i < this.preferences.length; i++) {
              if (i !== changedIdx && this.preferences[i].value > 0) {
                var dec = Math.min(this.preferences[i].value, excess);
                this.preferences[i].value -= dec;
                excess -= dec;
                if (excess <= 0) break;
              }
            }
          }
          this.refreshCompareData();
        },

        refreshCompareData: function () {
          var co = this.compareOffers;
          if (co.length >= 2) {
            var a = co[0], b = co[1];
            this.compareDimensions = [
              { label: '薪资总包', valueA: a.salary, valueB: b.salary, verdict: 'A 更优', verdictClass: 'text-emerald-500' },
              { label: '城市', valueA: a.city, valueB: b.city, verdict: '各有特色', verdictClass: 'text-amber-500' },
              { label: '成长空间', valueA: '⭐⭐⭐⭐', valueB: '⭐⭐⭐⭐', verdict: '持平', verdictClass: 'text-secondary/60' },
              { label: '工作平衡', valueA: '⭐⭐⭐', valueB: '⭐⭐⭐⭐', verdict: 'B 更优', verdictClass: 'text-blue-500' },
              { label: '公司规模', valueA: '大厂', valueB: '中大型', verdict: 'A 更优', verdictClass: 'text-emerald-500' },
              { label: '截止时间', valueA: a.deadline || '未知', valueB: b.deadline || '未知', verdict: '注意', verdictClass: 'text-amber-500' }
            ];
            this.comprehensiveJudgment = '综合你的偏好权重（薪资 ' + this.preferences[0].value + '%、成长 ' + this.preferences[1].value + '%、城市 ' + this.preferences[2].value + '%、平衡 ' + this.preferences[3].value + '%），系统推荐 ' + a.company + '（评分 ' + a.score + '）作为首选，但 ' + b.company + '（评分 ' + b.score + '）在工作平衡维度更优。建议结合个人价值观做最终判断。';
            this.systemSuggestion = {
              title: '推荐选择 ' + a.company,
              reason: '薪资更高、公司影响力更大，符合你当前对成长和收入的偏好设定。',
              risk: '注意：' + a.company + ' 的工作强度可能较大'
            };
            this.riskAlerts = [
              a.deadline ? a.company + ' 的 Offer 截止日期为 ' + a.deadline + '，注意时间紧迫性' : '',
              '两个 Offer 的薪资差距需要综合考虑生活成本',
              '建议在接受前确认签字费、期权归属条件等细节'
            ].filter(function (r) { return r; });
            this.negotiationTip = '根据市场数据，你当前的岗位在 ' + a.city + ' 的薪资中位数约为 40-55K。如果 ' + a.company + ' 的报价低于此范围，建议尝试协商。';
          } else {
            this.compareDimensions = [];
            this.comprehensiveJudgment = '';
            this.systemSuggestion = { title: '请先添加至少两个 Offer', reason: '系统需要至少两个对比对象才能给出建议。', risk: '' };
            this.riskAlerts = [];
            this.negotiationTip = '添加 Offer 后，系统将自动生成谈薪建议。';
          }
        },

        generateDetailedAnalysis: function () { alert('详细分析报告生成中…（功能开发中）'); },
        saveComparison: function () {
          saveJSON(DECISIONS_KEY + '_comparison', { offers: this.compareOffers, preferences: this.preferences, time: today() });
          alert('对比结果已保存');
        },
        markAsIntended: function () {
          if (this.compareOffers.length > 0) {
            this.compareOffers[0].status = 'accepted';
            this.compareOffers[0].statusText = offerStatusMap.accepted.text;
            this.compareOffers[0].statusClass = offerStatusMap.accepted.cls;
            alert('已标记 ' + this.compareOffers[0].company + ' 为意向 Offer');
          }
        },
        copyTip: function () {
          if (navigator.clipboard) navigator.clipboard.writeText(this.negotiationTip);
          else alert(this.negotiationTip);
        },

        /* ===== Negotiate ===== */
        refreshNegotiateData: function () {
          var o = this.offers[0];
          this.negotiation = {
            currentOffer: o ? o.salary : '未知',
            targetRange: '50-70K',
            floor: '40K',
            items: [
              { name: '基础薪资', priority: '高优先', priorityClass: 'text-red-500' },
              { name: '签字费', priority: '中优先', priorityClass: 'text-amber-500' },
              { name: '年终奖金', priority: '高优先', priorityClass: 'text-red-500' },
              { name: '股票/期权', priority: '中优先', priorityClass: 'text-amber-500' },
              { name: '远程工作', priority: '低优先', priorityClass: 'text-secondary/60' },
              { name: '入职时间', priority: '低优先', priorityClass: 'text-secondary/60' }
            ],
            scripts: [
              { scenario: '初始报价回应', text: '非常感谢贵公司的 Offer，我对这个机会很感兴趣。基于我的经验和市场调研，我希望我们能在薪资方面做进一步探讨。' },
              { scenario: '对方不松口时', text: '我理解公司的预算考量。除了基础薪资，我们是否可以探讨签字费、年终奖或股票期权方面的空间？' },
              { scenario: '有竞争Offer时', text: '坦诚地说，我目前手上有其他机会，给出了更具竞争力的条件。但贵公司是我的首选，如果能匹配这个水平，我可以立刻接受。' }
            ],
            riskBoundary: '如果对方在基础薪资和股票上都完全没有调整空间，且低于你的底线 40K，建议重新评估该机会的战略价值——是否值得为品牌背书、学习机会、人脉等无形资产接受。',
            counterResponses: [
              { scenario: '对方说"预算已到上限"', response: '表示理解，转向讨论非现金补偿（签字费、期权、假期）。' },
              { scenario: '对方说"给你的已是最高级别"', response: '询问绩效评估周期和晋升后的薪资涨幅空间。' },
              { scenario: '对方要求立即决定', response: '礼貌请求 2-3 天考虑时间，说明需要与家人商量。' }
            ],
            strategies: [
              '先表达强烈兴趣，再提出薪资讨论',
              '用数据支撑你的期望（市场调研、当前薪资）',
              '谈判时关注总包而非单一维度',
              '留有退路，不要把唯一选择暴露给对方'
            ],
            pitfalls: [
              '不要在电话中被迫当场做决定',
              '不要透露你的当前薪资具体数字',
              '不要用威胁的方式（如"不加薪我就不来"）',
              '不要忽略非薪资条款（竞业协议、保密条款）'
            ]
          };
        },

        /* ===== Advice ===== */
        refreshAdviceData: function () {
          var top = this.offers[0];
          this.adviceData = {
            recommendation: top ? '倾向选择 ' + top.company : '尚无 Offer',
            reason: top ? '综合薪资、成长空间和你的职业规划，' + top.company + ' 是当前最优选择。该公司在行业中具有较强影响力，技术栈与你的方向高度匹配。' : '请先添加 Offer 以获得建议。',
            costOfGivingUp: this.offers.length > 1 ? '放弃 ' + this.offers[1].company + ' 意味着可能错过 ' + this.offers[1].city + ' 的生活环境和更好的工作平衡。这是一个短期舒适度与长期发展之间的权衡。' : '目前只有一个选择，暂无放弃成本分析。',
            futureImpacts: [
              { title: '职业发展', description: top ? top.company + ' 的平台效应在 2-3 年内将显著提升你的简历含金量' : '待分析', positive: true },
              { title: '技术成长', description: '大公司技术体系完善，但可能缺乏从 0 到 1 的锻炼机会', positive: true },
              { title: '生活质量', description: '需关注加班文化对身体和家庭的潜在影响', positive: false },
              { title: '财务目标', description: top ? '按 ' + (top.salary || '预期薪资') + ' 计算，2 年后的累计收入和资产增长可观' : '待分析', positive: true }
            ],
            preferenceExplanation: '根据你设定的偏好权重（薪资 ' + this.preferences[0].value + '%、成长 ' + this.preferences[1].value + '%），系统将收入和发展路径作为最重要的决策因素。如果你更看重生活质量，建议调整权重后重新评估。',
            riskChecklist: [
              { text: '已确认薪资构成（基础+奖金+股票）', checked: false },
              { text: '已了解竞业协议条款', checked: false },
              { text: '已与直属领导沟通过工作预期', checked: false },
              { text: '已考虑城市生活成本（房租、通勤）', checked: false },
              { text: '已评估团队氛围和加班情况', checked: false },
              { text: '已与家人/伴侣讨论并达成共识', checked: false }
            ]
          };
        },

        confirmFinalChoice: function () {
          var allChecked = this.adviceData.riskChecklist.every(function (c) { return c.checked; });
          if (!allChecked) {
            alert('请先完成所有风险校验项');
            return;
          }
          alert('已确认最终选择！系统将保存你的决策记录。');
          saveJSON(DECISIONS_KEY + '_final', {
            choice: this.adviceData.recommendation,
            preferences: this.preferences,
            time: today()
          });
        },

        /* ===== Export ===== */
        exportReport: function () {
          var report = {
            applications: this.applications.length,
            offers: this.offers.length,
            stages: {},
            exportTime: new Date().toISOString()
          };
          this.trackingStages.forEach(function (s) { report.stages[s.label] = s.count; });
          var blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = '决策中心报告_' + today() + '.json';
          a.click();
          URL.revokeObjectURL(url);
        }
      };
    });
  });
})();
