/**
 * FindJob 2.0 - Interviews Workspace (面试工作台)
 * PRD v1.5 pixel-level implementation
 *
 * Three-column layout:
 *   Left  (248px): Training list navigation
 *   Center(520px): Main coaching / content area
 *   Right (356px): AI feedback & assistance
 *
 * 5 sub-modules via tab switching:
 *   1. 面试题库   (bank)
 *   2. 面试辅导   (coaching) — default
 *   3. 面试模拟   (simulation)
 *   4. 面试陪伴助手 (companion)
 *   5. 面试复盘   (review)
 *
 * Uses Alpine.js for all interactivity.
 */

export function InterviewsPage() {
  const html = `
<div id="interviews-workspace" x-data="interviewsWorkspace" x-init="init()" class="min-h-[calc(100vh-72px)]">

  <!-- ============================================ -->
  <!-- PAGE TITLE AREA                               -->
  <!-- ============================================ -->
  <div class="px-7 pt-6">
    <h1 class="text-[30px] font-semibold text-primary leading-[38px] tracking-tight">\u9762\u8bd5</h1>
    <p class="text-[14px] text-secondary leading-[22px] mt-2">\u628a\u51c6\u5907\u3001\u8bad\u7ec3\u3001\u6a21\u62df\u548c\u590d\u76d8\uff0c\u7ec4\u7ec7\u6210\u4e00\u5957\u8fde\u7eed\u7684\u9762\u8bd5\u63d0\u5347\u7cfb\u7edf\u3002</p>
  </div>

  <!-- ============================================ -->
  <!-- TOP TOOLBAR                                   -->
  <!-- ============================================ -->
  <div class="px-7 mt-5 flex items-center justify-between flex-wrap gap-3">
    <div class="flex items-center gap-2.5 flex-wrap">
      <!-- Search box 280x44 -->
      <div class="relative">
        <input type="text" x-model="searchTerm" x-on:input.debounce.300ms="filterItems()" placeholder="\u641c\u7d22\u9898\u76ee\u3001\u9762\u8bd5\u8bb0\u5f55\u3001\u590d\u76d8" class="w-[280px] h-[44px] pl-10 pr-4 rounded-[14px] bg-white border border-black/[0.08] text-[14px] text-primary placeholder-secondary/50 focus:outline-none focus:border-accent/30 transition-all" />
        <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-secondary/40"></i>
      </div>
      <!-- Sub-module capsules -->
      <template x-for="(tab, ti) in moduleTabs" x-bind:key="ti">
        <button x-on:click="switchModule(tab.value)" x-bind:class="activeModule === tab.value ? 'bg-primary/[0.06] text-primary font-semibold border-primary/[0.12]' : 'bg-white text-secondary border-black/[0.08] hover:border-black/[0.12] hover:text-primary/70'" class="h-[34px] px-3.5 rounded-full text-[13px] border whitespace-nowrap transition-all" x-text="tab.label"></button>
      </template>
    </div>
    <div class="flex items-center gap-2.5">
      <!-- Start simulation 108x44 -->
      <button x-on:click="switchModule('simulation')" class="h-[44px] px-5 rounded-[14px] bg-white border border-black/[0.08] flex items-center gap-2 text-[14px] text-primary font-medium hover:border-accent/20 transition-all">
        <i class="fas fa-play text-[11px] text-accent/60"></i>
        <span>\u5f00\u59cb\u6a21\u62df</span>
      </button>
      <!-- Import 132x44 -->
      <button x-on:click="showImportModal = true" class="h-[44px] px-5 rounded-[14px] bg-white border border-black/[0.08] flex items-center gap-2 text-[14px] text-primary font-medium hover:border-accent/20 transition-all">
        <i class="fas fa-file-import text-[11px] text-secondary/50"></i>
        <span>\u5bfc\u5165\u5f55\u97f3 / \u6587\u5b57</span>
      </button>
      <!-- New training 108x44 -->
      <button x-on:click="createNewTraining()" class="h-[44px] px-5 rounded-[14px] bg-primary text-white flex items-center gap-2 text-[14px] font-medium hover:bg-primary/90 transition-all">
        <i class="fas fa-plus text-[11px]"></i>
        <span>\u65b0\u5efa\u8bad\u7ec3</span>
      </button>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- THREE-COLUMN MAIN AREA                        -->
  <!-- ============================================ -->
  <div class="px-7 pt-5 pb-7 flex gap-4 min-w-0 flex-1 overflow-hidden-5" style="height: calc(100vh - 72px - 38px - 52px - 50px);">

    <!-- ========================================== -->
    <!-- LEFT: Training List (248px)                -->
    <!-- ========================================== -->
    <div class="w-[248px] flex-shrink-0 bg-white rounded-[24px] border border-black/[0.06] shadow-card flex flex-col overflow-hidden">

      <!-- Header -->
      <div class="h-[56px] px-[18px] flex items-center justify-between flex-shrink-0">
        <span class="text-[18px] font-semibold text-primary">\u8bad\u7ec3\u5217\u8868</span>
        <button x-on:click="createNewTraining()" class="w-[32px] h-[32px] rounded-[10px] bg-black/[0.03] hover:bg-black/[0.06] flex items-center justify-center transition-colors">
          <i class="fas fa-plus text-[12px] text-secondary/60"></i>
        </button>
      </div>

      <!-- Filter capsules -->
      <div class="px-[18px] pb-3 flex flex-wrap gap-2">
        <template x-for="(f, fi) in leftFilters" x-bind:key="fi">
          <button x-on:click="activeLeftFilter = f.value; filterItems()" x-bind:class="activeLeftFilter === f.value ? 'bg-primary/[0.06] text-primary font-medium border-primary/[0.12]' : 'bg-white text-secondary border-black/[0.08] hover:border-black/[0.12]'" class="h-[30px] px-3 rounded-full text-[12px] border whitespace-nowrap transition-all" x-text="f.label"></button>
        </template>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto px-[18px] pb-4 space-y-2.5 interview-scrollbar">

        <!-- Loading skeletons -->
        <template x-if="loading">
          <div class="space-y-2.5">
            <template x-for="i in 5" x-bind:key="'skel-'+i">
              <div class="h-[92px] rounded-[16px] bg-black/[0.03] animate-pulse"></div>
            </template>
          </div>
        </template>

        <!-- Empty state -->
        <template x-if="!loading && filteredItems.length === 0">
          <div class="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div class="w-12 h-12 rounded-full bg-black/[0.04] flex items-center justify-center mb-4">
              <i class="fas fa-microphone-alt text-[18px] text-secondary/30"></i>
            </div>
            <div class="text-[14px] text-primary/60 font-medium mb-2">\u8fd8\u6ca1\u6709\u8bad\u7ec3\u9898</div>
            <div class="text-[12px] text-secondary/50 leading-[18px] mb-5 px-2">\u5148\u6839\u636e\u76ee\u6807\u5c97\u4f4d\u751f\u6210\u4e00\u7ec4\u9762\u8bd5\u9898\u3002</div>
            <button x-on:click="createNewTraining()" class="h-[34px] px-4 rounded-[10px] bg-accent/[0.08] text-accent text-[12px] font-medium hover:bg-accent/[0.14] transition-colors mb-2">\u4ece\u5c97\u4f4d\u751f\u6210</button>
            <button class="h-[34px] px-4 rounded-[10px] bg-black/[0.04] text-secondary text-[12px] font-medium hover:bg-black/[0.06] transition-colors">\u4f7f\u7528\u901a\u7528\u9898\u5e93</button>
          </div>
        </template>

        <!-- Training item cards -->
        <template x-if="!loading && filteredItems.length > 0">
          <div class="space-y-2.5">
            <template x-for="(item, idx) in filteredItems" x-bind:key="item.id">
              <button x-on:click="selectItem(item)" x-bind:class="selectedItem && selectedItem.id === item.id ? 'bg-accent/[0.04] border-accent/[0.15] shadow-sm' : 'bg-white border-black/[0.06] hover:border-black/[0.10] hover:shadow-sm'" class="w-full text-left h-[92px] rounded-[16px] border p-[14px] transition-all relative group">
                <!-- Selected indicator -->
                <div x-show="selectedItem && selectedItem.id === item.id" class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[36px] bg-accent rounded-r-full"></div>
                <!-- Row 1: title + mastery -->
                <div class="flex items-start justify-between gap-2 mb-1.5">
                  <div class="text-[13px] font-medium text-primary leading-[18px] line-clamp-1 flex-1" x-text="item.title"></div>
                  <span x-bind:class="item.score >= 8 ? 'bg-success/10 text-success' : item.score >= 6 ? 'bg-warning/10 text-warning' : 'bg-black/[0.04] text-secondary'" class="text-[11px] px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0" x-text="item.score ? item.score + '\u5206' : '\u672a\u7ec3\u4e60'"></span>
                </div>
                <!-- Row 2: type + source -->
                <div class="flex items-center gap-1.5 mb-1.5">
                  <span class="text-[11px] text-accent/70 bg-accent/[0.06] px-1.5 py-0.5 rounded-full" x-text="item.type"></span>
                  <span class="text-[11px] text-secondary/50" x-text="item.source"></span>
                </div>
                <!-- Row 3: time + score -->
                <div class="text-[11px] text-secondary/40" x-text="item.lastPractice ? item.lastPractice + ' \u00b7 ' + item.score + ' \u5206' : '\u5c1a\u672a\u7ec3\u4e60'"></div>
              </button>
            </template>
          </div>
        </template>
      </div>

      <!-- Bottom stats -->
      <div class="px-[18px] py-3 border-t border-black/[0.04] flex-shrink-0">
        <div class="flex items-center justify-between text-[11px] text-secondary/50">
          <span>\u5171 <span class="text-primary/60 font-medium" x-text="allItems.length"></span> \u9898</span>
          <span>\u5df2\u7ec3\u4e60 <span class="text-accent font-medium" x-text="allItems.filter(i => i.score > 0).length"></span></span>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- CENTER COLUMN (520px)                      -->
    <!-- ========================================== -->
    <div class="flex-1 min-w-0 bg-white rounded-[24px] border border-black/[0.06] shadow-card flex flex-col overflow-hidden">

      <!-- ======= COACHING (default) ======= -->
      <template x-if="activeModule === 'coaching'">
        <div class="flex-1 flex flex-col overflow-hidden">
          <!-- No item selected -->
          <template x-if="!selectedItem">
            <div class="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div class="w-16 h-16 rounded-full bg-black/[0.03] flex items-center justify-center mb-5">
                <i class="fas fa-graduation-cap text-[24px] text-secondary/25"></i>
              </div>
              <div class="text-[16px] text-primary/50 font-medium mb-2">\u9009\u62e9\u4e00\u9053\u9898\u76ee\u5f00\u59cb\u8bad\u7ec3</div>
              <div class="text-[13px] text-secondary/40 leading-[20px]">\u4ece\u5de6\u4fa7\u5217\u8868\u9009\u62e9\u4e00\u9053\u9762\u8bd5\u9898\uff0c\u6216\u65b0\u5efa\u8bad\u7ec3\u4efb\u52a1\u3002</div>
            </div>
          </template>

          <!-- Item selected -->
          <template x-if="selectedItem">
            <div class="flex-1 flex flex-col overflow-y-auto interview-scrollbar">
              <!-- Question header -->
              <div class="p-6 pb-4 flex-shrink-0">
                <!-- Row 1: type tag + question number + controls -->
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span class="text-[12px] px-2 py-1 rounded-full bg-accent/[0.08] text-accent font-medium" x-text="selectedItem.type"></span>
                    <span class="text-[12px] text-secondary/50" x-text="'Q' + (filteredItems.indexOf(selectedItem) + 1) + ' / ' + filteredItems.length"></span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button x-on:click="selectedItem.mastered = !selectedItem.mastered" x-bind:class="selectedItem.mastered ? 'text-success bg-success/10' : 'text-secondary/40 bg-black/[0.03]'" class="h-[30px] px-3 rounded-[10px] text-[12px] flex items-center gap-1.5 transition-all">
                      <i class="fas fa-check text-[10px]"></i>
                      <span x-text="selectedItem.mastered ? '\u5df2\u638c\u63e1' : '\u6807\u8bb0\u5df2\u638c\u63e1'"></span>
                    </button>
                    <button class="w-[30px] h-[30px] rounded-[10px] bg-black/[0.03] hover:bg-black/[0.06] flex items-center justify-center transition-colors">
                      <i class="fas fa-ellipsis-h text-[12px] text-secondary/40"></i>
                    </button>
                  </div>
                </div>
                <!-- Row 2: question text -->
                <h2 class="text-[22px] font-semibold text-primary leading-[32px]" x-text="selectedItem.title"></h2>
                <!-- Row 3: exam intent -->
                <div class="mt-3.5 bg-black/[0.02] rounded-[14px] p-3.5">
                  <div class="text-[12px] text-secondary/50 font-medium mb-1">\u8003\u5bdf\u610f\u56fe</div>
                  <div class="text-[13px] text-primary/60 leading-[20px]" x-text="selectedItem.intent || '\u9762\u8bd5\u5b98\u60f3\u770b\u4f60\u662f\u5426\u5177\u5907\u9879\u76ee\u62c6\u89e3\u80fd\u529b\u3001\u8d44\u6e90\u5224\u65ad\u80fd\u529b\uff0c\u4ee5\u53ca\u5bf9 AI \u573a\u666f\u843d\u5730\u7684\u5b9e\u9645\u7406\u89e3\u3002'"></div>
                </div>
              </div>

              <!-- Answer input area -->
              <div class="px-6 flex-1 flex flex-col min-h-0">
                <div class="flex-1 flex flex-col rounded-[18px] border border-black/[0.06] bg-surface overflow-hidden">
                  <!-- Toolbar 40px -->
                  <div class="h-[40px] px-4 flex items-center justify-between border-b border-black/[0.04] flex-shrink-0">
                    <div class="flex items-center gap-3">
                      <button x-on:click="answerMode = 'text'" x-bind:class="answerMode === 'text' ? 'text-primary font-medium' : 'text-secondary/50'" class="text-[12px] transition-colors">\u6587\u672c\u56de\u7b54</button>
                      <button x-on:click="answerMode = 'voice'" x-bind:class="answerMode === 'voice' ? 'text-primary font-medium' : 'text-secondary/50'" class="text-[12px] transition-colors">\u8bed\u97f3\u8f6c\u5199</button>
                    </div>
                    <div class="flex items-center gap-3 text-[11px] text-secondary/40">
                      <span x-text="(currentAnswer || '').length + ' \u5b57'"></span>
                      <span class="flex items-center gap-1"><i class="fas fa-check-circle text-success/50 text-[10px]"></i>\u81ea\u52a8\u4fdd\u5b58</span>
                    </div>
                  </div>
                  <!-- Text area -->
                  <textarea x-model="currentAnswer" placeholder="\u5728\u8fd9\u91cc\u5199\u4e0b\u4f60\u7684\u56de\u7b54\u3002\u5c3d\u91cf\u8bf4\u660e\u80cc\u666f\u3001\u4f60\u7684\u5224\u65ad\u8fc7\u7a0b\u3001\u5173\u952e\u52a8\u4f5c\u548c\u7ed3\u679c\u3002" class="flex-1 w-full px-[18px] py-4 text-[14px] text-primary leading-[22px] bg-transparent border-0 focus:outline-none resize-none placeholder-secondary/35 interview-scrollbar"></textarea>
                  <!-- Bottom tool row -->
                  <div class="h-[48px] px-4 flex items-center justify-between border-t border-black/[0.04] flex-shrink-0">
                    <div class="flex items-center gap-2">
                      <button class="h-[32px] px-3 rounded-[10px] bg-black/[0.03] text-[12px] text-secondary/60 hover:bg-black/[0.06] transition-colors flex items-center gap-1.5">
                        <i class="fas fa-sitemap text-[10px]"></i>STAR \u7ed3\u6784
                      </button>
                      <button class="h-[32px] px-3 rounded-[10px] bg-black/[0.03] text-[12px] text-secondary/60 hover:bg-black/[0.06] transition-colors flex items-center gap-1.5">
                        <i class="fas fa-folder-open text-[10px]"></i>\u8c03\u7528\u7d20\u6750
                      </button>
                    </div>
                    <div class="flex items-center gap-2">
                      <button x-on:click="currentAnswer = ''" class="h-[32px] px-3 rounded-[10px] bg-black/[0.03] text-[12px] text-secondary/50 hover:bg-black/[0.06] transition-colors">\u6e05\u7a7a</button>
                      <button class="h-[32px] w-[32px] rounded-[10px] bg-black/[0.03] flex items-center justify-center hover:bg-black/[0.06] transition-colors">
                        <i class="fas fa-microphone text-[12px] text-secondary/50"></i>
                      </button>
                      <button x-on:click="submitAnswer()" class="h-[32px] px-4 rounded-[10px] bg-primary text-white text-[12px] font-medium hover:bg-primary/90 transition-colors">\u63d0\u4ea4\u56de\u7b54</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recent answer history -->
              <div class="px-6 pt-4 pb-5 flex-shrink-0">
                <div class="text-[13px] font-medium text-primary/60 mb-3">\u6700\u8fd1\u56de\u7b54\u8bb0\u5f55</div>
                <div class="space-y-2">
                  <template x-for="(rec, ri) in (selectedItem.history || []).slice(0, 2)" x-bind:key="ri">
                    <div class="h-[62px] rounded-[14px] bg-black/[0.02] border border-black/[0.04] px-4 flex items-center justify-between">
                      <div>
                        <div class="text-[12px] text-primary/60" x-text="rec.time"></div>
                        <div class="text-[11px] text-secondary/40 mt-0.5" x-text="'\u5f97\u5206 ' + rec.score + ' \u00b7 ' + rec.improvement"></div>
                      </div>
                      <button class="text-[12px] text-accent hover:text-accent-hover transition-colors">\u91cd\u65b0\u67e5\u770b</button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- ======= BANK (面试题库) ======= -->
      <template x-if="activeModule === 'bank'">
        <div class="flex-1 flex flex-col overflow-y-auto interview-scrollbar p-6">
          <template x-if="!selectedItem">
            <div class="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div class="w-16 h-16 rounded-full bg-black/[0.03] flex items-center justify-center mb-5">
                <i class="fas fa-book-open text-[24px] text-secondary/25"></i>
              </div>
              <div class="text-[16px] text-primary/50 font-medium mb-2">\u9009\u62e9\u4e00\u9053\u9898\u76ee\u67e5\u770b\u8be6\u60c5</div>
              <div class="text-[13px] text-secondary/40 leading-[20px]">\u4ece\u5de6\u4fa7\u5217\u8868\u9009\u62e9\u4e00\u9053\u9898\u76ee\uff0c\u67e5\u770b\u5b8c\u6574\u5185\u5bb9\u4e0e\u7ec3\u4e60\u5efa\u8bae\u3002</div>
            </div>
          </template>
          <template x-if="selectedItem">
            <div>
              <!-- Question full detail -->
              <div class="flex items-center gap-2 mb-4">
                <span class="text-[12px] px-2 py-1 rounded-full bg-accent/[0.08] text-accent font-medium" x-text="selectedItem.type"></span>
                <span class="text-[12px] text-secondary/50" x-text="selectedItem.source"></span>
              </div>
              <h2 class="text-[22px] font-semibold text-primary leading-[32px] mb-4" x-text="selectedItem.title"></h2>

              <!-- Exam intent -->
              <div class="bg-black/[0.02] rounded-[16px] p-4 mb-5">
                <div class="text-[13px] font-medium text-primary/70 mb-2">\u8003\u5bdf\u610f\u56fe</div>
                <div class="text-[13px] text-primary/55 leading-[20px]" x-text="selectedItem.intent || '\u8003\u5bdf\u4f60\u7684\u9879\u76ee\u62c6\u89e3\u80fd\u529b\u3001\u8d44\u6e90\u5224\u65ad\u80fd\u529b\uff0c\u4ee5\u53ca\u5bf9\u573a\u666f\u843d\u5730\u7684\u5b9e\u9645\u7406\u89e3\u3002'"></div>
              </div>

              <!-- Recommended answer structure -->
              <div class="bg-black/[0.02] rounded-[16px] p-4 mb-5">
                <div class="text-[13px] font-medium text-primary/70 mb-2">\u63a8\u8350\u7b54\u9898\u7ed3\u6784</div>
                <div class="space-y-2">
                  <template x-for="(step, si) in ['S \u2014 \u60c5\u5883\u80cc\u666f\u548c\u6311\u6218', 'T \u2014 \u4f60\u7684\u4efb\u52a1\u4e0e\u76ee\u6807', 'A \u2014 \u5173\u952e\u884c\u52a8\u4e0e\u51b3\u7b56\u8fc7\u7a0b', 'R \u2014 \u53ef\u91cf\u5316\u7684\u7ed3\u679c\u4e0e\u53cd\u601d']" x-bind:key="si">
                    <div class="flex items-start gap-2.5">
                      <div class="w-5 h-5 rounded-full bg-accent/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span class="text-[10px] text-accent font-bold" x-text="step.charAt(0)"></span>
                      </div>
                      <span class="text-[13px] text-primary/55 leading-[20px]" x-text="step"></span>
                    </div>
                  </template>
                </div>
              </div>

              <!-- My historical answers -->
              <div class="mb-4">
                <div class="text-[13px] font-medium text-primary/70 mb-3">\u6211\u7684\u5386\u53f2\u56de\u7b54</div>
                <template x-if="(selectedItem.history || []).length === 0">
                  <div class="text-[12px] text-secondary/40 bg-black/[0.02] rounded-[14px] p-4 text-center">\u8fd8\u6ca1\u6709\u56de\u7b54\u8bb0\u5f55\uff0c\u53bb\u300c\u9762\u8bd5\u8f85\u5bfc\u300d\u5f00\u59cb\u7ec3\u4e60\u3002</div>
                </template>
                <template x-if="(selectedItem.history || []).length > 0">
                  <div class="space-y-2">
                    <template x-for="(rec, ri) in selectedItem.history" x-bind:key="ri">
                      <div class="rounded-[14px] bg-black/[0.02] border border-black/[0.04] p-3.5">
                        <div class="flex items-center justify-between mb-1.5">
                          <span class="text-[12px] text-primary/60" x-text="rec.time"></span>
                          <span class="text-[12px] text-accent font-medium" x-text="rec.score + ' \u5206'"></span>
                        </div>
                        <div class="text-[12px] text-secondary/50 leading-[18px]" x-text="rec.improvement"></div>
                      </div>
                    </template>
                  </div>
                </template>
              </div>

              <!-- Related jobs -->
              <div>
                <div class="text-[13px] font-medium text-primary/70 mb-3">\u5173\u8054\u5c97\u4f4d</div>
                <div class="flex flex-wrap gap-2">
                  <template x-for="(job, ji) in (selectedItem.relatedJobs || ['\u4ea7\u54c1\u7ecf\u7406', 'AI \u4ea7\u54c1\u7ecf\u7406'])" x-bind:key="ji">
                    <span class="text-[12px] px-2.5 py-1 rounded-full bg-black/[0.04] text-secondary/60" x-text="job"></span>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- ======= SIMULATION (面试模拟) ======= -->
      <template x-if="activeModule === 'simulation'">
        <div class="flex-1 flex flex-col overflow-hidden p-6">
          <!-- Chat area -->
          <div class="flex-1 overflow-y-auto interview-scrollbar space-y-4 mb-4">
            <!-- Welcome -->
            <template x-if="simMessages.length === 0">
              <div class="flex-1 flex flex-col items-center justify-center text-center py-16">
                <div class="w-16 h-16 rounded-full bg-accent/[0.06] flex items-center justify-center mb-5">
                  <i class="fas fa-user-tie text-[24px] text-accent/40"></i>
                </div>
                <div class="text-[16px] text-primary/60 font-medium mb-2">\u51c6\u5907\u597d\u4e86\u5417\uff1f</div>
                <div class="text-[13px] text-secondary/40 leading-[20px] max-w-[320px]">\u9009\u62e9\u5de6\u4fa7\u6a21\u62df\u914d\u7f6e\uff0c\u7136\u540e\u70b9\u51fb\u300c\u5f00\u59cb\u6a21\u62df\u300d\u8fdb\u5165\u9762\u8bd5\u573a\u666f\u3002</div>
              </div>
            </template>
            <!-- Messages -->
            <template x-for="(msg, mi) in simMessages" x-bind:key="mi">
              <div x-bind:class="msg.role === 'interviewer' ? 'flex justify-start' : 'flex justify-end'">
                <div x-bind:class="msg.role === 'interviewer' ? 'bg-black/[0.03] rounded-[16px] rounded-tl-[4px]' : 'bg-accent/[0.08] rounded-[16px] rounded-tr-[4px]'" class="max-w-[85%] p-4">
                  <div class="text-[11px] text-secondary/40 mb-1.5" x-text="msg.role === 'interviewer' ? '\u9762\u8bd5\u5b98' : '\u6211'"></div>
                  <div class="text-[14px] text-primary leading-[22px]" x-text="msg.content"></div>
                </div>
              </div>
            </template>
          </div>
          <!-- Input -->
          <div class="flex items-center gap-3 flex-shrink-0">
            <div class="flex-1 relative">
              <input type="text" x-model="simInput" x-on:keydown.enter="sendSimMessage()" placeholder="\u8f93\u5165\u4f60\u7684\u56de\u7b54..." class="w-full h-[44px] pl-4 pr-12 rounded-[14px] bg-surface border border-black/[0.08] text-[14px] text-primary placeholder-secondary/40 focus:outline-none focus:border-accent/30 transition-all" />
              <button class="absolute right-2 top-1/2 -translate-y-1/2 w-[32px] h-[32px] rounded-[10px] bg-black/[0.03] flex items-center justify-center hover:bg-black/[0.06] transition-colors">
                <i class="fas fa-microphone text-[12px] text-secondary/50"></i>
              </button>
            </div>
            <button x-on:click="sendSimMessage()" class="h-[44px] px-5 rounded-[14px] bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-all">\u53d1\u9001</button>
          </div>
        </div>
      </template>

      <!-- ======= COMPANION (面试陪伴助手) ======= -->
      <template x-if="activeModule === 'companion'">
        <div class="flex-1 overflow-y-auto interview-scrollbar p-6">
          <!-- Tool intro -->
          <div class="mb-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-[12px] bg-accent/[0.08] flex items-center justify-center">
                <i class="fas fa-headset text-[18px] text-accent/60"></i>
              </div>
              <div>
                <div class="text-[16px] font-semibold text-primary">\u9762\u8bd5\u966a\u4f34\u52a9\u624b</div>
                <div class="text-[12px] text-secondary/50">\u5728\u771f\u5b9e\u9762\u8bd5\u4e2d\u4e3a\u4f60\u63d0\u4f9b\u5b9e\u65f6\u63d0\u793a\u4e0e\u7eaa\u8981</div>
              </div>
            </div>
            <div class="bg-black/[0.02] rounded-[16px] p-4 text-[13px] text-primary/60 leading-[22px]">\u9762\u8bd5\u966a\u4f34\u52a9\u624b\u4f1a\u5728\u4f60\u7684\u771f\u5b9e\u9762\u8bd5\u8fc7\u7a0b\u4e2d\uff0c\u5b9e\u65f6\u5206\u6790\u95ee\u9898\u5e76\u7ed9\u51fa\u56de\u7b54\u8981\u70b9\u63d0\u793a\u3002\u5b83\u4e0d\u4f1a\u66ff\u4f60\u56de\u7b54\uff0c\u800c\u662f\u5728\u5173\u952e\u65f6\u523b\u7ed9\u4f60\u4e00\u4e2a\u201c\u677f\u201d\u3002</div>
          </div>

          <!-- Activation card -->
          <div class="bg-surface rounded-[18px] border border-black/[0.06] p-5 mb-5">
            <div class="flex items-center justify-between mb-4">
              <div class="text-[14px] font-medium text-primary">\u5f00\u542f\u72b6\u6001</div>
              <button x-on:click="companionEnabled = !companionEnabled" x-bind:class="companionEnabled ? 'bg-accent' : 'bg-black/[0.12]'" class="w-[44px] h-[24px] rounded-full transition-colors relative">
                <div x-bind:class="companionEnabled ? 'translate-x-[22px]' : 'translate-x-[2px]'" class="w-[20px] h-[20px] rounded-full bg-white shadow-sm absolute top-[2px] transition-transform"></div>
              </button>
            </div>
            <div class="text-[12px] text-secondary/50 leading-[18px]" x-text="companionEnabled ? '\u52a9\u624b\u5df2\u5f00\u542f\uff0c\u5f00\u59cb\u9762\u8bd5\u65f6\u4f1a\u81ea\u52a8\u6fc0\u6d3b\u3002' : '\u5f00\u542f\u540e\uff0c\u52a9\u624b\u4f1a\u5728\u771f\u5b9e\u9762\u8bd5\u4e2d\u63d0\u4f9b\u5b9e\u65f6\u8f85\u52a9\u3002'"></div>
          </div>

          <!-- Recent recordings -->
          <div class="mb-5">
            <div class="text-[14px] font-medium text-primary mb-3">\u6700\u8fd1\u5f55\u5236</div>
            <div class="bg-black/[0.02] rounded-[14px] p-4 text-center">
              <div class="text-[12px] text-secondary/40">\u8fd8\u6ca1\u6709\u5f55\u5236\u8bb0\u5f55</div>
            </div>
          </div>

          <!-- Permissions -->
          <div>
            <div class="text-[14px] font-medium text-primary mb-3">\u6743\u9650\u8bf4\u660e</div>
            <div class="space-y-2">
              <template x-for="(perm, pi) in ['\u9ea6\u514b\u98ce\u6743\u9650\uff1a\u4ec5\u5728\u5f55\u5236\u65f6\u4f7f\u7528', '\u97f3\u9891\u6570\u636e\uff1a\u672c\u5730\u5904\u7406\uff0c\u4e0d\u4e0a\u4f20\u670d\u52a1\u5668', '\u63d0\u793a\u5ef6\u8fdf\uff1a\u7ea6 1-2 \u79d2']" x-bind:key="pi">
                <div class="flex items-start gap-2.5 text-[12px] text-secondary/50 leading-[18px]">
                  <i class="fas fa-shield-alt text-[10px] text-accent/40 mt-1"></i>
                  <span x-text="perm"></span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>

      <!-- ======= REVIEW (面试复盘) ======= -->
      <template x-if="activeModule === 'review'">
        <div class="flex-1 overflow-y-auto interview-scrollbar p-6">
          <template x-if="!selectedReview">
            <div class="flex-1 flex flex-col items-center justify-center text-center py-16">
              <div class="w-16 h-16 rounded-full bg-black/[0.03] flex items-center justify-center mb-5">
                <i class="fas fa-clipboard-list text-[24px] text-secondary/25"></i>
              </div>
              <div class="text-[16px] text-primary/50 font-medium mb-2">\u9009\u62e9\u4e00\u6b21\u9762\u8bd5\u67e5\u770b\u590d\u76d8</div>
              <div class="text-[13px] text-secondary/40 leading-[20px]">\u4ece\u5de6\u4fa7\u5386\u53f2\u5217\u8868\u9009\u62e9\u4e00\u6b21\u9762\u8bd5\u8bb0\u5f55\u3002</div>
            </div>
          </template>
          <template x-if="selectedReview">
            <div>
              <!-- Review header -->
              <div class="flex items-center justify-between mb-5">
                <div>
                  <h2 class="text-[18px] font-semibold text-primary" x-text="selectedReview.company + ' - ' + selectedReview.position"></h2>
                  <div class="text-[12px] text-secondary/50 mt-1" x-text="selectedReview.date"></div>
                </div>
                <div class="h-[48px] w-[48px] rounded-[14px] bg-accent/[0.08] flex items-center justify-center">
                  <span class="text-[18px] font-bold text-accent" x-text="selectedReview.overallScore"></span>
                </div>
              </div>

              <!-- Timeline -->
              <div class="mb-5">
                <div class="text-[13px] font-medium text-primary/70 mb-3">\u95ee\u9898\u65f6\u95f4\u7ebf</div>
                <div class="space-y-3">
                  <template x-for="(q, qi) in (selectedReview.questions || [])" x-bind:key="qi">
                    <div class="flex items-start gap-3">
                      <div class="w-6 h-6 rounded-full bg-accent/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span class="text-[10px] text-accent font-bold" x-text="qi + 1"></span>
                      </div>
                      <div class="flex-1">
                        <div class="text-[13px] text-primary leading-[20px]" x-text="q.question"></div>
                        <div class="text-[11px] text-secondary/40 mt-1" x-text="q.assessment"></div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Highlights & mistakes -->
              <div class="grid grid-cols-2 gap-3 mb-5">
                <div class="bg-success/[0.04] rounded-[14px] p-4">
                  <div class="text-[12px] font-medium text-success mb-2">\u4eae\u70b9</div>
                  <template x-for="(h, hi) in (selectedReview.highlights || [])" x-bind:key="hi">
                    <div class="text-[12px] text-primary/60 leading-[18px] mb-1" x-text="'\u2022 ' + h"></div>
                  </template>
                </div>
                <div class="bg-error/[0.04] rounded-[14px] p-4">
                  <div class="text-[12px] font-medium text-error mb-2">\u5f85\u6539\u8fdb</div>
                  <template x-for="(m, mi) in (selectedReview.mistakes || [])" x-bind:key="mi">
                    <div class="text-[12px] text-primary/60 leading-[18px] mb-1" x-text="'\u2022 ' + m"></div>
                  </template>
                </div>
              </div>

              <!-- Next round suggestions -->
              <div class="bg-black/[0.02] rounded-[16px] p-4">
                <div class="text-[13px] font-medium text-primary/70 mb-2">\u4e0b\u8f6e\u5efa\u8bae</div>
                <div class="text-[13px] text-primary/55 leading-[20px]" x-text="selectedReview.nextSuggestion || '\u5f3a\u5316\u7ed3\u679c\u91cf\u5316\u8868\u8fbe\uff0c\u589e\u52a0\u66f4\u591a\u5177\u4f53\u6570\u636e\u3002'"></div>
              </div>
            </div>
          </template>
        </div>
      </template>

    </div>

    <!-- ========================================== -->

  </div>
</div>
`;

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
}
