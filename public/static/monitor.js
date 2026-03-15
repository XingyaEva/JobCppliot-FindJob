/**
 * FindJob 2.0 - Monitor Dashboard Alpine.js Logic
 * 后台数据监控驾驶舱
 *
 * Manages: perspective/stage/time switching, KPI data, funnel,
 * trend chart SVG paths, module/AI/cost metrics, alerts, diagnoses,
 * user segments, retention, stage view, drill-down, localStorage,
 * export/subscribe actions.
 */

(function () {
  'use strict';

  var MONITOR_KEY = 'jobcopilot_monitor';
  var MONITOR_PREFS = 'jobcopilot_monitor_prefs';

  function loadJSON(key, fallback) {
    try { var d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
    catch (e) { return fallback; }
  }

  function saveJSON(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* quota */ }
  }

  /* =========================================================
   * SAMPLE DATA
   * ========================================================= */

  function sampleKPI() {
    return [
      { title: '\u5317\u6781\u661f', value: '28.4%', subtitle: '\u6c42\u804c\u4efb\u52a1\u95ed\u73af\u7387\uff0c\u8f83\u4e0a\u5468 +2.1%', trendUp: true },
      { title: '\u672c\u5468\u6fc0\u6d3b\u7528\u6237', value: '3,842', subtitle: '\u9996\u6b21\u4ef7\u503c\u5230\u8fbe\u7387 46%', trendUp: true },
      { title: '7 \u65e5\u7559\u5b58', value: '31.7%', subtitle: '\u542f\u7528 Skill \u7528\u6237\u9ad8\u51fa 2.3 \u500d', trendUp: true },
      { title: '\u9ad8\u4ef7\u503c\u7528\u6237', value: '1,126', subtitle: '\u8986\u76d6 2 \u4e2a\u4ee5\u4e0a\u6838\u5fc3\u6a21\u5757', trendUp: true },
      { title: 'Agent \u6210\u529f\u7387', value: '96.2%', subtitle: '\u8f83\u6628\u65e5 -0.8%', trendUp: false },
      { title: '\u5355\u4f4d\u95ed\u73af\u6210\u672c', value: '\u00a514.8', subtitle: '\u8f83\u4e0a\u5468 -6.4%', trendUp: true }
    ];
  }

  function sampleFunnel() {
    return [
      { stage: '\u8fdb\u5165\u9996\u9875', count: '12,840', rate: '100%', pct: 100 },
      { stage: '\u5b8c\u6210\u5c97\u4f4d\u89e3\u6790', count: '6,218', rate: '48.4%', pct: 48 },
      { stage: '\u751f\u6210\u5b9a\u5411\u7b80\u5386', count: '2,946', rate: '47.4%', pct: 23 },
      { stage: '\u5f00\u59cb\u9762\u8bd5\u8bad\u7ec3', count: '1,890', rate: '64.2%', pct: 15 },
      { stage: '\u6295\u9012/\u9762\u8bd5\u8bb0\u5f55', count: '1,024', rate: '54.2%', pct: 8 },
      { stage: 'Offer/\u51b3\u7b56\u9636\u6bb5', count: '364', rate: '35.5%', pct: 3 }
    ];
  }

  function sampleModuleMetrics() {
    return [
      { name: '\u673a\u4f1a', usage: 72, change: 3.2 },
      { name: '\u8d44\u4ea7', usage: 58, change: 1.8 },
      { name: '\u9762\u8bd5', usage: 49, change: -2.1 },
      { name: '\u51b3\u7b56', usage: 21, change: 5.4 },
      { name: '\u6210\u957f', usage: 34, change: 8.6 }
    ];
  }

  function sampleAIMetrics() {
    return [
      { name: 'Agent \u6210\u529f\u7387', value: '96.2%', change: '-0.8%', trendUp: false },
      { name: '\u5b57\u6bb5\u5b8c\u6574\u7387', value: '89.4%', change: '+1.2%', trendUp: true },
      { name: '\u7528\u6237\u91c7\u7eb3\u7387', value: '74.8%', change: '+3.1%', trendUp: true },
      { name: '\u91cd\u8dd1\u7387', value: '8.2%', change: '+2.4%', trendUp: false },
      { name: '\u6295\u8bc9\u7387/\u5e7b\u89c9\u7387', value: '1.3%', change: '-0.2%', trendUp: true }
    ];
  }

  function sampleCostMetrics() {
    return [
      { name: '\u5355\u6b21\u4efb\u52a1\u5e73\u5747\u6210\u672c', value: '\u00a52.4', change: '-8%', good: true },
      { name: '\u5355\u7528\u6237\u6708\u5747\u6210\u672c', value: '\u00a518.6', change: '-3.2%', good: true },
      { name: '\u5355\u4f4d\u95ed\u73af\u6210\u672c', value: '\u00a514.8', change: '-6.4%', good: true },
      { name: '\u9ad8\u4ef7\u503c\u884c\u4e3a\u6210\u672c', value: '\u00a54.2', change: '-12%', good: true },
      { name: 'API \u9519\u8bef\u7387/\u8d85\u65f6\u7387', value: '0.3%', change: '+0.1%', good: false }
    ];
  }

  function sampleAlerts() {
    return [
      { text: '\u9762\u8bd5\u8f85\u5bfc Agent \u6210\u529f\u7387\u4e0b\u964d 2.1%', level: 'high' },
      { text: '\u5c97\u4f4d\u89e3\u6790 \u2192 \u5b9a\u5411\u7b80\u5386\u8f6c\u5316\u4e0b\u964d 8%', level: 'high' },
      { text: '\u67d0\u6e20\u9053\u6fc0\u6d3b\u7387\u9ad8\u4f46\u95ed\u73af\u7387\u4f4e', level: 'medium' },
      { text: '\u51b3\u7b56\u6a21\u5757\u8fd1 7 \u5929\u8fdb\u5165\u7387\u660e\u663e\u4e0b\u964d', level: 'medium' }
    ];
  }

  function sampleDiagnoses() {
    return [
      { text: '\u8fc7\u53bb 7 \u5929\uff0c\u201c\u5c97\u4f4d\u89e3\u6790 \u2192 \u5b9a\u5411\u7b80\u5386\u201d\u8f6c\u5316\u4e0b\u964d 12%\uff0c\u4e3b\u8981\u6765\u81ea\u65b0\u7528\u6237\u4e0e\u79fb\u52a8\u7aef\u3002\u5efa\u8bae\u4f18\u5148\u68c0\u67e5\u9996\u9875\u5230\u673a\u4f1a\u9875\u7684\u627f\u63a5\u94fe\u8def\u4e0e\u7b80\u5386\u751f\u6210\u89e6\u53d1\u6309\u94ae\u4f4d\u7f6e\u3002' },
      { text: '\u542f\u7528\u6210\u957f Skill \u7684\u7528\u6237 14 \u65e5\u7559\u5b58\u663e\u8457\u66f4\u9ad8\uff0c\u5f53\u524d\u5efa\u8bae\u628a\u201c\u6bcf\u5929\u4e00\u9053\u9898\u201d\u548c\u201c\u6bcf\u5468\u5c97\u4f4d\u626b\u63cf\u201d\u524d\u7f6e\u5230\u65b0\u7528\u6237 7 \u65e5\u5185\u3002' },
      { text: '\u9762\u8bd5\u8f85\u5bfc Agent \u7684\u91c7\u7eb3\u7387\u7a33\u5b9a\u4e0a\u5347\uff0c\u4f46\u5355\u4f4d\u6210\u672c\u9ad8\u4e8e\u5176\u4ed6 Agent\uff0c\u5efa\u8bae\u8bc4\u4f30\u4f4e\u6210\u672c\u6a21\u578b\u63a5\u7ba1\u521d\u6b21\u53cd\u9988\u573a\u666f\u3002' }
    ];
  }

  function sampleUserSegments() {
    return [
      { name: '\u76ee\u6807\u660e\u786e\u578b', count: 1420, activation: 78, closure: 42, retention: 38 },
      { name: '\u76ee\u6807\u6a21\u7cca\u578b', count: 1680, activation: 52, closure: 18, retention: 24 },
      { name: '\u957f\u671f\u6210\u957f\u578b', count: 742, activation: 64, closure: 28, retention: 46 }
    ];
  }

  function sampleRetention() {
    return [
      { label: 'D1', value: 58 },
      { label: 'D7', value: 31.7 },
      { label: 'D14', value: 22.4 },
      { label: 'D30', value: 14.8 }
    ];
  }

  function sampleStageMetrics(stage) {
    var data = {
      validation: [
        { name: '\u5c97\u4f4d\u89e3\u6790\u5b8c\u6210\u7387', value: '42%', pct: 42 },
        { name: '\u7b80\u5386\u751f\u6210\u91c7\u7eb3\u7387', value: '38%', pct: 38 },
        { name: '\u7528\u6237\u9996\u65e5\u6fc0\u6d3b\u7387', value: '56%', pct: 56 },
        { name: 'Agent \u57fa\u7840\u6210\u529f\u7387', value: '91%', pct: 91 },
        { name: '\u7528\u6237\u53cd\u9988\u53ca\u65f6\u7387', value: '72%', pct: 72 }
      ],
      development: [
        { name: '\u6c42\u804c\u4efb\u52a1\u95ed\u73af\u7387', value: '28.4%', pct: 28 },
        { name: '\u5c97\u4f4d\u6c60\u5efa\u7acb\u7387', value: '64%', pct: 64 },
        { name: '\u5b9a\u5411\u7b80\u5386\u4f7f\u7528\u7387', value: '47%', pct: 47 },
        { name: '\u9762\u8bd5\u8bad\u7ec3\u5b8c\u6210\u7387', value: '38%', pct: 38 },
        { name: 'Offer \u5bf9\u6bd4\u4f7f\u7528\u7387', value: '21%', pct: 21 }
      ],
      maturity: [
        { name: '\u6708\u6d3b\u8dc3\u7528\u6237\u7559\u5b58', value: '45%', pct: 45 },
        { name: '\u4ed8\u8d39\u8f6c\u5316\u7387', value: '8.2%', pct: 8 },
        { name: '\u63a8\u8350\u7387 (NPS)', value: '62', pct: 62 },
        { name: '\u5355\u7528\u6237\u6536\u5165', value: '\u00a548', pct: 48 },
        { name: '\u5e73\u53f0\u53e3\u7891\u6307\u6570', value: '78%', pct: 78 }
      ]
    };
    return data[stage] || data.development;
  }

  /* =========================================================
   * TREND CHART SVG PATH GENERATION
   * ========================================================= */

  // Generate sample trend data for 30 days
  function generateTrendData(days) {
    var base = 24;
    var data = [];
    for (var i = 0; i < days; i++) {
      // Simulate gradual upward trend with noise
      var noise = (Math.sin(i * 0.8) * 2) + (Math.random() - 0.5) * 1.5;
      var val = base + (i / days) * 6 + noise;
      val = Math.max(20, Math.min(38, val));
      data.push(val);
    }
    // Ensure last value is close to 28.4
    data[data.length - 1] = 28.4;
    return data;
  }

  function buildSVGPath(data, width, height, minVal, maxVal) {
    var points = [];
    var step = width / (data.length - 1);
    for (var i = 0; i < data.length; i++) {
      var x = i * step;
      var y = height - ((data[i] - minVal) / (maxVal - minVal)) * height;
      points.push({ x: x, y: y });
    }
    // Smoothed path using Catmull-Rom to Bezier
    var line = 'M' + points[0].x + ',' + points[0].y;
    for (var j = 1; j < points.length; j++) {
      var p0 = points[j - 2] || points[j - 1];
      var p1 = points[j - 1];
      var p2 = points[j];
      var p3 = points[j + 1] || p2;
      var cp1x = p1.x + (p2.x - p0.x) / 6;
      var cp1y = p1.y + (p2.y - p0.y) / 6;
      var cp2x = p2.x - (p3.x - p1.x) / 6;
      var cp2y = p2.y - (p3.y - p1.y) / 6;
      line += ' C' + cp1x + ',' + cp1y + ' ' + cp2x + ',' + cp2y + ' ' + p2.x + ',' + p2.y;
    }
    return { line: line, points: points };
  }

  /* =========================================================
   * ALPINE.JS COMPONENT
   * ========================================================= */

  if (typeof Alpine === 'undefined') {
    document.addEventListener('alpine:init', registerComponent);
  } else {
    registerComponent();
  }

  function registerComponent() {
    Alpine.data('monitorWorkspace', function () {
      var prefs = loadJSON(MONITOR_PREFS, {});
      var trendData30 = generateTrendData(30);
      var trendData7 = trendData30.slice(-7);
      var trendData90 = generateTrendData(90);
      var currentTrend = trendData30;
      var pathResult = buildSVGPath(currentTrend, 560, 160, 20, 38);

      return {
        /* ---- State ---- */
        searchTerm: '',
        isEmpty: false,
        showTimeMenu: false,

        /* Perspective & Stage */
        activePerspective: prefs.perspective || 'overview',
        activeStage: prefs.stage || 'development',
        timeRange: prefs.timeRange || '30d',

        perspectives: [
          { label: '\u603b\u89c8', value: 'overview' },
          { label: '\u589e\u957f', value: 'growth' },
          { label: '\u95ed\u73af', value: 'loop' },
          { label: 'AI \u8d28\u91cf', value: 'ai_quality' },
          { label: '\u7559\u5b58', value: 'retention' },
          { label: '\u7ecf\u8425', value: 'operations' }
        ],

        stages: [
          { label: '\u9a8c\u8bc1\u671f', value: 'validation' },
          { label: '\u53d1\u5c55\u671f', value: 'development' },
          { label: '\u6210\u719f\u671f', value: 'maturity' }
        ],

        trendRanges: [
          { label: '7 \u5929', value: '7d' },
          { label: '30 \u5929', value: '30d' },
          { label: '90 \u5929', value: '90d' }
        ],
        activeTrendRange: '30d',

        /* Computed time label */
        get timeRangeLabel() {
          var m = { '7d': '\u6700\u8fd1 7 \u5929', '30d': '\u6700\u8fd1 30 \u5929', '90d': '\u6700\u8fd1 90 \u5929' };
          return m[this.timeRange] || '\u6700\u8fd1 30 \u5929';
        },

        /* KPI */
        kpiCards: sampleKPI(),

        /* Funnel */
        funnelData: sampleFunnel(),

        /* Trend chart */
        trendLinePath: pathResult.line,
        trendAreaPath: pathResult.line + ' L560,160 L0,160 Z',
        trendDotX: pathResult.points[pathResult.points.length - 1].x,
        trendDotY: pathResult.points[pathResult.points.length - 1].y,

        /* Module metrics */
        moduleMetrics: sampleModuleMetrics(),

        /* AI metrics */
        aiMetrics: sampleAIMetrics(),

        /* Cost metrics */
        costMetrics: sampleCostMetrics(),

        /* Alerts */
        alerts: sampleAlerts(),

        /* Diagnoses */
        diagnoses: sampleDiagnoses(),

        /* User segments */
        userSegments: sampleUserSegments(),

        /* Retention */
        retentionData: sampleRetention(),

        /* Stage view */
        activeStageView: 'development',
        stageViewTabs: [
          { label: '\u9a8c\u8bc1\u671f', value: 'validation' },
          { label: '\u53d1\u5c55\u671f', value: 'development' },
          { label: '\u6210\u719f\u671f', value: 'maturity' }
        ],
        stageMetrics: sampleStageMetrics('development'),

        /* Drill-down entries */
        drillDownEntries: [
          { title: '\u53bb\u589e\u957f\u770b\u677f', subtitle: '\u67e5\u770b\u8be6\u7ec6\u589e\u957f\u6570\u636e', icon: 'fas fa-chart-line', path: '/growth' },
          { title: '\u53bb\u95ed\u73af\u6f0f\u6597', subtitle: '\u6df1\u5165\u5206\u6790\u8f6c\u5316\u74f6\u9888', icon: 'fas fa-filter', path: '/opportunities' },
          { title: '\u53bb AI \u8d28\u91cf\u770b\u677f', subtitle: '\u76d1\u63a7 Agent \u8fd0\u884c\u72b6\u6001', icon: 'fas fa-robot', path: '/monitor?tab=ai' },
          { title: '\u53bb\u7ecf\u8425\u5206\u6790', subtitle: '\u6210\u672c\u4e0e\u6548\u7387\u8be6\u60c5', icon: 'fas fa-coins', path: '/monitor?tab=cost' }
        ],

        /* ---- Init ---- */
        init: function () {
          var self = this;

          // Watch perspective changes
          self.$watch('activePerspective', function (v) {
            self.savePrefs();
            self.refreshData();
          });

          // Watch stage changes
          self.$watch('activeStage', function (v) {
            self.savePrefs();
            self.refreshData();
          });

          // Watch trend range
          self.$watch('activeTrendRange', function (v) {
            self.updateTrendChart(v);
          });

          // Watch stage view tab
          self.$watch('activeStageView', function (v) {
            self.stageMetrics = sampleStageMetrics(v);
          });

          // Check URL params
          var params = new URLSearchParams(window.location.search);
          if (params.get('perspective')) {
            self.activePerspective = params.get('perspective');
          }
          if (params.get('stage')) {
            self.activeStage = params.get('stage');
          }

          // Set active workspace
          try {
            var wsEl = document.querySelector('[data-workspace]');
            if (wsEl) wsEl.setAttribute('data-workspace', 'monitor');
          } catch (e) {}

          console.log('[Monitor] Dashboard initialized');
        },

        /* ---- Trend Chart Update ---- */
        updateTrendChart: function (range) {
          var data;
          if (range === '7d') {
            data = trendData7;
          } else if (range === '90d') {
            data = trendData90;
          } else {
            data = trendData30;
          }
          var result = buildSVGPath(data, 560, 160, 20, 38);
          this.trendLinePath = result.line;
          this.trendAreaPath = result.line + ' L560,160 L0,160 Z';
          this.trendDotX = result.points[result.points.length - 1].x;
          this.trendDotY = result.points[result.points.length - 1].y;
        },

        /* ---- Data Refresh (perspective/stage aware) ---- */
        refreshData: function () {
          // In production, this would call /api/monitor/* endpoints
          // For now, data stays as sample
          console.log('[Monitor] Refreshing for perspective=' + this.activePerspective + ', stage=' + this.activeStage);
        },

        /* ---- Persistence ---- */
        savePrefs: function () {
          saveJSON(MONITOR_PREFS, {
            perspective: this.activePerspective,
            stage: this.activeStage,
            timeRange: this.timeRange
          });
        },

        /* ---- Empty state: load sample data ---- */
        loadSampleData: function () {
          this.isEmpty = false;
          this.kpiCards = sampleKPI();
          this.funnelData = sampleFunnel();
          this.moduleMetrics = sampleModuleMetrics();
          this.aiMetrics = sampleAIMetrics();
          this.costMetrics = sampleCostMetrics();
          this.alerts = sampleAlerts();
          this.diagnoses = sampleDiagnoses();
          this.userSegments = sampleUserSegments();
          this.retentionData = sampleRetention();
          this.stageMetrics = sampleStageMetrics(this.activeStageView);
          this.updateTrendChart(this.activeTrendRange);
          console.log('[Monitor] Sample data loaded');
        },

        /* ---- Export ---- */
        exportReport: function () {
          var report = {
            timestamp: new Date().toISOString(),
            perspective: this.activePerspective,
            stage: this.activeStage,
            timeRange: this.timeRange,
            kpi: this.kpiCards,
            funnel: this.funnelData,
            modules: this.moduleMetrics,
            aiQuality: this.aiMetrics,
            cost: this.costMetrics,
            alerts: this.alerts,
            diagnoses: this.diagnoses,
            segments: this.userSegments,
            retention: this.retentionData,
            stageView: this.stageMetrics
          };
          var blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = '\u6570\u636e\u9a7e\u9a76\u8231_' + new Date().toISOString().slice(0, 10) + '.json';
          a.click();
          URL.revokeObjectURL(url);
          console.log('[Monitor] Report exported');
        },

        /* ---- Subscribe ---- */
        subscribe: function () {
          // Placeholder: in production, call /api/monitor/subscribe
          var self = this;
          var btn = event.target.closest('button');
          if (btn) {
            var orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check text-[11px]"></i><span>\u5df2\u8ba2\u9605</span>';
            btn.classList.add('bg-emerald-600');
            setTimeout(function () {
              btn.innerHTML = orig;
              btn.classList.remove('bg-emerald-600');
            }, 2000);
          }
          console.log('[Monitor] Subscribed to daily report');
        },

        /* ---- Navigation ---- */
        navigateTo: function (path) {
          window.location.href = path;
        }
      };
    });
  }

})();
