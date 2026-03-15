/**
 * Job Copilot V2 - Home Page (Figma Pixel-Perfect Redesign)
 * 
 * Standalone full-width page (1440px canvas, 1280px content):
 *   - Top global bar: logo, global search (520px), role selector, icons, avatar
 *   - Title area: centered 32px heading + 15px subtitle  
 *   - Hero super input (860x84px, centered, frosted, upload/mic/submit)
 *   - Quick intent capsules (5 pills)
 *   - "Today's 3 Things" card (numbered list + CTA arrows)
 *   - "Job Search Progress" card (5-step horizontal stepper)
 *   - Growth Companion card + Recent Objects (3 columns)
 *   - Explore/Focus mode with chat sidebar
 * 
 * Design: white-dominant, restrained, 18-24px card radius, no heavy BI walls
 * PRD: FindJob_PRD_V1.5_高保真界面_Home页及prompt.md
 * Uses dangerouslySetInnerHTML for Alpine.js x-on directives.
 */

export function HomePage() {
  const html = `
<div id="home-v2" x-data="homeV2" x-init="init()" class="relative min-h-screen premium-canvas">

  <!-- Subtle center ambient glow -->
  <div class="premium-ambient-glow"></div>

  <!-- ============================================ -->
  <!-- DASHBOARD MODE (default)                      -->
  <!-- ============================================ -->
  <div x-show="phase === 'dashboard'" x-transition:leave="transition ease-in duration-200" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0">

    <!-- ======= TOP GLOBAL BAR (Premium) ======= -->
    <div class="premium-topbar">
      <div class="premium-topbar-inner">
        <!-- Left: Brand -->
        <div class="flex items-center gap-[10px]">
          <div class="premium-logo-mark">
            <span class="text-[15px] font-semibold text-white" style="letter-spacing:-0.02em;">J</span>
          </div>
          <span class="text-[16px] font-medium tracking-[-0.01em]" style="color:#2C2C2E;">Job Copilot</span>
        </div>

        <!-- Center: Global Search -->
        <div class="premium-search-bar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B0B0AE" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <span class="text-[13px]" style="color:#B0B0AE;">搜索或提问...</span>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-[6px]">
          <!-- Target role selector -->
          <div class="relative">
            <button x-on:click.stop="showTargetRolePicker = !showTargetRolePicker" class="premium-role-btn">
              <span x-text="targetRole || '设置目标'" class="text-[13px] font-medium truncate max-w-[100px]" style="color:#48484A;"></span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <!-- Dropdown -->
            <div x-show="showTargetRolePicker" x-transition x-on:click.outside="showTargetRolePicker = false" class="absolute z-50 mt-2 right-0 w-72 bg-white rounded-[20px] p-5 border border-black/[0.04]" style="box-shadow:0 12px 48px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.03);" x-on:click.stop>
              <div class="text-[13px] font-medium mb-3" style="color:#2C2C2E;">设定你的目标角色</div>
              <input type="text" x-model="targetRoleInput" x-on:keydown.enter.prevent.stop="saveTargetRole()" placeholder="例如: AI 产品经理" class="w-full h-[38px] px-3 rounded-[12px] border text-[13px] focus:outline-none transition-all" style="background:#FAFAF9;border-color:rgba(0,0,0,0.05);color:#2C2C2E;" />
              <div class="flex justify-end gap-2 mt-3">
                <button type="button" x-on:click.prevent.stop="showTargetRolePicker = false" class="px-3 py-1.5 text-[12px] rounded-[10px] transition-colors" style="color:#8E8E93;" onmouseover="this.style.background='rgba(0,0,0,0.03)'" onmouseout="this.style.background='transparent'">取消</button>
                <button type="button" x-on:click.prevent.stop="saveTargetRole()" class="px-4 py-1.5 text-[12px] text-white rounded-[10px] transition-colors" style="background:#3A3A3C;" onmouseover="this.style.background='#48484A'" onmouseout="this.style.background='#3A3A3C'">保存</button>
              </div>
            </div>
          </div>
          <!-- Notification -->
          <button class="premium-icon-btn" title="通知">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1.6" stroke-linecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
          <!-- Upload -->
          <button class="premium-icon-btn" title="上传">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1.6" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </button>
          <!-- Avatar -->
          <div class="premium-avatar">
            <span class="text-[13px] font-semibold text-white">U</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ======= MAIN CONTENT AREA ======= -->
    <div class="premium-content-area">

      <!-- ======= NEW USER: Premium Hero Panel ======= -->
      <template x-if="isNewUser && !isSearching">
        <div class="premium-entrance-anim">

          <!-- Hero Panel: the visual protagonist -->
          <div class="premium-hero-panel">
            <!-- Subtle inner glow -->
            <div class="premium-hero-inner-glow"></div>

            <!-- Title -->
            <h1 class="premium-hero-title" x-text="welcomeTitle"></h1>
            <!-- Subtitle -->
            <p class="premium-hero-subtitle" x-text="welcomeSubtitle"></p>

            <!-- Main Input -->
            <div class="premium-input-wrap">
              <input
                type="text"
                x-model="userInput"
                x-on:keydown.enter="submitQuery()"
                x-on:focus="inputFocused = true; stopPlaceholderRotation()"
                x-on:blur="inputFocused = false; startPlaceholderRotation()"
                class="premium-hero-input"
              />
              <!-- Static placeholder for new user -->
              <div x-show="!inputFocused && !userInput" class="premium-placeholder" x-text="currentPlaceholder"></div>
              <!-- Right control cluster -->
              <div class="premium-input-controls">
                <button class="premium-input-icon" title="上传文件">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </button>
                <button class="premium-input-icon" title="语音输入" style="opacity:0.3;cursor:not-allowed;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                </button>
                <button x-on:click="submitQuery()" class="premium-submit-btn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            </div>

            <!-- Segmented Control -->
            <div class="premium-segment-wrap">
              <div class="premium-segment-track">
                <button x-on:click="userInput = '我目标很明确，想直接找岗位'; submitQuery()" class="premium-segment-item" x-bind:class="activeSegment === 0 ? 'active' : ''" x-on:mouseenter="activeSegment = 0">目标明确</button>
                <button x-on:click="userInput = '方向不太清楚，想探索一下'; submitQuery()" class="premium-segment-item" x-bind:class="activeSegment === 1 ? 'active' : ''" x-on:mouseenter="activeSegment = 1">方向不清</button>
                <button x-on:click="userInput = '我已经有面试了，帮我准备'; submitQuery()" class="premium-segment-item" x-bind:class="activeSegment === 2 ? 'active' : ''" x-on:mouseenter="activeSegment = 2">已有面试</button>
              </div>
            </div>
          </div>

          <!-- ======= Entry Capsules (below hero) ======= -->
          <div class="premium-capsule-row">
            <a href="/job/new" class="premium-capsule">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>解析岗位</span>
            </a>
            <a href="/resume" class="premium-capsule">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>上传简历</span>
            </a>
            <a href="/interviews" class="premium-capsule">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <span>准备面试</span>
            </a>
          </div>

          <!-- ======= System Promise Strips ======= -->
          <div class="premium-promise-row">
            <a href="/job/new" class="premium-promise-strip group">
              <div class="premium-promise-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div class="premium-promise-text">
                <span class="premium-promise-title">看懂岗位关键点</span>
                <span class="premium-promise-desc">解构 JD 背后的真实需求与能力模型</span>
              </div>
            </a>
            <div class="premium-promise-divider"></div>
            <a href="/resume" class="premium-promise-strip group">
              <div class="premium-promise-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div class="premium-promise-text">
                <span class="premium-promise-title">建立简历版本库</span>
                <span class="premium-promise-desc">一份母版，按岗位自动生成定向版本</span>
              </div>
            </a>
            <div class="premium-promise-divider"></div>
            <a href="/interviews" class="premium-promise-strip group">
              <div class="premium-promise-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div class="premium-promise-text">
                <span class="premium-promise-title">面试训练与复盘</span>
                <span class="premium-promise-desc">模拟真实面试场景，结构化反馈每次表现</span>
              </div>
            </a>
          </div>

        </div>
      </template>

      <!-- ======= RETURNING USER: Title & Input (outside card) ======= -->
      <template x-if="!isNewUser && !isSearching">
        <div>
          <div class="text-center mb-10 animate-gentle-float stagger-1">
            <h1 class="text-[32px] font-semibold leading-[40px] tracking-tight mb-3 figma-title" x-text="welcomeTitle"></h1>
            <p class="text-[15px] leading-[24px] text-[#6E6E67] max-w-[640px] mx-auto" x-text="welcomeSubtitle"></p>
          </div>

          <!-- Hero Super Input -->
          <div class="flex justify-center mb-5 animate-gentle-float stagger-2">
            <div class="relative figma-hero-input-wrap">
              <div class="absolute left-[22px] top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <i class="fas fa-wand-magic-sparkles text-[18px] text-[#0071e3]/40"></i>
              </div>
              <input type="text" x-model="userInput" x-on:keydown.enter="submitQuery()" x-on:focus="inputFocused = true; stopPlaceholderRotation()" x-on:blur="inputFocused = false; startPlaceholderRotation()" class="figma-hero-input" />
              <div x-show="!inputFocused && !userInput" class="figma-rotating-placeholder" x-text="currentPlaceholder" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 translate-y-1" x-transition:enter-end="opacity-100 translate-y-0"></div>
              <div class="absolute right-[18px] top-1/2 -translate-y-1/2 flex items-center gap-[10px]">
                <button class="figma-input-icon-btn" title="上传文件"><i class="fas fa-arrow-up-from-bracket text-[16px]"></i></button>
                <button class="figma-input-icon-btn" title="语音输入" style="opacity:0.4;cursor:not-allowed;"><i class="fas fa-microphone text-[16px]"></i></button>
                <button x-on:click="submitQuery()" class="figma-submit-btn"><span class="text-[14px] font-medium">提交</span><i class="fas fa-arrow-right text-[12px]"></i></button>
              </div>
            </div>
          </div>

          <!-- Intent Capsules -->
          <div class="flex flex-wrap justify-center gap-[10px] mb-12 animate-gentle-float stagger-3">
            <button x-on:click="userInput = '解析一个岗位JD'; submitQuery()" class="figma-capsule">解析岗位</button>
            <a href="/resume" class="figma-capsule">上传简历</a>
            <button x-on:click="userInput = '帮我准备面试'; submitQuery()" class="figma-capsule">准备面试</button>
            <a href="/applications?status=offer" class="figma-capsule">对比 Offer</a>
            <button x-on:click="userInput = '我不确定方向，想探索一下'; submitQuery()" class="figma-capsule">探索方向</button>
          </div>

          <div class="text-center mb-14 -mt-6">
            <p class="text-[13px] text-[#A0A09A]">支持粘贴 JD、上传截图、输入岗位方向，也可以直接说"帮我准备明天的面试"。</p>
          </div>
        </div>
      </template>

      <!-- ======= RETURNING USER: Main Panels ======= -->
      <template x-if="!isNewUser && !isSearching">
        <div class="space-y-7 animate-gentle-float stagger-4">

          <!-- === Card A: Today's Top 3 Things === -->
          <div class="figma-card" style="padding:28px 32px;">
            <h2 class="text-[20px] font-semibold text-[#1d1d1f] mb-6">今天最值得先做的 3 件事</h2>
            <div class="space-y-0">
              <template x-for="(sug, si) in todayTasks" x-bind:key="si">
                <a x-bind:href="sug.url || '#'" x-on:click="sug.action ? handleSuggestionAction(sug, $event) : null" class="figma-task-row group">
                  <!-- Number circle -->
                  <div class="figma-task-num" x-text="si + 1"></div>
                  <!-- Text -->
                  <div class="flex-1 min-w-0">
                    <div class="text-[16px] font-medium text-[#1d1d1f] mb-1" x-text="sug.title"></div>
                    <div class="text-[14px] text-[#86868b] leading-relaxed" x-text="sug.desc"></div>
                  </div>
                  <!-- CTA arrow -->
                  <div class="flex items-center gap-1 text-[14px] text-[#1d1d1f]/70 group-hover:text-[#1d1d1f] transition-colors flex-shrink-0">
                    <span x-text="sug.cta || '查看'"></span>
                    <i class="fas fa-arrow-right text-[11px]"></i>
                  </div>
                </a>
              </template>
            </div>
          </div>

          <!-- === Card B: Job Search Progress === -->
          <div class="figma-card" style="padding:28px 32px;">
            <h2 class="text-[20px] font-semibold text-[#1d1d1f] mb-2">你的求职进度</h2>
            <p class="text-[13px] text-[#86868b] leading-[20px] mb-6" x-text="journeySummaryText"></p>

            <!-- Horizontal 5-step stepper -->
            <div class="figma-stepper">
              <template x-for="(stage, idx) in journeyStages" x-bind:key="idx">
                <div class="figma-step">
                  <!-- Connector line (not on first) -->
                  <div x-show="idx > 0" class="figma-step-line" x-bind:class="stage.pct >= 100 ? 'filled' : (journeyStages[idx-1]?.pct >= 100 ? 'filled' : '')"></div>
                  <!-- Dot -->
                  <div class="figma-step-dot" x-bind:class="stage.pct >= 100 ? 'complete' : stage.pct > 0 ? 'active' : 'pending'">
                    <template x-if="stage.pct >= 100">
                      <div class="w-[10px] h-[10px] rounded-full bg-[#1d1d1f]"></div>
                    </template>
                    <template x-if="stage.pct > 0 && stage.pct < 100">
                      <div class="w-[6px] h-[6px] rounded-full bg-[#1d1d1f]"></div>
                    </template>
                  </div>
                  <!-- Label -->
                  <div class="text-[13px] text-[#86868b] mt-2" x-text="stage.name"></div>
                </div>
              </template>
            </div>

            <!-- Summary bar -->
            <div class="figma-summary-bar mt-6">
              <div class="flex items-center gap-2">
                <i class="fas fa-chart-line text-[14px] text-[#1d1d1f]/50"></i>
                <span class="text-[15px] font-medium text-[#1d1d1f]" x-text="journeyHighlight"></span>
              </div>
              <div class="text-[13px] text-[#86868b] mt-1 ml-6" x-text="journeyHighlightDesc"></div>
            </div>
          </div>

          <!-- === Card C: Growth Companion === -->
          <div class="figma-card figma-card-soft" style="padding:28px 32px;">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-[20px] font-semibold text-[#1d1d1f]">成长陪伴师</h2>
              <span class="text-[12px] text-[#0071e3] bg-[#0071e3]/8 px-3 py-1 rounded-full">今日在线</span>
            </div>
            <p class="text-[22px] font-medium text-[#1d1d1f] leading-[32px] mb-5 max-w-[520px]" x-text="companionMessage"></p>
            <!-- Mini task card -->
            <div class="bg-white/80 rounded-[18px] border border-black/[0.04] p-4 mb-5">
              <div class="text-[12px] text-[#86868b] mb-1">今日训练</div>
              <div class="text-[14px] text-[#1d1d1f] font-medium">回答 1 道行为面试题，重点练"结果量化"</div>
              <div class="text-right mt-2">
                <a href="/questions" class="text-[13px] text-[#0071e3] hover:underline">继续对话</a>
              </div>
            </div>
            <!-- Bottom buttons -->
            <div class="flex gap-[10px]">
              <button x-on:click="userInput = '帮我制定本周计划'; submitQuery()" class="h-[42px] px-5 rounded-[14px] bg-[#1d1d1f] text-white text-[14px] font-medium hover:bg-[#333] transition-colors">继续对话</button>
              <a href="/growth" class="h-[42px] px-5 rounded-[14px] bg-white border border-black/[0.08] text-[#1d1d1f] text-[14px] font-medium flex items-center hover:bg-black/[0.02] transition-colors">查看本周计划</a>
            </div>
          </div>

          <!-- === Recent Objects (3 columns) === -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <!-- Recent Jobs -->
            <div class="figma-card-sm">
              <div class="flex items-center justify-between mb-4">
                <span class="text-[16px] font-semibold text-[#1d1d1f]">最近岗位</span>
                <a href="/jobs" class="text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors">查看全部</a>
              </div>
              <template x-if="recentJobs.length > 0">
                <div class="space-y-2.5">
                  <template x-for="(job, ji) in recentJobs.slice(0, 3)" x-bind:key="ji">
                    <a x-bind:href="'/job/' + job.id" class="block p-3 rounded-xl hover:bg-[#F5F5F3] transition-colors">
                      <div class="flex items-center justify-between">
                        <div class="min-w-0 flex-1">
                          <div class="text-[14px] font-medium text-[#1d1d1f] truncate" x-text="job.title || job.basic_info?.job_name || '未命名岗位'"></div>
                          <div class="text-[12px] text-[#86868b] mt-0.5 truncate" x-text="job.company || job.basic_info?.company || ''"></div>
                        </div>
                        <span class="text-[13px] font-medium text-[#1d1d1f]/60 flex-shrink-0 ml-3" x-text="job.matchScore ? job.matchScore + '%' : ''"></span>
                      </div>
                    </a>
                  </template>
                </div>
              </template>
              <template x-if="recentJobs.length === 0">
                <div class="text-[13px] text-[#86868b] text-center py-6">暂无岗位</div>
              </template>
            </div>

            <!-- Recent Resumes -->
            <div class="figma-card-sm">
              <div class="flex items-center justify-between mb-4">
                <span class="text-[16px] font-semibold text-[#1d1d1f]">最近简历</span>
                <a href="/resumes" class="text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors">查看全部</a>
              </div>
              <template x-if="recentResumes.length > 0">
                <div class="space-y-2.5">
                  <template x-for="(res, ri) in recentResumes.slice(0, 3)" x-bind:key="ri">
                    <a x-bind:href="'/resume/' + res.id" class="block p-3 rounded-xl hover:bg-[#F5F5F3] transition-colors">
                      <div class="text-[14px] font-medium text-[#1d1d1f] truncate" x-text="res.basic_info?.name || '我的简历'"></div>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[11px] text-[#86868b]" x-text="res.type || '基础版'"></span>
                        <span class="text-[11px] text-[#86868b]" x-text="res.updated_at ? '· ' + new Date(res.updated_at).toLocaleDateString('zh-CN') : ''"></span>
                      </div>
                    </a>
                  </template>
                </div>
              </template>
              <template x-if="recentResumes.length === 0">
                <div class="text-[13px] text-[#86868b] text-center py-6">暂无简历</div>
              </template>
            </div>

            <!-- Recent Progress -->
            <div class="figma-card-sm">
              <div class="flex items-center justify-between mb-4">
                <span class="text-[16px] font-semibold text-[#1d1d1f]">最近进展</span>
                <a href="/questions" class="text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors">查看全部</a>
              </div>
              <template x-if="recentInterviews.length > 0">
                <div class="space-y-2.5">
                  <template x-for="(iv, ii) in recentInterviews.slice(0, 3)" x-bind:key="ii">
                    <a x-bind:href="'/questions/' + iv.id" class="block p-3 rounded-xl hover:bg-[#F5F5F3] transition-colors">
                      <div class="flex items-center justify-between">
                        <div class="min-w-0 flex-1">
                          <div class="text-[14px] font-medium text-[#1d1d1f] truncate" x-text="iv.question || '面试题'"></div>
                          <div class="text-[12px] text-[#86868b] mt-0.5" x-text="iv.category || ''"></div>
                        </div>
                        <span class="text-[12px] text-[#86868b] flex-shrink-0 ml-3" x-text="iv.status || ''"></span>
                      </div>
                    </a>
                  </template>
                </div>
              </template>
              <template x-if="recentInterviews.length === 0">
                <div class="text-[13px] text-[#86868b] text-center py-6">暂无面试题</div>
              </template>
            </div>
          </div>

          <!-- Bottom spacer -->
          <div class="h-12"></div>
        </div>
      </template>

    </div>
  </div>

  <!-- ============================================ -->
  <!-- EXPLORE / FOCUS MODE (market search + chat)   -->
  <!-- ============================================ -->
  <div
    x-show="phase === 'explore' || phase === 'focus'"
    x-transition:enter="transition ease-out duration-300"
    x-transition:enter-start="opacity-0"
    x-transition:enter-end="opacity-100"
    class="flex h-screen"
  >
    <!-- Left Canvas -->
    <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F4F4F1]" id="canvas-area">

      <!-- Back button -->
      <button x-on:click="backToDashboard()" class="inline-flex items-center gap-2 text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-2">
        <i class="fas fa-arrow-left text-[10px]"></i>
        <span x-text="phase === 'focus' ? '返回市场概览' : '返回首页'"></span>
      </button>

      <!-- Search context -->
      <div class="flex items-center gap-3 mb-2">
        <h2 class="text-[22px] font-semibold text-[#1d1d1f] tracking-tight" x-text="searchQuery || '职业探索'"></h2>
        <span x-show="marketData" class="text-[12px] text-[#86868b] bg-black/[0.04] px-2.5 py-1 rounded-full" x-text="(marketData?.jobs?.length || 0) + ' 个岗位'"></span>
        <a x-show="marketData && marketData.jobs && marketData.jobs.length > 0" href="/jobs" class="text-[12px] text-[#0071e3] hover:underline ml-auto">
          <i class="fas fa-arrow-right text-[9px] mr-1"></i>进入机会工作台
        </a>
      </div>

      <!-- Loading skeleton -->
      <template x-if="isSearching && !marketData">
        <div class="space-y-4">
          <div class="explore-glass p-6 animate-module-enter">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-5 h-5 rounded-full border-2 border-[#0071e3] border-t-transparent loading-spinner"></div>
              <span class="text-[14px] text-[#86868b]" x-text="searchStatus"></span>
            </div>
            <div class="space-y-3">
              <div class="skeleton h-4 w-3/4"></div>
              <div class="skeleton h-4 w-1/2"></div>
              <div class="skeleton h-4 w-2/3"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- Market Overview -->
      <template x-if="marketData && marketData.overview">
        <div class="explore-glass p-6 animate-module-enter">
          <div class="flex items-center gap-2.5 mb-4">
            <span class="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <i class="fas fa-chart-line text-blue-500 text-[13px]"></i>
            </span>
            <h3 class="text-[16px] font-semibold text-[#1d1d1f]">市场概览</h3>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="text-center p-3 rounded-xl bg-[#F5F5F3]">
              <div class="text-[24px] font-bold text-[#1d1d1f]" x-text="marketData.overview.totalJobs || 0"></div>
              <div class="text-[12px] text-[#86868b] mt-0.5">岗位数量</div>
            </div>
            <div class="text-center p-3 rounded-xl bg-[#F5F5F3]">
              <div class="text-[24px] font-bold text-[#1d1d1f]" x-text="marketData.overview.avgSalary || '-'"></div>
              <div class="text-[12px] text-[#86868b] mt-0.5">平均薪资</div>
            </div>
            <div class="text-center p-3 rounded-xl bg-[#F5F5F3]">
              <div class="text-[24px] font-bold text-[#1d1d1f]" x-text="marketData.overview.topCompanies?.length || 0"></div>
              <div class="text-[12px] text-[#86868b] mt-0.5">招聘公司</div>
            </div>
            <div class="text-center p-3 rounded-xl bg-[#F5F5F3]">
              <div class="text-[24px] font-bold text-[#1d1d1f]" x-text="marketData.overview.mainCities?.length || 0"></div>
              <div class="text-[12px] text-[#86868b] mt-0.5">城市覆盖</div>
            </div>
          </div>
        </div>
      </template>

      <!-- Salary Chart -->
      <template x-if="marketData && marketData.salaryDistribution">
        <div class="explore-glass p-6 animate-module-enter stagger-1">
          <div class="flex items-center gap-2.5 mb-4">
            <span class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <i class="fas fa-chart-bar text-emerald-500 text-[13px]"></i>
            </span>
            <h3 class="text-[16px] font-semibold text-[#1d1d1f]">薪资分布</h3>
          </div>
          <div id="salary-chart" class="w-full h-[260px]"></div>
        </div>
      </template>

      <!-- Radar Chart -->
      <template x-if="marketData && marketData.radarData">
        <div class="explore-glass p-6 animate-module-enter stagger-2">
          <div class="flex items-center gap-2.5 mb-4">
            <span class="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <i class="fas fa-bullseye text-purple-500 text-[13px]"></i>
            </span>
            <h3 class="text-[16px] font-semibold text-[#1d1d1f]">岗位能力模型</h3>
          </div>
          <div id="radar-chart" class="w-full h-[300px]"></div>
        </div>
      </template>

      <!-- Job List -->
      <template x-if="marketData && marketData.jobs && marketData.jobs.length > 0">
        <div class="explore-glass p-6 animate-module-enter stagger-3">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <i class="fas fa-list text-amber-500 text-[13px]"></i>
              </span>
              <h3 class="text-[16px] font-semibold text-[#1d1d1f]">岗位列表</h3>
            </div>
            <span class="text-[12px] text-[#86868b]" x-text="marketData.jobs.length + ' 个结果'"></span>
          </div>
          <div class="space-y-2">
            <template x-for="(job, index) in marketData.jobs" x-bind:key="index">
              <div class="group p-4 rounded-xl border border-black/[0.04] hover:border-[#0071e3]/20 hover:bg-[#0071e3]/[0.02] transition-all cursor-pointer" x-on:click="focusJob(job)">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <div class="text-[15px] font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors mb-1" x-text="job.title || '未知岗位'"></div>
                    <div class="flex items-center gap-2 text-[13px] text-[#86868b] mb-2">
                      <span x-text="job.company || '未知公司'"></span>
                      <template x-if="job.location">
                        <span class="flex items-center gap-1"><span class="text-black/20">|</span><span x-text="job.location"></span></span>
                      </template>
                    </div>
                    <div class="flex flex-wrap gap-1.5">
                      <template x-if="job.salary"><span class="text-[11px] font-medium text-[#0071e3] bg-[#0071e3]/[0.08] px-2 py-0.5 rounded-full" x-text="job.salary"></span></template>
                      <template x-if="job.platform"><span class="text-[11px] text-[#86868b] bg-black/[0.04] px-2 py-0.5 rounded-full" x-text="job.platform"></span></template>
                    </div>
                  </div>
                  <template x-if="job.sourceUrl">
                    <a x-bind:href="job.sourceUrl" target="_blank" x-on:click.stop class="flex-shrink-0 w-7 h-7 rounded-lg bg-black/[0.03] hover:bg-[#0071e3]/10 flex items-center justify-center transition-colors">
                      <i class="fas fa-external-link-alt text-[10px] text-[#86868b]"></i>
                    </a>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- Focus mode: job detail -->
      <template x-if="phase === 'focus' && focusedJob">
        <div class="explore-glass p-6 animate-module-enter">
          <div class="flex items-center gap-2.5 mb-4">
            <span class="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <i class="fas fa-microscope text-indigo-500 text-[13px]"></i>
            </span>
            <h3 class="text-[16px] font-semibold text-[#1d1d1f]" x-text="'深入分析: ' + (focusedJob.title || '')"></h3>
          </div>
          <div class="text-[14px] text-[#86868b] leading-relaxed" x-text="focusedJob.summary || '正在分析中...'"></div>
          <div class="flex flex-wrap gap-2 mt-4">
            <button x-on:click="sendMessage('帮我匹配简历')" class="text-[13px] px-4 py-2 rounded-xl bg-[#0071e3]/10 text-[#0071e3] hover:bg-[#0071e3]/20 transition-colors">
              <i class="fas fa-link text-[10px] mr-1.5"></i>匹配简历
            </button>
            <button x-on:click="sendMessage('帮我准备面试')" class="text-[13px] px-4 py-2 rounded-xl bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors">
              <i class="fas fa-comments text-[10px] mr-1.5"></i>准备面试
            </button>
            <button x-on:click="sendMessage('帮我优化简历')" class="text-[13px] px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors">
              <i class="fas fa-magic text-[10px] mr-1.5"></i>优化简历
            </button>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <template x-if="!isSearching && !marketData && phase === 'explore' && !searchQuery">
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 rounded-full bg-[#0071e3]/10 flex items-center justify-center mb-4">
            <i class="fas fa-compass text-[#0071e3] text-[24px]"></i>
          </div>
          <h3 class="text-[18px] font-semibold text-[#1d1d1f] mb-2">开始你的职业探索</h3>
          <p class="text-[14px] text-[#86868b] max-w-sm">在右侧对话框中告诉我你的情况，我来帮你分析方向</p>
        </div>
      </template>
    </div>

    <!-- Right Chat Sidebar -->
    <div class="w-[380px] flex-shrink-0 chat-panel flex flex-col hidden lg:flex" id="chat-sidebar">
      <div class="h-12 px-4 flex items-center justify-between border-b border-black/[0.06] flex-shrink-0">
        <div class="flex items-center gap-2.5">
          <span class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px]" x-bind:class="agentRole.bgClass">
            <i x-bind:class="'fas ' + agentRole.icon" class="text-[11px]" x-bind:style="'color:' + agentRole.color"></i>
          </span>
          <span class="text-[13px] font-medium text-[#1d1d1f]" x-text="agentRole.name"></span>
        </div>
        <button x-on:click="clearChat()" class="text-[11px] text-[#86868b] hover:text-[#1d1d1f] transition-colors">
          <i class="fas fa-rotate-right text-[10px] mr-1"></i>重置
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-4 space-y-3 chat-scroll" id="chat-messages" x-ref="chatMessages">
        <template x-for="(msg, i) in messages" x-bind:key="i">
          <div class="animate-gentle-float" x-bind:class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
            <div class="max-w-[85%] px-4 py-2.5 text-[14px] leading-relaxed" x-bind:class="msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'">
              <template x-if="msg.role === 'ai' && msg.roleName">
                <div class="text-[11px] font-medium text-[#0071e3] mb-1" x-text="msg.roleName"></div>
              </template>
              <div x-html="msg.html || msg.text"></div>
              <template x-if="msg.actions && msg.actions.length > 0">
                <div class="flex flex-wrap gap-1.5 mt-2.5">
                  <template x-for="(action, ai) in msg.actions" x-bind:key="ai">
                    <button x-on:click="handleAction(action)" x-text="action.label" class="text-[12px] px-3 py-1.5 rounded-lg bg-white/60 hover:bg-white/80 text-[#1d1d1f]/70 hover:text-[#1d1d1f] border border-black/[0.06] transition-all"></button>
                  </template>
                </div>
              </template>
            </div>
          </div>
        </template>
        <div x-show="isTyping" class="flex justify-start">
          <div class="chat-bubble-ai px-4 py-3 flex gap-1.5">
            <span class="w-2 h-2 rounded-full bg-black/20 animate-pulse" style="animation-delay:0s"></span>
            <span class="w-2 h-2 rounded-full bg-black/20 animate-pulse" style="animation-delay:0.2s"></span>
            <span class="w-2 h-2 rounded-full bg-black/20 animate-pulse" style="animation-delay:0.4s"></span>
          </div>
        </div>
      </div>
      <div class="p-3 border-t border-black/[0.06] flex-shrink-0">
        <div class="flex items-center gap-2">
          <input type="text" x-model="chatInput" x-on:keydown.enter="sendChatMessage()" placeholder="输入你的想法..." class="flex-1 h-10 px-4 rounded-xl bg-black/[0.04] border border-black/[0.06] text-[14px] text-[#1d1d1f] placeholder-[#86868b]/60 focus:outline-none focus:border-[#0071e3]/30 focus:bg-white transition-all" />
          <button x-on:click="sendChatMessage()" x-bind:disabled="!chatInput.trim()" class="w-10 h-10 rounded-xl bg-[#1d1d1f] text-white flex items-center justify-center hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0">
            <i class="fas fa-paper-plane text-[12px]"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile chat overlay -->
    <div x-show="showMobileChat" x-transition class="lg:hidden fixed inset-0 z-50 flex flex-col bg-[#F4F4F1]">
      <div class="h-12 px-4 flex items-center justify-between border-b border-black/[0.06]">
        <div class="flex items-center gap-2.5">
          <span class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px]" x-bind:class="agentRole.bgClass">
            <i x-bind:class="'fas ' + agentRole.icon" class="text-[11px]" x-bind:style="'color:' + agentRole.color"></i>
          </span>
          <span class="text-[13px] font-medium text-[#1d1d1f]" x-text="agentRole.name"></span>
        </div>
        <button x-on:click="showMobileChat = false" class="w-8 h-8 rounded-lg hover:bg-black/[0.04] flex items-center justify-center">
          <i class="fas fa-times text-[14px] text-[#86868b]"></i>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-4 space-y-3 chat-scroll">
        <template x-for="(msg, i) in messages" x-bind:key="'m'+i">
          <div x-bind:class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
            <div class="max-w-[85%] px-4 py-2.5 text-[14px] leading-relaxed" x-bind:class="msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'">
              <template x-if="msg.role === 'ai' && msg.roleName"><div class="text-[11px] font-medium text-[#0071e3] mb-1" x-text="msg.roleName"></div></template>
              <div x-html="msg.html || msg.text"></div>
            </div>
          </div>
        </template>
      </div>
      <div class="p-3 border-t border-black/[0.06]">
        <div class="flex items-center gap-2">
          <input type="text" x-model="chatInput" x-on:keydown.enter="sendChatMessage()" placeholder="输入你的想法..." class="flex-1 h-10 px-4 rounded-xl bg-black/[0.04] border border-black/[0.06] text-[14px] focus:outline-none focus:border-[#0071e3]/30" />
          <button x-on:click="sendChatMessage()" class="w-10 h-10 rounded-xl bg-[#1d1d1f] text-white flex items-center justify-center"><i class="fas fa-paper-plane text-[12px]"></i></button>
        </div>
      </div>
    </div>

    <!-- Mobile chat FAB -->
    <button x-show="(phase === 'explore' || phase === 'focus') && !showMobileChat" x-on:click="showMobileChat = true" class="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#1d1d1f] text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform">
      <i class="fas fa-comments text-[18px]"></i>
      <span x-show="messages.length > 0" class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-bold" x-text="messages.length"></span>
    </button>
  </div>

</div>
`;

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}
