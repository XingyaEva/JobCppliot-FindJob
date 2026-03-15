/**
 * FindJob 2.0 - Interviews Workspace Alpine.js Component
 *
 * Handles: module switching, training list management, answer submission,
 * AI feedback rendering, simulation chat, companion config, review display.
 */

document.addEventListener('alpine:init', function () {

  Alpine.data('interviewsWorkspace', function () {
    return {
      // === Module state ===
      activeModule: 'coaching',  // 'bank' | 'coaching' | 'simulation' | 'companion' | 'review'
      moduleTabs: [
        { label: '\u9762\u8bd5\u9898\u5e93', value: 'bank' },
        { label: '\u9762\u8bd5\u8f85\u5bfc', value: 'coaching' },
        { label: '\u9762\u8bd5\u6a21\u62df', value: 'simulation' },
        { label: '\u9762\u8bd5\u966a\u4f34\u52a9\u624b', value: 'companion' },
        { label: '\u9762\u8bd5\u590d\u76d8', value: 'review' }
      ],

      // === Left column ===
      allItems: [],
      filteredItems: [],
      selectedItem: null,
      loading: true,
      searchTerm: '',
      activeLeftFilter: 'all',
      leftFilters: [
        { label: '\u5168\u90e8', value: 'all' },
        { label: '\u9ad8\u9891\u9898', value: 'hot' },
        { label: '\u6211\u7684\u8584\u5f31\u9879', value: 'weak' },
        { label: '\u672c\u5468\u91cd\u70b9', value: 'weekly' }
      ],

      // === Coaching state ===
      currentAnswer: '',
      answerMode: 'text',
      feedbackData: null,
      feedbackLoading: false,

      // === Simulation state ===
      simMessages: [],
      simInput: '',
      activeSimConfig: 'standard',
      simConfigs: [
        { label: '\u5feb\u901f\u6a21\u62df', value: 'quick', desc: '3 \u9053\u9898\uff0c\u7ea6 10 \u5206\u949f\uff0c\u8f7b\u677e\u6a21\u5f0f' },
        { label: '\u6807\u51c6\u6a21\u62df', value: 'standard', desc: '5 \u9053\u9898\uff0c\u7ea6 25 \u5206\u949f\uff0c\u6a21\u62df\u771f\u5b9e\u8282\u594f' },
        { label: '\u9ad8\u538b\u6a21\u62df', value: 'hard', desc: '7 \u9053\u9898\uff0c\u7ea6 40 \u5206\u949f\uff0c\u5305\u542b\u8ffd\u95ee\u4e0e\u538b\u529b\u6d4b\u8bd5' }
      ],

      // === Companion state ===
      companionEnabled: false,
      companionMode: 'keywords',

      // === Review state ===
      selectedReview: null,
      reviews: [],

      // === Import modal ===
      showImportModal: false,

      // ========================
      // Lifecycle
      // ========================
      init() {
        this.loadItems();
        this.loadReviews();
      },

      // ========================
      // Data loading
      // ========================
      loadItems() {
        this.loading = true;
        try {
          var stored = localStorage.getItem('jobcopilot_questions');
          var items = [];
          if (stored) {
            var parsed = JSON.parse(stored);
            items = Array.isArray(parsed) ? parsed : [];
          }

          // If no stored data, use demo data
          if (items.length === 0) {
            items = this.getDemoItems();
          }

          // Normalize
          this.allItems = items.map(function (item, idx) {
            return {
              id: item.id || 'q-' + idx,
              title: item.title || item.question || item.content || '\u672a\u547d\u540d\u9898\u76ee',
              type: item.type || '\u884c\u4e3a\u9762',
              source: item.source || '\u7cfb\u7edf\u63a8\u8350',
              score: item.score || 0,
              lastPractice: item.lastPractice || '',
              mastered: item.mastered || false,
              intent: item.intent || '',
              history: item.history || [],
              relatedJobs: item.relatedJobs || [],
              tag: item.tag || 'all'
            };
          });

          this.filterItems();
        } catch (e) {
          this.allItems = this.getDemoItems();
          this.filterItems();
        }
        this.loading = false;
      },

      getDemoItems() {
        return [
          {
            id: 'q-1',
            title: '\u8bf7\u4ecb\u7ecd\u4e00\u4e2a\u4f60\u505a\u8fc7\u7684 AI \u4ea7\u54c1\u9879\u76ee\uff0c\u5e76\u8bf4\u660e\u4f60\u662f\u5982\u4f55\u5224\u65ad\u5b83\u503c\u5f97\u6295\u5165\u8d44\u6e90\u7684\u3002',
            type: '\u884c\u4e3a\u9762',
            source: 'AI \u4ea7\u54c1\u7ecf\u7406\u5c97\u4f4d\u751f\u6210',
            score: 7.5,
            lastPractice: '2 \u5929\u524d\u7ec3\u4e60',
            mastered: false,
            intent: '\u9762\u8bd5\u5b98\u60f3\u770b\u4f60\u662f\u5426\u5177\u5907\u9879\u76ee\u62c6\u89e3\u80fd\u529b\u3001\u8d44\u6e90\u5224\u65ad\u80fd\u529b\uff0c\u4ee5\u53ca\u5bf9 AI \u573a\u666f\u843d\u5730\u7684\u5b9e\u9645\u7406\u89e3\u3002',
            history: [
              { time: '3\u670831\u65e5 14:20', score: 7.5, improvement: '\u7ed3\u6784\u6027\u63d0\u5347\uff0c\u4f46\u8bc1\u636e\u4ecd\u504f\u5f31' },
              { time: '3\u670829\u65e5 09:15', score: 6.2, improvement: '\u7f3a\u5c11\u91cf\u5316\u7ed3\u679c' }
            ],
            relatedJobs: ['AI \u4ea7\u54c1\u7ecf\u7406', '\u4ea7\u54c1\u7ecf\u7406'],
            tag: 'hot'
          },
          {
            id: 'q-2',
            title: '\u4f60\u5982\u4f55\u5904\u7406\u56e2\u961f\u4e2d\u7684\u610f\u89c1\u5206\u6b67\uff1f\u8bf7\u4e3e\u4e00\u4e2a\u5177\u4f53\u4f8b\u5b50\u3002',
            type: '\u884c\u4e3a\u9762',
            source: '\u7cfb\u7edf\u63a8\u8350',
            score: 6.8,
            lastPractice: '5 \u5929\u524d\u7ec3\u4e60',
            mastered: false,
            intent: '\u8003\u5bdf\u4f60\u7684\u6c9f\u901a\u80fd\u529b\u3001\u51b2\u7a81\u89e3\u51b3\u548c\u56e2\u961f\u534f\u4f5c\u7ecf\u9a8c\u3002',
            history: [
              { time: '3\u670826\u65e5 16:30', score: 6.8, improvement: '\u8868\u8fbe\u6e05\u6670\uff0c\u4f46\u7f3a\u5c11\u5177\u4f53\u7ed3\u679c' }
            ],
            relatedJobs: ['\u4ea7\u54c1\u7ecf\u7406', '\u9879\u76ee\u7ecf\u7406'],
            tag: 'weak'
          },
          {
            id: 'q-3',
            title: '\u63cf\u8ff0\u4e00\u6b21\u4f60\u63a8\u52a8\u8de8\u90e8\u95e8\u534f\u4f5c\u7684\u7ecf\u5386\uff0c\u4f60\u662f\u5982\u4f55\u8ba9\u5404\u65b9\u8fbe\u6210\u5171\u8bc6\u7684\uff1f',
            type: '\u9879\u76ee\u9762',
            source: '\u7cfb\u7edf\u63a8\u8350',
            score: 0,
            lastPractice: '',
            mastered: false,
            intent: '\u8003\u5bdf\u4f60\u7684\u8de8\u90e8\u95e8\u534f\u8c03\u3001\u5f71\u54cd\u529b\u548c\u63a8\u52a8\u590d\u6742\u9879\u76ee\u7684\u80fd\u529b\u3002',
            history: [],
            relatedJobs: ['\u4ea7\u54c1\u7ecf\u7406', '\u9879\u76ee\u7ecf\u7406', '\u8fd0\u8425\u7ecf\u7406'],
            tag: 'weekly'
          },
          {
            id: 'q-4',
            title: '\u4f60\u5bf9\u5f53\u524d AI \u4ea7\u54c1\u7684\u843d\u5730\u573a\u666f\u6709\u4ec0\u4e48\u7406\u89e3\uff1f\u4f60\u89c9\u5f97\u54ea\u4e9b\u573a\u666f\u6700\u6709\u4ef7\u503c\uff1f',
            type: 'AI \u573a\u666f',
            source: 'AI \u4ea7\u54c1\u7ecf\u7406\u5c97\u4f4d\u751f\u6210',
            score: 0,
            lastPractice: '',
            mastered: false,
            intent: '\u8003\u5bdf\u4f60\u5bf9 AI \u884c\u4e1a\u7684\u8ba4\u77e5\u6df1\u5ea6\u548c\u5546\u4e1a\u5224\u65ad\u529b\u3002',
            history: [],
            relatedJobs: ['AI \u4ea7\u54c1\u7ecf\u7406'],
            tag: 'hot'
          },
          {
            id: 'q-5',
            title: '\u4f60\u5982\u4f55\u8861\u91cf\u4e00\u4e2a\u529f\u80fd\u662f\u5426\u503c\u5f97\u5f00\u53d1\uff1f\u8bf7\u63cf\u8ff0\u4f60\u7684\u51b3\u7b56\u6846\u67b6\u3002',
            type: '\u4ea7\u54c1\u8bbe\u8ba1',
            source: '\u7cfb\u7edf\u63a8\u8350',
            score: 8.2,
            lastPractice: '1 \u5929\u524d\u7ec3\u4e60',
            mastered: true,
            intent: '\u8003\u5bdf\u4f60\u7684\u4ea7\u54c1\u601d\u7ef4\u3001\u4f18\u5148\u7ea7\u5224\u65ad\u548c\u6570\u636e\u9a71\u52a8\u51b3\u7b56\u80fd\u529b\u3002',
            history: [
              { time: '3\u670830\u65e5 10:00', score: 8.2, improvement: '\u7ed3\u6784\u6e05\u6670\uff0c\u8bc1\u636e\u5145\u5206' }
            ],
            relatedJobs: ['\u4ea7\u54c1\u7ecf\u7406', 'AI \u4ea7\u54c1\u7ecf\u7406'],
            tag: 'all'
          }
        ];
      },

      loadReviews() {
        this.reviews = [
          {
            id: 'r-1',
            company: '\u5b57\u8282\u8df3\u52a8',
            position: 'AI \u4ea7\u54c1\u7ecf\u7406',
            date: '2026-02-28 \u4e0a\u5348',
            overallScore: 7.2,
            questions: [
              { question: '\u8bf7\u4ecb\u7ecd\u4f60\u505a\u8fc7\u7684 AI \u9879\u76ee', assessment: '\u7ed3\u6784\u6e05\u6670\uff0c\u4f46\u91cf\u5316\u4e0d\u8db3' },
              { question: '\u4f60\u5982\u4f55\u505a\u4f18\u5148\u7ea7\u6392\u5e8f', assessment: '\u56de\u7b54\u504f\u7406\u8bba\uff0c\u7f3a\u5c11\u5177\u4f53\u6848\u4f8b' },
              { question: '\u4f60\u5bf9 LLM \u4ea7\u54c1\u7684\u770b\u6cd5', assessment: '\u89c1\u89e3\u72ec\u7279\uff0c\u8868\u8fbe\u6d41\u7545' }
            ],
            highlights: ['\u9879\u76ee\u7ecf\u9a8c\u4e30\u5bcc\uff0c\u6848\u4f8b\u771f\u5b9e', 'AI \u573a\u666f\u7406\u89e3\u6df1\u5165'],
            mistakes: ['\u7ed3\u679c\u91cf\u5316\u4e0d\u8db3', '\u7f3a\u5c11\u5c97\u4f4d\u8d34\u5408\u8868\u8fbe'],
            nextSuggestion: '\u5efa\u8bae\u5728\u6bcf\u4e2a\u56de\u7b54\u4e2d\u52a0\u5165 2-3 \u4e2a\u5177\u4f53\u6570\u636e\u70b9\uff0c\u5e76\u5728\u7ed3\u5c3e\u56de\u6263\u5c97\u4f4d\u9700\u6c42\u3002'
          }
        ];
      },

      // ========================
      // Filtering
      // ========================
      filterItems() {
        var self = this;
        var items = this.allItems.slice();

        // Filter by left filter
        if (this.activeLeftFilter !== 'all') {
          items = items.filter(function (i) { return i.tag === self.activeLeftFilter; });
        }

        // Search
        if (this.searchTerm) {
          var term = this.searchTerm.toLowerCase();
          items = items.filter(function (i) {
            return (i.title || '').toLowerCase().indexOf(term) !== -1 ||
                   (i.type || '').toLowerCase().indexOf(term) !== -1;
          });
        }

        this.filteredItems = items;
      },

      // ========================
      // Module switching
      // ========================
      switchModule(mod) {
        this.activeModule = mod;
        // When switching to review, auto-select first review if any
        if (mod === 'review' && this.reviews.length > 0 && !this.selectedReview) {
          this.selectedReview = this.reviews[0];
        }
      },

      // ========================
      // Item selection
      // ========================
      selectItem(item) {
        this.selectedItem = item;
        this.currentAnswer = '';
        this.feedbackData = null;
        this.feedbackLoading = false;

        // If in review mode and item clicked, switch to coaching
        if (this.activeModule === 'review' || this.activeModule === 'simulation' || this.activeModule === 'companion') {
          this.activeModule = 'coaching';
        }
      },

      // ========================
      // Answer submission
      // ========================
      submitAnswer() {
        if (!this.currentAnswer || this.currentAnswer.trim().length < 10) {
          return;
        }
        this.feedbackLoading = true;
        this.feedbackData = null;

        var self = this;
        // Simulate AI feedback generation
        setTimeout(function () {
          self.feedbackData = {
            score: 7.8,
            conclusion: '\u5df2\u5177\u5907\u57fa\u672c\u901a\u8fc7\u6c34\u5e73\uff0c\u4f46\u8bc1\u636e\u8868\u8fbe\u4ecd\u504f\u5f31',
            summary: '\u5efa\u8bae\u8865\u5145\u66f4\u591a\u91cf\u5316\u7ed3\u679c\uff0c\u5f3a\u5316\u5c97\u4f4d\u8d34\u5408\u5ea6\u3002',
            dimensions: [
              { name: '\u7ed3\u6784\u6027', score: 8.0 },
              { name: '\u5c97\u4f4d\u76f8\u5173\u6027', score: 7.5 },
              { name: '\u8bc1\u636e\u5f3a\u5ea6', score: 6.8 },
              { name: '\u8868\u8fbe\u6e05\u6670\u5ea6', score: 8.2 },
              { name: '\u5dee\u5f02\u5316\u7a0b\u5ea6', score: 7.0 }
            ],
            mustFix: [
              '\u7ed3\u679c\u91cf\u5316\u4e0d\u8db3\uff0c\u56de\u7b54\u91cc\u6ca1\u6709\u660e\u786e\u4f53\u73b0\u9879\u76ee\u6548\u679c',
              '\u5224\u65ad\u8fc7\u7a0b\u504f\u7a7a\u6cdb\uff0c\u7f3a\u5c11\u4f60\u5982\u4f55\u505a\u8d44\u6e90\u53d6\u820d\u7684\u5177\u4f53\u7ec6\u8282',
              '\u7ed3\u5c3e\u6ca1\u6709\u56de\u6263\u5c97\u4f4d\u9700\u6c42\uff0c\u5bfc\u81f4\u76f8\u5173\u6027\u5f31\u4e86\u4e00\u5c42'
            ],
            optimizedAnswer: '\u5728\u6211\u4e0a\u4e00\u5bb6\u516c\u53f8\uff0c\u6211\u4e3b\u5bfc\u4e86\u4e00\u4e2a AI \u5ba2\u670d\u52a9\u624b\u9879\u76ee\u3002\u5f53\u65f6\u56e2\u961f\u9762\u4e34\u7684\u6838\u5fc3\u6311\u6218\u662f\u5ba2\u670d\u54cd\u5e94\u6162\u3001\u91cd\u590d\u95ee\u9898\u591a\u3002\u6211\u7684\u5224\u65ad\u662f\uff1a\u8fd9\u4e2a\u573a\u666f\u7684\u7528\u6237\u610f\u56fe\u660e\u786e\u3001\u6570\u636e\u79ef\u7d2f\u5145\u8db3\u3001ROI \u53ef\u9884\u671f\u2014\u2014\u6240\u4ee5\u503c\u5f97\u6295\u5165\u3002\u6211\u5148\u62c6\u89e3\u4e86 Top 20 \u9ad8\u9891\u95ee\u9898\uff0c\u7528 3 \u5468\u65f6\u95f4\u8ddf\u7814\u53d1\u5b8c\u6210\u4e86 MVP\u3002\u4e0a\u7ebf\u540e\uff0c\u5ba2\u670d\u54cd\u5e94\u65f6\u95f4\u4ece 4 \u5c0f\u65f6\u964d\u81f3 15 \u5206\u949f\uff0c\u91cd\u590d\u95ee\u9898\u89e3\u51b3\u7387\u8fbe 87%\u3002\u8fd9\u4e2a\u7ecf\u9a8c\u8ba9\u6211\u66f4\u6df1\u5165\u5730\u7406\u89e3\u4e86 AI \u4ea7\u54c1\u7684\u573a\u666f\u5224\u65ad\u903b\u8f91\uff0c\u4e5f\u6b63\u662f\u8d35\u53f8\u5c97\u4f4d\u6240\u9700\u8981\u7684\u80fd\u529b\u3002'
          };
          self.feedbackLoading = false;

          // Update item score
          if (self.selectedItem) {
            self.selectedItem.score = self.feedbackData.score;
          }
        }, 2000);
      },

      // ========================
      // Simulation
      // ========================
      startSimulation() {
        if (this.simMessages.length > 0) {
          // End simulation
          this.switchModule('review');
          this.simMessages = [];
          return;
        }
        this.simMessages = [
          { role: 'interviewer', content: '\u4f60\u597d\uff0c\u6b22\u8fce\u53c2\u52a0\u4eca\u5929\u7684\u9762\u8bd5\u3002\u8bf7\u5148\u505a\u4e00\u4e2a\u7b80\u77ed\u7684\u81ea\u6211\u4ecb\u7ecd\uff0c\u91cd\u70b9\u8bf4\u8bf4\u4f60\u8fd1\u671f\u6700\u6709\u4ee3\u8868\u6027\u7684\u9879\u76ee\u7ecf\u5386\u3002' }
        ];
      },

      sendSimMessage() {
        if (!this.simInput || this.simInput.trim() === '') return;
        this.simMessages.push({ role: 'me', content: this.simInput });
        this.simInput = '';

        var self = this;
        var followUps = [
          '\u4f60\u5728\u8fd9\u4e2a\u9879\u76ee\u4e2d\u9047\u5230\u7684\u6700\u5927\u6311\u6218\u662f\u4ec0\u4e48\uff1f\u4f60\u662f\u5982\u4f55\u89e3\u51b3\u7684\uff1f',
          '\u80fd\u5177\u4f53\u8bf4\u8bf4\u4f60\u5982\u4f55\u8861\u91cf\u8fd9\u4e2a\u529f\u80fd\u7684\u4f18\u5148\u7ea7\u5417\uff1f',
          '\u4f60\u89c9\u5f97\u5982\u679c\u91cd\u65b0\u6765\u4e00\u6b21\uff0c\u4f60\u4f1a\u505a\u4ec0\u4e48\u4e0d\u540c\u7684\u51b3\u7b56\uff1f',
          '\u5f88\u597d\uff0c\u6700\u540e\u4e00\u4e2a\u95ee\u9898\uff1a\u4f60\u5bf9\u6211\u4eec\u7684\u5c97\u4f4d\u6709\u4ec0\u4e48\u60f3\u4e86\u89e3\u7684\uff1f',
          '\u611f\u8c22\u4f60\u7684\u65f6\u95f4\uff0c\u4eca\u5929\u7684\u9762\u8bd5\u5230\u8fd9\u91cc\u3002\u6211\u4eec\u4f1a\u5c3d\u5feb\u7ed9\u4f60\u53cd\u9988\u3002'
        ];

        var qIdx = Math.floor(self.simMessages.length / 2);
        if (qIdx < followUps.length) {
          setTimeout(function () {
            self.simMessages.push({ role: 'interviewer', content: followUps[qIdx] });
          }, 1200);
        }
      },

      // ========================
      // New training
      // ========================
      createNewTraining() {
        var title = prompt('\u8f93\u5165\u9762\u8bd5\u9898\u76ee\uff08\u6216\u4ece\u5c97\u4f4d\u751f\u6210\uff09\uff1a');
        if (!title || title.trim() === '') return;

        var newItem = {
          id: 'q-' + Date.now(),
          title: title.trim(),
          type: '\u884c\u4e3a\u9762',
          source: '\u624b\u52a8\u6dfb\u52a0',
          score: 0,
          lastPractice: '',
          mastered: false,
          intent: '',
          history: [],
          relatedJobs: [],
          tag: 'all'
        };

        this.allItems.unshift(newItem);
        this.filterItems();
        this.selectItem(newItem);
      },

      // ========================
      // Formatting helpers
      // ========================
      formatTime(ts) {
        if (!ts) return '';
        try {
          var d = new Date(ts);
          var now = new Date();
          var diff = now - d;
          if (diff < 3600000) return Math.floor(diff / 60000) + ' \u5206\u949f\u524d';
          if (diff < 86400000) return Math.floor(diff / 3600000) + ' \u5c0f\u65f6\u524d';
          if (diff < 604800000) return Math.floor(diff / 86400000) + ' \u5929\u524d';
          return d.getMonth() + 1 + '\u6708' + d.getDate() + '\u65e5';
        } catch (e) {
          return ts;
        }
      }
    };
  });

});
