/**
 * FindJob 2.0 - Growth Center Alpine.js Component
 * Handles all interactivity for the growth workspace:
 *   - Module switching (coach/skills/weekly/review)
 *   - Milestone timeline & selection
 *   - Skill tree & gap analysis
 *   - Weekly plan editing
 *   - Weekly review display
 *   - Radar chart data computation
 *   - localStorage persistence
 */

document.addEventListener('alpine:init', () => {
  Alpine.data('growthWorkspace', () => ({
    // ===== Module state =====
    activeModule: 'coach',
    searchTerm: '',
    moduleTabs: [
      { label: '成长陪伴师', value: 'coach' },
      { label: 'Skills自动化', value: 'skills' },
      { label: '周计划', value: 'weekly' },
      { label: '周复盘', value: 'review' }
    ],

    // ===== Coach module state =====
    milestones: [],
    selectedMilestone: -1,
    activeDays: 0,
    coachAdvice: [],
    pendingStepCount: 0,

    // ===== Skills module state =====
    skillCategories: [],
    selectedSkill: null,
    skillViewMode: 'matrix',
    skillGaps: [],
    skillTrends: [],
    targetJobSkillSummary: '',
    skillSuggestions: [],
    learningResources: [],

    // ===== Weekly plan state =====
    weeklyPlans: [],
    selectedWeekIndex: -1,
    currentWeekPlan: null,
    weeklyAISuggestion: null,

    // ===== Review state =====
    weeklyReviews: [],
    selectedReviewIndex: -1,
    currentReview: null,

    // ===== Radar chart state =====
    radarDimensions: [],
    radarDimensionDetails: [],
    radarThisWeekPoints: [],

    // ===== Init =====
    init() {
      // Read tab from URL query
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['coach', 'skills', 'weekly', 'review'].includes(tab)) {
        this.activeModule = tab;
      }
      this.loadData();
      this.computeRadar();
    },

    // ===== Module switching =====
    switchModule(mod) {
      this.activeModule = mod;
      // Update URL without reload
      const url = new URL(window.location);
      if (mod === 'coach') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', mod);
      }
      window.history.replaceState({}, '', url);
    },

    filterItems() {
      // Search placeholder — future: filter milestones/skills/plans by searchTerm
    },

    // ===== Data loading =====
    loadData() {
      this.loadMilestones();
      this.loadCoachAdvice();
      this.loadSkills();
      this.loadWeeklyPlans();
      this.loadWeeklyReviews();
    },

    loadMilestones() {
      try {
        const stored = JSON.parse(localStorage.getItem('jobcopilot_growth') || 'null');
        if (stored && stored.milestones && stored.milestones.length > 0) {
          this.milestones = stored.milestones;
          this.activeDays = stored.activeDays || 0;
        } else {
          this.generateDemoMilestones();
        }
      } catch (e) {
        this.generateDemoMilestones();
      }
    },

    generateDemoMilestones() {
      const tagClasses = {
        '简历': 'bg-blue-50 text-blue-600',
        '面试': 'bg-amber-50 text-amber-600',
        '投递': 'bg-emerald-50 text-emerald-600',
        '技能': 'bg-purple-50 text-purple-600'
      };
      this.milestones = [
        { date: '今天', title: '完成第3份定向简历优化', tag: '简历', tagClass: tagClasses['简历'] },
        { date: '昨天', title: '面试模拟得分提升至 7.8/10', tag: '面试', tagClass: tagClasses['面试'] },
        { date: '3月1日', title: '新增投递 5 个目标岗位', tag: '投递', tagClass: tagClasses['投递'] },
        { date: '2月28日', title: '掌握 STAR 回答框架', tag: '技能', tagClass: tagClasses['技能'] },
        { date: '2月27日', title: '完成本周面试准备计划', tag: '面试', tagClass: tagClasses['面试'] },
        { date: '2月25日', title: '简历匹配度达到 85%', tag: '简历', tagClass: tagClasses['简历'] },
        { date: '2月23日', title: '收到 2 家面试邀请', tag: '投递', tagClass: tagClasses['投递'] },
        { date: '2月20日', title: '完成 Python 项目素材整理', tag: '技能', tagClass: tagClasses['技能'] }
      ];
      this.activeDays = 18;
    },

    selectMilestone(idx) {
      this.selectedMilestone = idx;
    },

    loadCoachAdvice() {
      this.coachAdvice = [
        {
          title: '优化简历中的项目经历描述',
          priorityLabel: '高',
          priorityClass: 'bg-red-50 text-red-600',
          description: '你的项目经历缺少量化数据，建议补充具体的业绩指标和技术细节。',
          steps: [
            { text: '回顾最近3个项目，提取关键数据指标', done: false },
            { text: '使用 STAR 框架重写项目描述', done: false },
            { text: '让 AI 辅助优化措辞和格式', done: true }
          ],
          benefit: '预计简历匹配度提升 12%'
        },
        {
          title: '加强行为面试类问题练习',
          priorityLabel: '中',
          priorityClass: 'bg-amber-50 text-amber-600',
          description: '面试反馈显示你的行为问题回答结构性不够，建议每天练习 2 道。',
          steps: [
            { text: '每天在面试中心完成 2 道行为面试题', done: false },
            { text: '对照 AI 反馈修正回答结构', done: false },
            { text: '本周完成 10 道题目积累', done: false }
          ],
          benefit: '预计面试通过率提升 15%'
        },
        {
          title: '拓展投递渠道和岗位匹配',
          priorityLabel: '低',
          priorityClass: 'bg-blue-50 text-blue-600',
          description: '目前投递范围较窄，建议扩大到关联行业岗位。',
          steps: [
            { text: '在岗位中心探索 3 个新行业方向', done: false },
            { text: '更新求职画像中的目标岗位', done: false }
          ],
          benefit: '预计面试机会增加 20%'
        }
      ];
      this.updatePendingCount();
    },

    toggleStep(adviceIdx, stepIdx) {
      this.coachAdvice[adviceIdx].steps[stepIdx].done = !this.coachAdvice[adviceIdx].steps[stepIdx].done;
      this.updatePendingCount();
      this.saveGrowthData();
    },

    updatePendingCount() {
      let count = 0;
      this.coachAdvice.forEach(a => a.steps.forEach(s => { if (!s.done) count++; }));
      this.pendingStepCount = count;
    },

    markAllDone() {
      this.coachAdvice.forEach(a => a.steps.forEach(s => s.done = true));
      this.pendingStepCount = 0;
      this.saveGrowthData();
    },

    refreshCoachAdvice() {
      // Placeholder for API call: POST /api/growth/coach
      alert('AI 教练正在分析你的最新数据，功能将在后续版本上线。');
    },

    // ===== Skills =====
    loadSkills() {
      try {
        const stored = JSON.parse(localStorage.getItem('jobcopilot_skills') || 'null');
        if (stored && stored.categories) {
          this.skillCategories = stored.categories;
        } else {
          this.generateDemoSkills();
        }
      } catch (e) {
        this.generateDemoSkills();
      }
      this.generateSkillGaps();
      this.generateSkillTrends();
      this.generateSkillSuggestions();
      this.generateLearningResources();
    },

    generateDemoSkills() {
      const levelClasses = {
        '精通': 'bg-emerald-50 text-emerald-600',
        '高级': 'bg-blue-50 text-blue-600',
        '中级': 'bg-amber-50 text-amber-600',
        '初级': 'bg-gray-100 text-gray-500'
      };
      this.skillCategories = [
        {
          name: '技术技能', icon: 'fas fa-code text-blue-500', expanded: true,
          skills: [
            { name: 'JavaScript', level: '高级', levelClass: levelClasses['高级'], source: 'resume' },
            { name: 'React', level: '中级', levelClass: levelClasses['中级'], source: 'resume' },
            { name: 'Python', level: '高级', levelClass: levelClasses['高级'], source: 'resume' },
            { name: 'Node.js', level: '中级', levelClass: levelClasses['中级'], source: 'interview' },
            { name: 'SQL', level: '中级', levelClass: levelClasses['中级'], source: 'resume' }
          ]
        },
        {
          name: '软技能', icon: 'fas fa-users text-rose-500', expanded: false,
          skills: [
            { name: '团队协作', level: '高级', levelClass: levelClasses['高级'], source: 'interview' },
            { name: '项目管理', level: '中级', levelClass: levelClasses['中级'], source: 'resume' },
            { name: '沟通表达', level: '中级', levelClass: levelClasses['中级'], source: 'interview' }
          ]
        },
        {
          name: '行业知识', icon: 'fas fa-industry text-amber-500', expanded: false,
          skills: [
            { name: 'SaaS 产品', level: '中级', levelClass: levelClasses['中级'], source: 'manual' },
            { name: '数据分析', level: '初级', levelClass: levelClasses['初级'], source: 'resume' }
          ]
        },
        {
          name: '工具熟练度', icon: 'fas fa-wrench text-gray-500', expanded: false,
          skills: [
            { name: 'Git', level: '精通', levelClass: levelClasses['精通'], source: 'resume' },
            { name: 'Docker', level: '中级', levelClass: levelClasses['中级'], source: 'resume' },
            { name: 'VS Code', level: '精通', levelClass: levelClasses['精通'], source: 'manual' }
          ]
        }
      ];
    },

    selectSkill(skill) {
      this.selectedSkill = skill;
    },

    generateSkillGaps() {
      this.targetJobSkillSummary = '前端开发工程师 — 需要 React、TypeScript、Node.js、系统设计等核心技能';
      this.skillGaps = [
        { skill: 'React', current: 55, required: 80 },
        { skill: 'TypeScript', current: 30, required: 75 },
        { skill: 'Node.js', current: 50, required: 70 },
        { skill: '系统设计', current: 25, required: 60 },
        { skill: 'JavaScript', current: 75, required: 80 },
        { skill: 'Git', current: 90, required: 70 },
        { skill: 'Python', current: 70, required: 40 }
      ];
    },

    generateSkillTrends() {
      this.skillTrends = [
        { skill: 'React', delta: +8, history: [40, 42, 48, 55] },
        { skill: 'JavaScript', delta: +5, history: [65, 68, 72, 75] },
        { skill: 'Node.js', delta: +12, history: [30, 35, 42, 50] },
        { skill: 'TypeScript', delta: +10, history: [15, 18, 22, 30] },
        { skill: '系统设计', delta: +5, history: [15, 18, 20, 25] }
      ];
    },

    generateSkillSuggestions() {
      this.skillSuggestions = [
        { skill: 'TypeScript', source: '简历提取', reason: '你的简历中提到了 TypeScript 项目经验，建议添加到技能库并标记等级。' },
        { skill: 'CI/CD', source: '面试反馈', reason: '上次面试中被问到 CI/CD 流程，建议补充相关经验描述。' },
        { skill: 'GraphQL', source: '岗位匹配', reason: '目标岗位中 60% 要求 GraphQL 经验，建议学习。' }
      ];
    },

    addSkillFromSuggestion(idx) {
      const sug = this.skillSuggestions[idx];
      if (this.skillCategories[0]) {
        this.skillCategories[0].skills.push({
          name: sug.skill, level: '初级',
          levelClass: 'bg-gray-100 text-gray-500', source: 'auto'
        });
      }
      this.skillSuggestions.splice(idx, 1);
      this.saveSkillsData();
    },

    generateLearningResources() {
      this.learningResources = [
        { title: 'TypeScript 官方文档', type: '文档', icon: 'fas fa-book text-blue-500', bgClass: 'bg-blue-50' },
        { title: 'React Hooks 深入理解', type: '教程', icon: 'fas fa-graduation-cap text-emerald-500', bgClass: 'bg-emerald-50' },
        { title: '系统设计面试指南', type: '指南', icon: 'fas fa-sitemap text-purple-500', bgClass: 'bg-purple-50' }
      ];
    },

    refreshSkillSuggestions() {
      alert('AI 正在重新分析你的技能数据，功能将在后续版本上线。');
    },

    // ===== Weekly Plans =====
    loadWeeklyPlans() {
      try {
        const stored = JSON.parse(localStorage.getItem('jobcopilot_weekly_plans') || 'null');
        if (stored && stored.length > 0) {
          this.weeklyPlans = stored;
        } else {
          this.generateDemoWeeklyPlans();
        }
      } catch (e) {
        this.generateDemoWeeklyPlans();
      }
      if (this.weeklyPlans.length > 0) {
        this.selectWeek(0);
      }
    },

    generateDemoWeeklyPlans() {
      this.weeklyPlans = [
        {
          label: 'W10 · 本周',
          dateRange: '3月3日 - 3月9日',
          status: 'active',
          statusText: '进行中',
          statusClass: 'bg-blue-50 text-blue-600',
          progress: 35,
          goals: [
            {
              title: '投递目标', icon: 'fas fa-paper-plane text-blue-500',
              target: 8, completed: 3,
              tasks: [
                { text: '筛选 5 个高匹配度岗位', done: true },
                { text: '为每个岗位定制简历', done: false },
                { text: '提交所有投递', done: false }
              ]
            },
            {
              title: '面试准备', icon: 'fas fa-microphone text-amber-500',
              target: 5, completed: 2,
              tasks: [
                { text: '完成 3 道行为面试练习', done: true },
                { text: '模拟面试 1 场', done: true },
                { text: '复盘上周面试反馈', done: false }
              ]
            },
            {
              title: '简历优化', icon: 'fas fa-file-pen text-emerald-500',
              target: 2, completed: 1,
              tasks: [
                { text: '更新项目经历量化数据', done: true },
                { text: '优化技能描述部分', done: false }
              ]
            }
          ]
        },
        {
          label: 'W9',
          dateRange: '2月24日 - 3月2日',
          status: 'completed',
          statusText: '已完成',
          statusClass: 'bg-emerald-50 text-emerald-600',
          progress: 87,
          goals: [
            {
              title: '投递目标', icon: 'fas fa-paper-plane text-blue-500',
              target: 6, completed: 5,
              tasks: [
                { text: '筛选目标岗位', done: true },
                { text: '提交投递', done: true }
              ]
            },
            {
              title: '面试准备', icon: 'fas fa-microphone text-amber-500',
              target: 3, completed: 3,
              tasks: [
                { text: '完成面试练习', done: true },
                { text: '模拟面试', done: true }
              ]
            }
          ]
        },
        {
          label: 'W8',
          dateRange: '2月17日 - 2月23日',
          status: 'completed',
          statusText: '已完成',
          statusClass: 'bg-emerald-50 text-emerald-600',
          progress: 72,
          goals: [
            {
              title: '投递目标', icon: 'fas fa-paper-plane text-blue-500',
              target: 5, completed: 4,
              tasks: [{ text: '完成投递任务', done: true }]
            }
          ]
        }
      ];
      this.weeklyAISuggestion = {
        summary: '根据你上周的投递回复率（40%）和面试表现（7.8/10），建议本周重点优化简历匹配度。',
        items: [
          '增加投递目标到 8 个，优先选择匹配度 >80% 的岗位',
          '每天练习 2 道面试题，重点关注行为类问题',
          '完成 2 份定向简历优化，补充量化数据',
          '预留 1 天进行面试模拟和复盘'
        ],
        hint: '上周投递回复率偏低，建议在投递前先用 AI 检查简历匹配度，只投递得分 >75% 的岗位。'
      };
    },

    selectWeek(idx) {
      this.selectedWeekIndex = idx;
      this.currentWeekPlan = this.weeklyPlans[idx] || null;
    },

    createNewWeek() {
      const weekNum = this.weeklyPlans.length + 8;
      const newWeek = {
        label: 'W' + weekNum + ' · 新',
        dateRange: '待设置',
        status: 'pending',
        statusText: '未开始',
        statusClass: 'bg-gray-100 text-gray-500',
        progress: 0,
        goals: [
          {
            title: '投递目标', icon: 'fas fa-paper-plane text-blue-500',
            target: 5, completed: 0,
            tasks: [{ text: '筛选目标岗位', done: false }, { text: '提交投递', done: false }]
          },
          {
            title: '面试准备', icon: 'fas fa-microphone text-amber-500',
            target: 3, completed: 0,
            tasks: [{ text: '完成面试练习', done: false }]
          }
        ]
      };
      this.weeklyPlans.unshift(newWeek);
      this.selectWeek(0);
      this.saveWeeklyPlans();
    },

    toggleGoalTask(goalIdx, taskIdx) {
      if (!this.currentWeekPlan) return;
      const goal = this.currentWeekPlan.goals[goalIdx];
      goal.tasks[taskIdx].done = !goal.tasks[taskIdx].done;
      // Recalc completed count
      goal.completed = goal.tasks.filter(t => t.done).length;
      // Recalc overall progress
      let totalTasks = 0, doneTasks = 0;
      this.currentWeekPlan.goals.forEach(g => {
        g.tasks.forEach(t => { totalTasks++; if (t.done) doneTasks++; });
      });
      this.currentWeekPlan.progress = totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0;
      this.saveWeeklyPlans();
    },

    saveWeeklyPlan() {
      this.saveWeeklyPlans();
      // Brief visual feedback
      const btn = event && event.target;
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '已保存 ✓';
        setTimeout(() => btn.textContent = orig, 1500);
      }
    },

    saveWeeklyPlans() {
      try {
        localStorage.setItem('jobcopilot_weekly_plans', JSON.stringify(this.weeklyPlans));
      } catch (e) { /* quota */ }
    },

    generateAIPlan() {
      if (!this.weeklyAISuggestion) {
        this.weeklyAISuggestion = {
          summary: 'AI 分析了你的历史数据，为你生成了下周建议计划。',
          items: [
            '目标投递 6 个高匹配度岗位',
            '每天练习 2 道面试题',
            '完成 1 份简历优化',
            '安排 1 次模拟面试'
          ],
          hint: '建议优先完成简历优化后再开始投递，效果会更好。'
        };
      }
    },

    adoptAIPlan() {
      alert('AI 计划已采纳，目标已更新到本周计划中。');
    },

    // ===== Reviews =====
    loadWeeklyReviews() {
      try {
        const stored = JSON.parse(localStorage.getItem('jobcopilot_weekly_reviews') || 'null');
        if (stored && stored.length > 0) {
          this.weeklyReviews = stored;
        } else {
          this.generateDemoReviews();
        }
      } catch (e) {
        this.generateDemoReviews();
      }
    },

    generateDemoReviews() {
      this.weeklyReviews = [
        {
          label: 'W9 复盘',
          dateRange: '2月24日 - 3月2日',
          score: 82,
          completion: 87,
          stats: [
            { label: '投递数', value: '5' },
            { label: '面试数', value: '3' },
            { label: '通过率', value: '67%' },
            { label: '新技能', value: '+2' }
          ],
          goodItems: [
            '简历优化后匹配度提升 12%',
            '面试模拟分数稳步上升至 7.8',
            '按时完成了所有面试准备任务'
          ],
          improveItems: [
            '投递回复率仍然偏低（40%）',
            '行为面试回答结构需要改进',
            '项目经历描述缺少量化数据'
          ],
          keyEvents: [
            { date: '2月25日', text: '收到字节跳动面试邀请' },
            { date: '2月27日', text: '完成首次模拟面试，得分 7.2' },
            { date: '3月1日', text: '简历匹配度突破 85%' }
          ],
          freeText: '这周整体进展不错，面试准备有明显提升。下周需要重点关注投递质量。',
          aiSummary: '本周你的求职效率显著提升。简历优化带来了 12% 的匹配度增长，面试得分也稳步上升。主要瓶颈在于投递环节的回复率，建议下周优先改善。',
          trendInsights: [
            { icon: 'fas fa-arrow-trend-up text-emerald-500', text: '面试得分连续 3 周上升，趋势良好' },
            { icon: 'fas fa-arrow-right text-amber-500', text: '投递回复率持平，需要关注简历针对性' },
            { icon: 'fas fa-arrow-trend-up text-blue-500', text: '技能覆盖度提升 8%，新增 TypeScript 和 CI/CD' }
          ],
          nextWeekSuggestions: [
            '投递前使用 AI 匹配度检查，只投递 >75% 的岗位',
            '每天增加 1 道行为面试练习',
            '给 3 个已投递岗位做跟进',
            '完善系统设计相关的项目描述'
          ]
        },
        {
          label: 'W8 复盘',
          dateRange: '2月17日 - 2月23日',
          score: 68,
          completion: 72,
          stats: [
            { label: '投递数', value: '4' },
            { label: '面试数', value: '1' },
            { label: '通过率', value: '50%' },
            { label: '新技能', value: '+1' }
          ],
          goodItems: [
            '完成了基础简历框架搭建',
            '开始使用面试训练模块'
          ],
          improveItems: [
            '投递数量偏少',
            '面试练习频次不够',
            '缺少定向简历优化'
          ],
          keyEvents: [
            { date: '2月18日', text: '上传第一份简历' },
            { date: '2月21日', text: '完成首次面试题练习' }
          ],
          freeText: '刚开始使用系统，还在摸索阶段。',
          aiSummary: '这是你使用系统的第一周，基础框架已搭建完成。下周需要增加使用频率，特别是面试训练和投递量。',
          trendInsights: [
            { icon: 'fas fa-circle-info text-blue-500', text: '首周数据基线已建立，后续可进行趋势对比' }
          ],
          nextWeekSuggestions: [
            '增加每日面试练习到 2 道',
            '投递目标提升到 6 个',
            '完成一次完整的简历优化流程'
          ]
        }
      ];
    },

    selectReview(idx) {
      this.selectedReviewIndex = idx;
      this.currentReview = this.weeklyReviews[idx] || null;
    },

    exportReview() {
      if (!this.currentReview) return;
      const text = [
        `# ${this.currentReview.label}`,
        `日期范围: ${this.currentReview.dateRange}`,
        `总分: ${this.currentReview.score}  完成度: ${this.currentReview.completion}%`,
        '',
        '## 数据概览',
        ...this.currentReview.stats.map(s => `- ${s.label}: ${s.value}`),
        '',
        '## 做得好',
        ...this.currentReview.goodItems.map(i => `✓ ${i}`),
        '',
        '## 需改进',
        ...this.currentReview.improveItems.map(i => `△ ${i}`),
        '',
        '## 自由复盘',
        this.currentReview.freeText || '(无)',
        '',
        '## AI 摘要',
        this.currentReview.aiSummary || '(无)',
        '',
        '## 下周建议',
        ...(this.currentReview.nextWeekSuggestions || []).map((s, i) => `${i+1}. ${s}`)
      ].join('\n');

      const blob = new Blob([text], { type: 'text/markdown' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `周复盘_${this.currentReview.label.replace(/\s/g, '_')}.md`;
      a.click();
    },

    // ===== Radar chart =====
    computeRadar() {
      const dims = [
        { name: '简历质量', thisWeek: 78, lastWeek: 70, icon: 'fas fa-file-alt text-blue-500' },
        { name: '面试表现', thisWeek: 72, lastWeek: 65, icon: 'fas fa-microphone text-amber-500' },
        { name: '投递效率', thisWeek: 55, lastWeek: 50, icon: 'fas fa-paper-plane text-emerald-500' },
        { name: '技能覆盖', thisWeek: 65, lastWeek: 58, icon: 'fas fa-bolt text-purple-500' },
        { name: '岗位匹配', thisWeek: 82, lastWeek: 75, icon: 'fas fa-bullseye text-rose-500' }
      ];

      const n = dims.length;
      const cx = 120, cy = 120, r = 90;
      const angleOff = -Math.PI / 2;

      this.radarDimensions = dims.map((d, i) => {
        const angle = angleOff + (2 * Math.PI * i) / n;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const labelR = r + 18;
        const labelX = cx + labelR * Math.cos(angle);
        const labelY = cy + labelR * Math.sin(angle) + 3;
        return { ...d, x, y, labelX, labelY, angle };
      });

      this.radarDimensionDetails = dims.map(d => ({
        name: d.name, icon: d.icon,
        thisWeek: d.thisWeek,
        delta: d.thisWeek - d.lastWeek
      }));

      this.radarThisWeekPoints = dims.map((d, i) => {
        const angle = angleOff + (2 * Math.PI * i) / n;
        const pct = d.thisWeek / 100;
        return { x: cx + r * pct * Math.cos(angle), y: cy + r * pct * Math.sin(angle) };
      });
    },

    radarPoints(scale) {
      const n = 5, cx = 120, cy = 120, r = 90;
      const angleOff = -Math.PI / 2;
      return Array.from({ length: n }, (_, i) => {
        const angle = angleOff + (2 * Math.PI * i) / n;
        return (cx + r * scale * Math.cos(angle)) + ',' + (cy + r * scale * Math.sin(angle));
      }).join(' ');
    },

    radarDataPoints(which) {
      const n = 5, cx = 120, cy = 120, r = 90;
      const angleOff = -Math.PI / 2;
      const dims = this.radarDimensions;
      return dims.map((d, i) => {
        const angle = angleOff + (2 * Math.PI * i) / n;
        const pct = (which === 'thisWeek' ? d.thisWeek : d.lastWeek) / 100;
        return (cx + r * pct * Math.cos(angle)) + ',' + (cy + r * pct * Math.sin(angle));
      }).join(' ');
    },

    // ===== Export & share =====
    exportReport() {
      alert('导出报告功能将在后续版本上线。');
    },

    generateWeeklyReport() {
      this.switchModule('review');
      if (this.weeklyReviews.length > 0) {
        this.selectReview(0);
      }
    },

    shareProgress() {
      alert('分享功能将在后续版本上线。');
    },

    // ===== Persistence =====
    saveGrowthData() {
      try {
        localStorage.setItem('jobcopilot_growth', JSON.stringify({
          milestones: this.milestones,
          activeDays: this.activeDays
        }));
      } catch (e) { /* quota */ }
    },

    saveSkillsData() {
      try {
        localStorage.setItem('jobcopilot_skills', JSON.stringify({
          categories: this.skillCategories
        }));
      } catch (e) { /* quota */ }
    }
  }));
});
