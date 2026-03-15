/**
 * FindJob 2.0 - Assets Workspace (资产中心)
 * PRD v1.5 pixel-level implementation
 * 
 * Two-column layout:
 *   Left (264px):  Asset tree navigation
 *   Center (flex):  Main editor / viewer
 *   (AI suggestions moved to global chat panel)
 * 
 * Uses Alpine.js for all interactivity.
 */

export function AssetsPage() {
  const html = `
<div id="assets-workspace" x-data="assetsWorkspace" x-init="init()" class="flex flex-col" style="height: calc(100vh - 72px)">>

  <!-- ============================================ -->
  <!-- PAGE TITLE AREA                               -->
  <!-- ============================================ -->
  <div class="px-7 pt-5">
    <h1 class="text-[26px] font-semibold text-primary leading-[34px] tracking-tight">\u8d44\u4ea7</h1>
    <p class="text-[13px] text-secondary leading-[20px] mt-1">\u628a\u7b80\u5386\u3001\u9879\u76ee\u3001\u6210\u679c\u548c\u6c42\u804c\u753b\u50cf\u7ec4\u7ec7\u6210\u53ef\u6301\u7eed\u8fed\u4ee3\u7684\u6c42\u804c\u8d44\u4ea7\u3002</p>
  </div>

  <!-- ============================================ -->
  <!-- TOP TOOLBAR (44px)                             -->
  <!-- ============================================ -->
  <div class="px-7 mt-3 flex items-center justify-between gap-3 flex-wrap">
    <div class="flex items-center gap-2.5">
      <!-- Search box 280x44 -->
      <div class="relative">
        <input type="text" x-model="searchTerm" x-on:input.debounce.300ms="filterAssets()" placeholder="\u641c\u7d22\u7b80\u5386\u3001\u9879\u76ee\u3001\u8bc1\u636e" class="w-[200px] h-[44px] pl-10 pr-4 rounded-[14px] bg-white border border-black/[0.08] text-[14px] text-primary placeholder-secondary/50 focus:outline-none focus:border-accent/30 transition-all" />
        <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-secondary/40"></i>
      </div>
      <!-- Filter capsules -->
      <template x-for="(f, fi) in filterTabs" x-bind:key="fi">
        <button x-on:click="activeFilterTab = f.value; filterAssets()" x-bind:class="activeFilterTab === f.value ? 'bg-primary/[0.06] text-primary font-medium border-primary/[0.12]' : 'bg-white text-secondary border-black/[0.08] hover:border-black/[0.12]'" class="h-[32px] px-3.5 rounded-full text-[12px] border whitespace-nowrap transition-all" x-text="f.label"></button>
      </template>
    </div>
    <div class="flex items-center gap-2.5 flex-shrink-0">
      <!-- New asset 116x44 -->
      <div class="relative">
        <div x-on:click="showNewAssetMenu = !showNewAssetMenu" role="button" class="h-[44px] px-5 rounded-[14px] bg-primary text-white flex items-center gap-2 text-[14px] font-medium hover:bg-primary/90 transition-all cursor-pointer select-none whitespace-nowrap">
          <i class="fas fa-plus text-[11px]"></i>
          <span>\u65b0\u5efa\u8d44\u4ea7</span>
        </div>
        <!-- Dropdown -->
        <div x-show="showNewAssetMenu" x-on:click.away="showNewAssetMenu = false" x-transition class="absolute top-full right-0 mt-2 w-[180px] bg-white rounded-[14px] border border-black/[0.06] shadow-apple-lg py-2 z-50">
          <div x-on:click="createNewResume(); showNewAssetMenu = false" role="button" class="w-full px-4 py-2.5 text-left text-[13px] text-primary hover:bg-black/[0.03] transition-colors flex items-center gap-2.5 cursor-pointer"><i class="fas fa-file-alt text-[10px] text-secondary/50 w-4 text-center"></i>\u65b0\u5efa\u7b80\u5386\u7248\u672c</div>
          <div x-on:click="createNewProject(); showNewAssetMenu = false" role="button" class="w-full px-4 py-2.5 text-left text-[13px] text-primary hover:bg-black/[0.03] transition-colors flex items-center gap-2.5 cursor-pointer"><i class="fas fa-folder-plus text-[10px] text-secondary/50 w-4 text-center"></i>\u65b0\u5efa\u9879\u76ee\u7d20\u6750</div>
          <div x-on:click="createNewEvidence(); showNewAssetMenu = false" role="button" class="w-full px-4 py-2.5 text-left text-[13px] text-primary hover:bg-black/[0.03] transition-colors flex items-center gap-2.5 cursor-pointer"><i class="fas fa-trophy text-[10px] text-secondary/50 w-4 text-center"></i>\u65b0\u5efa\u6210\u5c31\u8bc1\u636e</div>
        </div>
      </div>
      <!-- Import 84x44 -->
      <button x-on:click="importAssets()" class="h-[44px] px-4 rounded-[14px] bg-white border border-black/[0.08] flex items-center gap-2 text-[14px] text-primary font-medium hover:border-accent/20 transition-all whitespace-nowrap">
        <i class="fas fa-cloud-arrow-up text-[12px] text-secondary/50"></i>
        <span>\u5bfc\u5165</span>
      </button>
      <!-- Export 84x44 -->
      <button x-on:click="exportAssets()" class="h-[44px] px-4 rounded-[14px] bg-white border border-black/[0.08] flex items-center gap-2 text-[14px] text-primary font-medium hover:border-accent/20 transition-all whitespace-nowrap">
        <i class="fas fa-download text-[12px] text-secondary/50"></i>
        <span>\u5bfc\u51fa</span>
      </button>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- THREE-COLUMN MAIN AREA                        -->
  <!-- ============================================ -->
  <div class="px-7 pt-3 pb-5 flex gap-4 min-w-0 flex-1 overflow-hidden">

    <!-- ========== LEFT: Asset Tree (264px) ========== -->
    <div class="w-[264px] flex-shrink-0 bg-white rounded-card-lg border border-black/[0.06] shadow-card flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="h-[56px] px-[18px] flex items-center justify-between flex-shrink-0">
        <span class="text-[18px] font-semibold text-primary">\u6211\u7684\u8d44\u4ea7</span>
        <button x-on:click="showNewAssetMenu = true" class="w-8 h-8 rounded-[10px] flex items-center justify-center text-secondary/40 hover:text-secondary hover:bg-black/[0.04] transition-all" title="\u65b0\u5efa\u8d44\u4ea7">
          <i class="fas fa-plus text-[12px]"></i>
        </button>
      </div>

      <!-- Navigation tree -->
      <div class="flex-1 overflow-y-auto px-[12px] pb-3 space-y-1" id="asset-tree">

        <!-- 1. \u6c42\u804c\u753b\u50cf (no expand) -->
        <button x-on:click="switchCategory('profile')" x-bind:class="activeCategory === 'profile' ? 'bg-accent/[0.06] text-primary font-semibold asset-tree-active' : 'text-primary/60 hover:text-primary hover:bg-black/[0.03]'" class="relative w-full flex items-center gap-2.5 px-3 h-[42px] rounded-[12px] text-[14px] transition-all">
          <i class="fas fa-user-circle text-[13px] w-[18px] text-center" x-bind:class="activeCategory === 'profile' ? 'text-accent' : 'text-secondary/50'"></i>
          <span>\u6c42\u804c\u753b\u50cf</span>
        </button>

        <!-- 2. \u7b80\u5386\u5e93 (expandable) -->
        <div>
          <button x-on:click="toggleTreeGroup('resumes'); if(activeCategory !== 'resumes') switchCategory('resumes')" x-bind:class="activeCategory === 'resumes' ? 'bg-accent/[0.06] text-primary font-semibold asset-tree-active' : 'text-primary/60 hover:text-primary hover:bg-black/[0.03]'" class="relative w-full flex items-center gap-2.5 px-3 h-[42px] rounded-[12px] text-[14px] transition-all">
            <i class="fas fa-file-alt text-[13px] w-[18px] text-center" x-bind:class="activeCategory === 'resumes' ? 'text-accent' : 'text-secondary/50'"></i>
            <span class="flex-1 text-left">\u7b80\u5386\u5e93</span>
            <i class="fas fa-chevron-right text-[9px] text-primary/25 transition-transform duration-200" x-bind:class="treeExpanded.resumes ? 'rotate-90' : ''"></i>
          </button>
          <div x-show="treeExpanded.resumes" x-transition class="pl-[32px] pr-2 py-1 space-y-[6px]">
            <template x-for="(r, ri) in resumeVersions" x-bind:key="r.id || ri">
              <button x-on:click="selectResumeVersion(r)" x-bind:class="selectedAssetId === r.id ? 'bg-accent/[0.06] text-accent font-semibold' : 'text-primary/50 hover:text-primary hover:bg-black/[0.04]'" class="w-full flex items-center gap-2 px-2.5 h-[34px] rounded-[10px] text-[13px] transition-all truncate">
                <span class="truncate" x-text="r.name || r.version_tag || '\u672a\u547d\u540d\u7248\u672c'"></span>
                <span x-show="r.isCurrent" class="flex-shrink-0 text-[10px] text-accent/60 bg-accent/[0.08] px-1.5 py-0.5 rounded-full">\u5f53\u524d</span>
                <span x-show="r.isTargeted" class="flex-shrink-0 text-[10px] text-purple-600/60 bg-purple-500/[0.08] px-1.5 py-0.5 rounded-full">\u5b9a\u5411</span>
              </button>
            </template>
            <template x-if="resumeVersions.length === 0">
              <div class="text-[12px] text-secondary/40 px-2.5 py-2">\u6682\u65e0\u7b80\u5386</div>
            </template>
          </div>
        </div>

        <!-- 3. \u9879\u76ee\u7d20\u6750\u5e93 (expandable) -->
        <div>
          <button x-on:click="toggleTreeGroup('projects'); if(activeCategory !== 'projects') switchCategory('projects')" x-bind:class="activeCategory === 'projects' ? 'bg-accent/[0.06] text-primary font-semibold asset-tree-active' : 'text-primary/60 hover:text-primary hover:bg-black/[0.03]'" class="relative w-full flex items-center gap-2.5 px-3 h-[42px] rounded-[12px] text-[14px] transition-all">
            <i class="fas fa-cubes text-[13px] w-[18px] text-center" x-bind:class="activeCategory === 'projects' ? 'text-accent' : 'text-secondary/50'"></i>
            <span class="flex-1 text-left">\u9879\u76ee\u7d20\u6750\u5e93</span>
            <i class="fas fa-chevron-right text-[9px] text-primary/25 transition-transform duration-200" x-bind:class="treeExpanded.projects ? 'rotate-90' : ''"></i>
          </button>
          <div x-show="treeExpanded.projects" x-transition class="pl-[32px] pr-2 py-1 space-y-[6px]">
            <template x-for="(p, pi) in projects" x-bind:key="p.id || pi">
              <button x-on:click="selectProject(p)" x-bind:class="selectedAssetId === p.id ? 'bg-accent/[0.06] text-accent font-semibold' : 'text-primary/50 hover:text-primary hover:bg-black/[0.04]'" class="w-full flex items-center px-2.5 h-[34px] rounded-[10px] text-[13px] transition-all truncate">
                <span class="truncate" x-text="p.name || '\u672a\u547d\u540d\u9879\u76ee'"></span>
              </button>
            </template>
            <template x-if="projects.length === 0">
              <div class="text-[12px] text-secondary/40 px-2.5 py-2">\u6682\u65e0\u9879\u76ee</div>
            </template>
          </div>
        </div>

        <!-- 4. \u6210\u5c31\u8bc1\u636e\u5e93 (expandable) -->
        <div>
          <button x-on:click="toggleTreeGroup('evidences'); if(activeCategory !== 'evidences') switchCategory('evidences')" x-bind:class="activeCategory === 'evidences' ? 'bg-accent/[0.06] text-primary font-semibold asset-tree-active' : 'text-primary/60 hover:text-primary hover:bg-black/[0.03]'" class="relative w-full flex items-center gap-2.5 px-3 h-[42px] rounded-[12px] text-[14px] transition-all">
            <i class="fas fa-trophy text-[13px] w-[18px] text-center" x-bind:class="activeCategory === 'evidences' ? 'text-accent' : 'text-secondary/50'"></i>
            <span class="flex-1 text-left">\u6210\u5c31\u8bc1\u636e\u5e93</span>
            <i class="fas fa-chevron-right text-[9px] text-primary/25 transition-transform duration-200" x-bind:class="treeExpanded.evidences ? 'rotate-90' : ''"></i>
          </button>
          <div x-show="treeExpanded.evidences" x-transition class="pl-[32px] pr-2 py-1 space-y-[6px]">
            <template x-for="(ev, evi) in evidenceCategories" x-bind:key="evi">
              <button x-on:click="selectEvidenceCategory(ev)" x-bind:class="selectedAssetId === ev.id ? 'bg-accent/[0.06] text-accent font-semibold' : 'text-primary/50 hover:text-primary hover:bg-black/[0.04]'" class="w-full flex items-center px-2.5 h-[34px] rounded-[10px] text-[13px] transition-all truncate">
                <span class="truncate" x-text="ev.name"></span>
                <span x-show="ev.count > 0" class="flex-shrink-0 ml-auto text-[10px] text-secondary/40" x-text="ev.count"></span>
              </button>
            </template>
          </div>
        </div>

      </div>

      <!-- Bottom stats -->
      <div class="px-[18px] py-3.5 border-t border-black/[0.04] flex-shrink-0">
        <div class="flex items-center justify-between text-[12px] text-secondary/50">
          <span>\u7b80\u5386 <span class="text-primary/60 font-medium" x-text="resumeVersions.length">0</span></span>
          <span>\u9879\u76ee <span class="text-primary/60 font-medium" x-text="projects.length">0</span></span>
          <span>\u8bc1\u636e <span class="text-primary/60 font-medium" x-text="totalEvidences">0</span></span>
        </div>
      </div>
    </div>

    <!-- ========== CENTER: Main Editor (flexible) ========== -->
    <div class="flex-1 min-w-0 bg-white rounded-card-lg border border-black/[0.06] shadow-card flex flex-col overflow-hidden">

      <!-- ===== RESUME VIEW (default) ===== -->
      <template x-if="activeCategory === 'resumes'">
        <div class="flex-1 flex flex-col overflow-hidden">

          <!-- Info header -->
          <div class="px-6 pt-5 pb-4 border-b border-black/[0.04] flex-shrink-0">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h2 class="text-[24px] font-semibold text-primary leading-[32px] tracking-tight" x-text="currentResume.name || currentResume.version_tag || '\u9009\u62e9\u4e00\u4e2a\u7b80\u5386\u7248\u672c'"></h2>
                <div class="text-[12px] text-secondary mt-2.5 flex items-center gap-1.5 flex-wrap">
                  <span x-text="currentResume.updatedAt || ''"></span>
                  <template x-if="currentResume.linkedJob"><span>\u00b7 \u5173\u8054\u5c97\u4f4d\uff1a<span class="text-primary/70" x-text="currentResume.linkedJob"></span></span></template>
                  <template x-if="currentResume.matchBoost"><span>\u00b7 \u5339\u914d\u63d0\u5347 <span class="text-accent font-medium" x-text="currentResume.matchBoost"></span></span></template>
                  <template x-if="currentResume.source"><span>\u00b7 \u6765\u6e90\uff1a<span x-text="currentResume.source"></span></span></template>
                </div>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <span x-show="currentResume.isCurrent" class="h-[26px] px-2.5 rounded-full bg-accent/[0.08] text-accent text-[11px] font-medium flex items-center">\u5f53\u524d\u4f7f\u7528</span>
                <span x-show="currentResume.isTargeted" class="h-[26px] px-2.5 rounded-full bg-purple-500/[0.08] text-purple-600 text-[11px] font-medium flex items-center">\u5b9a\u5411\u7248</span>
              </div>
            </div>
            <!-- Action buttons (38px) -->
            <div class="flex items-center gap-2.5 mt-4">
              <button x-on:click="saveResume()" class="h-[38px] px-3.5 rounded-[12px] bg-white border border-black/[0.08] text-[13px] text-primary font-medium hover:border-accent/20 transition-all flex items-center gap-1.5">
                <i class="fas fa-save text-[10px] text-secondary/50"></i>\u4fdd\u5b58
              </button>
              <button x-on:click="saveAsNewVersion()" class="h-[38px] px-3.5 rounded-[12px] bg-white border border-black/[0.08] text-[13px] text-primary font-medium hover:border-accent/20 transition-all flex items-center gap-1.5">
                <i class="fas fa-copy text-[10px] text-secondary/50"></i>\u53e6\u5b58\u4e3a\u65b0\u7248\u672c
              </button>
              <button x-on:click="showToast('PDF \u5bfc\u51fa\u529f\u80fd\u5f00\u53d1\u4e2d...', 'info')" class="h-[38px] px-3.5 rounded-[12px] bg-white border border-black/[0.08] text-[13px] text-primary font-medium hover:border-accent/20 transition-all flex items-center gap-1.5">
                <i class="fas fa-file-pdf text-[10px] text-secondary/50"></i>\u5bfc\u51fa PDF
              </button>
              <button x-on:click="confirmDeleteResume()" class="h-[38px] px-3.5 rounded-[12px] bg-white border border-black/[0.08] text-[13px] text-error font-medium hover:border-error/20 hover:bg-error/[0.04] transition-all flex items-center gap-1.5">
                <i class="fas fa-trash text-[10px]"></i>\u5220\u9664
              </button>
            </div>
          </div>

          <!-- Editor area (scrollable) -->
          <div class="flex-1 overflow-y-auto">
            <!-- Tool row (40px) -->
            <div class="h-[40px] px-6 flex items-center justify-between border-b border-black/[0.03] flex-shrink-0">
              <div class="flex items-center gap-1">
                <template x-for="(mode, mi) in editorModes" x-bind:key="mi">
                  <button x-on:click="editorMode = mode.id" x-bind:class="editorMode === mode.id ? 'bg-primary/[0.06] text-primary font-medium' : 'text-secondary hover:text-primary'" class="h-[28px] px-2.5 rounded-[8px] text-[12px] transition-all" x-text="mode.label"></button>
                </template>
              </div>
              <div class="flex items-center gap-2 text-[11px] text-secondary/50">
                <i class="fas fa-circle text-[6px] text-success"></i>
                <span>\u5df2\u81ea\u52a8\u4fdd\u5b58</span>
              </div>
            </div>

            <!-- Resume content -->
            <div class="px-6 py-5 space-y-5">
              <!-- No selection state -->
              <template x-if="!currentResume.id">
                <div class="flex flex-col items-center justify-center py-16 text-center">
                  <div class="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <i class="fas fa-file-alt text-accent text-[22px]"></i>
                  </div>
                  <div class="text-[18px] font-semibold text-primary mb-2">\u8fd8\u6ca1\u6709\u7b80\u5386\u7248\u672c</div>
                  <div class="text-[13px] text-secondary mb-5">\u5bfc\u5165\u540e\u6211\u4eec\u4f1a\u5e2e\u4f60\u62c6\u89e3\u7ed3\u6784\u3001\u751f\u6210\u7248\u672c\uff0c\u5e76\u6839\u636e\u5c97\u4f4d\u505a\u5b9a\u5411\u4f18\u5316\u3002</div>
                  <div class="flex gap-2.5">
                    <button x-on:click="importAssets()" class="h-10 px-4 rounded-[14px] bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-all">\u4e0a\u4f20\u7b80\u5386</button>
                    <button x-on:click="createNewResume()" class="h-10 px-4 rounded-[14px] bg-white border border-black/[0.08] text-[13px] text-primary font-medium hover:border-accent/20 transition-all">\u65b0\u5efa\u7a7a\u767d\u7248\u672c</button>
                  </div>
                </div>
              </template>

              <!-- Resume modules -->
              <template x-if="currentResume.id">
                <div class="space-y-5">
                  <template x-for="(section, si) in resumeSections" x-bind:key="si">
                    <div class="group relative rounded-card bg-white border border-black/[0.04] hover:border-black/[0.08] transition-all" x-bind:class="editingSection === si ? 'border-accent/20 ring-1 ring-accent/[0.06]' : ''">
                      <!-- Section header -->
                      <div class="px-4 pt-4 pb-2 flex items-center justify-between">
                        <h3 class="text-[14px] font-semibold text-primary" x-text="section.title"></h3>
                        <!-- Hover actions -->
                        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button x-on:click="editSection(si)" class="w-7 h-7 rounded-lg flex items-center justify-center text-secondary/40 hover:text-accent hover:bg-accent/[0.06] transition-all" title="\u7f16\u8f91"><i class="fas fa-pen text-[10px]"></i></button>
                          <button x-on:click="aiOptimizeSection(si)" class="w-7 h-7 rounded-lg flex items-center justify-center text-secondary/40 hover:text-purple-600 hover:bg-purple-500/[0.06] transition-all" title="AI \u4f18\u5316"><i class="fas fa-wand-magic-sparkles text-[10px]"></i></button>
                          <button class="w-7 h-7 rounded-lg flex items-center justify-center text-secondary/40 hover:text-error hover:bg-error/[0.06] transition-all" title="\u5220\u9664"><i class="fas fa-trash text-[10px]"></i></button>
                          <button class="w-7 h-7 rounded-lg flex items-center justify-center text-secondary/40 hover:text-secondary cursor-grab transition-all" title="\u62d6\u52a8\u6392\u5e8f"><i class="fas fa-grip-vertical text-[10px]"></i></button>
                        </div>
                      </div>
                      <!-- Section content -->
                      <div class="px-4 pb-4">
                        <template x-if="editorMode === 'preview' || editingSection !== si">
                          <div class="text-[14px] text-primary/70 leading-[22px] whitespace-pre-line" x-text="section.content"></div>
                        </template>
                        <template x-if="editorMode === 'edit' || editingSection === si">
                          <textarea x-model="section.content" class="w-full min-h-[80px] text-[14px] text-primary leading-[22px] bg-transparent border-0 focus:outline-none resize-none" x-bind:rows="Math.max(3, (section.content || '').split('\\n').length + 1)"></textarea>
                        </template>
                      </div>
                    </div>
                  </template>
                </div>
              </template>
            </div>

            <!-- Structure summary cards -->
            <template x-if="currentResume.id">
              <div class="px-6 pb-6">
                <div class="text-[14px] font-semibold text-primary mb-3">\u7ed3\u6784\u6458\u8981</div>
                <div class="grid grid-cols-2 gap-3">
                  <template x-for="(card, ci) in structureSummary" x-bind:key="ci">
                    <div class="h-[74px] rounded-input bg-surface border border-black/[0.04] p-3.5">
                      <div class="text-[11px] text-secondary mb-1" x-text="card.label"></div>
                      <div class="text-[13px] font-medium text-primary leading-snug line-clamp-2" x-text="card.value"></div>
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- ===== PROFILE VIEW ===== -->
      <template x-if="activeCategory === 'profile'">
        <div class="flex-1 overflow-y-auto px-6 py-6">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-[24px] font-semibold text-primary leading-[32px]">\u6211\u7684\u6c42\u804c\u753b\u50cf</h2>
              <p class="text-[12px] text-secondary mt-2">\u57fa\u4e8e\u4f60\u7684\u7b80\u5386\u548c\u9879\u76ee\u7ecf\u5386\uff0c\u7cfb\u7edf\u81ea\u52a8\u751f\u6210\u7684\u80fd\u529b\u753b\u50cf\u3002</p>
            </div>
          </div>
          <!-- Radar chart -->
          <div class="rounded-card-lg bg-surface border border-black/[0.04] p-6 mb-5 flex items-center justify-center">
            <div id="profile-radar-chart" class="w-[280px] h-[280px]"></div>
          </div>
          <!-- Tags -->
          <div class="mb-5">
            <div class="text-[14px] font-semibold text-primary mb-2.5">\u4f18\u52bf\u6807\u7b7e</div>
            <div class="flex flex-wrap gap-2">
              <template x-for="(tag, ti) in profileStrengths" x-bind:key="ti">
                <span class="h-[28px] px-3 rounded-full bg-success/[0.08] text-success text-[12px] font-medium flex items-center" x-text="tag"></span>
              </template>
            </div>
          </div>
          <div class="mb-5">
            <div class="text-[14px] font-semibold text-primary mb-2.5">\u98ce\u9669\u6807\u7b7e</div>
            <div class="flex flex-wrap gap-2">
              <template x-for="(tag, ti) in profileRisks" x-bind:key="ti">
                <span class="h-[28px] px-3 rounded-full bg-warning/[0.08] text-warning text-[12px] font-medium flex items-center" x-text="tag"></span>
              </template>
            </div>
          </div>
          <div>
            <div class="text-[14px] font-semibold text-primary mb-2.5">\u8fd1\u671f\u5efa\u8bae</div>
            <div class="space-y-2">
              <template x-for="(s, si) in profileSuggestions" x-bind:key="si">
                <div class="rounded-input bg-surface border border-black/[0.04] p-3.5 text-[13px] text-primary/70 leading-relaxed" x-text="s"></div>
              </template>
            </div>
          </div>
        </div>
      </template>

      <!-- ===== PROJECTS VIEW ===== -->
      <template x-if="activeCategory === 'projects'">
        <div class="flex-1 overflow-y-auto px-6 py-6">
          <template x-if="!selectedProject.id">
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <i class="fas fa-cubes text-emerald-500 text-[22px]"></i>
              </div>
              <div class="text-[18px] font-semibold text-primary mb-2">\u5148\u6dfb\u52a0\u4e00\u4e2a\u9879\u76ee</div>
              <div class="text-[13px] text-secondary mb-5">\u628a\u4f60\u7684\u7ecf\u5386\u79ef\u7d2f\u6210\u53ef\u590d\u7528\u7684\u8868\u8fbe\u7d20\u6750\u3002</div>
              <div class="flex gap-2.5">
                <button x-on:click="createNewProject()" class="h-10 px-4 rounded-[14px] bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-all">\u65b0\u5efa\u9879\u76ee</button>
                <button class="h-10 px-4 rounded-[14px] bg-white border border-black/[0.08] text-[13px] text-primary font-medium hover:border-accent/20 transition-all">\u4ece\u7b80\u5386\u4e2d\u63d0\u53d6</button>
              </div>
            </div>
          </template>
          <template x-if="selectedProject.id">
            <div>
              <h2 class="text-[24px] font-semibold text-primary leading-[32px] mb-4" x-text="selectedProject.name"></h2>
              <div class="space-y-4">
                <template x-for="(field, fi) in projectFields" x-bind:key="fi">
                  <div class="group">
                    <div class="text-[12px] text-secondary font-medium mb-1.5 uppercase tracking-wider" x-text="field.label"></div>
                    <div class="rounded-input bg-surface border border-black/[0.04] p-3.5 text-[14px] text-primary/80 leading-relaxed group-hover:border-black/[0.08] transition-all" x-text="field.value || '\u70b9\u51fb\u7f16\u8f91...'"></div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- ===== EVIDENCES VIEW ===== -->
      <template x-if="activeCategory === 'evidences'">
        <div class="flex-1 overflow-y-auto px-6 py-6">
          <template x-if="evidenceItems.length === 0">
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <i class="fas fa-trophy text-amber-500 text-[22px]"></i>
              </div>
              <div class="text-[18px] font-semibold text-primary mb-2">\u8865\u5145\u4f60\u7684\u6210\u5c31\u8bc1\u636e</div>
              <div class="text-[13px] text-secondary mb-5">\u628a\u4e1a\u7ee9\u6210\u679c\u3001\u8bc1\u4e66\u548c\u4f5c\u54c1\u8865\u8fdb\u6765\uff0c\u540e\u7eed\u7b80\u5386\u548c\u9762\u8bd5\u90fd\u4f1a\u66f4\u6709\u8bf4\u670d\u529b\u3002</div>
              <button x-on:click="createNewEvidence()" class="h-10 px-4 rounded-[14px] bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-all">\u6dfb\u52a0\u8bc1\u636e</button>
            </div>
          </template>
          <template x-if="evidenceItems.length > 0">
            <div>
              <h2 class="text-[24px] font-semibold text-primary leading-[32px] mb-4">\u6210\u5c31\u8bc1\u636e</h2>
              <div class="space-y-3">
                <template x-for="(ev, evi) in evidenceItems" x-bind:key="evi">
                  <div class="group rounded-card bg-surface border border-black/[0.04] p-4 hover:border-black/[0.08] transition-all">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <div class="text-[14px] font-semibold text-primary mb-1" x-text="ev.title"></div>
                        <div class="text-[12px] text-secondary mb-2" x-text="ev.type"></div>
                        <div class="text-[13px] text-primary/70 leading-relaxed" x-text="ev.content"></div>
                      </div>
                      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button class="w-7 h-7 rounded-lg flex items-center justify-center text-secondary/40 hover:text-accent hover:bg-accent/[0.06] transition-all"><i class="fas fa-pen text-[10px]"></i></button>
                        <button class="w-7 h-7 rounded-lg flex items-center justify-center text-secondary/40 hover:text-error hover:bg-error/[0.06] transition-all"><i class="fas fa-trash text-[10px]"></i></button>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </template>

    </div>


  </div>

  <!-- ============================================ -->
  <!-- DELETE CONFIRMATION DIALOG                    -->
  <!-- ============================================ -->
  <div x-show="showDeleteConfirm" x-cloak x-transition.opacity class="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center" x-on:click.self="cancelDelete()">
    <div x-show="showDeleteConfirm" x-cloak x-transition class="bg-white rounded-[20px] border border-black/[0.06] shadow-apple-lg w-[400px] p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
          <i class="fas fa-trash text-error text-[14px]"></i>
        </div>
        <div>
          <h3 class="text-[16px] font-semibold text-primary">\u786e\u8ba4\u5220\u9664\u7b80\u5386</h3>
          <p class="text-[12px] text-secondary mt-0.5">\u6b64\u64cd\u4f5c\u4e0d\u53ef\u64a4\u9500</p>
        </div>
      </div>
      <p class="text-[14px] text-primary/70 mb-6">\u786e\u5b9a\u8981\u5220\u9664\u300c<span class="font-semibold text-primary" x-text="deleteTarget ? deleteTarget.name : ''"></span>\u300d\u5417\uff1f</p>
      <div class="flex items-center justify-end gap-2.5">
        <button x-on:click="cancelDelete()" class="h-[38px] px-4 rounded-[12px] bg-white border border-black/[0.08] text-[13px] text-primary font-medium hover:bg-black/[0.03] transition-all">\u53d6\u6d88</button>
        <button x-on:click="executeDelete()" class="h-[38px] px-4 rounded-[12px] bg-error text-white text-[13px] font-medium hover:bg-error/90 transition-all">\u5220\u9664</button>
      </div>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- TEXT INPUT DRAWER (520px)                     -->
  <!-- ============================================ -->
  <div x-show="showTextDrawer" x-cloak x-transition.opacity class="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55]" x-on:click.self="showTextDrawer = false"></div>
  <div x-show="showTextDrawer" x-cloak x-transition:enter="transition ease-out duration-300" x-transition:enter-start="translate-x-full" x-transition:enter-end="translate-x-0" x-transition:leave="transition ease-in duration-200" x-transition:leave-start="translate-x-0" x-transition:leave-end="translate-x-full" class="fixed top-0 right-0 bottom-0 w-[520px] bg-white shadow-apple-lg z-[56] flex flex-col">
    <!-- Drawer header -->
    <div class="h-[64px] px-6 flex items-center justify-between border-b border-black/[0.06] flex-shrink-0">
      <div>
        <h3 class="text-[18px] font-semibold text-primary">\u65b0\u5efa\u7b80\u5386\u7248\u672c</h3>
        <p class="text-[12px] text-secondary mt-0.5">\u7c98\u8d34\u7b80\u5386\u5185\u5bb9\uff0cAI \u4f1a\u81ea\u52a8\u89e3\u6790\u7ed3\u6784</p>
      </div>
      <button x-on:click="showTextDrawer = false" class="w-8 h-8 rounded-[10px] flex items-center justify-center text-secondary/40 hover:text-secondary hover:bg-black/[0.04] transition-all">
        <i class="fas fa-xmark text-[14px]"></i>
      </button>
    </div>
    <!-- Drawer body -->
    <div class="flex-1 overflow-y-auto p-6">
      <textarea x-model="textInput" placeholder="\u5728\u6b64\u7c98\u8d34\u4f60\u7684\u7b80\u5386\u5185\u5bb9\uff08\u7eaf\u6587\u672c\uff09...\n\n\u4f8b\u5982\uff1a\n\u59d3\u540d\uff1a\u5f20\u4e09\n\u90ae\u7bb1\uff1azhang@example.com\n\u5de5\u4f5c\u7ecf\u5386\uff1a\n- \u5b57\u8282\u8df3\u52a8 | \u4ea7\u54c1\u7ecf\u7406 | 2021-2024\n  \u8d1f\u8d23..." class="w-full h-[400px] p-4 rounded-[16px] bg-surface border border-black/[0.06] text-[14px] text-primary leading-[22px] placeholder-secondary/40 resize-none focus:outline-none focus:border-accent/30 transition-all"></textarea>
      <div class="mt-3 text-[12px] text-secondary/50">\u652f\u6301\u7eaf\u6587\u672c\u3001Markdown \u683c\u5f0f\uff0c\u81f3\u5c11 50 \u4e2a\u5b57\u7b26</div>
    </div>
    <!-- Drawer footer -->
    <div class="px-6 py-4 border-t border-black/[0.06] flex items-center justify-end gap-2.5 flex-shrink-0">
      <button x-on:click="showTextDrawer = false" class="h-[44px] px-5 rounded-[14px] bg-white border border-black/[0.08] text-[14px] text-primary font-medium hover:bg-black/[0.03] transition-all">\u53d6\u6d88</button>
      <button x-on:click="submitTextResume()" x-bind:disabled="textParsing" class="h-[44px] px-6 rounded-[14px] bg-accent text-white text-[14px] font-medium hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
        <template x-if="textParsing"><i class="fas fa-spinner fa-spin text-[12px]"></i></template>
        <span x-text="textParsing ? 'AI \u89e3\u6790\u4e2d...' : '\u5f00\u59cb\u89e3\u6790'"></span>
      </button>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- LOADING SKELETON OVERLAY                      -->
  <!-- ============================================ -->
  <template x-if="loading">
    <div class="fixed top-[72px] left-[264px] right-0 z-40 flex items-center justify-center" style="height: 4px;">
      <div class="w-full h-full bg-accent/20 overflow-hidden">
        <div class="h-full bg-accent animate-pulse" style="width: 60%"></div>
      </div>
    </div>
  </template>

</div>
`;

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}
