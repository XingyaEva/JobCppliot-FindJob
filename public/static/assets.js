/**
 * FindJob 2.0 - Assets Workspace Alpine.js Component
 * 
 * Connects to real backend APIs:
 * - GET  /api/resume/list        - Load all resumes
 * - GET  /api/resume/:id         - Get resume detail
 * - DELETE /api/resume/:id       - Delete resume
 * - PUT  /api/resume/:id         - Update resume
 * - POST /api/resume/parse-text  - Parse pasted text
 * - POST /api/resume/:id/version - Create manual version
 * - GET  /api/resume/:id/versions - Get version history
 *
 * Falls back to localStorage when API unavailable.
 */

document.addEventListener('alpine:init', function () {

  Alpine.data('assetsWorkspace', function () {
    return {
      // === Category & navigation ===
      activeCategory: 'resumes',
      treeExpanded: { resumes: true, projects: false, evidences: false },
      selectedAssetId: null,
      searchTerm: '',
      activeFilterTab: 'all',
      showNewAssetMenu: false,
      loading: false,

      filterTabs: [
        { label: '\u5168\u90e8', value: 'all' },
        { label: '\u7b80\u5386', value: 'resumes' },
        { label: '\u9879\u76ee', value: 'projects' },
        { label: '\u6210\u679c', value: 'evidences' },
      ],

      // === Resume data ===
      resumeVersions: [],
      allResumes: [],    // unfiltered full list
      currentResume: {},
      resumeSections: [],
      editorMode: 'preview',
      editingSection: null,
      editorModes: [
        { id: 'preview', label: '\u9884\u89c8' },
        { id: 'edit', label: '\u7f16\u8f91' },
        { id: 'compare', label: '\u5bf9\u6bd4' },
      ],
      structureSummary: [],

      // === Delete confirmation ===
      showDeleteConfirm: false,
      deleteTarget: null,

      // === Profile data ===
      profileStrengths: [],
      profileRisks: [],
      profileSuggestions: [],

      // === Projects data ===
      projects: [],
      selectedProject: {},
      projectFields: [],

      // === Evidences data ===
      evidenceCategories: [
        { id: 'achievements', name: '\u4e1a\u7ee9\u6210\u679c', count: 0 },
        { id: 'works', name: '\u4f5c\u54c1\u94fe\u63a5', count: 0 },
        { id: 'certs', name: '\u83b7\u5956\u8bc1\u4e66', count: 0 },
        { id: 'quotes', name: '\u63a8\u8350\u8bed\u53e5', count: 0 },
      ],
      evidenceItems: [],
      totalEvidences: 0,

      // === AI Suggestions ===
      aiSuggestions: [],
      versionStats: { keywords: 0, quantified: 0, matchBoost: '+0%' },

      // === Text input drawer ===
      showTextDrawer: false,
      textInput: '',
      textParsing: false,

      // ========================
      // Toast helper
      // ========================
      showToast: function(msg, type) {
        if (window.JobCopilot && window.JobCopilot.showToast) {
          window.JobCopilot.showToast(msg, type || 'info');
        } else {
          console.log('[Toast]', type, msg);
        }
      },

      // ========================
      // Lifecycle
      // ========================
      init: function() {
        var self = this;
        self.loadAllData();

        // Parse URL params
        var params = new URLSearchParams(window.location.search);
        var view = params.get('view');
        if (view === 'profile') self.switchCategory('profile');
        else if (view === 'projects') self.switchCategory('projects');
        else if (view === 'evidences') self.switchCategory('evidences');

        // Render profile radar chart when switching to profile
        self.$watch('activeCategory', function (val) {
          if (val === 'profile') {
            setTimeout(function () { self.renderProfileRadar(); }, 150);
          }
        });
      },

      // ========================
      // Data Loading
      // ========================
      loadAllData: function() {
        this.loadResumes();
        this.loadProjects();
        this.loadEvidences();
        this.loadProfile();
      },

      loadResumes: function() {
        var self = this;
        self.loading = true;

        // Try API first
        fetch('/api/resume/list')
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.success && data.resumes && data.resumes.length > 0) {
              self.processResumes(data.resumes);
              // Sync to localStorage
              try { localStorage.setItem('jobcopilot_resumes', JSON.stringify(data.resumes)); } catch(e) {}
            } else {
              // Fallback to localStorage
              self.loadResumesFromStorage();
            }
            self.loading = false;
          })
          .catch(function(err) {
            console.warn('[Assets] API unavailable, using localStorage:', err);
            self.loadResumesFromStorage();
            self.loading = false;
          });
      },

      loadResumesFromStorage: function() {
        try {
          var raw = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
          this.processResumes(raw);
        } catch (e) {
          console.error('Failed to load resumes from localStorage:', e);
          this.resumeVersions = [];
          this.allResumes = [];
        }
      },

      processResumes: function(rawResumes) {
        var self = this;
        self.allResumes = rawResumes;
        self.resumeVersions = rawResumes.map(function (r, i) {
          return {
            id: r.id || 'resume_' + i,
            name: (r.basic_info && r.basic_info.name) || r.version_tag || r.name || '\u672a\u547d\u540d\u7248\u672c',
            version_tag: r.version_tag || '',
            isCurrent: r.is_master || i === 0,
            isTargeted: !r.is_master && r.linked_jd_ids && r.linked_jd_ids.length > 0,
            updatedAt: r.updated_at ? formatTimeAgo(r.updated_at) + '\u66f4\u65b0' : '',
            linkedJob: (r.linked_jd_ids && r.linked_jd_ids.length > 0) ? r.linked_jd_ids.length + ' \u4e2a\u5c97\u4f4d' : '',
            matchBoost: '',
            source: r.original_file_name ? 'PDF \u89e3\u6790' : (r.is_master ? '\u4e3b\u7248\u672c' : 'AI \u751f\u6210'),
            status: r.status || 'completed',
            raw: r
          };
        });

        // Auto-select first resume
        if (self.resumeVersions.length > 0 && self.activeCategory === 'resumes' && !self.selectedAssetId) {
          self.selectResumeVersion(self.resumeVersions[0]);
        }

        self.loadAISuggestions();
      },

      loadProjects: function() {
        try {
          var rawProjects = JSON.parse(localStorage.getItem('jobcopilot_projects') || '[]');
          this.projects = rawProjects.map(function (p, i) {
            return {
              id: p.id || 'project_' + i,
              name: p.name || '\u672a\u547d\u540d\u9879\u76ee',
              background: p.background || '',
              goal: p.goal || '',
              role: p.role || '',
              actions: p.actions || '',
              results: p.results || '',
              highlights: p.highlights || '',
              tags: p.tags || [],
              raw: p
            };
          });
        } catch (e) {
          this.projects = [];
        }
      },

      loadEvidences: function() {
        try {
          var rawEvidences = JSON.parse(localStorage.getItem('jobcopilot_evidences') || '[]');
          this.evidenceItems = rawEvidences;
          this.totalEvidences = rawEvidences.length;

          var counts = { achievements: 0, works: 0, certs: 0, quotes: 0 };
          rawEvidences.forEach(function (ev) {
            if (ev.type === '\u4e1a\u7ee9\u6210\u679c' || ev.type === 'achievement') counts.achievements++;
            else if (ev.type === '\u4f5c\u54c1\u94fe\u63a5' || ev.type === 'work') counts.works++;
            else if (ev.type === '\u83b7\u5956\u8bc1\u4e66' || ev.type === 'cert') counts.certs++;
            else if (ev.type === '\u63a8\u8350\u8bed\u53e5' || ev.type === 'quote') counts.quotes++;
          });
          this.evidenceCategories.forEach(function (cat) {
            cat.count = counts[cat.id] || 0;
          });
        } catch (e) {
          this.evidenceItems = [];
          this.totalEvidences = 0;
        }
      },

      loadProfile: function() {
        // Default profile data (populated from resume analysis in the future)
        this.profileStrengths = ['\u884c\u4e1a\u573a\u666f\u7406\u89e3', 'B \u7aef\u4ea7\u54c1\u7ecf\u9a8c', '\u8de8\u56e2\u961f\u534f\u4f5c', '\u9700\u6c42\u62c6\u89e3\u80fd\u529b'];
        this.profileRisks = ['\u7f3a\u5c11 0-1 \u9879\u76ee\u8bc1\u636e', '\u6570\u636e\u80fd\u529b\u8868\u8fbe\u5f85\u52a0\u5f3a'];
        this.profileSuggestions = [
          '\u5efa\u8bae\u8865\u5145\u4e00\u4e2a\u5b8c\u6574\u7684 0-1 \u9879\u76ee\u7ecf\u9a8c\uff0c\u7a81\u51fa\u4f60\u7684\u72ec\u7acb\u63a8\u52a8\u80fd\u529b\u3002',
          '\u6570\u636e\u80fd\u529b\u53ef\u4ee5\u901a\u8fc7\u589e\u52a0\u6570\u636e\u9a71\u52a8\u51b3\u7b56\u7684\u5177\u4f53\u6848\u4f8b\u6765\u5f3a\u5316\u3002',
          '\u5f53\u524d\u80fd\u529b\u6a21\u578b\u4e0e AI \u4ea7\u54c1\u7ecf\u7406\u3001B \u7aef\u4ea7\u54c1\u8bbe\u8ba1\u7b49\u65b9\u5411\u9ad8\u5ea6\u5339\u914d\u3002',
        ];
      },

      loadAISuggestions: function() {
        if (this.resumeVersions.length > 0) {
          this.aiSuggestions = [
            {
              title: '\u8865\u5145\u7ed3\u679c\u91cf\u5316',
              priority: '\u9ad8',
              reason: '\u8fd9\u6bb5\u7ecf\u5386\u6709\u660e\u786e\u4e1a\u52a1\u7ed3\u679c\uff0c\u4f46\u5f53\u524d\u8868\u8fbe\u7f3a\u5c11\u6570\u636e\u652f\u6491\u3002\u8865\u5145\u540e\u66f4\u5bb9\u6613\u5339\u914d\u5c97\u4f4d\u4e2d\u7684\u201c\u7ed3\u679c\u5bfc\u5411\u201d\u8981\u6c42\u3002',
              dismissed: false
            },
            {
              title: '\u7a81\u51fa AI \u573a\u666f\u7406\u89e3',
              priority: '\u9ad8',
              reason: '\u76ee\u6807\u5c97\u4f4d\u5bf9 AI \u573a\u666f\u843d\u5730\u7ecf\u9a8c\u8981\u6c42\u8f83\u9ad8\uff0c\u5efa\u8bae\u628a\u4f60\u5728\u76f8\u5173\u9879\u76ee\u4e2d\u7684\u9700\u6c42\u62c6\u89e3\u4e0e\u534f\u4f5c\u8fc7\u7a0b\u63d0\u5230\u66f4\u524d\u9762\u3002',
              dismissed: false
            },
            {
              title: '\u5f3a\u5316\u8de8\u56e2\u961f\u534f\u4f5c\u8868\u8fbe',
              priority: '\u4e2d',
              reason: '\u5c97\u4f4d\u8981\u6c42\u201c\u63a8\u52a8\u8de8\u56e2\u961f\u534f\u4f5c\u201d\uff0c\u5efa\u8bae\u5728\u5de5\u4f5c\u7ecf\u5386\u4e2d\u589e\u52a0\u534f\u4f5c\u65b9\u548c\u534f\u4f5c\u7ed3\u679c\u7684\u5177\u4f53\u63cf\u8ff0\u3002',
              dismissed: false
            },
            {
              title: '\u7cbe\u7b80\u6280\u80fd\u6807\u7b7e',
              priority: '\u4f4e',
              reason: '\u5f53\u524d\u6280\u80fd\u5217\u8868\u8f83\u591a\uff0c\u5efa\u8bae\u53ea\u4fdd\u7559\u4e0e\u76ee\u6807\u5c97\u4f4d\u6700\u76f8\u5173\u7684 8-10 \u4e2a\u6280\u80fd\u6807\u7b7e\u3002',
              dismissed: false
            },
          ];
          this.versionStats = { keywords: 8, quantified: 4, matchBoost: '+7%' };
        } else {
          this.aiSuggestions = [];
          this.versionStats = { keywords: 0, quantified: 0, matchBoost: '+0%' };
        }
      },

      // ========================
      // Navigation
      // ========================
      switchCategory: function(cat) {
        this.activeCategory = cat;
        this.selectedAssetId = null;

        if (cat === 'resumes') {
          this.treeExpanded.resumes = true;
          if (this.resumeVersions.length > 0) {
            this.selectResumeVersion(this.resumeVersions[0]);
          } else {
            this.currentResume = {};
            this.resumeSections = [];
          }
        } else if (cat === 'projects') {
          this.treeExpanded.projects = true;
          this.selectedProject = {};
          this.projectFields = [];
        } else if (cat === 'evidences') {
          this.treeExpanded.evidences = true;
        }
      },

      toggleTreeGroup: function(group) {
        this.treeExpanded[group] = !this.treeExpanded[group];
      },

      // ========================
      // Resume selection & detail
      // ========================
      selectResumeVersion: function(r) {
        var self = this;
        self.activeCategory = 'resumes';
        self.selectedAssetId = r.id;
        self.currentResume = r;
        self.editingSection = null;
        self.editorMode = 'preview';

        // Try fetching fresh detail from API
        fetch('/api/resume/' + r.id)
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data.success && data.resume) {
              r.raw = data.resume;
            }
            self.buildResumeSections(r);
          })
          .catch(function() {
            self.buildResumeSections(r);
          });
      },

      buildResumeSections: function(r) {
        var raw = r.raw || {};
        var bi = raw.basic_info || {};
        var sections = [];

        // Personal info
        var personalParts = [bi.name, bi.email, bi.phone, bi.location].filter(Boolean);
        sections.push({
          title: '\u4e2a\u4eba\u4fe1\u606f',
          content: personalParts.length > 0 ? personalParts.join(' \u00b7 ') : '\u70b9\u51fb\u7f16\u8f91\u4e2a\u4eba\u4fe1\u606f...'
        });

        // Education
        var edu = raw.education;
        if (edu) {
          if (Array.isArray(edu)) {
            sections.push({
              title: '\u6559\u80b2\u7ecf\u5386',
              content: edu.map(function(e) {
                return [e.school, e.degree, e.major, e.period || e.date].filter(Boolean).join(' \u00b7 ');
              }).join('\n') || '\u70b9\u51fb\u7f16\u8f91\u6559\u80b2\u7ecf\u5386...'
            });
          } else {
            sections.push({ title: '\u6559\u80b2\u7ecf\u5386', content: String(edu) });
          }
        } else {
          sections.push({ title: '\u6559\u80b2\u7ecf\u5386', content: '\u70b9\u51fb\u7f16\u8f91\u6559\u80b2\u7ecf\u5386...' });
        }

        // Work experience
        var exp = raw.work_experience || raw.experience;
        if (exp) {
          if (Array.isArray(exp)) {
            sections.push({
              title: '\u5de5\u4f5c\u7ecf\u5386',
              content: exp.map(function(e) {
                var header = [e.company, e.title || e.role, e.period || e.date].filter(Boolean).join(' \u00b7 ');
                var desc = e.description || e.content || '';
                if (Array.isArray(e.achievements)) desc += '\n' + e.achievements.join('\n');
                return header + (desc ? '\n' + desc : '');
              }).join('\n\n')
            });
          } else {
            sections.push({ title: '\u5de5\u4f5c\u7ecf\u5386', content: String(exp) });
          }
        } else {
          sections.push({ title: '\u5de5\u4f5c\u7ecf\u5386', content: '\u70b9\u51fb\u7f16\u8f91\u5de5\u4f5c\u7ecf\u5386...' });
        }

        // Projects
        var proj = raw.projects || raw.project_experience;
        if (proj) {
          if (Array.isArray(proj)) {
            sections.push({
              title: '\u9879\u76ee\u7ecf\u5386',
              content: proj.map(function(p) {
                var header = [p.name || p.title, p.role, p.period || p.date].filter(Boolean).join(' \u00b7 ');
                var desc = p.description || p.content || '';
                if (Array.isArray(p.achievements)) desc += '\n' + p.achievements.join('\n');
                return header + (desc ? '\n' + desc : '');
              }).join('\n\n')
            });
          } else {
            sections.push({ title: '\u9879\u76ee\u7ecf\u5386', content: String(proj) });
          }
        } else {
          sections.push({ title: '\u9879\u76ee\u7ecf\u5386', content: '\u70b9\u51fb\u7f16\u8f91\u9879\u76ee\u7ecf\u5386...' });
        }

        // Skills
        var skills = raw.skills || bi.skills;
        if (skills) {
          var skillText = '';
          if (Array.isArray(skills)) {
            skillText = skills.map(function(s) {
              if (typeof s === 'string') return s;
              if (s.name && s.level) return s.name + ' (' + s.level + ')';
              return s.name || String(s);
            }).join('\u3001');
          } else {
            skillText = String(skills);
          }
          sections.push({ title: '\u6280\u80fd\u4e0e\u8bc1\u4e66', content: skillText || '\u70b9\u51fb\u7f16\u8f91\u6280\u80fd\u4e0e\u8bc1\u4e66...' });
        } else {
          sections.push({ title: '\u6280\u80fd\u4e0e\u8bc1\u4e66', content: '\u70b9\u51fb\u7f16\u8f91\u6280\u80fd\u4e0e\u8bc1\u4e66...' });
        }

        // Ability tags
        var tags = raw.ability_tags;
        if (tags && Array.isArray(tags) && tags.length > 0) {
          sections.push({
            title: '\u80fd\u529b\u6807\u7b7e',
            content: tags.join('\u3001')
          });
        }

        this.resumeSections = sections;

        // Structure summary
        this.structureSummary = [
          { label: '\u5f53\u524d\u7248\u672c\u7279\u70b9', value: r.isTargeted ? '\u9488\u5bf9\u76ee\u6807\u5c97\u4f4d\u5b9a\u5411\u4f18\u5316' : '\u901a\u7528\u7248\u672c' },
          { label: '\u7248\u672c\u6807\u8bb0', value: r.version_tag || '\u57fa\u7840\u7248' },
          { label: '\u6765\u6e90', value: r.source || '\u624b\u52a8\u4e0a\u4f20' },
          { label: '\u72b6\u6001', value: r.status === 'completed' ? '\u89e3\u6790\u5b8c\u6210' : (r.status === 'parsing' ? '\u89e3\u6790\u4e2d...' : '\u5f85\u5904\u7406') },
        ];
      },

      // ========================
      // Project selection
      // ========================
      selectProject: function(p) {
        this.activeCategory = 'projects';
        this.selectedAssetId = p.id;
        this.selectedProject = p;

        this.projectFields = [
          { label: '\u9879\u76ee\u540d\u79f0', value: p.name },
          { label: '\u9879\u76ee\u80cc\u666f', value: p.background },
          { label: '\u4e1a\u52a1\u76ee\u6807', value: p.goal },
          { label: '\u6211\u7684\u89d2\u8272', value: p.role },
          { label: '\u5173\u952e\u52a8\u4f5c', value: p.actions },
          { label: '\u6570\u636e\u7ed3\u679c', value: p.results },
          { label: '\u53ef\u8bb2\u4eae\u70b9', value: p.highlights },
        ];
      },

      selectEvidenceCategory: function(ev) {
        this.selectedAssetId = ev.id;
        var allItems = JSON.parse(localStorage.getItem('jobcopilot_evidences') || '[]');
        var typeMap = {
          achievements: ['\u4e1a\u7ee9\u6210\u679c', 'achievement'],
          works: ['\u4f5c\u54c1\u94fe\u63a5', 'work'],
          certs: ['\u83b7\u5956\u8bc1\u4e66', 'cert'],
          quotes: ['\u63a8\u8350\u8bed\u53e5', 'quote']
        };
        var types = typeMap[ev.id] || [];
        if (types.length > 0) {
          this.evidenceItems = allItems.filter(function (item) {
            return types.indexOf(item.type) >= 0;
          });
        } else {
          this.evidenceItems = allItems;
        }
      },

      // ========================
      // Editor actions
      // ========================
      editSection: function(si) {
        this.editingSection = this.editingSection === si ? null : si;
      },

      aiOptimizeSection: function(si) {
        this.showToast('AI \u6b63\u5728\u4f18\u5316\u8fd9\u4e2a\u6a21\u5757...', 'info');
      },

      saveResume: function() {
        var self = this;
        if (!self.currentResume || !self.currentResume.id) return;

        self.showToast('\u6b63\u5728\u4fdd\u5b58...', 'info');

        fetch('/api/resume/' + self.currentResume.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            createVersion: false
          })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.success) {
            self.showToast('\u4fdd\u5b58\u6210\u529f', 'success');
          } else {
            self.showToast('\u4fdd\u5b58\u5931\u8d25: ' + (data.error || '\u672a\u77e5\u9519\u8bef'), 'error');
          }
        })
        .catch(function() {
          self.showToast('\u4fdd\u5b58\u5931\u8d25\uff0c\u7f51\u7edc\u9519\u8bef', 'error');
        });
      },

      saveAsNewVersion: function() {
        var self = this;
        if (!self.currentResume || !self.currentResume.id) return;

        self.showToast('\u6b63\u5728\u521b\u5efa\u65b0\u7248\u672c...', 'info');

        fetch('/api/resume/' + self.currentResume.id + '/version', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tag: '\u624b\u52a8\u7248\u672c ' + new Date().toLocaleDateString('zh-CN')
          })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.success) {
            self.showToast('\u65b0\u7248\u672c\u5df2\u521b\u5efa', 'success');
            self.loadResumes();
          } else {
            self.showToast('\u521b\u5efa\u5931\u8d25: ' + (data.error || ''), 'error');
          }
        })
        .catch(function() {
          self.showToast('\u521b\u5efa\u5931\u8d25\uff0c\u7f51\u7edc\u9519\u8bef', 'error');
        });
      },

      // ========================
      // Delete resume
      // ========================
      confirmDeleteResume: function() {
        if (!this.currentResume || !this.currentResume.id) return;
        this.deleteTarget = this.currentResume;
        this.showDeleteConfirm = true;
      },

      cancelDelete: function() {
        this.showDeleteConfirm = false;
        this.deleteTarget = null;
      },

      executeDelete: function() {
        var self = this;
        var target = self.deleteTarget;
        if (!target) return;

        self.showDeleteConfirm = false;

        fetch('/api/resume/' + target.id, { method: 'DELETE' })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.success) {
              self.showToast('\u7b80\u5386\u5df2\u5220\u9664', 'success');
              // Also remove from localStorage
              try {
                var stored = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
                stored = stored.filter(function(r) { return r.id !== target.id; });
                localStorage.setItem('jobcopilot_resumes', JSON.stringify(stored));
              } catch(e) {}
              self.selectedAssetId = null;
              self.currentResume = {};
              self.resumeSections = [];
              self.deleteTarget = null;
              self.loadResumes();
            } else {
              // Try localStorage delete
              self.deleteFromStorage(target.id);
            }
          })
          .catch(function() {
            self.deleteFromStorage(target.id);
          });
      },

      deleteFromStorage: function(id) {
        try {
          var stored = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
          var before = stored.length;
          stored = stored.filter(function(r) { return r.id !== id; });
          localStorage.setItem('jobcopilot_resumes', JSON.stringify(stored));
          if (stored.length < before) {
            this.showToast('\u7b80\u5386\u5df2\u5220\u9664', 'success');
          } else {
            this.showToast('\u5220\u9664\u5931\u8d25', 'error');
          }
        } catch(e) {
          this.showToast('\u5220\u9664\u5931\u8d25', 'error');
        }
        this.selectedAssetId = null;
        this.currentResume = {};
        this.resumeSections = [];
        this.deleteTarget = null;
        this.loadResumesFromStorage();
      },

      // ========================
      // AI Suggestion actions
      // ========================
      acceptSuggestion: function(si) {
        this.showToast('\u5df2\u91c7\u7eb3\u5efa\u8bae', 'success');
        this.aiSuggestions[si].dismissed = true;
      },

      rewriteSuggestion: function(si) {
        this.showToast('AI \u6b63\u5728\u6539\u5199...', 'info');
      },

      dismissSuggestion: function(si) {
        this.aiSuggestions[si].dismissed = true;
      },

      // ========================
      // Create new assets
      // ========================
      createNewResume: function() {
        this.showTextDrawer = true;
        this.textInput = '';
      },

      submitTextResume: function() {
        var self = this;
        var text = self.textInput.trim();
        if (!text || text.length < 50) {
          self.showToast('\u8bf7\u8f93\u5165\u81f3\u5c11 50 \u4e2a\u5b57\u7b26\u7684\u7b80\u5386\u5185\u5bb9', 'warning');
          return;
        }

        self.textParsing = true;
        self.showToast('\u6b63\u5728\u89e3\u6790\u7b80\u5386...', 'info');

        fetch('/api/resume/parse-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text,
            parseMethod: 'manual-input'
          })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          self.textParsing = false;
          if (data.success && data.resume) {
            self.showToast('\u7b80\u5386\u89e3\u6790\u6210\u529f\uff01', 'success');
            self.showTextDrawer = false;
            self.textInput = '';
            // Sync to localStorage
            try {
              var stored = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
              stored.unshift(data.resume);
              localStorage.setItem('jobcopilot_resumes', JSON.stringify(stored));
            } catch(e) {}
            self.loadResumes();
          } else {
            self.showToast('\u89e3\u6790\u5931\u8d25: ' + (data.error || '\u672a\u77e5\u9519\u8bef'), 'error');
          }
        })
        .catch(function(err) {
          self.textParsing = false;
          self.showToast('\u89e3\u6790\u5931\u8d25: \u7f51\u7edc\u9519\u8bef', 'error');
        });
      },

      createNewProject: function() {
        var id = 'project_' + Date.now();
        var newProject = {
          id: id,
          name: '\u65b0\u9879\u76ee',
          background: '',
          goal: '',
          role: '',
          actions: '',
          results: '',
          highlights: '',
          tags: []
        };
        var projects = JSON.parse(localStorage.getItem('jobcopilot_projects') || '[]');
        projects.unshift(newProject);
        localStorage.setItem('jobcopilot_projects', JSON.stringify(projects));
        this.loadProjects();
        this.switchCategory('projects');
        this.selectProject(this.projects[0]);
        this.showToast('\u5df2\u521b\u5efa\u65b0\u9879\u76ee', 'success');
      },

      createNewEvidence: function() {
        var id = 'evidence_' + Date.now();
        var newEvidence = {
          id: id,
          title: '\u65b0\u8bc1\u636e',
          type: '\u4e1a\u7ee9\u6210\u679c',
          content: ''
        };
        var evidences = JSON.parse(localStorage.getItem('jobcopilot_evidences') || '[]');
        evidences.unshift(newEvidence);
        localStorage.setItem('jobcopilot_evidences', JSON.stringify(evidences));
        this.loadEvidences();
        this.switchCategory('evidences');
        this.showToast('\u5df2\u521b\u5efa\u65b0\u8bc1\u636e', 'success');
      },

      // ========================
      // Import / Export
      // ========================
      importAssets: function() {
        // Open file picker for PDF upload
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt';
        var self = this;
        input.onchange = function(e) {
          var file = e.target.files && e.target.files[0];
          if (!file) return;
          self.uploadFile(file);
        };
        input.click();
      },

      uploadFile: function(file) {
        var self = this;
        if (!file) return;

        self.showToast('\u6b63\u5728\u4e0a\u4f20 ' + file.name + '...', 'info');
        self.loading = true;

        // For text files, read and send as text
        if (file.name.endsWith('.txt')) {
          var reader = new FileReader();
          reader.onload = function(e) {
            var text = e.target.result;
            self.loading = false;
            self.textInput = text;
            self.showTextDrawer = true;
          };
          reader.readAsText(file);
          return;
        }

        // For PDF files, use upload-smart
        var formData = new FormData();
        formData.append('file', file);

        fetch('/api/resume/upload-smart', {
          method: 'POST',
          body: formData
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          self.loading = false;
          if (data.success && data.resume) {
            self.showToast('\u7b80\u5386\u89e3\u6790\u6210\u529f\uff01(' + (data.parseMethod || 'auto') + ')', 'success');
            // Sync to localStorage
            try {
              var stored = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
              stored.unshift(data.resume);
              localStorage.setItem('jobcopilot_resumes', JSON.stringify(stored));
            } catch(e) {}
            self.loadResumes();
          } else {
            self.showToast('\u89e3\u6790\u5931\u8d25: ' + (data.error || '\u672a\u77e5\u9519\u8bef'), 'error');
          }
        })
        .catch(function(err) {
          self.loading = false;
          self.showToast('\u4e0a\u4f20\u5931\u8d25: \u7f51\u7edc\u9519\u8bef', 'error');
        });
      },

      exportAssets: function() {
        if (window.JobCopilot) JobCopilot.exportData();
      },

      // ========================
      // Refresh
      // ========================
      refreshData: function() {
        this.showToast('\u6b63\u5728\u5237\u65b0...', 'info');
        this.loadAllData();
      },

      // ========================
      // Search & filter
      // ========================
      filterAssets: function() {
        if (this.activeFilterTab !== 'all') {
          this.switchCategory(this.activeFilterTab);
        }
      },

      // ========================
      // Profile radar chart
      // ========================
      renderProfileRadar: function() {
        var el = document.getElementById('profile-radar-chart');
        if (el && typeof echarts !== 'undefined') {
          try {
            var chart = echarts.init(el);
            chart.setOption({
              tooltip: {},
              radar: {
                indicator: [
                  { name: '\u884c\u4e1a\u7406\u89e3', max: 100 },
                  { name: '\u4ea7\u54c1\u7ecf\u9a8c', max: 100 },
                  { name: '\u6280\u672f\u7406\u89e3', max: 100 },
                  { name: '\u6570\u636e\u80fd\u529b', max: 100 },
                  { name: '\u534f\u4f5c\u63a8\u52a8', max: 100 },
                  { name: '0-1 \u9002\u914d', max: 100 },
                ],
                shape: 'polygon',
                splitNumber: 4,
                axisName: { color: '#1d1d1f', fontSize: 11 },
                splitLine: { lineStyle: { color: '#e5e7eb' } },
                splitArea: { areaStyle: { color: ['rgba(0,113,227,0.02)', 'rgba(0,113,227,0.04)'] } },
              },
              series: [{
                type: 'radar',
                data: [{
                  value: [78, 85, 65, 58, 80, 50],
                  name: '\u6211\u7684\u80fd\u529b',
                  areaStyle: { color: 'rgba(0,113,227,0.12)' },
                  lineStyle: { color: '#0071e3', width: 2 },
                  itemStyle: { color: '#0071e3' },
                }]
              }]
            });
            window.addEventListener('resize', function () { chart.resize(); });
          } catch (e) {
            console.error('Profile radar chart error:', e);
          }
        }
      },
    };
  });

  // Helper: format time ago
  function formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    try {
      var d = new Date(dateStr);
      var now = new Date();
      var diff = now.getTime() - d.getTime();
      var mins = Math.floor(diff / 60000);
      if (mins < 1) return '\u521a\u521a';
      if (mins < 60) return mins + ' \u5206\u949f\u524d';
      var hours = Math.floor(mins / 60);
      if (hours < 24) return hours + ' \u5c0f\u65f6\u524d';
      var days = Math.floor(hours / 24);
      if (days < 30) return days + ' \u5929\u524d';
      return d.toLocaleDateString('zh-CN');
    } catch (e) { return ''; }
  }

});
