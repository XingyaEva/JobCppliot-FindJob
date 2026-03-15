/**
 * FindJob 2.0 - 后台数据监控驾驶舱 (Data Dashboard)
 * PRD v1.5 pixel-level implementation
 *
 * Single-page vertical dashboard layout:
 *   Content area: ~1148px (1440 - 236 sidebar - 2×28 margin)
 *
 * 5 vertical layers:
 *   Layer 1: North Star & 6 KPI cards (184×110 px each)
 *   Layer 2: Job-closure funnel (520×320) + North Star trend (636×320)
 *   Layer 3: Module performance (400×300) + AI quality (400×300) + Cost efficiency (356×300)
 *   Layer 4: Anomaly alerts (520×260) + Auto diagnosis (636×260)
 *   Layer 5: User segments (400×280) + Retention (400×280) + Stage view (356×280)
 *   Footer: 4 drill-down entry cards (286×88)
 *
 * Uses Alpine.js for all interactivity.
 */

export function MonitorPage() {
  const html = `
<div id="monitor-workspace" x-data="monitorWorkspace" x-init="init()" class="min-h-[calc(100vh-72px)]">

  <!-- ============================================ -->
  <!-- PAGE TITLE AREA                               -->
  <!-- ============================================ -->
  <div class="px-7 pt-6">
    <h1 class="text-[30px] font-semibold text-primary leading-[38px] tracking-tight">\u6570\u636e\u9a7e\u9a76\u8231</h1>
    <p class="text-[14px] text-secondary leading-[22px] mt-2">\u4ece\u589e\u957f\u3001\u95ed\u73af\u3001AI \u8d28\u91cf\u5230\u7ecf\u8425\u6548\u7387\uff0c\u5feb\u901f\u5224\u65ad\u4ea7\u54c1\u73b0\u5728\u662f\u5426\u5065\u5eb7\u3002</p>
  </div>

  <!-- ============================================ -->
  <!-- TOP TOOLBAR                                    -->
  <!-- ============================================ -->
  <div class="px-7 mt-5 flex items-center justify-between flex-wrap gap-3" style="min-height:52px;">
    <div class="flex items-center gap-2.5 flex-wrap">
      <!-- Search box 260x44 -->
      <div class="relative">
        <input type="text" x-model="searchTerm" placeholder="\u641c\u7d22\u6307\u6807\u3001\u6a21\u5757\u3001Agent" class="w-[260px] h-[44px] pl-10 pr-4 rounded-[14px] bg-white border border-black/[0.08] text-[14px] text-primary placeholder-secondary/50 focus:outline-none focus:border-accent/30 transition-all" />
        <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-secondary/40"></i>
      </div>
      <!-- Perspective capsules (6) -->
      <template x-for="(v, vi) in perspectives" x-bind:key="vi">
        <button x-on:click="activePerspective = v.value" x-bind:class="activePerspective === v.value ? 'bg-primary/[0.06] text-primary font-semibold border-primary/[0.12]' : 'bg-white text-secondary border-black/[0.08] hover:border-black/[0.12] hover:text-primary/70'" class="h-[34px] px-3.5 rounded-full text-[13px] border whitespace-nowrap transition-all" x-text="v.label"></button>
      </template>
      <!-- Divider -->
      <div class="w-px h-5 bg-black/[0.06] mx-1"></div>
      <!-- Stage capsules (3) -->
      <template x-for="(s, si) in stages" x-bind:key="si">
        <button x-on:click="activeStage = s.value" x-bind:class="activeStage === s.value ? 'bg-amber-50 text-amber-700 font-semibold border-amber-200' : 'bg-white text-secondary border-black/[0.08] hover:border-black/[0.12] hover:text-primary/70'" class="h-[34px] px-3.5 rounded-full text-[13px] border whitespace-nowrap transition-all" x-text="s.label"></button>
      </template>
    </div>
    <div class="flex items-center gap-2.5">
      <!-- Time range selector 132x44 -->
      <button x-on:click="showTimeMenu = !showTimeMenu" class="relative h-[44px] w-[132px] rounded-[14px] bg-white border border-black/[0.08] flex items-center justify-center gap-2 text-[14px] text-primary font-medium hover:border-accent/20 transition-all">
        <i class="fas fa-calendar-alt text-[11px] text-secondary/50"></i>
        <span x-text="timeRangeLabel"></span>
        <i class="fas fa-chevron-down text-[9px] text-secondary/40 ml-0.5"></i>
      </button>
      <!-- Export -->
      <button x-on:click="exportReport()" class="h-[44px] px-5 rounded-[14px] bg-white border border-black/[0.08] flex items-center gap-2 text-[14px] text-primary font-medium hover:border-accent/20 transition-all">
        <i class="fas fa-download text-[11px] text-secondary/50"></i>
        <span>\u5bfc\u51fa\u62a5\u544a</span>
      </button>
      <!-- Subscribe -->
      <button x-on:click="subscribe()" class="h-[44px] px-5 rounded-[14px] bg-primary text-white flex items-center gap-2 text-[14px] font-medium hover:bg-primary/90 transition-all">
        <i class="fas fa-bell text-[11px]"></i>
        <span>\u8ba2\u9605\u65e5\u62a5</span>
      </button>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- MAIN CONTENT (scrollable)                      -->
  <!-- ============================================ -->
  <div class="px-7 pb-10 mt-5 monitor-scrollbar" style="overflow-y:auto; max-height:calc(100vh - 72px - 180px);">

    <!-- ==================== LAYER 1: KPI CARDS ==================== -->
    <div class="grid grid-cols-6 gap-4">
      <template x-for="(kpi, ki) in kpiCards" x-bind:key="ki">
        <div class="bg-white rounded-[20px] border border-black/[0.06] p-4 flex flex-col justify-between" style="height:110px;">
          <span class="text-[12px] text-secondary/70 font-medium" x-text="kpi.title"></span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-[24px] font-semibold text-primary leading-[30px]" x-text="kpi.value"></span>
            <span class="text-[12px]" x-bind:class="kpi.trendUp ? 'text-emerald-600/70' : 'text-amber-600/70'" x-text="kpi.trendUp ? '\u2191' : '\u2193'"></span>
          </div>
          <span class="text-[12px] text-secondary/50 leading-[16px]" x-text="kpi.subtitle"></span>
        </div>
      </template>
    </div>

    <!-- ==================== LAYER 2: FUNNEL + TREND ==================== -->
    <div class="flex gap-4 mt-5">

      <!-- LEFT: Job-closure Funnel 520x320 -->
      <div class="bg-white rounded-[24px] border border-black/[0.06] p-5 flex-shrink-0" style="width:520px; height:320px;">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="text-[16px] font-semibold text-primary">\u6c42\u804c\u95ed\u73af\u6f0f\u6597</h3>
            <p class="text-[12px] text-secondary/60 mt-0.5">\u770b\u7528\u6237\u662f\u5426\u771f\u6b63\u4ece\u5c97\u4f4d\u8fdb\u5165\u5230\u7b80\u5386\u3001\u9762\u8bd5\u4e0e\u51b3\u7b56\u3002</p>
          </div>
        </div>
        <!-- Funnel bars -->
        <div class="flex flex-col gap-2.5 mt-2">
          <template x-for="(f, fi) in funnelData" x-bind:key="fi">
            <div class="flex items-center gap-3" style="height:36px;">
              <span class="text-[12px] text-secondary/70 w-[100px] text-right flex-shrink-0" x-text="f.stage"></span>
              <div class="flex-1 h-[22px] bg-black/[0.03] rounded-full overflow-hidden relative">
                <div class="h-full rounded-full transition-all duration-700" x-bind:style="'width:' + f.pct + '%; background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,' + (0.04 + fi*0.02) + '))'" x-bind:class="fi === 0 ? 'bg-primary/10' : ''"></div>
                <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-secondary/60 font-medium" x-text="f.count"></span>
              </div>
              <span class="text-[11px] text-secondary/50 w-[42px] text-right flex-shrink-0" x-text="f.rate"></span>
            </div>
          </template>
        </div>
        <!-- Bottom insight -->
        <div class="mt-4 pt-3 border-t border-black/[0.04]">
          <div class="flex items-start gap-2">
            <i class="fas fa-lightbulb text-amber-500/60 text-[11px] mt-0.5"></i>
            <span class="text-[12px] text-secondary/70 leading-[18px]">\u5f53\u524d\u6700\u5927\u6d41\u5931\u53d1\u751f\u5728\u201c\u5c97\u4f4d\u89e3\u6790 \u2192 \u5b9a\u5411\u7b80\u5386\u201d\u9636\u6bb5\u3002</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: North Star Trend -->
      <div class="bg-white rounded-[24px] border border-black/[0.06] p-5 flex-1" style="height:320px;">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-[16px] font-semibold text-primary">\u5317\u6781\u661f\u8d8b\u52bf</h3>
          <div class="flex items-center gap-1.5">
            <template x-for="(tr, tri) in trendRanges" x-bind:key="tri">
              <button x-on:click="activeTrendRange = tr.value" x-bind:class="activeTrendRange === tr.value ? 'bg-primary/[0.06] text-primary font-semibold border-primary/[0.12]' : 'bg-white text-secondary border-black/[0.08] hover:text-primary/60'" class="h-[28px] px-2.5 rounded-full text-[12px] border whitespace-nowrap transition-all" x-text="tr.label"></button>
            </template>
          </div>
        </div>
        <!-- SVG Line Chart -->
        <div class="relative" style="height:190px;">
          <svg x-ref="trendChart" viewBox="0 0 580 180" class="w-full h-full" preserveAspectRatio="none">
            <!-- Grid lines -->
            <line x1="0" y1="45" x2="580" y2="45" stroke="rgba(0,0,0,0.04)" stroke-dasharray="4,4"/>
            <line x1="0" y1="90" x2="580" y2="90" stroke="rgba(0,0,0,0.04)" stroke-dasharray="4,4"/>
            <line x1="0" y1="135" x2="580" y2="135" stroke="rgba(0,0,0,0.04)" stroke-dasharray="4,4"/>
            <!-- Target line -->
            <line x1="0" x2="580" y1="54" y2="54" stroke="rgba(245,158,11,0.3)" stroke-dasharray="6,4" stroke-width="1"/>
            <text x="582" y="58" fill="rgba(245,158,11,0.5)" font-size="10">\u76ee\u6807 32%</text>
            <!-- Trend area -->
            <path x-bind:d="trendAreaPath" fill="rgba(0,0,0,0.03)" />
            <!-- Trend line -->
            <path x-bind:d="trendLinePath" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Current dot -->
            <circle x-bind:cx="trendDotX" x-bind:cy="trendDotY" r="4" fill="white" stroke="rgba(0,0,0,0.35)" stroke-width="2"/>
          </svg>
          <!-- Y-axis labels -->
          <span class="absolute left-0 top-[42px] text-[10px] text-secondary/40">35%</span>
          <span class="absolute left-0 top-[87px] text-[10px] text-secondary/40">30%</span>
          <span class="absolute left-0 top-[132px] text-[10px] text-secondary/40">25%</span>
        </div>
        <!-- Summary row -->
        <div class="flex items-center gap-6 mt-2 pt-3 border-t border-black/[0.04]">
          <div class="flex items-center gap-2">
            <span class="text-[12px] text-secondary/60">\u5f53\u524d</span>
            <span class="text-[14px] font-semibold text-primary">28.4%</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[12px] text-secondary/60">\u76ee\u6807</span>
            <span class="text-[14px] font-semibold text-amber-600">32%</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[12px] text-secondary/60">\u6700\u8fd1 7 \u5929</span>
            <span class="text-[12px] text-emerald-600/70 font-medium">\u7a33\u6b65\u4e0a\u5347 \u2191</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== LAYER 3: MODULE + AI + COST ==================== -->
    <div class="flex gap-4 mt-5">

      <!-- Module Performance 400x300 -->
      <div class="bg-white rounded-[24px] border border-black/[0.06] p-5" style="width:400px; height:300px;">
        <h3 class="text-[16px] font-semibold text-primary mb-4">\u6838\u5fc3\u6a21\u5757\u8868\u73b0</h3>
        <div class="flex flex-col gap-3">
          <template x-for="(m, mi) in moduleMetrics" x-bind:key="mi">
            <div class="flex items-center gap-3">
              <span class="text-[13px] text-secondary/70 w-[48px] flex-shrink-0" x-text="m.name"></span>
              <div class="flex-1 h-[18px] bg-black/[0.03] rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" x-bind:style="'width:' + m.usage + '%; background: rgba(0,0,0,' + (0.06 + mi*0.02) + ')'"></div>
              </div>
              <span class="text-[13px] font-semibold text-primary w-[38px] text-right" x-text="m.usage + '%'"></span>
              <span class="text-[11px] w-[48px] text-right" x-bind:class="m.change > 0 ? 'text-emerald-600/60' : 'text-amber-600/60'" x-text="(m.change > 0 ? '+' : '') + m.change + '%'"></span>
            </div>
          </template>
        </div>
        <div class="mt-auto pt-4 border-t border-black/[0.04]" style="margin-top:auto;">
          <div class="flex items-start gap-2">
            <i class="fas fa-info-circle text-secondary/40 text-[11px] mt-0.5"></i>
            <span class="text-[12px] text-secondary/60 leading-[18px]">\u9762\u8bd5\u6a21\u5757\u91c7\u7eb3\u7387\u8f83\u9ad8\uff0c\u4f46\u8fdb\u5165\u7387\u4ecd\u504f\u4f4e\u3002</span>
          </div>
        </div>
      </div>

      <!-- AI Quality 400x300 -->
      <div class="bg-white rounded-[24px] border border-black/[0.06] p-5" style="width:400px; height:300px;">
        <h3 class="text-[16px] font-semibold text-primary mb-4">AI \u8d28\u91cf</h3>
        <div class="flex flex-col gap-3">
          <template x-for="(a, ai) in aiMetrics" x-bind:key="ai">
            <div class="flex items-center justify-between py-2 border-b border-black/[0.03] last:border-0">
              <span class="text-[13px] text-secondary/70" x-text="a.name"></span>
              <div class="flex items-center gap-3">
                <span class="text-[15px] font-semibold text-primary" x-text="a.value"></span>
                <div class="flex items-center gap-1">
                  <span class="text-[11px]" x-bind:class="a.trendUp ? 'text-emerald-600/60' : 'text-amber-600/60'" x-text="a.trendUp ? '\u2191' : '\u2193'"></span>
                  <span class="text-[11px]" x-bind:class="a.trendUp ? 'text-emerald-600/60' : 'text-amber-600/60'" x-text="a.change"></span>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div class="mt-auto pt-3 border-t border-black/[0.04]" style="margin-top:auto;">
          <div class="flex items-start gap-2">
            <i class="fas fa-exclamation-circle text-amber-500/50 text-[11px] mt-0.5"></i>
            <span class="text-[12px] text-secondary/60 leading-[18px]">\u9762\u8bd5\u8f85\u5bfc Agent \u91c7\u7eb3\u7387\u9ad8\uff0c\u4f46\u5b9a\u5411\u7b80\u5386 Agent \u91cd\u8dd1\u7387\u4e0a\u5347\u3002</span>
          </div>
        </div>
      </div>

      <!-- Cost Efficiency 356x300 -->
      <div class="bg-white rounded-[24px] border border-black/[0.06] p-5 flex-1" style="min-width:300px; height:300px;">
        <h3 class="text-[16px] font-semibold text-primary mb-4">\u6210\u672c\u6548\u7387</h3>
        <div class="flex flex-col gap-3">
          <template x-for="(c, ci) in costMetrics" x-bind:key="ci">
            <div class="flex items-center justify-between py-2 border-b border-black/[0.03] last:border-0">
              <span class="text-[13px] text-secondary/70" x-text="c.name"></span>
              <div class="flex items-center gap-3">
                <span class="text-[15px] font-semibold text-primary" x-text="c.value"></span>
                <span class="text-[11px]" x-bind:class="c.good ? 'text-emerald-600/60' : 'text-amber-600/60'" x-text="c.change"></span>
              </div>
            </div>
          </template>
        </div>
        <!-- Mini trend sparkline -->
        <div class="mt-3 h-[32px]">
          <svg viewBox="0 0 300 30" class="w-full h-full" preserveAspectRatio="none">
            <path d="M0,25 L30,22 L60,20 L90,18 L120,19 L150,16 L180,14 L210,15 L240,12 L270,10 L300,8" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="mt-auto pt-3 border-t border-black/[0.04]" style="margin-top:auto;">
          <div class="flex items-start gap-2">
            <i class="fas fa-check-circle text-emerald-500/50 text-[11px] mt-0.5"></i>
            <span class="text-[12px] text-secondary/60 leading-[18px]">\u5f53\u524d\u6210\u672c\u63a7\u5236\u826f\u597d\uff0c\u589e\u957f\u4e3b\u8981\u6765\u81ea\u7f13\u5b58\u547d\u4e2d\u63d0\u5347\u3002</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== LAYER 4: ALERTS + DIAGNOSIS ==================== -->
    <div class="flex gap-4 mt-5">

      <!-- Anomaly Alerts 520x260 -->
      <div class="bg-white rounded-[24px] border border-black/[0.06] p-5 flex-shrink-0" style="width:520px; height:260px;">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[16px] font-semibold text-primary">\u5f02\u5e38\u63d0\u9192</h3>
          <span class="text-[12px] text-secondary/50" x-text="alerts.length + ' \u6761\u5f02\u5e38'"></span>
        </div>
        <div class="flex flex-col gap-2.5">
          <template x-for="(alert, ali) in alerts" x-bind:key="ali">
            <div class="flex items-center justify-between h-[44px] px-4 rounded-[12px] bg-black/[0.02] hover:bg-black/[0.04] transition-all">
              <div class="flex items-center gap-2.5 flex-1 min-w-0">
                <span class="w-2 h-2 rounded-full flex-shrink-0" x-bind:class="alert.level === 'high' ? 'bg-red-400/60' : alert.level === 'medium' ? 'bg-amber-400/60' : 'bg-yellow-300/60'"></span>
                <span class="text-[13px] text-primary/80 truncate" x-text="alert.text"></span>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0 ml-3">
                <button class="text-[12px] text-secondary/50 hover:text-primary/70 transition-colors">\u67e5\u770b\u539f\u56e0</button>
                <button class="text-[12px] text-accent hover:text-accent/80 transition-colors">\u53bb\u5206\u6790</button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Auto Diagnosis -->
      <div class="bg-white rounded-[24px] border border-black/[0.06] p-5 flex-1" style="height:260px;">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[16px] font-semibold text-primary">\u81ea\u52a8\u8bca\u65ad</h3>
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-[12px] text-emerald-600/60">\u5df2\u66f4\u65b0</span>
          </div>
        </div>
        <div class="flex flex-col gap-3 monitor-scrollbar" style="overflow-y:auto; max-height:148px;">
          <template x-for="(d, di) in diagnoses" x-bind:key="di">
            <div class="p-3 rounded-[14px] bg-black/[0.015] border border-black/[0.03]">
              <p class="text-[13px] text-primary/80 leading-[20px]" x-text="d.text"></p>
            </div>
          </template>
        </div>
        <!-- Bottom actions -->
        <div class="flex items-center gap-3 mt-3 pt-3 border-t border-black/[0.04]">
          <button class="h-[34px] px-4 rounded-[10px] bg-primary/[0.06] text-[13px] text-primary font-medium hover:bg-primary/[0.10] transition-all">\u67e5\u770b\u5b8c\u6574\u8bca\u65ad</button>
          <button class="h-[34px] px-4 rounded-[10px] bg-white border border-black/[0.08] text-[13px] text-secondary hover:text-primary transition-all">\u5bfc\u51fa\u672c\u5468\u7ed3\u8bba</button>
        </div>
      </div>
    </div>

    <!-- ==================== LAYER 5: SEGMENTS + RETENTION + STAGE ==================== -->
    <div class="flex gap-4 mt-5">

      <!-- User Segments 400x280 -->
      <div class="bg-white rounded-[24px] border border-black/[0.06] p-5" style="width:400px; height:280px;">
        <h3 class="text-[16px] font-semibold text-primary mb-4">\u7528\u6237\u5206\u7fa4\u8868\u73b0</h3>
        <div class="flex flex-col gap-3">
          <template x-for="(seg, sgi) in userSegments" x-bind:key="sgi">
            <div class="p-3 rounded-[14px] bg-black/[0.015] border border-black/[0.03]">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[13px] font-semibold text-primary" x-text="seg.name"></span>
                <span class="text-[11px] text-secondary/50" x-text="seg.count + ' \u4eba'"></span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div class="text-center">
                  <span class="text-[11px] text-secondary/50 block">\u6fc0\u6d3b\u7387</span>
                  <span class="text-[14px] font-semibold text-primary" x-text="seg.activation + '%'"></span>
                </div>
                <div class="text-center">
                  <span class="text-[11px] text-secondary/50 block">\u95ed\u73af\u7387</span>
                  <span class="text-[14px] font-semibold text-primary" x-text="seg.closure + '%'"></span>
                </div>
                <div class="text-center">
                  <span class="text-[11px] text-secondary/50 block">7\u65e5\u7559\u5b58</span>
                  <span class="text-[14px] font-semibold text-primary" x-text="seg.retention + '%'"></span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Retention Overview 400x280 -->
      <div class="bg-white rounded-[24px] border border-black/[0.06] p-5" style="width:400px; height:280px;">
        <h3 class="text-[16px] font-semibold text-primary mb-4">\u7559\u5b58\u6982\u51b5</h3>
        <!-- Retention blocks -->
        <div class="grid grid-cols-4 gap-3 mb-4">
          <template x-for="(r, ri) in retentionData" x-bind:key="ri">
            <div class="text-center p-3 rounded-[14px] bg-black/[0.015] border border-black/[0.03]">
              <span class="text-[12px] text-secondary/50 block" x-text="r.label"></span>
              <span class="text-[20px] font-semibold text-primary block mt-1" x-text="r.value + '%'"></span>
            </div>
          </template>
        </div>
        <!-- Mini retention trend -->
        <div class="h-[60px] mb-3">
          <svg viewBox="0 0 350 55" class="w-full h-full" preserveAspectRatio="none">
            <!-- Normal users -->
            <path d="M0,5 L87,20 L175,30 L262,38 L350,42" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" stroke-dasharray="4,3"/>
            <!-- Skill users -->
            <path d="M0,5 L87,12 L175,18 L262,22 L350,25" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="1.5"/>
            <text x="352" y="26" fill="rgba(0,0,0,0.35)" font-size="9">Skill</text>
            <text x="352" y="44" fill="rgba(0,0,0,0.15)" font-size="9">\u666e\u901a</text>
          </svg>
        </div>
        <div class="pt-3 border-t border-black/[0.04]">
          <div class="flex items-start gap-2">
            <i class="fas fa-chart-line text-secondary/40 text-[11px] mt-0.5"></i>
            <span class="text-[12px] text-secondary/60 leading-[18px]">\u542f\u7528 Skills \u7684\u7528\u6237\u5728 14 \u65e5\u7559\u5b58\u4e0a\u660e\u663e\u4f18\u4e8e\u666e\u901a\u7528\u6237\u3002</span>
          </div>
        </div>
      </div>

      <!-- Stage View 356x280 -->
      <div class="bg-white rounded-[24px] border border-black/[0.06] p-5 flex-1" style="min-width:300px; height:280px;">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[16px] font-semibold text-primary">\u9636\u6bb5\u89c6\u56fe</h3>
          <div class="flex items-center gap-1">
            <template x-for="(sv, svi) in stageViewTabs" x-bind:key="svi">
              <button x-on:click="activeStageView = sv.value" x-bind:class="activeStageView === sv.value ? 'bg-amber-50 text-amber-700 font-semibold border-amber-200' : 'bg-white text-secondary border-black/[0.08] hover:text-primary/60'" class="h-[26px] px-2.5 rounded-full text-[11px] border whitespace-nowrap transition-all" x-text="sv.label"></button>
            </template>
          </div>
        </div>
        <div class="flex flex-col gap-2.5">
          <template x-for="(sv, svi) in stageMetrics" x-bind:key="svi">
            <div class="flex items-center justify-between py-2 border-b border-black/[0.03] last:border-0">
              <span class="text-[13px] text-secondary/70" x-text="sv.name"></span>
              <div class="flex items-center gap-2">
                <div class="w-[80px] h-[6px] bg-black/[0.03] rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-primary/20 transition-all" x-bind:style="'width:' + sv.pct + '%'"></div>
                </div>
                <span class="text-[13px] font-semibold text-primary w-[40px] text-right" x-text="sv.value"></span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- ==================== FOOTER: DRILL-DOWN ENTRIES ==================== -->
    <div class="grid grid-cols-4 gap-4 mt-5 mb-6">
      <template x-for="(entry, ei) in drillDownEntries" x-bind:key="ei">
        <button x-on:click="navigateTo(entry.path)" class="flex items-center gap-3 h-[88px] px-5 rounded-[18px] bg-white border border-black/[0.06] hover:border-black/[0.10] hover:shadow-sm transition-all text-left">
          <div class="w-10 h-10 rounded-[12px] bg-primary/[0.04] flex items-center justify-center flex-shrink-0">
            <i class="text-[14px] text-primary/50" x-bind:class="entry.icon"></i>
          </div>
          <div class="flex-1 min-w-0">
            <span class="text-[14px] font-semibold text-primary block" x-text="entry.title"></span>
            <span class="text-[12px] text-secondary/50 block mt-0.5" x-text="entry.subtitle"></span>
          </div>
          <i class="fas fa-chevron-right text-[10px] text-secondary/30"></i>
        </button>
      </template>
    </div>

  </div><!-- /main-content -->

  <!-- ============================================ -->
  <!-- EMPTY STATE                                    -->
  <!-- ============================================ -->
  <template x-if="isEmpty">
    <div class="absolute inset-0 flex items-center justify-center bg-surface/80 z-10" style="top:72px;">
      <div class="text-center max-w-[380px]">
        <div class="w-16 h-16 mx-auto mb-5 rounded-[20px] bg-primary/[0.04] flex items-center justify-center">
          <i class="fas fa-chart-line text-[24px] text-primary/30"></i>
        </div>
        <h3 class="text-[18px] font-semibold text-primary mb-2">\u5f53\u524d\u8fd8\u6ca1\u6709\u8db3\u591f\u6570\u636e\u5f62\u6210\u7ecf\u8425\u5224\u65ad\u3002</h3>
        <p class="text-[14px] text-secondary/60 leading-[22px]">\u5f53\u7528\u6237\u5f00\u59cb\u4f7f\u7528\u5c97\u4f4d\u3001\u7b80\u5386\u3001\u9762\u8bd5\u548c\u51b3\u7b56\u6a21\u5757\u540e\uff0c\u8fd9\u91cc\u4f1a\u9010\u6b65\u5f62\u6210\u8d8b\u52bf\u4e0e\u8bca\u65ad\u3002</p>
        <div class="flex items-center justify-center gap-3 mt-5">
          <button class="h-[40px] px-5 rounded-[12px] bg-white border border-black/[0.08] text-[13px] text-secondary hover:text-primary transition-all">\u67e5\u770b\u57cb\u70b9\u63a5\u5165\u8bf4\u660e</button>
          <button x-on:click="loadSampleData()" class="h-[40px] px-5 rounded-[12px] bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-all">\u5bfc\u5165\u793a\u4f8b\u6570\u636e</button>
        </div>
      </div>
    </div>
  </template>

</div><!-- /monitor-workspace -->
`;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
