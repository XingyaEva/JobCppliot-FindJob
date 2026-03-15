/**
 * FindJob 2.0 - Decisions Center (决策中心)
 * PRD v1.5 pixel-level implementation
 *
 * Three-column layout:
 *   Left  (260px): Offer list / delivery kanban navigation
 *   Center(560px): Tracking / Compare / Detail / Negotiate / Advice
 *   Right (304px): System suggestions & conclusions
 *
 * 5 sub-modules via tab switching:
 *   1. 投递跟踪     (tracking) — default
 *   2. Offer 列表   (list)
 *   3. Offer 对比   (compare)
 *   4. 谈薪助手     (negotiate)
 *   5. 选择建议     (advice)
 *
 * Uses Alpine.js for all interactivity.
 */

export function DecisionsPage() {
  const html = `
<div id="decisions-workspace" x-data="decisionsWorkspace" x-init="init()" class="min-h-[calc(100vh-72px)]">

  <!-- ============================================ -->
  <!-- PAGE TITLE AREA                               -->
  <!-- ============================================ -->
  <div class="px-7 pt-6">
    <h1 class="text-[30px] font-semibold text-primary leading-[38px] tracking-tight">\u51b3\u7b56</h1>
    <p class="text-[14px] text-secondary leading-[22px] mt-2">\u628a\u6295\u9012\u8fdb\u5ea6\u3001Offer\u3001\u8c08\u85aa\u548c\u804c\u4e1a\u9009\u62e9\uff0c\u7ec4\u7ec7\u6210\u4e00\u5957\u66f4\u6e05\u6670\u3001\u66f4\u4e0d\u614c\u4e71\u7684\u5224\u65ad\u7cfb\u7edf\u3002</p>
  </div>

  <!-- ============================================ -->
  <!-- TOP TOOLBAR (52px)                            -->
  <!-- ============================================ -->
  <div class="px-7 mt-5 flex items-center justify-between flex-wrap gap-3" style="min-height:52px;">
    <div class="flex items-center gap-2 flex-wrap">
      <!-- Search box 280x44 -->
      <div class="relative">
        <input type="text" x-model="searchTerm" x-on:input.debounce.300ms="filterItems()" placeholder="\u641c\u7d22 Offer\u3001\u516c\u53f8\u3001\u5c97\u4f4d\u3001\u6295\u9012" class="w-[280px] h-[44px] pl-10 pr-4 rounded-[14px] bg-white border border-black/[0.08] text-[14px] text-primary placeholder-secondary/50 focus:outline-none focus:border-accent/30 transition-all" />
        <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-secondary/40"></i>
      </div>
      <!-- Sub-module capsules -->
      <template x-for="(tab, ti) in moduleTabs" x-bind:key="ti">
        <button x-on:click="switchModule(tab.value)" x-bind:class="activeModule === tab.value ? 'bg-primary/[0.06] text-primary font-semibold border-primary/[0.12]' : 'bg-white text-secondary border-black/[0.08] hover:border-black/[0.12] hover:text-primary/70'" class="h-[34px] px-3.5 rounded-full text-[13px] border whitespace-nowrap transition-all" x-text="tab.label"></button>
      </template>
    </div>
    <div class="flex items-center gap-2">
      <!-- New application / offer -->
      <button x-on:click="activeModule === 'tracking' ? createApplication() : createOffer()" class="h-[44px] px-5 rounded-[14px] bg-primary text-white flex items-center gap-2 text-[14px] font-medium hover:bg-primary/90 transition-all">
        <i class="fas fa-plus text-[11px]"></i>
        <span x-text="activeModule === 'tracking' ? '\u65b0\u589e\u6295\u9012' : '\u65b0\u589e Offer'"></span>
      </button>
      <!-- Export report -->
      <button x-on:click="exportReport()" class="h-[44px] px-5 rounded-[14px] bg-white border border-black/[0.08] flex items-center gap-2 text-[14px] text-primary font-medium hover:border-accent/20 transition-all">
        <i class="fas fa-file-export text-[11px] text-secondary/50"></i>
        <span>\u5bfc\u51fa\u62a5\u544a</span>
      </button>
      <!-- Start compare -->
      <button x-show="activeModule !== 'tracking'" x-on:click="switchModule('compare')" class="h-[44px] px-5 rounded-[14px] bg-white border border-black/[0.08] flex items-center gap-2 text-[14px] text-primary font-medium hover:border-accent/20 transition-all">
        <i class="fas fa-code-compare text-[11px] text-secondary/50"></i>
        <span>\u5f00\u59cb\u5bf9\u6bd4</span>
      </button>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- THREE-COLUMN MAIN AREA                        -->
  <!-- ============================================ -->
  <div class="px-7 pt-5 pb-7 flex gap-4 min-w-0 flex-1 overflow-hidden-5" style="height: calc(100vh - 72px - 38px - 52px - 50px);">

    <!-- ========================================== -->
    <!-- LEFT COLUMN (260px): Context Navigation     -->
    <!-- ========================================== -->
    <div class="w-[260px] flex-shrink-0 bg-white rounded-[24px] border border-black/[0.06] shadow-card flex flex-col overflow-hidden">

      <!-- ==== LEFT: TRACKING MODE — Kanban stages ==== -->
      <template x-if="activeModule === 'tracking'">
        <div class="flex flex-col h-full">
          <div class="h-[56px] px-[18px] flex items-center justify-between flex-shrink-0">
            <span class="text-[18px] font-semibold text-primary">\u6295\u9012\u770b\u677f</span>
            <button x-on:click="createApplication()" class="w-[32px] h-[32px] rounded-[10px] bg-black/[0.03] hover:bg-black/[0.06] flex items-center justify-center transition-colors">
              <i class="fas fa-plus text-[12px] text-secondary/60"></i>
            </button>
          </div>

          <!-- Stage filters -->
          <div class="px-[14px] flex flex-wrap gap-[6px] pb-3">
            <template x-for="(stg, si) in trackingStages" x-bind:key="si">
              <button x-on:click="activeTrackingStage = stg.value; filterApplications()" x-bind:class="activeTrackingStage === stg.value ? 'bg-primary/[0.06] text-primary font-medium border-primary/[0.12]' : 'bg-white text-secondary/60 border-black/[0.06] hover:text-primary/60'" class="h-[30px] px-3 rounded-full text-[11px] border whitespace-nowrap transition-all">
                <span x-text="stg.label"></span>
                <span class="ml-1 text-[10px] opacity-60" x-text="'(' + stg.count + ')'"></span>
              </button>
            </template>
          </div>

          <!-- Application cards -->
          <div class="flex-1 overflow-y-auto decision-scrollbar px-[14px] pb-4 space-y-[10px]">
            <!-- Empty state -->
            <template x-if="filteredApplications.length === 0">
              <div class="flex flex-col items-center justify-center py-14 text-center">
                <div class="w-[56px] h-[56px] rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <i class="fas fa-paper-plane text-[22px] text-blue-300"></i>
                </div>
                <p class="text-[14px] font-medium text-primary/80 mb-1">\u8fd8\u6ca1\u6709\u6295\u9012</p>
                <p class="text-[12px] text-secondary/50 mb-4">\u65b0\u589e\u4e00\u4e2a\u6295\u9012\u5f00\u59cb\u8ddf\u8e2a</p>
                <button x-on:click="createApplication()" class="h-[34px] px-4 rounded-[10px] bg-primary text-white text-[12px] font-medium hover:bg-primary/90 transition-colors">\u65b0\u589e\u6295\u9012</button>
              </div>
            </template>

            <template x-for="(app, ai) in filteredApplications" x-bind:key="ai">
              <div x-on:click="selectApplication(ai)" class="relative p-[14px] rounded-[16px] border cursor-pointer transition-all" x-bind:class="selectedAppIndex === ai ? 'bg-accent/[0.04] border-accent/[0.15] shadow-sm' : 'border-black/[0.05] hover:border-black/[0.1] hover:bg-black/[0.01]'">
                <div x-show="selectedAppIndex === ai" class="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full bg-accent"></div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[13px] font-semibold text-primary truncate" x-text="app.company"></span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0" x-bind:class="app.stageClass" x-text="app.stageText"></span>
                </div>
                <div class="text-[12px] text-secondary/70 mb-1 truncate" x-text="app.position + ' \u00b7 ' + app.city"></div>
                <div class="flex items-center gap-2 text-[11px] text-secondary/50">
                  <span x-text="'\u6295\u9012: ' + app.appliedDate"></span>
                  <template x-if="app.nextAction">
                    <span class="text-amber-600" x-text="'\u2022 ' + app.nextAction"></span>
                  </template>
                </div>
              </div>
            </template>
          </div>

          <!-- Stage summary bar -->
          <div class="px-[14px] py-3 border-t border-black/[0.04] flex-shrink-0">
            <div class="flex items-center justify-between text-[11px] text-secondary/60">
              <span>\u5168\u90e8\u6295\u9012</span>
              <span class="font-semibold text-primary" x-text="applications.length"></span>
            </div>
            <div class="mt-2 h-[4px] rounded-full bg-black/[0.04] overflow-hidden flex">
              <div class="bg-blue-400 transition-all" x-bind:style="'width:' + stagePct('applied') + '%'"></div>
              <div class="bg-amber-400 transition-all" x-bind:style="'width:' + stagePct('screening') + '%'"></div>
              <div class="bg-violet-400 transition-all" x-bind:style="'width:' + stagePct('interview') + '%'"></div>
              <div class="bg-emerald-400 transition-all" x-bind:style="'width:' + stagePct('offer') + '%'"></div>
              <div class="bg-red-300 transition-all" x-bind:style="'width:' + stagePct('rejected') + '%'"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- ==== LEFT: OFFER MODULES — Offer list ==== -->
      <template x-if="activeModule !== 'tracking'">
        <div class="flex flex-col h-full">
          <!-- Header -->
          <div class="h-[56px] px-[18px] flex items-center justify-between flex-shrink-0">
            <span class="text-[18px] font-semibold text-primary">Offer \u5217\u8868</span>
            <button x-on:click="createOffer()" class="w-[32px] h-[32px] rounded-[10px] bg-black/[0.03] hover:bg-black/[0.06] flex items-center justify-center transition-colors">
              <i class="fas fa-plus text-[12px] text-secondary/60"></i>
            </button>
          </div>

      <!-- Filter capsules -->
      <div class="px-[14px] flex flex-wrap gap-[6px] pb-3">
        <template x-for="(f, fi) in offerFilters" x-bind:key="fi">
          <button x-on:click="activeFilter = f.value; filterOffers()" x-bind:class="activeFilter === f.value ? 'bg-primary/[0.06] text-primary font-medium border-primary/[0.12]' : 'bg-white text-secondary/60 border-black/[0.06] hover:text-primary/60'" class="h-[30px] px-3 rounded-full text-[11px] border whitespace-nowrap transition-all" x-text="f.label"></button>
        </template>
      </div>

      <!-- Offer cards list -->
      <div class="flex-1 overflow-y-auto decision-scrollbar px-[14px] pb-4 space-y-[10px]">
        <!-- Empty state -->
        <template x-if="filteredOffers.length === 0">
          <div class="flex flex-col items-center justify-center py-14 text-center">
            <div class="w-[56px] h-[56px] rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <i class="fas fa-file-signature text-[22px] text-indigo-300"></i>
            </div>
            <p class="text-[14px] font-medium text-primary/80 mb-1">\u8fd8\u6ca1\u6709 Offer</p>
            <p class="text-[12px] text-secondary/50 mb-4">\u5148\u65b0\u589e\u4e00\u4e2a\u673a\u4f1a\u5f00\u59cb\u6bd4\u8f83</p>
            <button x-on:click="createOffer()" class="h-[34px] px-4 rounded-[10px] bg-primary text-white text-[12px] font-medium hover:bg-primary/90 transition-colors">\u65b0\u589e Offer</button>
            <button x-on:click="importFromJobs()" class="mt-2 h-[34px] px-4 rounded-[10px] bg-white border border-black/[0.08] text-[12px] text-primary font-medium hover:border-accent/20 transition-colors">\u4ece\u5c97\u4f4d\u8bb0\u5f55\u5bfc\u5165</button>
          </div>
        </template>

        <!-- Offer cards -->
        <template x-for="(offer, oi) in filteredOffers" x-bind:key="oi">
          <div x-on:click="selectOffer(oi)" class="relative h-[104px] p-[14px] rounded-[16px] border cursor-pointer transition-all" x-bind:class="selectedOfferIndex === oi ? 'bg-accent/[0.04] border-accent/[0.15] shadow-sm' : 'border-black/[0.05] hover:border-black/[0.1] hover:bg-black/[0.01]'">
            <!-- Selected indicator line -->
            <div x-show="selectedOfferIndex === oi" class="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full bg-accent"></div>
            <!-- Row 1: company + status -->
            <div class="flex items-center justify-between mb-1">
              <span class="text-[13px] font-semibold text-primary truncate" x-text="offer.company"></span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0" x-bind:class="offer.statusClass" x-text="offer.statusText"></span>
            </div>
            <!-- Row 2: position + city -->
            <div class="text-[12px] text-secondary/70 mb-1 truncate" x-text="offer.position + ' \u00b7 ' + offer.city"></div>
            <!-- Row 3: salary + deadline -->
            <div class="text-[12px] text-primary/80 font-medium mb-1.5" x-text="offer.salary + (offer.deadline ? ' \u00b7 ' + offer.deadline : '')"></div>
            <!-- Row 4: tags -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <template x-for="(tag, tgi) in offer.tags" x-bind:key="tgi">
                <span class="px-1.5 py-0.5 rounded text-[9px] font-medium bg-black/[0.03] text-secondary/60" x-text="tag"></span>
              </template>
            </div>
          </div>
        </template>
      </div>
        </div>
      </template>
    </div>

    <!-- ========================================== -->
    <!-- CENTER COLUMN (560px)                      -->
    <!-- ========================================== -->
    <div class="flex-1 min-w-0 bg-white rounded-[24px] border border-black/[0.06] shadow-card flex flex-col overflow-hidden">

      <!-- ==== MODULE: TRACKING - Center ==== -->
      <template x-if="activeModule === 'tracking'">
        <div class="flex flex-col h-full overflow-y-auto decision-scrollbar">
          <!-- No app selected -->
          <template x-if="!selectedApp">
            <div class="p-[24px] space-y-[18px]">
              <!-- Overview stats -->
              <div>
                <h2 class="text-[24px] font-semibold text-primary leading-[32px]">\u6295\u9012\u6982\u89c8</h2>
                <p class="text-[12px] text-secondary/60 mt-[10px]">\u5f53\u524d\u6295\u9012\u8fdb\u5ea6\u4e00\u89c8</p>
              </div>

              <!-- Stage cards -->
              <div class="grid grid-cols-5 gap-2.5">
                <template x-for="(stg, si) in trackingStages" x-bind:key="si">
                  <div class="p-3 rounded-[14px] border border-black/[0.04] text-center cursor-pointer hover:border-accent/20 transition-colors" x-on:click="activeTrackingStage = stg.value; filterApplications()">
                    <div class="text-[20px] font-bold text-primary" x-text="stg.count"></div>
                    <div class="text-[10px] text-secondary/60 mt-0.5" x-text="stg.label"></div>
                  </div>
                </template>
              </div>

              <!-- Timeline / recent activity -->
              <div class="rounded-[18px] bg-black/[0.015] p-[16px]">
                <div class="text-[13px] font-semibold text-primary mb-3">\u6700\u8fd1\u52a8\u6001</div>
                <div class="space-y-3">
                  <template x-for="(act, ai) in recentActivities" x-bind:key="ai">
                    <div class="flex items-start gap-3">
                      <div class="w-[8px] h-[8px] rounded-full mt-1.5 flex-shrink-0" x-bind:class="act.dotClass"></div>
                      <div class="flex-1">
                        <div class="text-[12px] text-primary" x-text="act.text"></div>
                        <div class="text-[10px] text-secondary/50 mt-0.5" x-text="act.time"></div>
                      </div>
                    </div>
                  </template>
                  <template x-if="recentActivities.length === 0">
                    <div class="text-[12px] text-secondary/50 text-center py-4">\u6682\u65e0\u52a8\u6001</div>
                  </template>
                </div>
              </div>

              <!-- Funnel chart -->
              <div class="rounded-[18px] border border-black/[0.04] p-[16px]">
                <div class="text-[13px] font-semibold text-primary mb-3">\u8f6c\u5316\u6f0f\u6597</div>
                <div class="space-y-2">
                  <template x-for="(stg, si) in trackingStages.filter(s => s.value !== 'all')" x-bind:key="si">
                    <div class="flex items-center gap-2.5">
                      <span class="w-[60px] text-[11px] text-secondary/70 text-right" x-text="stg.label"></span>
                      <div class="flex-1 h-[18px] rounded-full bg-black/[0.03] overflow-hidden">
                        <div class="h-full rounded-full transition-all" x-bind:class="stg.barClass" x-bind:style="'width:' + (applications.length ? Math.round(stg.count / applications.length * 100) : 0) + '%'"></div>
                      </div>
                      <span class="w-[28px] text-[11px] text-primary font-medium text-right" x-text="stg.count"></span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>

          <!-- App detail view -->
          <template x-if="selectedApp">
            <div class="p-[24px] space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-[22px] font-semibold text-primary" x-text="selectedApp.company"></h2>
                  <p class="text-[13px] text-secondary/60 mt-1" x-text="selectedApp.position + ' \u00b7 ' + selectedApp.city"></p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full text-[11px] font-semibold" x-bind:class="selectedApp.stageClass" x-text="selectedApp.stageText"></span>
                  <button x-on:click="selectedAppIndex = -1; selectedApp = null" class="w-[30px] h-[30px] rounded-[8px] bg-black/[0.03] hover:bg-black/[0.06] flex items-center justify-center transition-colors">
                    <i class="fas fa-times text-[11px] text-secondary/50"></i>
                  </button>
                </div>
              </div>

              <!-- Stage progress -->
              <div class="p-4 rounded-[16px] bg-black/[0.015]">
                <div class="text-[12px] font-medium text-primary mb-3">\u8fdb\u5ea6\u65f6\u95f4\u7ebf</div>
                <div class="flex items-center gap-1">
                  <template x-for="(step, sti) in trackingSteps" x-bind:key="sti">
                    <div class="flex items-center gap-1 flex-1">
                      <div class="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[10px] flex-shrink-0" x-bind:class="getStepClass(step, selectedApp.stage)">
                        <i x-bind:class="step.icon"></i>
                      </div>
                      <template x-if="sti < trackingSteps.length - 1">
                        <div class="flex-1 h-[2px] rounded-full" x-bind:class="isStepDone(step.value, selectedApp.stage) ? 'bg-accent' : 'bg-black/[0.06]'"></div>
                      </template>
                    </div>
                  </template>
                </div>
                <div class="flex justify-between mt-1.5">
                  <template x-for="(step, sti) in trackingSteps" x-bind:key="sti">
                    <span class="text-[9px] text-secondary/50" x-text="step.label"></span>
                  </template>
                </div>
              </div>

              <!-- Detail grid -->
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3.5 rounded-[14px] bg-black/[0.015]">
                  <div class="text-[11px] text-secondary/50 mb-1">\u6295\u9012\u65e5\u671f</div>
                  <div class="text-[14px] font-semibold text-primary" x-text="selectedApp.appliedDate"></div>
                </div>
                <div class="p-3.5 rounded-[14px] bg-black/[0.015]">
                  <div class="text-[11px] text-secondary/50 mb-1">\u6765\u6e90\u6e20\u9053</div>
                  <div class="text-[14px] font-semibold text-primary" x-text="selectedApp.channel || '\u672a\u8bbe\u7f6e'"></div>
                </div>
                <div class="p-3.5 rounded-[14px] bg-black/[0.015]">
                  <div class="text-[11px] text-secondary/50 mb-1">\u4e0b\u6b21\u64cd\u4f5c</div>
                  <div class="text-[14px] font-semibold text-primary" x-text="selectedApp.nextAction || '\u65e0'"></div>
                </div>
                <div class="p-3.5 rounded-[14px] bg-black/[0.015]">
                  <div class="text-[11px] text-secondary/50 mb-1">\u85aa\u8d44\u8303\u56f4</div>
                  <div class="text-[14px] font-semibold text-primary" x-text="selectedApp.salary || '\u672a\u77e5'"></div>
                </div>
              </div>

              <!-- Notes -->
              <div class="p-4 rounded-[16px] border border-black/[0.04]">
                <div class="flex items-center gap-2 mb-2.5">
                  <i class="fas fa-sticky-note text-[11px] text-secondary/50"></i>
                  <span class="text-[13px] font-semibold text-primary">\u5907\u6ce8</span>
                </div>
                <textarea x-model="selectedApp.notes" x-on:input="saveApplications()" placeholder="\u6dfb\u52a0\u5907\u6ce8..." class="w-full h-[80px] rounded-[10px] border border-black/[0.06] px-3 py-2 text-[12px] text-primary placeholder-secondary/40 resize-none focus:outline-none focus:border-accent/30 transition-all"></textarea>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2">
                <button x-on:click="advanceStage()" class="h-[38px] px-4 rounded-[12px] bg-primary text-white text-[12px] font-medium hover:bg-primary/90 transition-colors">\u63a8\u8fdb\u5230\u4e0b\u4e00\u9636\u6bb5</button>
                <button x-on:click="moveToOffer()" class="h-[38px] px-4 rounded-[12px] bg-emerald-50 text-emerald-700 text-[12px] font-medium hover:bg-emerald-100 transition-colors">\u8f6c\u4e3a Offer</button>
                <button x-on:click="markRejected()" class="h-[38px] px-4 rounded-[12px] bg-red-50 text-red-600 text-[12px] font-medium hover:bg-red-100 transition-colors">\u6807\u8bb0\u4e0d\u901a\u8fc7</button>
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- ==== MODULE: COMPARE (default) - Center ==== -->
      <template x-if="activeModule === 'compare'">
        <div class="flex flex-col h-full overflow-y-auto decision-scrollbar">
          <div class="p-[24px] space-y-[18px]">
            <!-- Header -->
            <div>
              <div class="flex items-center justify-between">
                <h2 class="text-[24px] font-semibold text-primary leading-[32px]">Offer \u5bf9\u6bd4</h2>
                <div class="flex items-center gap-2">
                  <button x-on:click="addCompareTarget()" class="h-[30px] px-3 rounded-[8px] bg-black/[0.03] text-[12px] text-primary font-medium hover:bg-black/[0.06] transition-colors">\u6dfb\u52a0\u5bf9\u6bd4\u5bf9\u8c61</button>
                </div>
              </div>
              <p class="text-[12px] text-secondary/60 mt-[10px]">\u5f53\u524d\u5bf9\u6bd4 <span class="font-semibold text-primary" x-text="compareOffers.length"></span> \u4e2a\u673a\u4f1a \u00b7 \u4f60\u53ef\u4ee5\u6309\u201c\u6210\u957f\u201d\u201c\u6536\u5165\u201d\u201c\u57ce\u5e02\u201d\u201c\u5e73\u8861\u201d\u8c03\u6574\u6743\u91cd</p>
            </div>

            <!-- Decision preference area -->
            <div class="rounded-[18px] bg-black/[0.015] p-[16px]">
              <div class="text-[13px] font-semibold text-primary mb-3">\u4f60\u7684\u51b3\u7b56\u504f\u597d</div>
              <div class="grid grid-cols-2 gap-x-5 gap-y-3">
                <template x-for="(pref, pi) in preferences" x-bind:key="pi">
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-[12px] text-secondary/70" x-text="pref.label"></span>
                      <span class="text-[12px] font-semibold text-primary" x-text="pref.value + '%'"></span>
                    </div>
                    <input type="range" min="0" max="100" x-model.number="pref.value" x-on:input="recalcPreferences(pi)" class="w-full h-[4px] rounded-full appearance-none bg-black/[0.06] accent-accent cursor-pointer" />
                  </div>
                </template>
              </div>
            </div>

            <!-- Compare head cards -->
            <template x-if="compareOffers.length >= 2">
              <div class="flex gap-3">
                <template x-for="(co, ci) in compareOffers.slice(0, 2)" x-bind:key="ci">
                  <div class="flex-1 h-[120px] rounded-[18px] border border-black/[0.05] bg-white p-4 flex flex-col justify-between">
                    <div>
                      <div class="text-[15px] font-semibold text-primary" x-text="co.company"></div>
                      <div class="text-[12px] text-secondary/60 mt-0.5" x-text="co.position + ' \u00b7 ' + co.city"></div>
                      <div class="text-[13px] text-primary font-medium mt-1" x-text="co.salary"></div>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-[11px] text-secondary/50">\u7cfb\u7edf\u5efa\u8bae\u5206</span>
                      <span class="text-[14px] font-bold" x-bind:class="co.score >= 80 ? 'text-emerald-500' : co.score >= 60 ? 'text-amber-500' : 'text-red-400'" x-text="co.score"></span>
                    </div>
                  </div>
                </template>
              </div>
            </template>
            <template x-if="compareOffers.length < 2">
              <div class="rounded-[18px] border border-dashed border-black/[0.1] p-8 text-center">
                <p class="text-[13px] text-secondary/50 mb-3">\u518d\u6dfb\u52a0\u4e00\u4e2a Offer\uff0c\u7cfb\u7edf\u624d\u4f1a\u7ed9\u51fa\u66f4\u6709\u610f\u4e49\u7684\u6bd4\u8f83</p>
                <button x-on:click="addCompareTarget()" class="h-[34px] px-4 rounded-[10px] bg-primary/[0.06] text-primary text-[12px] font-medium hover:bg-primary/[0.1] transition-colors">\u6dfb\u52a0 Offer</button>
              </div>
            </template>

            <!-- Dimension comparison table -->
            <template x-if="compareOffers.length >= 2">
              <div>
                <div class="text-[14px] font-semibold text-primary mb-3">\u5173\u952e\u7ef4\u5ea6\u5bf9\u6bd4</div>
                <div class="rounded-[14px] border border-black/[0.05] overflow-hidden">
                  <!-- Table header -->
                  <div class="flex items-center h-[38px] bg-black/[0.015] px-4 text-[11px] font-semibold text-secondary/60">
                    <span class="w-[130px]">\u7ef4\u5ea6</span>
                    <span class="flex-1 text-center" x-text="compareOffers[0] ? compareOffers[0].company : 'Offer A'"></span>
                    <span class="flex-1 text-center" x-text="compareOffers[1] ? compareOffers[1].company : 'Offer B'"></span>
                    <span class="w-[80px] text-right">\u5224\u65ad</span>
                  </div>
                  <!-- Dimension rows -->
                  <template x-for="(dim, di) in compareDimensions" x-bind:key="di">
                    <div class="flex items-center h-[46px] px-4 border-t border-black/[0.03] text-[12px] hover:bg-black/[0.01] transition-colors">
                      <span class="w-[130px] text-secondary/70 font-medium" x-text="dim.label"></span>
                      <span class="flex-1 text-center text-primary" x-text="dim.valueA"></span>
                      <span class="flex-1 text-center text-primary" x-text="dim.valueB"></span>
                      <span class="w-[80px] text-right text-[11px] font-medium" x-bind:class="dim.verdictClass" x-text="dim.verdict"></span>
                    </div>
                  </template>
                </div>
              </div>
            </template>

            <!-- Comprehensive judgment -->
            <template x-if="compareOffers.length >= 2">
              <div class="rounded-[18px] bg-black/[0.015] p-[18px]">
                <div class="text-[14px] font-semibold text-primary mb-2">\u5f53\u524d\u7efc\u5408\u5224\u65ad</div>
                <p class="text-[13px] text-secondary leading-relaxed mb-4" x-text="comprehensiveJudgment"></p>
                <div class="flex items-center gap-2">
                  <button x-on:click="generateDetailedAnalysis()" class="h-[34px] px-3.5 rounded-[10px] bg-primary text-white text-[12px] font-medium hover:bg-primary/90 transition-colors">\u751f\u6210\u8be6\u7ec6\u5206\u6790</button>
                  <button x-on:click="switchModule('negotiate')" class="h-[34px] px-3.5 rounded-[10px] bg-white border border-black/[0.08] text-[12px] text-primary font-medium hover:border-accent/20 transition-colors">\u53bb\u8c08\u85aa\u51c6\u5907</button>
                  <button x-on:click="saveComparison()" class="h-[34px] px-3.5 rounded-[10px] bg-white border border-black/[0.08] text-[12px] text-primary font-medium hover:border-accent/20 transition-colors">\u4fdd\u5b58\u8fd9\u6b21\u5bf9\u6bd4</button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- ==== MODULE: LIST - Center ==== -->
      <template x-if="activeModule === 'list'">
        <div class="flex flex-col h-full overflow-y-auto decision-scrollbar">
          <template x-if="!selectedOffer">
            <div class="flex flex-col items-center justify-center flex-1 text-center px-8">
              <div class="w-[64px] h-[64px] rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                <i class="fas fa-hand-pointer text-[26px] text-indigo-300"></i>
              </div>
              <p class="text-[15px] font-medium text-primary/80 mb-2">\u9009\u62e9\u4e00\u4e2a Offer \u67e5\u770b\u8be6\u60c5</p>
              <p class="text-[13px] text-secondary/50">\u5728\u5de6\u4fa7\u5217\u8868\u4e2d\u70b9\u51fb\u4efb\u610f Offer</p>
            </div>
          </template>

          <template x-if="selectedOffer">
            <div class="p-[24px] space-y-4">
              <!-- Offer detail header -->
              <div>
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-[22px] font-semibold text-primary" x-text="selectedOffer.company"></h2>
                    <p class="text-[13px] text-secondary/60 mt-1" x-text="selectedOffer.position + ' \u00b7 ' + selectedOffer.city"></p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-[11px] font-semibold" x-bind:class="selectedOffer.statusClass" x-text="selectedOffer.statusText"></span>
                </div>
              </div>

              <!-- Detail cards -->
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3.5 rounded-[14px] bg-black/[0.015]">
                  <div class="text-[11px] text-secondary/50 mb-1">\u603b\u5305</div>
                  <div class="text-[16px] font-bold text-primary" x-text="selectedOffer.salary"></div>
                </div>
                <div class="p-3.5 rounded-[14px] bg-black/[0.015]">
                  <div class="text-[11px] text-secondary/50 mb-1">\u622a\u6b62\u65f6\u95f4</div>
                  <div class="text-[16px] font-bold text-primary" x-text="selectedOffer.deadline || '\u672a\u8bbe\u7f6e'"></div>
                </div>
              </div>

              <!-- Detail sections -->
              <template x-for="(section, si) in offerDetailSections" x-bind:key="si">
                <div class="p-4 rounded-[16px] border border-black/[0.04]">
                  <div class="flex items-center gap-2 mb-2.5">
                    <i class="text-[11px]" x-bind:class="section.icon"></i>
                    <span class="text-[13px] font-semibold text-primary" x-text="section.title"></span>
                  </div>
                  <p class="text-[12px] text-secondary/70 leading-relaxed" x-text="section.content"></p>
                </div>
              </template>
            </div>
          </template>
        </div>
      </template>

      <!-- ==== MODULE: NEGOTIATE - Center ==== -->
      <template x-if="activeModule === 'negotiate'">
        <div class="flex flex-col h-full overflow-y-auto decision-scrollbar">
          <div class="p-[24px] space-y-4">
            <div class="flex items-center gap-2.5 mb-1">
              <div class="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <i class="fas fa-comments-dollar text-[14px] text-amber-600"></i>
              </div>
              <h2 class="text-[20px] font-semibold text-primary">\u8c08\u85aa\u51c6\u5907\u677f</h2>
            </div>
            <p class="text-[12px] text-secondary/60">\u9488\u5bf9 <span class="font-semibold text-primary" x-text="selectedOffer ? selectedOffer.company : '\u5f85\u9009\u62e9'"></span> \u7684\u8c08\u5224\u51c6\u5907</p>

            <!-- Current offer / target / floor -->
            <div class="grid grid-cols-3 gap-3">
              <div class="p-3.5 rounded-[14px] bg-black/[0.015] text-center">
                <div class="text-[11px] text-secondary/50 mb-1">\u5f53\u524d\u62a5\u4ef7</div>
                <div class="text-[16px] font-bold text-primary" x-text="negotiation.currentOffer"></div>
              </div>
              <div class="p-3.5 rounded-[14px] bg-emerald-50/60 text-center">
                <div class="text-[11px] text-emerald-600 mb-1">\u76ee\u6807\u533a\u95f4</div>
                <div class="text-[16px] font-bold text-emerald-700" x-text="negotiation.targetRange"></div>
              </div>
              <div class="p-3.5 rounded-[14px] bg-red-50/60 text-center">
                <div class="text-[11px] text-red-500 mb-1">\u53ef\u63a5\u53d7\u5e95\u7ebf</div>
                <div class="text-[16px] font-bold text-red-600" x-text="negotiation.floor"></div>
              </div>
            </div>

            <!-- Negotiable items -->
            <div class="p-4 rounded-[16px] border border-black/[0.04]">
              <div class="flex items-center gap-2 mb-3">
                <i class="fas fa-list-check text-[11px] text-secondary/50"></i>
                <span class="text-[13px] font-semibold text-primary">\u53ef\u8c08\u9879\u76ee</span>
              </div>
              <div class="space-y-2">
                <template x-for="(item, ii) in negotiation.items" x-bind:key="ii">
                  <div class="flex items-center justify-between px-3 py-2.5 rounded-[10px] bg-black/[0.015]">
                    <span class="text-[12px] text-primary" x-text="item.name"></span>
                    <span class="text-[11px] font-medium" x-bind:class="item.priorityClass" x-text="item.priority"></span>
                  </div>
                </template>
              </div>
            </div>

            <!-- Recommended scripts -->
            <div class="p-4 rounded-[16px] border border-black/[0.04]">
              <div class="flex items-center gap-2 mb-3">
                <i class="fas fa-message text-[11px] text-secondary/50"></i>
                <span class="text-[13px] font-semibold text-primary">\u63a8\u8350\u8bdd\u672f</span>
              </div>
              <div class="space-y-3">
                <template x-for="(script, si) in negotiation.scripts" x-bind:key="si">
                  <div class="p-3 rounded-[12px] bg-black/[0.015]">
                    <div class="text-[11px] font-semibold text-secondary/60 mb-1" x-text="script.scenario"></div>
                    <p class="text-[12px] text-primary/80 leading-relaxed italic" x-text="'\u201c' + script.text + '\u201d'"></p>
                  </div>
                </template>
              </div>
            </div>

            <!-- Risk boundary -->
            <div class="p-4 rounded-[16px] border border-red-100/50 bg-red-50/30">
              <div class="flex items-center gap-2 mb-2">
                <i class="fas fa-shield-halved text-[11px] text-red-400"></i>
                <span class="text-[13px] font-semibold text-red-600">\u98ce\u9669\u8fb9\u754c</span>
              </div>
              <p class="text-[12px] text-red-600/70 leading-relaxed" x-text="negotiation.riskBoundary"></p>
            </div>
          </div>
        </div>
      </template>

      <!-- ==== MODULE: ADVICE - Center ==== -->
      <template x-if="activeModule === 'advice'">
        <div class="flex flex-col h-full overflow-y-auto decision-scrollbar">
          <div class="p-[24px] space-y-4">
            <div class="flex items-center gap-2.5 mb-1">
              <div class="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                <i class="fas fa-lightbulb text-[14px] text-violet-500"></i>
              </div>
              <h2 class="text-[20px] font-semibold text-primary">\u804c\u4e1a\u987e\u95ee\u5224\u65ad</h2>
            </div>

            <!-- Recommendation result -->
            <div class="p-5 rounded-[18px] bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50">
              <div class="flex items-center gap-2 mb-2">
                <i class="fas fa-star text-[12px] text-indigo-500"></i>
                <span class="text-[13px] font-semibold text-indigo-700">\u5f53\u524d\u63a8\u8350</span>
              </div>
              <div class="text-[18px] font-bold text-indigo-800 mb-2" x-text="adviceData.recommendation"></div>
              <p class="text-[13px] text-indigo-700/70 leading-relaxed" x-text="adviceData.reason"></p>
            </div>

            <!-- Cost of giving up -->
            <div class="p-4 rounded-[16px] border border-black/[0.04]">
              <div class="flex items-center gap-2 mb-2.5">
                <i class="fas fa-scale-unbalanced text-[11px] text-secondary/50"></i>
                <span class="text-[13px] font-semibold text-primary">\u653e\u5f03\u53e6\u4e00\u4e2a\u7684\u4ee3\u4ef7</span>
              </div>
              <p class="text-[12px] text-secondary/70 leading-relaxed" x-text="adviceData.costOfGivingUp"></p>
            </div>

            <!-- Future 2-3 year impact -->
            <div class="p-4 rounded-[16px] border border-black/[0.04]">
              <div class="flex items-center gap-2 mb-2.5">
                <i class="fas fa-road text-[11px] text-secondary/50"></i>
                <span class="text-[13px] font-semibold text-primary">\u672a\u6765 2-3 \u5e74\u5f71\u54cd</span>
              </div>
              <div class="space-y-2.5">
                <template x-for="(impact, ii) in adviceData.futureImpacts" x-bind:key="ii">
                  <div class="flex items-start gap-2.5">
                    <div class="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold" x-bind:class="impact.positive ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'">
                      <i x-bind:class="impact.positive ? 'fas fa-arrow-up' : 'fas fa-minus'"></i>
                    </div>
                    <div class="flex-1">
                      <div class="text-[12px] font-medium text-primary" x-text="impact.title"></div>
                      <p class="text-[11px] text-secondary/60 leading-relaxed mt-0.5" x-text="impact.description"></p>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ========================================== -->

  </div>
</div>
`;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
