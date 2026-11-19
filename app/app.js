// Vice Legends — boot and wiring: loads the trophy data, holds the state
// (earned set, filters, spoiler setting, selected trophy), routes by hash,
// and connects the toolbar to the views. No network beyond its own files.

import {
  clearProgress,
  exportProgress,
  importProgressFile,
  loadProgress,
  loadSettings,
  saveProgress,
  saveSettings,
  seedDemoProgress,
} from './store.js';
import { KIND_LABELS, KIND_ORDER, filterTrophies } from './filters.js';
import {
  renderAbout,
  renderDetail,
  renderList,
  renderMissables,
  renderProgress,
  renderRoadmap,
} from './views.js';

const params = new URLSearchParams(location.search);
const wantsDemo = params.get('demo') === '1';
const wantsSpoiler = params.get('spoiler') === '1';

let trophies = [];
let earned = loadProgress();
let settings = loadSettings();
if (wantsSpoiler) settings.hideSpoilers = true;
let isDemo = false;
if (wantsDemo && earned.size === 0) {
  earned = seedDemoProgress();
  isDemo = true;
}

const state = {
  view: 'list',
  kind: 'all',
  grade: '',
  query: '',
  hideEarned: false,
  selectedId: null,
};

const els = {
  progress: document.getElementById('progress'),
  tabs: document.getElementById('tabs'),
  toolbar: document.getElementById('toolbar'),
  search: document.getElementById('search'),
  chips: document.getElementById('kind-chips'),
  grade: document.getElementById('grade-filter'),
  hideEarned: document.getElementById('hide-earned'),
  spoiler: document.getElementById('spoiler-toggle'),
  exportBtn: document.getElementById('export-btn'),
  importBtn: document.getElementById('import-btn'),
  importFile: document.getElementById('import-file'),
  count: document.getElementById('count'),
  list: document.getElementById('trophy-list'),
  empty: document.getElementById('empty'),
  detail: document.getElementById('detail-col'),
  layout: document.querySelector('.layout'),
  page: document.getElementById('page'),
};

function currentView() {
  const hash = location.hash || '#/list';
  const parts = hash.replace(/^#\//, '').split('/');
  if (parts[0] === 'trophy' && parts[1]) return { view: 'list', selectedId: Number(parts[1]) || null };
  if (['list', 'roadmap', 'missables', 'about'].includes(parts[0])) return { view: parts[0], selectedId: null };
  return { view: 'list', selectedId: null };
}

function visibleTrophies() {
  return filterTrophies(trophies, earned, {
    kind: state.kind,
    grade: state.grade,
    query: state.query,
    hideEarned: state.hideEarned,
  });
}

function render() {
  const { view, selectedId } = currentView();
  state.view = view;
  state.selectedId = selectedId;
  renderProgress(els.progress, trophies, earned, isDemo);
  els.tabs.querySelectorAll('a').forEach((a) => {
    a.classList.toggle('active', a.dataset.view === view);
  });
  const isList = view === 'list';
  els.toolbar.style.display = isList ? '' : 'none';
  els.layout.style.display = isList ? '' : 'none';
  els.page.hidden = isList;
  if (!isList) {
    if (view === 'roadmap') renderRoadmap(els.page, trophies, earned, selectTrophy);
    if (view === 'missables') renderMissables(els.page, trophies, earned, selectTrophy);
    if (view === 'about') renderAbout(els.page);
    return;
  }
  const shown = visibleTrophies();
  els.count.textContent = `Showing ${shown.length} of ${trophies.length} trophies — ${trophies.filter((t) => earned.has(t.id)).length} earned.`;
  els.empty.hidden = shown.length > 0;
  renderList(els.list, shown, earned, !!settings.hideSpoilers, toggleEarned, selectTrophy);
  const selected = trophies.find((t) => t.id === state.selectedId) || null;
  document.querySelectorAll('.trophy').forEach((li) => {
    li.classList.toggle('selected', Number(li.dataset.id) === state.selectedId);
  });
  renderDetail(els.detail, selected, earned, !!settings.hideSpoilers, toggleEarned);
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveProgress(earned);
  render();
}

function selectTrophy(id) {
  location.hash = `#/trophy/${id}`;
}

function buildChips() {
  els.chips.innerHTML = '';
  for (const kind of KIND_ORDER) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = KIND_LABELS[kind];
    b.setAttribute('aria-pressed', String(state.kind === kind));
    b.addEventListener('click', () => {
      state.kind = kind;
      buildChips();
      render();
    });
    els.chips.appendChild(b);
  }
}

function wireToolbar() {
  els.search.addEventListener('input', () => {
    state.query = els.search.value;
    render();
  });
  els.grade.addEventListener('change', () => {
    state.grade = els.grade.value;
    render();
  });
  els.hideEarned.addEventListener('change', () => {
    state.hideEarned = els.hideEarned.checked;
    render();
  });
  els.spoiler.checked = !!settings.hideSpoilers;
  els.spoiler.addEventListener('change', () => {
    settings.hideSpoilers = els.spoiler.checked;
    saveSettings(settings);
    render();
  });
  els.exportBtn.addEventListener('click', () => exportProgress(earned, settings));
  els.importBtn.addEventListener('click', () => els.importFile.click());
  els.importFile.addEventListener('change', () => {
    const file = els.importFile.files && els.importFile.files[0];
    if (!file) return;
    importProgressFile(file)
      .then(({ earned: next, settings: nextSettings }) => {
        earned = next;
        saveProgress(earned);
        if (typeof nextSettings.hideSpoilers === 'boolean') {
          settings.hideSpoilers = nextSettings.hideSpoilers;
          els.spoiler.checked = settings.hideSpoilers;
          saveSettings(settings);
        }
        isDemo = false;
        render();
      })
      .catch((err) => {
        window.alert(`Could not import that file: ${err.message}`);
      })
      .finally(() => {
        els.importFile.value = '';
      });
  });
  window.addEventListener('hashchange', render);
}

function bootError(message) {
  els.count.textContent = '';
  els.list.innerHTML = '';
  els.empty.hidden = true;
  els.detail.innerHTML = `<h2>Could not load the trophy list</h2><p>${message}</p><p>Serve this folder with a static file server and open index.html from it.</p>`;
}

fetch('data/trophies.json')
  .then((res) => {
    if (!res.ok) throw new Error(`trophies.json answered ${res.status}`);
    return res.json();
  })
  .then((data) => {
    trophies = Array.isArray(data) ? data : data.trophies;
    if (!Array.isArray(trophies) || trophies.length === 0) {
      throw new Error('trophies.json holds no trophies.');
    }
    buildChips();
    wireToolbar();
    render();
  })
  .catch((err) => bootError(err.message));
