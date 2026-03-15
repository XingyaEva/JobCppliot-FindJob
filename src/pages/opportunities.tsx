/**
 * FindJob 2.0 - Opportunities Workspace (机会工作台)
 * Figma Design v2.0 - Pixel-perfect implementation
 * 
 * Layout: Title toolbar + dual-pane (left job list ~40% + right job detail ~60%)
 * Key changes from Figma:
 * - Status filter tabs: 全部/待研究/待投递/面试中/已淘汰
 * - Job cards: heart + 3-dot menu, company·city·salary·pay count, source/time, tags
 * - Right pane: 3 action buttons (black primary), 匹配诊断/简历优化/更多 links
 * - 4 conclusion cards: green bg for recommendation, 95/A style match
 * - Tab bar: 概览/JD解析/能力模型/匹配诊断/公司分析/投递记录
 * Uses Alpine.js for all interactivity.
 * Full API integration: loads from /api/jobs, delete, add to applications, etc.
 */

export function OpportunitiesPage() {
  const html = `
<div id="opp-workspace" x-data="oppWorkspace" x-init="init()" class="min-h-[calc(100vh-72px)]">

  <!-- ============================================ -->
  <!-- TOAST NOTIFICATION                            -->
  <!-- ============================================ -->
  <div x-show="toastVisible" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" x-transition:leave="transition ease-in duration-200" x-transition:leave-start="opacity-100 translate-y-0" x-transition:leave-end="opacity-0 translate-y-2" class="fixed top-20 right-8 z-[100] max-w-sm" style="display:none;">
    <div x-bind:class="{
      'bg-emerald-50 border-emerald-200 text-emerald-800': toastType === 'success',
      'bg-red-50 border-red-200 text-red-800': toastType === 'error',
      'bg-amber-50 border-amber-200 text-amber-800': toastType === 'warning',
      'bg-blue-50 border-blue-200 text-blue-800': toastType === 'info'
    }" class="px-4 py-3 rounded-[14px] border shadow-lg flex items-center gap-2.5">
      <i x-bind:class="{
        'fas fa-check-circle text-emerald-500': toastType === 'success',
        'fas fa-exclamation-circle text-red-500': toastType === 'error',
        'fas fa-exclamation-triangle text-amber-500': toastType === 'warning',
        'fas fa-info-circle text-blue-500': toastType === 'info'
      }" class="text-[14px] flex-shrink-0"></i>
      <span class="text-[13px] font-medium" x-text="toastMessage"></span>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- PAGE TITLE & TOOLBAR                          -->
  <!-- ============================================ -->
  <div class="px-8 pt-8 pb-5">
    <div class="flex items-start justify-between gap-6">
      <div>
        <h1 class="text-[32px] font-bold text-[#1E1E1A] leading-[40px] tracking-tight">\u673a\u4f1a</h1>
        <p class="text-[15px] text-[#86868b] leading-[22px] mt-1.5">\u6536\u96c6\u5c97\u4f4d\u3001\u7406\u89e3\u5c97\u4f4d\u3001\u63a8\u8fdb\u66f4\u503c\u5f97\u6295\u5165\u7684\u673a\u4f1a</p>
      </div>
      <div class="flex items-center gap-3 flex-shrink-0 pt-1">
        <!-- Search -->
        <div class="relative">
          <input type="text" x-model="searchTerm" x-on:input.debounce.300ms="filterJobs()" placeholder="\u641c\u7d22\u5c97\u4f4d\u3001\u516c\u53f8\u3001\u57ce\u5e02" class="w-[240px] h-[40px] pl-10 pr-4 rounded-[12px] bg-white border border-black/[0.08] text-[14px] text-primary placeholder-[#86868b]/60 focus:outline-none focus:border-black/[0.15] transition-all" />
          <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[#86868b]/50"></i>
        </div>
        <!-- Filter -->
        <button class="h-[40px] px-3.5 rounded-[12px] bg-white border border-black/[0.08] flex items-center gap-2 text-[14px] text-primary hover:border-black/[0.15] transition-all">
          <i class="fas fa-filter text-[11px] text-[#86868b]/60"></i>
          <span>\u7b5b\u9009</span>
        </button>
        <!-- Sort -->
        <button x-on:click="cycleSortMode()" class="h-[40px] px-3.5 rounded-[12px] bg-white border border-black/[0.08] flex items-center gap-2 text-[14px] text-primary hover:border-black/[0.15] transition-all">
          <span x-text="sortLabel">\u6700\u8fd1\u6dfb\u52a0</span>
          <i class="fas fa-arrow-down-short-wide text-[11px] text-[#86868b]/50"></i>
        </button>
        <!-- Add job (black button) -->
        <button x-on:click="showAddDrawer = true" class="h-[40px] px-5 rounded-[12px] bg-[#1E1E1A] text-white flex items-center gap-2 text-[14px] font-medium hover:bg-[#333] transition-all">
          <i class="fas fa-plus text-[11px]"></i>
          <span>\u65b0\u589e\u5c97\u4f4d</span>
        </button>
      </div>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- ERROR MESSAGE                                 -->
  <!-- ============================================ -->
  <template x-if="errorMessage && !loading">
    <div class="mx-8 mb-4 px-4 py-3 rounded-[14px] bg-red-50 border border-red-200 flex items-center gap-2.5">
      <i class="fas fa-exclamation-triangle text-red-500 text-[13px]"></i>
      <span class="text-[13px] text-red-700" x-text="errorMessage"></span>
      <button x-on:click="loadJobsFromAPI()" class="ml-auto text-[12px] text-red-600 hover:underline">\u91cd\u8bd5</button>
    </div>
  </template>

  <!-- ============================================ -->
  <!-- DUAL-PANE MAIN AREA                           -->
  <!-- ============================================ -->
  <div class="px-8 pb-8 flex gap-6" style="height: calc(100vh - 72px - 120px);">

    <!-- ========== LEFT PANE: Job List ========== -->
    <div class="w-[380px] flex-shrink-0 bg-white rounded-[20px] border border-black/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden">

      <!-- List header -->
      <div class="h-[52px] px-5 flex items-center justify-between flex-shrink-0 border-b border-black/[0.04]">
        <div class="flex items-center gap-2.5">
          <span class="text-[17px] font-bold text-[#1E1E1A]">\u5c97\u4f4d\u5217\u8868</span>
          <span class="text-[13px] text-[#86868b]" x-text="filteredJobs.length + ' \u4e2a\u5c97\u4f4d'"></span>
        </div>
        <div class="flex items-center gap-1">
          <button class="w-8 h-8 rounded-[10px] flex items-center justify-center text-[#86868b]/60 hover:text-[#86868b] hover:bg-black/[0.04] transition-all" title="\u7f51\u683c\u89c6\u56fe">
            <i class="fas fa-grid-2 text-[12px]"></i>
          </button>
          <button class="w-8 h-8 rounded-[10px] flex items-center justify-center text-[#1E1E1A] bg-black/[0.04] transition-all" title="\u5217\u8868\u89c6\u56fe">
            <i class="fas fa-bars text-[12px]"></i>
          </button>
          <button class="w-8 h-8 rounded-[10px] flex items-center justify-center text-[#86868b]/60 hover:text-[#86868b] hover:bg-black/[0.04] transition-all" title="\u66f4\u591a">
            <i class="fas fa-ellipsis text-[12px]"></i>
          </button>
        </div>
      </div>

      <!-- Status filter tabs -->
      <div class="px-5 py-3 flex items-center gap-1.5 flex-shrink-0 border-b border-black/[0.03]">
        <template x-for="(f, fi) in filterOptions" x-bind:key="fi">
          <button x-on:click="activeFilter = f.value; filterJobs()" x-bind:class="activeFilter === f.value ? 'bg-[#1E1E1A] text-white font-medium' : 'bg-black/[0.04] text-[#86868b] hover:bg-black/[0.06]'" class="h-[30px] px-3 rounded-full text-[12px] whitespace-nowrap transition-all flex items-center gap-1.5">
            <span x-text="f.label"></span>
            <span x-show="f.count !== undefined" class="text-[11px] opacity-70" x-text="f.count"></span>
          </button>
        </template>
      </div>

      <!-- Job cards (scrollable) -->
      <div class="flex-1 overflow-y-auto px-4 pb-3 space-y-2.5 pt-3" id="job-list-scroll">
        <!-- Empty state -->
        <template x-if="filteredJobs.length === 0 && !loading">
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <i class="fas fa-compass text-accent text-[22px]"></i>
            </div>
            <div class="text-[18px] font-semibold text-primary mb-2">\u8fd8\u6ca1\u6709\u5c97\u4f4d</div>
            <div class="text-[13px] text-[#86868b] mb-5">\u5148\u7c98\u8d34\u4e00\u4e2a JD \u6216\u8f93\u5165\u94fe\u63a5\u5f00\u59cb\u3002</div>
            <div class="flex flex-wrap justify-center gap-2.5">
              <button x-on:click="showAddDrawer = true; addTab = 'text'" class="h-10 px-4 rounded-[14px] bg-white border border-black/[0.08] text-[13px] text-primary font-medium hover:border-black/[0.15] transition-all">\u7c98\u8d34\u6587\u672c</button>
              <button x-on:click="showAddDrawer = true; addTab = 'url'" class="h-10 px-4 rounded-[14px] bg-white border border-black/[0.08] text-[13px] text-primary font-medium hover:border-black/[0.15] transition-all">\u8f93\u5165 URL</button>
              <button x-on:click="showAddDrawer = true; addTab = 'screenshot'" class="h-10 px-4 rounded-[14px] bg-white border border-black/[0.08] text-[13px] text-primary font-medium hover:border-black/[0.15] transition-all">\u4e0a\u4f20\u622a\u56fe</button>
            </div>
          </div>
        </template>

        <!-- Loading skeleton -->
        <template x-if="loading">
          <div class="space-y-3">
            <template x-for="i in 5" x-bind:key="'sk'+i">
              <div class="h-[140px] rounded-[16px] p-4">
                <div class="skeleton h-4 w-3/5 mb-3"></div>
                <div class="skeleton h-3 w-2/3 mb-3"></div>
                <div class="skeleton h-3 w-1/2 mb-3"></div>
                <div class="flex gap-2"><div class="skeleton h-6 w-12 rounded-full"></div><div class="skeleton h-6 w-14 rounded-full"></div></div>
              </div>
            </template>
          </div>
        </template>

        <!-- Job cards -->
        <template x-for="(job, idx) in filteredJobs" x-bind:key="job.id || idx">
          <div x-on:click="selectJob(job)" x-bind:class="selectedJob && selectedJob.id === job.id ? 'border-[#1E1E1A]/20 bg-[#FAFAF8] shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'border-black/[0.06] hover:border-black/[0.1] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]'" class="relative rounded-[16px] border p-4 cursor-pointer transition-all group">
            <!-- Row 1: Title + badges + actions -->
            <div class="flex items-start justify-between gap-2 mb-1.5">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <span class="text-[15px] font-bold text-[#1E1E1A] leading-[20px] truncate" x-text="job.title || '\u672a\u547d\u540d\u5c97\u4f4d'"></span>
                <span x-show="job.matchScore >= 80" class="flex-shrink-0 h-[20px] px-2 rounded-full bg-orange-500/10 text-orange-600 text-[11px] font-semibold flex items-center">\u63a8\u8350</span>
                <span x-show="job.isNew" class="flex-shrink-0 h-[20px] px-2 rounded-full bg-blue-500/10 text-blue-600 text-[11px] font-medium flex items-center">\u65b0</span>
                <span x-show="job.status === 'processing'" class="flex-shrink-0 h-[20px] px-2 rounded-full bg-blue-500/10 text-blue-600 text-[11px] font-medium flex items-center animate-pulse">\u89e3\u6790\u4e2d</span>
                <span x-show="job.status === 'error'" class="flex-shrink-0 h-[20px] px-2 rounded-full bg-red-500/10 text-red-600 text-[11px] font-medium flex items-center">\u5931\u8d25</span>
              </div>
              <div class="flex items-center gap-0.5 flex-shrink-0">
                <button x-on:click.stop="toggleFavorite(job)" class="w-7 h-7 rounded-[8px] flex items-center justify-center transition-all" x-bind:class="job.favorited ? 'text-red-400' : 'text-[#86868b]/30 hover:text-[#86868b]/60 hover:bg-black/[0.04]'" title="\u6536\u85cf">
                  <i x-bind:class="job.favorited ? 'fas' : 'far'" class="fa-heart text-[12px]"></i>
                </button>
                <button x-on:click.stop="showJobMenu(job, $event)" class="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#86868b]/30 hover:text-[#86868b]/60 hover:bg-black/[0.04] transition-all" title="\u66f4\u591a">
                  <i class="fas fa-ellipsis-vertical text-[12px]"></i>
                </button>
              </div>
            </div>
            <!-- Row 2: Company + city + salary -->
            <div class="text-[13px] text-[#86868b] mb-2 truncate" x-text="[job.company, job.location, job.salary].filter(Boolean).join(' \u00b7 ')"></div>
            <!-- Row 3: Source + time + status -->
            <div class="flex items-center gap-2 mb-2.5">
              <span class="text-[12px] text-[#86868b]/70" x-text="[sourceLabel(job.source), job.created_at ? formatTime(job.created_at) : ''].filter(Boolean).join(' \u00b7 ')"></span>
              <span x-show="job.applicationStatus" class="h-[20px] px-2 rounded-full text-[11px] font-medium flex items-center" x-bind:class="appStatusClass(job.applicationStatus)" x-text="appStatusLabel(job.applicationStatus)"></span>
            </div>
            <!-- Row 4: Tags -->
            <div class="flex flex-wrap gap-1.5">
              <template x-for="(tag, ti) in (job.tags || []).slice(0, 4)" x-bind:key="ti">
                <span class="h-[24px] px-2.5 rounded-full bg-black/[0.04] text-[11px] text-[#86868b] flex items-center font-medium" x-text="tag"></span>
              </template>
            </div>
            <!-- Selected indicator (left bar) -->
            <div x-show="selectedJob && selectedJob.id === job.id" class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#1E1E1A] rounded-r-full"></div>
          </div>
        </template>
      </div>
    </div>

    <!-- ========== RIGHT PANE: Job Detail ========== -->
    <div class="flex-1 bg-white rounded-[20px] border border-black/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden">

      <!-- No selection state -->
      <template x-if="!selectedJob">
        <div class="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div class="w-16 h-16 rounded-full bg-black/[0.04] flex items-center justify-center mb-4">
            <i class="fas fa-hand-pointer text-[24px] text-[#86868b]/40"></i>
          </div>
          <div class="text-[18px] font-semibold text-primary mb-2">\u9009\u62e9\u4e00\u4e2a\u5c97\u4f4d\u67e5\u770b\u8be6\u60c5</div>
          <div class="text-[14px] text-[#86868b]">\u5de6\u4fa7\u70b9\u51fb\u5c97\u4f4d\u5361\u7247\uff0c\u8fd9\u91cc\u5c06\u5c55\u793a\u5b8c\u6574\u5206\u6790</div>
        </div>
      </template>

      <!-- Detail content -->
      <template x-if="selectedJob">
        <div class="flex-1 overflow-y-auto">

          <!-- Info header -->
          <div class="px-7 pt-7 pb-5 border-b border-black/[0.04]">
            <!-- Title -->
            <h2 class="text-[26px] font-bold text-[#1E1E1A] leading-[34px] tracking-tight mb-2" x-text="selectedJob.title || '\u672a\u547d\u540d\u5c97\u4f4d'"></h2>
            <!-- Meta row -->
            <div class="text-[13px] text-[#86868b] mb-5 flex items-center gap-1.5 flex-wrap">
              <span x-show="selectedJob.company" x-text="selectedJob.company" class="font-medium text-[#1E1E1A]/70"></span>
              <template x-if="selectedJob.location"><span>\u00b7 <span x-text="selectedJob.location"></span></span></template>
              <template x-if="selectedJob.salary"><span>\u00b7 <span x-text="selectedJob.salary"></span></span></template>
              <template x-if="selectedJob.source"><span>\u00b7 <span x-text="sourceLabel(selectedJob.source)"></span></span></template>
              <template x-if="selectedJob.created_at"><span>\u00b7 <span x-text="formatTime(selectedJob.created_at) + '\u6dfb\u52a0'"></span></span></template>
            </div>
            <!-- Action buttons row (Figma style: 3 buttons) -->
            <div class="flex items-center gap-3 mb-3">
              <button x-on:click="addToApplicationList(selectedJob)" x-bind:disabled="addingToApplication" class="h-[44px] px-5 rounded-[14px] bg-[#1E1E1A] text-white text-[14px] font-medium hover:bg-[#333] transition-all disabled:opacity-50 flex items-center gap-2">
                <i class="far fa-clock text-[12px]"></i>
                <span x-text="addingToApplication ? '\u52a0\u5165\u4e2d...' : '\u52a0\u5165\u6295\u9012\u6e05\u5355'">\u52a0\u5165\u6295\u9012\u6e05\u5355</span>
              </button>
              <a x-bind:href="selectedJob.id ? '/job/' + selectedJob.id + '/optimize' : '#'" class="h-[44px] px-5 rounded-[14px] bg-white border border-black/[0.1] text-[14px] text-[#1E1E1A] font-medium hover:border-black/[0.2] transition-all flex items-center gap-2">
                <i class="far fa-file-alt text-[12px]"></i>
                <span>\u751f\u6210\u5b9a\u5411\u7b80\u5386</span>
              </a>
              <a x-bind:href="selectedJob.id ? '/job/' + selectedJob.id + '/interview' : '#'" class="h-[44px] px-5 rounded-[14px] bg-white border border-black/[0.1] text-[14px] text-[#1E1E1A] font-medium hover:border-black/[0.2] transition-all flex items-center gap-2">
                <i class="far fa-comment text-[12px]"></i>
                <span>\u5f00\u59cb\u9762\u8bd5\u51c6\u5907</span>
              </a>
            </div>
            <!-- Quick links -->
            <div class="flex items-center gap-4">
              <a x-bind:href="selectedJob.id ? '/job/' + selectedJob.id + '/match' : '#'" class="text-[13px] text-accent hover:underline font-medium">\u5339\u914d\u8bca\u65ad</a>
              <a x-bind:href="selectedJob.id ? '/job/' + selectedJob.id + '/optimize' : '#'" class="text-[13px] text-accent hover:underline font-medium">\u7b80\u5386\u4f18\u5316</a>
              <span class="text-[13px] text-[#86868b] cursor-pointer hover:text-[#1E1E1A] transition-colors">\u66f4\u591a</span>
            </div>
          </div>

          <!-- 4 Conclusion cards (2x2) -->
          <div class="px-7 pt-5 pb-4">
            <div class="grid grid-cols-2 gap-3.5">
              <!-- Recommendation card - green tinted -->
              <div class="rounded-[16px] p-4 border" x-bind:class="selectedJob.conclusion?.recommendation === '\u63a8\u8350' || selectedJob.conclusion?.recommendation === '\u975e\u5e38\u63a8\u8350' ? 'bg-emerald-50/60 border-emerald-200/40' : 'bg-[#FAFAF8] border-black/[0.04]'">
                <div class="text-[12px] text-[#86868b] mb-1.5">\u6295\u9012\u5efa\u8bae</div>
                <div class="text-[20px] font-bold mb-1" x-bind:class="selectedJob.conclusion?.recommendation === '\u63a8\u8350' || selectedJob.conclusion?.recommendation === '\u975e\u5e38\u63a8\u8350' ? 'text-emerald-700' : 'text-[#1E1E1A]'" x-text="selectedJob.conclusion?.recommendation || '\u5f85\u5206\u6790'">\u63a8\u8350</div>
                <div class="text-[12px] text-[#86868b] leading-relaxed" x-text="selectedJob.conclusion?.recReason || '\u5b8c\u6210\u89e3\u6790\u540e\u5c06\u751f\u6210\u6295\u9012\u5efa\u8bae\u3002'"></div>
              </div>
              <!-- Match score card -->
              <div class="rounded-[16px] bg-[#FAFAF8] p-4 border border-black/[0.04]">
                <div class="text-[12px] text-[#86868b] mb-1.5">\u5f53\u524d\u5339\u914d\u5ea6</div>
                <div class="text-[20px] font-bold text-[#1E1E1A] mb-1" x-text="(selectedJob.matchScore || '--') + ' / ' + (selectedJob.matchGrade || '-')">-- / -</div>
                <div class="text-[12px] text-[#86868b] leading-relaxed" x-text="selectedJob.conclusion?.matchReason || '\u4e0a\u4f20\u7b80\u5386\u540e\u53ef\u751f\u6210\u5339\u914d\u5ea6\u3002'"></div>
              </div>
              <!-- Strength card -->
              <div class="rounded-[16px] bg-[#FAFAF8] p-4 border border-black/[0.04]">
                <div class="text-[12px] text-[#86868b] mb-1.5">\u6700\u5927\u4f18\u52bf</div>
                <div class="text-[20px] font-bold text-[#1E1E1A] mb-1" x-text="selectedJob.conclusion?.strength || '\u5f85\u5206\u6790'"></div>
                <div class="text-[12px] text-[#86868b] leading-relaxed" x-text="selectedJob.conclusion?.strengthDetail || ''"></div>
              </div>
              <!-- Risk card -->
              <div class="rounded-[16px] bg-[#FAFAF8] p-4 border border-black/[0.04]">
                <div class="text-[12px] text-[#86868b] mb-1.5">\u6700\u5927\u98ce\u9669</div>
                <div class="text-[20px] font-bold text-[#1E1E1A] mb-1" x-text="selectedJob.conclusion?.risk || '\u5f85\u5206\u6790'"></div>
                <div class="text-[12px] text-[#86868b] leading-relaxed" x-text="selectedJob.conclusion?.riskDetail || ''"></div>
              </div>
            </div>
          </div>

          <!-- Tab navigation -->
          <div class="px-7 flex items-center gap-1 border-b border-black/[0.04]">
            <template x-for="(tab, ti) in tabs" x-bind:key="ti">
              <button x-on:click="activeTab = tab.id" x-bind:class="activeTab === tab.id ? 'text-[#1E1E1A] font-semibold border-b-2 border-[#1E1E1A]' : 'text-[#86868b] hover:text-[#1E1E1A]'" class="h-[42px] px-3.5 text-[14px] transition-all" x-text="tab.label"></button>
            </template>
          </div>

          <!-- Tab content -->
          <div class="px-7 py-6">

            <!-- Overview tab -->
            <template x-if="activeTab === 'overview'">
              <div class="space-y-5 animate-gentle-float">
                <!-- One-line summary -->
                <div>
                  <div class="text-[15px] font-bold text-[#1E1E1A] mb-2.5">\u4e00\u53e5\u8bdd\u603b\u7ed3</div>
                  <div class="rounded-[14px] bg-[#FAFAF8] p-5 border border-black/[0.04]">
                    <p class="text-[15px] text-[#1E1E1A]/80 leading-[24px]" x-text="selectedJob.analysis?.summary || selectedJob.analysis?.one_liner || '\u89e3\u6790\u5b8c\u6210\u540e\u5c06\u751f\u6210\u5c97\u4f4d\u6982\u8ff0\u3002'"></p>
                  </div>
                </div>

                <!-- Basic judgment 2x2 -->
                <div>
                  <div class="text-[15px] font-bold text-[#1E1E1A] mb-2.5">\u5c97\u4f4d\u57fa\u7840\u5224\u65ad</div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="rounded-[12px] bg-white border border-black/[0.06] p-3.5">
                      <div class="text-[11px] text-[#86868b] mb-1">\u4ea7\u54c1\u7c7b\u578b</div>
                      <div class="text-[15px] font-bold text-[#1E1E1A]" x-text="selectedJob.analysis?.product_type || selectedJob.analysis?.productType || '\u5f85\u5206\u6790'"></div>
                    </div>
                    <div class="rounded-[12px] bg-white border border-black/[0.06] p-3.5">
                      <div class="text-[11px] text-[#86868b] mb-1">\u4e1a\u52a1\u9886\u57df</div>
                      <div class="text-[15px] font-bold text-[#1E1E1A]" x-text="selectedJob.analysis?.biz_domain || selectedJob.analysis?.bizDomain || '\u5f85\u5206\u6790'"></div>
                    </div>
                    <div class="rounded-[12px] bg-white border border-black/[0.06] p-3.5">
                      <div class="text-[11px] text-[#86868b] mb-1">\u56e2\u961f\u9636\u6bb5</div>
                      <div class="text-[15px] font-bold text-[#1E1E1A]" x-text="selectedJob.analysis?.team_stage || selectedJob.analysis?.teamStage || '\u5f85\u5206\u6790'"></div>
                    </div>
                    <div class="rounded-[12px] bg-white border border-black/[0.06] p-3.5">
                      <div class="text-[11px] text-[#86868b] mb-1">\u6280\u672f\u6808\u5bc6\u5ea6</div>
                      <div class="text-[15px] font-bold text-[#1E1E1A]" x-text="selectedJob.analysis?.tech_density || selectedJob.analysis?.techDensity || '\u5f85\u5206\u6790'"></div>
                    </div>
                  </div>
                </div>

                <!-- Suitable for -->
                <div>
                  <div class="text-[15px] font-bold text-[#1E1E1A] mb-2.5">\u66f4\u9002\u5408\u4ec0\u4e48\u80cc\u666f\u7684\u4eba</div>
                  <div class="space-y-2.5">
                    <template x-for="(item, si) in (selectedJob.analysis?.suitability || selectedJob.analysis?.suitable_for || ['\u5b8c\u6210\u5c97\u4f4d\u5206\u6790\u540e\u5c06\u751f\u6210\u80cc\u666f\u5339\u914d\u5efa\u8bae'])" x-bind:key="si">
                      <div class="flex items-start gap-2.5 p-3.5 rounded-[12px] bg-[#FAFAF8] border border-black/[0.04]">
                        <i x-bind:class="(typeof item === 'string' && item.startsWith('\u4e0d')) ? 'fas fa-times-circle text-red-400' : 'fas fa-check-circle text-emerald-500'" class="text-[13px] mt-0.5 flex-shrink-0"></i>
                        <span class="text-[14px] text-[#1E1E1A]/80" x-text="typeof item === 'string' ? item : item.text || item"></span>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Next steps -->
                <div>
                  <div class="text-[15px] font-bold text-[#1E1E1A] mb-2.5">\u5efa\u8bae\u4e0b\u4e00\u6b65</div>
                  <div class="flex flex-wrap gap-2.5">
                    <a x-bind:href="selectedJob.id ? '/job/' + selectedJob.id + '/optimize' : '#'" class="h-10 px-4 rounded-[12px] bg-white border border-black/[0.08] text-[13px] text-primary font-medium hover:border-black/[0.15] transition-all flex items-center gap-1.5">
                      <i class="fas fa-bullseye text-[10px] text-accent/60"></i>\u53bb\u751f\u6210\u5b9a\u5411\u7b80\u5386
                    </a>
                    <a x-bind:href="selectedJob.id ? '/job/' + selectedJob.id + '/match' : '#'" class="h-10 px-4 rounded-[12px] bg-white border border-black/[0.08] text-[13px] text-primary font-medium hover:border-black/[0.15] transition-all flex items-center gap-1.5">
                      <i class="fas fa-wand-magic-sparkles text-[10px] text-emerald-500/60"></i>\u53bb\u505a\u5339\u914d\u8bca\u65ad
                    </a>
                    <a x-bind:href="selectedJob.id ? '/job/' + selectedJob.id + '/interview' : '#'" class="h-10 px-4 rounded-[12px] bg-white border border-black/[0.08] text-[13px] text-primary font-medium hover:border-black/[0.15] transition-all flex items-center gap-1.5">
                      <i class="fas fa-comments text-[10px] text-purple-500/60"></i>\u76f4\u63a5\u5f00\u59cb\u9762\u8bd5\u51c6\u5907
                    </a>
                  </div>
                </div>
              </div>
            </template>

            <!-- JD Parse tab -->
            <template x-if="activeTab === 'jd'">
              <div class="flex gap-5 animate-gentle-float">
                <!-- Left: structured info -->
                <div class="w-[240px] flex-shrink-0">
                  <div class="text-[15px] font-bold text-[#1E1E1A] mb-2.5">\u5c97\u4f4d\u4fe1\u606f</div>
                  <div class="rounded-[14px] bg-[#FAFAF8] p-4 border border-black/[0.04] space-y-3">
                    <template x-for="(field, fi) in jdFields" x-bind:key="fi">
                      <div>
                        <div class="text-[11px] text-[#86868b] mb-0.5" x-text="field.label"></div>
                        <div class="text-[13px] text-[#1E1E1A] font-medium" x-text="field.value || '-'"></div>
                      </div>
                    </template>
                  </div>
                </div>
                <!-- Right: A/B analysis -->
                <div class="flex-1">
                  <div class="text-[15px] font-bold text-[#1E1E1A] mb-2.5">\u5c97\u4f4d\u901f\u89c8</div>
                  <div class="grid grid-cols-2 gap-3 mb-5">
                    <div class="h-[68px] rounded-[12px] bg-[#FAFAF8] border border-black/[0.04] p-3">
                      <div class="text-[11px] text-[#86868b]">\u6280\u672f\u6808\u5bc6\u5ea6</div>
                      <div class="text-[15px] font-bold text-[#1E1E1A] mt-1" x-text="selectedJob.analysis?.tech_density || selectedJob.analysis?.techDensity || '\u5f85\u5206\u6790'"></div>
                    </div>
                    <div class="h-[68px] rounded-[12px] bg-[#FAFAF8] border border-black/[0.04] p-3">
                      <div class="text-[11px] text-[#86868b]">\u4ea7\u54c1\u7c7b\u578b</div>
                      <div class="text-[15px] font-bold text-[#1E1E1A] mt-1" x-text="selectedJob.analysis?.product_type || selectedJob.analysis?.productType || '\u5f85\u5206\u6790'"></div>
                    </div>
                    <div class="h-[68px] rounded-[12px] bg-[#FAFAF8] border border-black/[0.04] p-3">
                      <div class="text-[11px] text-[#86868b]">\u4e1a\u52a1\u9886\u57df</div>
                      <div class="text-[15px] font-bold text-[#1E1E1A] mt-1" x-text="selectedJob.analysis?.biz_domain || selectedJob.analysis?.bizDomain || '\u5f85\u5206\u6790'"></div>
                    </div>
                    <div class="h-[68px] rounded-[12px] bg-[#FAFAF8] border border-black/[0.04] p-3">
                      <div class="text-[11px] text-[#86868b]">\u56e2\u961f\u9636\u6bb5</div>
                      <div class="text-[15px] font-bold text-[#1E1E1A] mt-1" x-text="selectedJob.analysis?.team_stage || selectedJob.analysis?.teamStage || '\u5f85\u5206\u6790'"></div>
                    </div>
                  </div>
                  <div class="text-[15px] font-bold text-[#1E1E1A] mb-2.5">\u6df1\u5ea6\u62c6\u89e3</div>
                  <div class="space-y-2">
                    <template x-for="(panel, pi) in deepPanels" x-bind:key="pi">
                      <div class="rounded-[12px] border border-black/[0.04] overflow-hidden">
                        <button x-on:click="panel.open = !panel.open" class="w-full px-4 py-3 flex items-center justify-between hover:bg-black/[0.02] transition-colors">
                          <span class="text-[13px] font-semibold text-[#1E1E1A]" x-text="panel.title"></span>
                          <i x-bind:class="panel.open ? 'rotate-90' : ''" class="fas fa-chevron-right text-[9px] text-[#86868b]/40 transition-transform duration-200"></i>
                        </button>
                        <div x-show="panel.open" x-transition class="px-4 pb-3">
                          <p class="text-[13px] text-[#86868b] leading-relaxed" x-text="panel.content"></p>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </template>

            <!-- Capability Model tab -->
            <template x-if="activeTab === 'capability'">
              <div class="flex gap-6 animate-gentle-float">
                <div class="w-[280px] h-[280px] rounded-[18px] bg-[#FAFAF8] border border-black/[0.04] flex-shrink-0 flex items-center justify-center">
                  <div id="opp-radar-chart" class="w-full h-full"></div>
                </div>
                <div class="flex-1 space-y-2.5">
                  <template x-for="(dim, di) in capabilityDims" x-bind:key="di">
                    <div class="h-[64px] rounded-[12px] bg-[#FAFAF8] border border-black/[0.04] p-3 flex items-center gap-3">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="text-[13px] font-bold text-[#1E1E1A]" x-text="dim.name"></span>
                          <span class="text-[11px] text-accent font-medium" x-text="'\u6743\u91cd: ' + dim.weight"></span>
                        </div>
                        <div class="text-[12px] text-[#86868b] truncate" x-text="dim.evidence || 'JD \u4e2d\u672a\u660e\u786e\u63d0\u53ca'"></div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </template>

            <!-- Match Diagnosis tab -->
            <template x-if="activeTab === 'match'">
              <div class="space-y-5 animate-gentle-float">
                <div class="rounded-[16px] bg-[#FAFAF8] p-5 border border-black/[0.04] flex items-center gap-6">
                  <div class="text-center">
                    <div class="text-[36px] font-bold text-accent" x-text="selectedJob.matchGrade || '-'"></div>
                    <div class="text-[14px] text-[#86868b]">\u5339\u914d\u7b49\u7ea7</div>
                  </div>
                  <div class="text-center">
                    <div class="text-[36px] font-bold text-[#1E1E1A]" x-text="selectedJob.matchScore || '--'"></div>
                    <div class="text-[14px] text-[#86868b]">\u767e\u5206\u5236</div>
                  </div>
                  <div class="flex-1 text-[14px] text-[#86868b] pl-4 border-l border-black/[0.06]">
                    <span x-text="selectedJob.conclusion?.recReason || '\u4e0a\u4f20\u7b80\u5386\u540e\u53ef\u751f\u6210\u5339\u914d\u5ea6\u5206\u6790'"></span>
                  </div>
                </div>
                <div class="text-center py-6">
                  <a x-bind:href="selectedJob.id ? '/job/' + selectedJob.id + '/match' : '#'" class="inline-flex items-center gap-2 h-10 px-5 rounded-[14px] bg-[#1E1E1A] text-white text-[13px] font-medium hover:bg-[#333] transition-all">
                    <i class="fas fa-stethoscope text-[11px]"></i>
                    \u53bb\u505a\u5339\u914d\u8bca\u65ad
                  </a>
                </div>
              </div>
            </template>

            <!-- Company Analysis tab -->
            <template x-if="activeTab === 'company'">
              <div class="space-y-3.5 animate-gentle-float">
                <template x-for="(block, bi) in companyBlocks" x-bind:key="bi">
                  <div class="rounded-[14px] bg-[#FAFAF8] p-4 border border-black/[0.04]">
                    <div class="text-[14px] font-bold text-[#1E1E1A] mb-2" x-text="block.title"></div>
                    <div class="text-[13px] text-[#86868b] leading-relaxed" x-text="block.content"></div>
                  </div>
                </template>
              </div>
            </template>

            <!-- Application Record tab -->
            <template x-if="activeTab === 'application'">
              <div class="animate-gentle-float">
                <!-- Has application -->
                <template x-if="applicationData">
                  <div>
                    <!-- Status flow -->
                    <div class="flex items-center justify-between h-[72px] mb-5">
                      <template x-for="(status, si) in applicationStatuses" x-bind:key="si">
                        <div class="flex items-center gap-2">
                          <div class="flex flex-col items-center">
                            <div x-bind:class="status.active ? 'bg-[#1E1E1A] text-white' : status.done ? 'bg-emerald-500 text-white' : 'bg-black/[0.06] text-[#86868b]'" class="w-8 h-8 rounded-full flex items-center justify-center text-[12px]">
                              <i x-show="status.done && !status.active" class="fas fa-check text-[10px]"></i>
                              <span x-show="!status.done || status.active" x-text="si + 1"></span>
                            </div>
                            <span class="text-[11px] text-[#86868b] mt-1" x-text="status.label"></span>
                          </div>
                          <div x-show="si < applicationStatuses.length - 1" class="w-8 h-[2px]" x-bind:class="status.done ? 'bg-emerald-500' : 'bg-black/[0.08]'"></div>
                        </div>
                      </template>
                    </div>
                    <!-- Application info -->
                    <div class="rounded-[14px] bg-[#FAFAF8] p-4 border border-black/[0.04] mb-4">
                      <div class="text-[13px] text-[#86868b]">\u6295\u9012\u65f6\u95f4\uff1a<span x-text="applicationData.applied_at ? formatTime(applicationData.applied_at) : '-'"></span></div>
                      <div class="text-[13px] text-[#86868b] mt-1">\u6295\u9012\u6e20\u9053\uff1a<span x-text="applicationData.source || '-'"></span></div>
                      <div x-show="applicationData.notes" class="text-[13px] text-[#86868b] mt-1">\u5907\u6ce8\uff1a<span x-text="applicationData.notes"></span></div>
                    </div>
                  </div>
                </template>
                <!-- No application -->
                <template x-if="!applicationData">
                  <div class="text-center py-12">
                    <div class="w-14 h-14 rounded-full bg-black/[0.04] flex items-center justify-center mx-auto mb-4">
                      <i class="fas fa-paper-plane text-[20px] text-[#86868b]/40"></i>
                    </div>
                    <div class="text-[16px] font-semibold text-primary mb-2">\u6682\u65e0\u6295\u9012\u8bb0\u5f55</div>
                    <div class="text-[13px] text-[#86868b] mb-5">\u5c06\u5c97\u4f4d\u52a0\u5165\u6295\u9012\u6e05\u5355\u5f00\u59cb\u8ddf\u8e2a</div>
                    <button x-on:click="addToApplicationList(selectedJob)" class="h-10 px-5 rounded-[14px] bg-[#1E1E1A] text-white text-[13px] font-medium hover:bg-[#333] transition-all">\u52a0\u5165\u6295\u9012\u6e05\u5355</button>
                  </div>
                </template>
              </div>
            </template>

          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- DELETE CONFIRMATION DIALOG                    -->
  <!-- ============================================ -->
  <div x-show="showDeleteConfirm" x-transition.opacity class="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center" style="display:none;">
    <div x-show="showDeleteConfirm" x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 scale-95" x-transition:enter-end="opacity-100 scale-100" class="bg-white rounded-[20px] shadow-apple-lg p-6 w-[400px]">
      <div class="text-[18px] font-bold text-[#1E1E1A] mb-2">\u786e\u8ba4\u5220\u9664</div>
      <div class="text-[14px] text-[#86868b] mb-5">\u786e\u5b9a\u8981\u5220\u9664\u300c<span x-text="deleteTargetJob?.title || ''" class="font-medium text-[#1E1E1A]"></span>\u300d\u5417\uff1f\u5220\u9664\u540e\u65e0\u6cd5\u6062\u590d\u3002</div>
      <div class="flex justify-end gap-3">
        <button x-on:click="showDeleteConfirm = false; deleteTargetJob = null" class="h-[40px] px-5 rounded-[14px] bg-black/[0.04] text-[14px] text-primary font-medium hover:bg-black/[0.08] transition-all">\u53d6\u6d88</button>
        <button x-on:click="deleteJob()" class="h-[40px] px-5 rounded-[14px] bg-red-500 text-white text-[14px] font-medium hover:bg-red-600 transition-all">\u5220\u9664</button>
      </div>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- ADD JOB DRAWER (520px, right slide)           -->
  <!-- ============================================ -->
  <div x-show="showAddDrawer" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="translate-x-full" x-transition:enter-end="translate-x-0" x-transition:leave="transition ease-in duration-200" x-transition:leave-start="translate-x-0" x-transition:leave-end="translate-x-full" class="fixed inset-y-0 right-0 w-[520px] bg-white shadow-apple-lg z-50 flex flex-col">
    <!-- Drawer header -->
    <div class="h-[76px] px-6 flex items-center justify-between border-b border-black/[0.04] flex-shrink-0">
      <div>
        <div class="text-[18px] font-bold text-[#1E1E1A]">\u65b0\u589e\u5c97\u4f4d</div>
        <div class="text-[13px] text-[#86868b] mt-0.5">\u7c98\u8d34\u6587\u672c\u3001\u4e0a\u4f20\u622a\u56fe\u6216\u8f93\u5165\u5c97\u4f4d\u94fe\u63a5</div>
      </div>
      <button x-on:click="showAddDrawer = false" class="w-8 h-8 rounded-lg flex items-center justify-center text-[#86868b] hover:text-[#1E1E1A] hover:bg-black/[0.04] transition-all">
        <i class="fas fa-times text-[14px]"></i>
      </button>
    </div>
    <!-- Input mode tabs -->
    <div class="px-6 pt-4 flex items-center gap-2">
      <button x-on:click="addTab = 'text'" x-bind:class="addTab === 'text' ? 'bg-[#1E1E1A] text-white' : 'text-[#86868b] bg-black/[0.04] hover:bg-black/[0.06]'" class="h-[34px] px-4 rounded-full text-[13px] font-medium transition-all">\u7c98\u8d34\u6587\u672c</button>
      <button x-on:click="addTab = 'screenshot'" x-bind:class="addTab === 'screenshot' ? 'bg-[#1E1E1A] text-white' : 'text-[#86868b] bg-black/[0.04] hover:bg-black/[0.06]'" class="h-[34px] px-4 rounded-full text-[13px] font-medium transition-all">\u4e0a\u4f20\u622a\u56fe</button>
      <button x-on:click="addTab = 'url'" x-bind:class="addTab === 'url' ? 'bg-[#1E1E1A] text-white' : 'text-[#86868b] bg-black/[0.04] hover:bg-black/[0.06]'" class="h-[34px] px-4 rounded-full text-[13px] font-medium transition-all">\u8f93\u5165 URL</button>
    </div>
    <!-- Tab content -->
    <div class="flex-1 px-6 py-4 overflow-y-auto">
      <!-- Text mode -->
      <template x-if="addTab === 'text'">
        <div>
          <input type="text" x-model="addJobTitle" placeholder="\u5c97\u4f4d\u6807\u9898\uff08\u53ef\u9009\uff09" class="w-full h-11 px-4 mb-3 rounded-[14px] bg-black/[0.03] border border-black/[0.06] text-[14px] focus:outline-none focus:border-black/[0.15] transition-all" />
          <textarea x-model="addJobText" placeholder="\u7c98\u8d34\u5c97\u4f4d\u63cf\u8ff0 (JD) \u5185\u5bb9..." class="w-full min-h-[260px] p-4 rounded-[14px] bg-black/[0.03] border border-black/[0.06] text-[14px] leading-relaxed focus:outline-none focus:border-black/[0.15] transition-all resize-none"></textarea>
        </div>
      </template>
      <!-- Screenshot mode -->
      <template x-if="addTab === 'screenshot'">
        <div class="h-[220px] rounded-[18px] border-2 border-dashed border-black/[0.1] flex flex-col items-center justify-center text-center hover:border-black/[0.2] transition-all cursor-pointer">
          <i class="fas fa-cloud-arrow-up text-[28px] text-[#86868b]/30 mb-3"></i>
          <div class="text-[14px] text-primary font-medium">\u62d6\u62fd\u6216\u70b9\u51fb\u4e0a\u4f20\u622a\u56fe</div>
          <div class="text-[12px] text-[#86868b] mt-1">\u652f\u6301 Ctrl+V \u76f4\u63a5\u7c98\u8d34\u622a\u56fe</div>
        </div>
      </template>
      <!-- URL mode -->
      <template x-if="addTab === 'url'">
        <div>
          <input type="url" x-model="addJobUrl" placeholder="\u8f93\u5165\u5c97\u4f4d\u94fe\u63a5\uff08\u652f\u6301 Boss\u3001\u62c9\u52fe\u3001\u730e\u8058\u7b49\uff09" class="w-full h-11 px-4 mb-3 rounded-[14px] bg-black/[0.03] border border-black/[0.06] text-[14px] focus:outline-none focus:border-black/[0.15] transition-all" />
          <div class="text-[12px] text-[#86868b]">\u63d0\u793a\uff1a\u90e8\u5206\u5e73\u53f0\u53ef\u80fd\u9700\u8981 <a href="/job/cookie-settings" class="text-accent hover:underline">Cookie \u914d\u7f6e</a></div>
        </div>
      </template>
    </div>
    <!-- Bottom buttons -->
    <div class="px-6 py-4 border-t border-black/[0.04] flex justify-end gap-3 flex-shrink-0">
      <button x-on:click="showAddDrawer = false" class="h-[44px] px-5 rounded-[14px] bg-black/[0.04] text-[14px] text-primary font-medium hover:bg-black/[0.08] transition-all">\u53d6\u6d88</button>
      <button x-on:click="submitNewJob()" x-bind:disabled="submitting" class="h-[44px] px-6 rounded-[14px] bg-[#1E1E1A] text-white text-[14px] font-medium hover:bg-[#333] transition-all disabled:opacity-50 flex items-center gap-2">
        <i x-show="submitting" class="fas fa-spinner animate-spin text-[12px]"></i>
        <span x-text="submitting ? '\u89e3\u6790\u4e2d...' : '\u5f00\u59cb\u89e3\u6790'">\u5f00\u59cb\u89e3\u6790</span>
      </button>
    </div>
  </div>
  <!-- Drawer backdrop -->
  <div x-show="showAddDrawer" x-transition.opacity class="fixed inset-0 bg-black/20 z-40" x-on:click="showAddDrawer = false"></div>

</div>
`;

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}
