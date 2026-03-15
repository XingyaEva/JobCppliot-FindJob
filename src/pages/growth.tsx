/**
 * FindJob 2.0 - Growth Center (成长中心)
 * PRD v1.5 pixel-level implementation
 *
 * Three-column layout:
 *   Left  (264px): Growth navigation / milestones
 *   Center(520px): Core content area
 *   Right (340px): AI coach / insights panel
 *
 * 4 sub-modules via tab switching:
 *   1. 成长陪伴师  (coach)    — default
 *   2. Skills自动化 (skills)
 *   3. 周计划       (weekly)
 *   4. 周复盘       (review)
 *
 * Uses Alpine.js for all interactivity.
 */

export function GrowthPage() {
  const html = `
<div id="growth-workspace" x-data="growthWorkspace" x-init="init()" class="min-h-[calc(100vh-72px)]">

  <!-- ============================================ -->
  <!-- PAGE TITLE AREA                               -->
  <!-- ============================================ -->
  <div class="px-7 pt-6">
    <h1 class="text-[30px] font-semibold text-primary leading-[38px] tracking-tight">\u6210\u957f</h1>
    <p class="text-[14px] text-secondary leading-[22px] mt-2">\u4ee5\u6570\u636e\u9a71\u52a8\u4f60\u7684\u6c42\u804c\u7b56\u7565\uff0c\u8ba9\u6bcf\u4e00\u6b65\u90fd\u53ef\u91cf\u5316\u3001\u53ef\u56de\u987e\u3001\u53ef\u4f18\u5316\u3002</p>
  </div>

  <!-- ============================================ -->
  <!-- TOP TOOLBAR (52px)                             -->
  <!-- ============================================ -->
  <div class="px-7 mt-5 flex items-center justify-between flex-wrap gap-3">
    <div class="flex items-center gap-2.5 flex-wrap">
      <!-- Search box 280x44 -->
      <div class="relative">
        <input type="text" x-model="searchTerm" x-on:input.debounce.300ms="filterItems()" placeholder="\u641c\u7d22\u6210\u957f\u8bb0\u5f55\u3001\u6280\u80fd\u6807\u7b7e\u3001\u5468\u62a5" class="w-[280px] h-[44px] pl-10 pr-4 rounded-[14px] bg-white border border-black/[0.08] text-[14px] text-primary placeholder-secondary/50 focus:outline-none focus:border-accent/30 transition-all" />
        <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-secondary/40"></i>
      </div>
      <!-- Sub-module capsules -->
      <template x-for="(tab, ti) in moduleTabs" x-bind:key="ti">
        <button x-on:click="switchModule(tab.value)" x-bind:class="activeModule === tab.value ? 'bg-primary/[0.06] text-primary font-semibold border-primary/[0.12]' : 'bg-white text-secondary border-black/[0.08] hover:border-black/[0.12] hover:text-primary/70'" class="h-[34px] px-3.5 rounded-full text-[13px] border whitespace-nowrap transition-all" x-text="tab.label"></button>
      </template>
    </div>
    <div class="flex items-center gap-2.5">
      <!-- Export report -->
      <button x-on:click="exportReport()" class="h-[44px] px-5 rounded-[14px] bg-white border border-black/[0.08] flex items-center gap-2 text-[14px] text-primary font-medium hover:border-accent/20 transition-all">
        <i class="fas fa-download text-[11px] text-secondary/50"></i>
        <span>\u5bfc\u51fa\u62a5\u544a</span>
      </button>
      <!-- Generate weekly report -->
      <button x-on:click="generateWeeklyReport()" class="h-[44px] px-5 rounded-[14px] bg-primary text-white flex items-center gap-2 text-[14px] font-medium hover:bg-primary/90 transition-all">
        <i class="fas fa-wand-magic-sparkles text-[11px]"></i>
        <span>\u751f\u6210\u5468\u62a5</span>
      </button>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- THREE-COLUMN MAIN AREA                        -->
  <!-- ============================================ -->
  <div class="px-7 pt-5 pb-7 flex gap-4 min-w-0 flex-1 overflow-hidden-5" style="height: calc(100vh - 72px - 38px - 52px - 50px);">

    <!-- ========================================== -->
    <!-- LEFT COLUMN (264px)                        -->
    <!-- ========================================== -->
    <div class="w-[264px] flex-shrink-0 bg-white rounded-[24px] border border-black/[0.06] shadow-card flex flex-col overflow-hidden">

      <!-- ================================ -->
      <!-- MODULE: COACH (default) - Left   -->
      <!-- ================================ -->
      <template x-if="activeModule === 'coach'">
        <div class="flex flex-col h-full">
          <div class="h-[56px] px-[18px] flex items-center justify-between flex-shrink-0">
            <span class="text-[18px] font-semibold text-primary">\u6210\u957f\u91cc\u7a0b\u7891</span>
            <span class="text-[12px] text-secondary/50" x-text="milestones.length + ' \u9879'"></span>
          </div>

          <!-- Milestone timeline -->
          <div class="flex-1 overflow-y-auto growth-scrollbar px-[14px] pb-4">
            <!-- Empty state -->
            <template x-if="milestones.length === 0">
              <div class="flex flex-col items-center justify-center py-16 text-center">
                <div class="w-[56px] h-[56px] rounded-full bg-rose-50 flex items-center justify-center mb-4">
                  <i class="fas fa-seedling text-[22px] text-rose-300"></i>
                </div>
                <p class="text-[14px] font-medium text-primary/80 mb-1">\u8fd8\u6ca1\u6709\u6210\u957f\u8bb0\u5f55</p>
                <p class="text-[12px] text-secondary/50">\u5f00\u59cb\u4f7f\u7528\u5404\u6a21\u5757\u540e\u81ea\u52a8\u751f\u6210</p>
              </div>
            </template>

            <!-- Timeline items -->
            <template x-for="(ms, mi) in milestones" x-bind:key="mi">
              <div class="flex gap-3 group cursor-pointer" x-on:click="selectMilestone(mi)">
                <!-- Timeline line + dot -->
                <div class="flex flex-col items-center flex-shrink-0">
                  <div class="w-[10px] h-[10px] rounded-full border-2 transition-colors" x-bind:class="selectedMilestone === mi ? 'border-accent bg-accent' : 'border-secondary/30 bg-white group-hover:border-accent/50'"></div>
                  <div class="w-[1.5px] flex-1 bg-black/[0.06]" x-show="mi < milestones.length - 1"></div>
                </div>
                <!-- Content -->
                <div class="pb-5 flex-1 min-w-0">
                  <div class="text-[11px] text-secondary/50 mb-1" x-text="ms.date"></div>
                  <div class="text-[13px] text-primary font-medium leading-relaxed" x-text="ms.title"></div>
                  <div class="flex items-center gap-1.5 mt-1.5">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" x-bind:class="ms.tagClass" x-text="ms.tag"></span>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Bottom stats -->
          <div class="border-t border-black/[0.04] px-[18px] py-3 flex-shrink-0 flex items-center justify-between">
            <div class="text-[12px] text-secondary/50"><i class="fas fa-fire text-[10px] text-orange-400 mr-1"></i>\u672c\u6708\u6d3b\u8dc3 <span class="font-semibold text-primary" x-text="activeDays"></span> \u5929</div>
            <div class="text-[12px] text-secondary/50">\u603b\u8ba1 <span class="font-semibold text-primary" x-text="milestones.length"></span> \u4e2a\u91cc\u7a0b\u7891</div>
          </div>
        </div>
      </template>

      <!-- ================================ -->
      <!-- MODULE: SKILLS - Left            -->
      <!-- ================================ -->
      <template x-if="activeModule === 'skills'">
        <div class="flex flex-col h-full">
          <div class="h-[56px] px-[18px] flex items-center justify-between flex-shrink-0">
            <span class="text-[18px] font-semibold text-primary">\u6280\u80fd\u5e93</span>
            <span class="text-[12px] text-secondary/50" x-text="skillCategories.reduce((s,c) => s + c.skills.length, 0) + ' \u4e2a\u6280\u80fd'"></span>
          </div>

          <!-- Skill tree -->
          <div class="flex-1 overflow-y-auto growth-scrollbar px-[14px] pb-4">
            <template x-if="skillCategories.length === 0">
              <div class="flex flex-col items-center justify-center py-16 text-center">
                <div class="w-[56px] h-[56px] rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <i class="fas fa-bolt text-[22px] text-blue-300"></i>
                </div>
                <p class="text-[14px] font-medium text-primary/80 mb-1">\u8fd8\u6ca1\u6709\u6280\u80fd\u6570\u636e</p>
                <p class="text-[12px] text-secondary/50">\u4ece\u7b80\u5386\u548c\u9762\u8bd5\u4e2d\u81ea\u52a8\u63d0\u53d6</p>
              </div>
            </template>

            <template x-for="(cat, ci) in skillCategories" x-bind:key="ci">
              <div class="mb-3">
                <button x-on:click="cat.expanded = !cat.expanded" class="w-full flex items-center gap-2 py-2 px-1 text-[13px] font-semibold text-primary/70 hover:text-primary transition-colors">
                  <i class="fas fa-chevron-right text-[9px] text-secondary/40 transition-transform duration-200" x-bind:class="cat.expanded && 'rotate-90'"></i>
                  <i class="text-[11px] w-4 text-center" x-bind:class="cat.icon"></i>
                  <span x-text="cat.name"></span>
                  <span class="ml-auto text-[11px] text-secondary/40 font-normal" x-text="cat.skills.length"></span>
                </button>
                <div x-show="cat.expanded" x-transition class="pl-7 space-y-1">
                  <template x-for="(skill, si) in cat.skills" x-bind:key="si">
                    <div x-on:click="selectSkill(skill)" class="flex items-center gap-2 px-2.5 py-2 rounded-[10px] cursor-pointer transition-colors" x-bind:class="selectedSkill && selectedSkill.name === skill.name ? 'bg-accent/[0.06]' : 'hover:bg-black/[0.03]'">
                      <span class="text-[13px] text-primary flex-1 truncate" x-text="skill.name"></span>
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-medium" x-bind:class="skill.levelClass" x-text="skill.level"></span>
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </div>

          <!-- Source legend -->
          <div class="border-t border-black/[0.04] px-[18px] py-3 flex-shrink-0">
            <div class="flex items-center gap-3 text-[11px] text-secondary/50">
              <span><i class="fas fa-file-alt text-[9px] mr-1"></i>\u7b80\u5386\u63d0\u53d6</span>
              <span><i class="fas fa-comments text-[9px] mr-1"></i>\u9762\u8bd5\u53cd\u9988</span>
              <span><i class="fas fa-pen text-[9px] mr-1"></i>\u624b\u52a8\u6dfb\u52a0</span>
            </div>
          </div>
        </div>
      </template>

      <!-- ================================ -->
      <!-- MODULE: WEEKLY - Left            -->
      <!-- ================================ -->
      <template x-if="activeModule === 'weekly'">
        <div class="flex flex-col h-full">
          <div class="h-[56px] px-[18px] flex items-center justify-between flex-shrink-0">
            <span class="text-[18px] font-semibold text-primary">\u5468\u8ba1\u5212</span>
            <button x-on:click="createNewWeek()" class="w-[32px] h-[32px] rounded-[10px] bg-black/[0.03] hover:bg-black/[0.06] flex items-center justify-center transition-colors">
              <i class="fas fa-plus text-[12px] text-secondary/60"></i>
            </button>
          </div>

          <!-- Week list -->
          <div class="flex-1 overflow-y-auto growth-scrollbar px-[14px] pb-4 space-y-1.5">
            <template x-if="weeklyPlans.length === 0">
              <div class="flex flex-col items-center justify-center py-16 text-center">
                <div class="w-[56px] h-[56px] rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <i class="fas fa-calendar-week text-[22px] text-emerald-300"></i>
                </div>
                <p class="text-[14px] font-medium text-primary/80 mb-1">\u8fd8\u6ca1\u6709\u5468\u8ba1\u5212</p>
                <p class="text-[12px] text-secondary/50">\u70b9\u51fb\u53f3\u4e0a\u89d2 + \u521b\u5efa\u7b2c\u4e00\u4e2a</p>
              </div>
            </template>

            <template x-for="(week, wi) in weeklyPlans" x-bind:key="wi">
              <div x-on:click="selectWeek(wi)" class="px-3.5 py-3 rounded-[14px] cursor-pointer border transition-all" x-bind:class="selectedWeekIndex === wi ? 'bg-accent/[0.06] border-accent/[0.12] shadow-sm' : 'border-transparent hover:bg-black/[0.02]'">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[13px] font-semibold text-primary" x-text="week.label"></span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" x-bind:class="week.statusClass" x-text="week.statusText"></span>
                </div>
                <div class="text-[11px] text-secondary/50 mb-2" x-text="week.dateRange"></div>
                <!-- Progress bar -->
                <div class="h-[4px] rounded-full bg-black/[0.04] overflow-hidden">
                  <div class="h-full rounded-full bg-accent transition-all duration-500" x-bind:style="'width:' + week.progress + '%'"></div>
                </div>
                <div class="text-[10px] text-secondary/40 mt-1 text-right" x-text="week.progress + '%'"></div>
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- ================================ -->
      <!-- MODULE: REVIEW - Left            -->
      <!-- ================================ -->
      <template x-if="activeModule === 'review'">
        <div class="flex flex-col h-full">
          <div class="h-[56px] px-[18px] flex items-center justify-between flex-shrink-0">
            <span class="text-[18px] font-semibold text-primary">\u590d\u76d8\u5386\u53f2</span>
            <span class="text-[12px] text-secondary/50" x-text="weeklyReviews.length + ' \u7bc7'"></span>
          </div>

          <div class="flex-1 overflow-y-auto growth-scrollbar px-[14px] pb-4 space-y-1.5">
            <template x-if="weeklyReviews.length === 0">
              <div class="flex flex-col items-center justify-center py-16 text-center">
                <div class="w-[56px] h-[56px] rounded-full bg-purple-50 flex items-center justify-center mb-4">
                  <i class="fas fa-chart-line text-[22px] text-purple-300"></i>
                </div>
                <p class="text-[14px] font-medium text-primary/80 mb-1">\u8fd8\u6ca1\u6709\u590d\u76d8\u8bb0\u5f55</p>
                <p class="text-[12px] text-secondary/50">\u5b8c\u6210\u4e00\u5468\u540e\u53ef\u751f\u6210\u590d\u76d8</p>
              </div>
            </template>

            <template x-for="(rv, ri) in weeklyReviews" x-bind:key="ri">
              <div x-on:click="selectReview(ri)" class="px-3.5 py-3 rounded-[14px] cursor-pointer border transition-all" x-bind:class="selectedReviewIndex === ri ? 'bg-accent/[0.06] border-accent/[0.12] shadow-sm' : 'border-transparent hover:bg-black/[0.02]'">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[13px] font-semibold text-primary" x-text="rv.label"></span>
                  <span class="text-[12px] font-semibold" x-bind:class="rv.score >= 80 ? 'text-emerald-500' : rv.score >= 60 ? 'text-amber-500' : 'text-red-400'" x-text="rv.score + '\u5206'"></span>
                </div>
                <div class="text-[11px] text-secondary/50 mb-2" x-text="rv.dateRange"></div>
                <!-- Completion bar -->
                <div class="h-[4px] rounded-full bg-black/[0.04] overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500" x-bind:class="rv.completion >= 80 ? 'bg-emerald-400' : rv.completion >= 50 ? 'bg-amber-400' : 'bg-red-300'" x-bind:style="'width:' + rv.completion + '%'"></div>
                </div>
                <div class="text-[10px] text-secondary/40 mt-1 text-right">\u5b8c\u6210\u5ea6 <span x-text="rv.completion + '%'"></span></div>
              </div>
            </template>
          </div>
        </div>
      </template>

    </div>

    <!-- ========================================== -->
    <!-- CENTER COLUMN (520px)                      -->
    <!-- ========================================== -->
    <div class="flex-1 min-w-0 bg-white rounded-[24px] border border-black/[0.06] shadow-card flex flex-col overflow-hidden">

      <!-- ================================ -->
      <!-- MODULE: COACH - Center           -->
      <!-- ================================ -->
      <template x-if="activeModule === 'coach'">
        <div class="flex flex-col h-full">
          <!-- Header -->
          <div class="h-[56px] px-[20px] flex items-center justify-between flex-shrink-0 border-b border-black/[0.04]">
            <div class="flex items-center gap-2.5">
              <div class="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                <i class="fas fa-heart-pulse text-[14px] text-rose-500"></i>
              </div>
              <div>
                <span class="text-[15px] font-semibold text-primary">AI \u6210\u957f\u6559\u7ec3</span>
                <span class="text-[11px] text-secondary/50 ml-2">\u672c\u5468\u5efa\u8bae</span>
              </div>
            </div>
            <button x-on:click="refreshCoachAdvice()" class="w-[32px] h-[32px] rounded-[10px] bg-black/[0.03] hover:bg-black/[0.06] flex items-center justify-center transition-colors" title="\u5237\u65b0\u5efa\u8bae">
              <i class="fas fa-arrows-rotate text-[12px] text-secondary/60"></i>
            </button>
          </div>

          <!-- Coach advice cards -->
          <div class="flex-1 overflow-y-auto growth-scrollbar px-[18px] py-4 space-y-3">
            <template x-if="coachAdvice.length === 0">
              <div class="flex flex-col items-center justify-center py-20 text-center">
                <div class="w-[64px] h-[64px] rounded-full bg-rose-50 flex items-center justify-center mb-4">
                  <i class="fas fa-robot text-[26px] text-rose-300"></i>
                </div>
                <p class="text-[15px] font-medium text-primary/80 mb-2">\u6b63\u5728\u5206\u6790\u4f60\u7684\u6c42\u804c\u6570\u636e...</p>
                <p class="text-[13px] text-secondary/50 max-w-[300px]">\u5f00\u59cb\u4f7f\u7528\u5404\u529f\u80fd\u6a21\u5757\u540e\uff0cAI \u6559\u7ec3\u5c06\u751f\u6210\u4e2a\u6027\u5316\u5efa\u8bae</p>
              </div>
            </template>

            <template x-for="(advice, ai) in coachAdvice" x-bind:key="ai">
              <div class="p-4 rounded-[18px] border border-black/[0.05] bg-white hover:shadow-sm transition-all">
                <!-- Title + priority -->
                <div class="flex items-start justify-between mb-2.5">
                  <h3 class="text-[14px] font-semibold text-primary leading-snug flex-1" x-text="advice.title"></h3>
                  <span class="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0" x-bind:class="advice.priorityClass" x-text="advice.priorityLabel"></span>
                </div>
                <!-- Description -->
                <p class="text-[13px] text-secondary leading-relaxed mb-3" x-text="advice.description"></p>
                <!-- Action steps -->
                <div class="space-y-2 mb-3">
                  <template x-for="(step, si) in advice.steps" x-bind:key="si">
                    <label class="flex items-start gap-2.5 cursor-pointer group">
                      <input type="checkbox" x-bind:checked="step.done" x-on:change="toggleStep(ai, si)" class="mt-0.5 w-[16px] h-[16px] rounded border-secondary/30 text-accent focus:ring-accent/30 cursor-pointer" />
                      <span class="text-[12px] leading-relaxed" x-bind:class="step.done ? 'text-secondary/40 line-through' : 'text-primary/70'" x-text="step.text"></span>
                    </label>
                  </template>
                </div>
                <!-- Expected benefit -->
                <div class="flex items-center gap-2 text-[11px] text-emerald-600 bg-emerald-50 rounded-[10px] px-3 py-2">
                  <i class="fas fa-arrow-trend-up text-[10px]"></i>
                  <span x-text="advice.benefit"></span>
                </div>
              </div>
            </template>
          </div>

          <!-- Bottom action plan -->
          <div class="border-t border-black/[0.04] px-[18px] py-3 flex-shrink-0">
            <div class="flex items-center justify-between">
              <span class="text-[12px] text-secondary/50"><i class="fas fa-clipboard-list text-[10px] mr-1"></i>\u5f85\u6267\u884c <span class="font-semibold text-primary" x-text="pendingStepCount"></span> \u9879</span>
              <button x-on:click="markAllDone()" class="text-[12px] text-accent hover:text-accent/80 font-medium transition-colors">\u5168\u90e8\u5b8c\u6210</button>
            </div>
          </div>
        </div>
      </template>

      <!-- ================================ -->
      <!-- MODULE: SKILLS - Center          -->
      <!-- ================================ -->
      <template x-if="activeModule === 'skills'">
        <div class="flex flex-col h-full">
          <div class="h-[56px] px-[20px] flex items-center justify-between flex-shrink-0 border-b border-black/[0.04]">
            <div class="flex items-center gap-2.5">
              <div class="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <i class="fas fa-bolt text-[14px] text-blue-500"></i>
              </div>
              <span class="text-[15px] font-semibold text-primary">\u6280\u80fd\u5dee\u8ddd\u5206\u6790</span>
            </div>
            <div class="flex items-center gap-2">
              <button x-on:click="skillViewMode = 'matrix'" x-bind:class="skillViewMode === 'matrix' ? 'bg-primary/[0.06] text-primary' : 'text-secondary/50 hover:text-primary'" class="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center transition-colors"><i class="fas fa-table-cells text-[12px]"></i></button>
              <button x-on:click="skillViewMode = 'trend'" x-bind:class="skillViewMode === 'trend' ? 'bg-primary/[0.06] text-primary' : 'text-secondary/50 hover:text-primary'" class="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center transition-colors"><i class="fas fa-chart-line text-[12px]"></i></button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto growth-scrollbar px-[18px] py-4">
            <!-- Target job header -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[14px] px-4 py-3 mb-4">
              <div class="flex items-center gap-2 mb-1">
                <i class="fas fa-bullseye text-[11px] text-blue-500"></i>
                <span class="text-[12px] font-semibold text-blue-700">\u76ee\u6807\u5c97\u4f4d\u8981\u6c42</span>
              </div>
              <p class="text-[12px] text-blue-600/70" x-text="targetJobSkillSummary || '\u672a\u8bbe\u7f6e\u76ee\u6807\u5c97\u4f4d\uff0c\u5efa\u8bae\u5148\u5728\u5c97\u4f4d\u4e2d\u5fc3\u9009\u62e9\u4e00\u4e2a\u76ee\u6807'"></p>
            </div>

            <!-- Skill gap matrix -->
            <template x-if="skillViewMode === 'matrix'">
              <div class="space-y-2">
                <template x-for="(gap, gi) in skillGaps" x-bind:key="gi">
                  <div class="flex items-center gap-3 px-3 py-2.5 rounded-[12px] border border-black/[0.04] hover:border-black/[0.08] transition-colors">
                    <span class="text-[13px] text-primary font-medium w-[120px] truncate" x-text="gap.skill"></span>
                    <!-- Current level bar -->
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-[10px] text-secondary/40 w-[28px]">\u5f53\u524d</span>
                        <div class="flex-1 h-[6px] rounded-full bg-black/[0.04] overflow-hidden">
                          <div class="h-full rounded-full bg-blue-400 transition-all" x-bind:style="'width:' + gap.current + '%'"></div>
                        </div>
                        <span class="text-[10px] text-secondary/50 w-[28px] text-right" x-text="gap.current + '%'"></span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] text-secondary/40 w-[28px]">\u8981\u6c42</span>
                        <div class="flex-1 h-[6px] rounded-full bg-black/[0.04] overflow-hidden">
                          <div class="h-full rounded-full bg-emerald-400 transition-all" x-bind:style="'width:' + gap.required + '%'"></div>
                        </div>
                        <span class="text-[10px] text-secondary/50 w-[28px] text-right" x-text="gap.required + '%'"></span>
                      </div>
                    </div>
                    <!-- Gap indicator -->
                    <span class="w-[40px] text-right text-[11px] font-semibold" x-bind:class="gap.current >= gap.required ? 'text-emerald-500' : 'text-red-400'" x-text="gap.current >= gap.required ? '\u2713 \u8fbe\u6807' : '-' + (gap.required - gap.current) + '%'"></span>
                  </div>
                </template>
                <template x-if="skillGaps.length === 0">
                  <div class="text-center py-12 text-[13px] text-secondary/50">\u6682\u65e0\u6280\u80fd\u5dee\u8ddd\u6570\u636e</div>
                </template>
              </div>
            </template>

            <!-- Skill trend view -->
            <template x-if="skillViewMode === 'trend'">
              <div class="space-y-4">
                <template x-for="(trend, tri) in skillTrends" x-bind:key="tri">
                  <div class="p-3 rounded-[14px] border border-black/[0.04]">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-[13px] font-medium text-primary" x-text="trend.skill"></span>
                      <span class="text-[11px] font-semibold" x-bind:class="trend.delta > 0 ? 'text-emerald-500' : trend.delta < 0 ? 'text-red-400' : 'text-secondary/50'" x-text="(trend.delta > 0 ? '+' : '') + trend.delta + '%'"></span>
                    </div>
                    <!-- Simple trend bar visualization -->
                    <div class="flex items-end gap-[3px] h-[32px]">
                      <template x-for="(val, vi) in trend.history" x-bind:key="vi">
                        <div class="flex-1 rounded-t-[2px] bg-blue-200 transition-all hover:bg-blue-400" x-bind:style="'height:' + Math.max(val * 0.32, 2) + 'px'" x-bind:title="val + '%'"></div>
                      </template>
                    </div>
                    <div class="flex justify-between text-[9px] text-secondary/30 mt-1">
                      <span>4\u5468\u524d</span>
                      <span>\u672c\u5468</span>
                    </div>
                  </div>
                </template>
                <template x-if="skillTrends.length === 0">
                  <div class="text-center py-12 text-[13px] text-secondary/50">\u6682\u65e0\u6280\u80fd\u8d8b\u52bf\u6570\u636e</div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- ================================ -->
      <!-- MODULE: WEEKLY - Center          -->
      <!-- ================================ -->
      <template x-if="activeModule === 'weekly'">
        <div class="flex flex-col h-full">
          <div class="h-[56px] px-[20px] flex items-center justify-between flex-shrink-0 border-b border-black/[0.04]">
            <div class="flex items-center gap-2.5">
              <div class="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <i class="fas fa-calendar-check text-[14px] text-emerald-500"></i>
              </div>
              <div>
                <span class="text-[15px] font-semibold text-primary" x-text="currentWeekPlan ? currentWeekPlan.label : '\u672c\u5468\u8ba1\u5212'"></span>
                <span class="text-[11px] text-secondary/50 ml-2" x-text="currentWeekPlan ? currentWeekPlan.dateRange : ''"></span>
              </div>
            </div>
            <button x-on:click="saveWeeklyPlan()" class="px-3 h-[30px] rounded-[8px] bg-primary text-white text-[12px] font-medium hover:bg-primary/90 transition-colors">\u4fdd\u5b58</button>
          </div>

          <div class="flex-1 overflow-y-auto growth-scrollbar px-[18px] py-4 space-y-4">
            <template x-if="!currentWeekPlan">
              <div class="flex flex-col items-center justify-center py-20 text-center">
                <div class="w-[64px] h-[64px] rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <i class="fas fa-calendar-plus text-[26px] text-emerald-300"></i>
                </div>
                <p class="text-[15px] font-medium text-primary/80 mb-2">\u9009\u62e9\u6216\u521b\u5efa\u4e00\u4e2a\u5468\u8ba1\u5212</p>
                <p class="text-[13px] text-secondary/50">\u5728\u5de6\u4fa7\u9009\u62e9\u5df2\u6709\u8ba1\u5212\u6216\u70b9\u51fb + \u521b\u5efa\u65b0\u8ba1\u5212</p>
              </div>
            </template>

            <template x-if="currentWeekPlan">
              <div>
                <!-- Goal cards -->
                <template x-for="(goal, gi) in currentWeekPlan.goals" x-bind:key="gi">
                  <div class="p-4 rounded-[16px] border border-black/[0.05] mb-3">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <i class="text-[12px]" x-bind:class="goal.icon"></i>
                        <span class="text-[14px] font-semibold text-primary" x-text="goal.title"></span>
                      </div>
                      <span class="text-[12px] font-semibold" x-bind:class="goal.completed >= goal.target ? 'text-emerald-500' : 'text-primary/60'" x-text="goal.completed + '/' + goal.target"></span>
                    </div>
                    <!-- Progress -->
                    <div class="h-[6px] rounded-full bg-black/[0.04] overflow-hidden mb-3">
                      <div class="h-full rounded-full bg-accent transition-all duration-500" x-bind:style="'width:' + Math.min(100, Math.round(goal.completed / goal.target * 100)) + '%'"></div>
                    </div>
                    <!-- Sub-tasks -->
                    <div class="space-y-2">
                      <template x-for="(task, ti) in goal.tasks" x-bind:key="ti">
                        <label class="flex items-center gap-2.5 cursor-pointer group">
                          <input type="checkbox" x-bind:checked="task.done" x-on:change="toggleGoalTask(gi, ti)" class="w-[16px] h-[16px] rounded border-secondary/30 text-accent focus:ring-accent/30 cursor-pointer" />
                          <span class="text-[12px]" x-bind:class="task.done ? 'text-secondary/40 line-through' : 'text-primary/70'" x-text="task.text"></span>
                        </label>
                      </template>
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- ================================ -->
      <!-- MODULE: REVIEW - Center          -->
      <!-- ================================ -->
      <template x-if="activeModule === 'review'">
        <div class="flex flex-col h-full">
          <div class="h-[56px] px-[20px] flex items-center justify-between flex-shrink-0 border-b border-black/[0.04]">
            <div class="flex items-center gap-2.5">
              <div class="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                <i class="fas fa-chart-line text-[14px] text-purple-500"></i>
              </div>
              <div>
                <span class="text-[15px] font-semibold text-primary" x-text="currentReview ? currentReview.label : '\u5468\u590d\u76d8'"></span>
                <span class="text-[11px] text-secondary/50 ml-2" x-text="currentReview ? currentReview.dateRange : ''"></span>
              </div>
            </div>
            <button x-on:click="exportReview()" class="px-3 h-[30px] rounded-[8px] bg-white border border-black/[0.08] text-[12px] text-primary font-medium hover:border-accent/20 transition-colors">\u5bfc\u51fa\u5468\u62a5</button>
          </div>

          <div class="flex-1 overflow-y-auto growth-scrollbar px-[18px] py-4">
            <template x-if="!currentReview">
              <div class="flex flex-col items-center justify-center py-20 text-center">
                <div class="w-[64px] h-[64px] rounded-full bg-purple-50 flex items-center justify-center mb-4">
                  <i class="fas fa-chart-pie text-[26px] text-purple-300"></i>
                </div>
                <p class="text-[15px] font-medium text-primary/80 mb-2">\u9009\u62e9\u4e00\u7bc7\u590d\u76d8</p>
                <p class="text-[13px] text-secondary/50">\u5728\u5de6\u4fa7\u9009\u62e9\u5df2\u6709\u590d\u76d8\u6216\u70b9\u51fb\u201c\u751f\u6210\u5468\u62a5\u201d</p>
              </div>
            </template>

            <template x-if="currentReview">
              <div class="space-y-4">
                <!-- Data summary -->
                <div class="grid grid-cols-2 gap-2.5">
                  <template x-for="(stat, sti) in currentReview.stats" x-bind:key="sti">
                    <div class="p-3 rounded-[14px] bg-gray-50/80 text-center">
                      <div class="text-[20px] font-bold text-primary" x-text="stat.value"></div>
                      <div class="text-[11px] text-secondary/50 mt-0.5" x-text="stat.label"></div>
                    </div>
                  </template>
                </div>

                <!-- Good / Improve columns -->
                <div class="grid grid-cols-2 gap-3">
                  <!-- What went well -->
                  <div class="p-3.5 rounded-[14px] bg-emerald-50/60 border border-emerald-100/50">
                    <div class="flex items-center gap-1.5 mb-2.5">
                      <i class="fas fa-face-smile text-[12px] text-emerald-500"></i>
                      <span class="text-[12px] font-semibold text-emerald-700">\u505a\u5f97\u597d</span>
                    </div>
                    <div class="space-y-1.5">
                      <template x-for="(item, ii) in currentReview.goodItems" x-bind:key="ii">
                        <div class="text-[12px] text-emerald-700/70 leading-relaxed flex items-start gap-1.5">
                          <i class="fas fa-check text-[8px] mt-1.5 text-emerald-400"></i>
                          <span x-text="item"></span>
                        </div>
                      </template>
                    </div>
                  </div>
                  <!-- What to improve -->
                  <div class="p-3.5 rounded-[14px] bg-amber-50/60 border border-amber-100/50">
                    <div class="flex items-center gap-1.5 mb-2.5">
                      <i class="fas fa-triangle-exclamation text-[12px] text-amber-500"></i>
                      <span class="text-[12px] font-semibold text-amber-700">\u9700\u6539\u8fdb</span>
                    </div>
                    <div class="space-y-1.5">
                      <template x-for="(item, ii) in currentReview.improveItems" x-bind:key="ii">
                        <div class="text-[12px] text-amber-700/70 leading-relaxed flex items-start gap-1.5">
                          <i class="fas fa-arrow-up text-[8px] mt-1.5 text-amber-400"></i>
                          <span x-text="item"></span>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Key events -->
                <div class="p-3.5 rounded-[14px] border border-black/[0.05]">
                  <div class="flex items-center gap-1.5 mb-2.5">
                    <i class="fas fa-timeline text-[11px] text-secondary/50"></i>
                    <span class="text-[12px] font-semibold text-primary">\u5173\u952e\u4e8b\u4ef6</span>
                  </div>
                  <div class="space-y-2">
                    <template x-for="(evt, ei) in currentReview.keyEvents" x-bind:key="ei">
                      <div class="flex items-start gap-2.5 text-[12px]">
                        <span class="text-secondary/40 w-[48px] flex-shrink-0" x-text="evt.date"></span>
                        <span class="text-primary/70 leading-relaxed" x-text="evt.text"></span>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Free-text reflection -->
                <div class="p-3.5 rounded-[14px] border border-black/[0.05]">
                  <div class="flex items-center gap-1.5 mb-2.5">
                    <i class="fas fa-pen-to-square text-[11px] text-secondary/50"></i>
                    <span class="text-[12px] font-semibold text-primary">\u81ea\u7531\u590d\u76d8</span>
                  </div>
                  <textarea x-model="currentReview.freeText" placeholder="\u5199\u4e0b\u4f60\u8fd9\u5468\u7684\u611f\u60f3\u548c\u53cd\u601d..." class="w-full h-[100px] text-[13px] text-primary/70 bg-transparent border-none resize-none focus:outline-none placeholder-secondary/30 leading-relaxed"></textarea>
                </div>
              </div>
            </template>
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
