// Vice Legends — progress store: earned trophies in localStorage, with export/import.
// One file, one job: nothing here touches the network or the DOM beyond storage.

export const STORE_KEY = 'vice-legends-progress-v1';
export const SETTINGS_KEY = 'vice-legends-settings-v1';

// Thirteen early, plausible trophies, earned in story order, used only when the
// page is opened with ?demo=1 so screenshots can show a tracker with progress.
export const DEMO_EARNED_IDS = [2, 3, 20, 21, 8, 9, 10, 46, 54, 36, 37, 16, 22];

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.earned)) return new Set();
    return new Set(parsed.earned.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

export function saveProgress(earned) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b) }));
  } catch {
    // Storage full or unavailable: progress lives in memory for this visit.
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore: settings fall back to defaults next visit.
  }
}

export function seedDemoProgress() {
  const earned = new Set(DEMO_EARNED_IDS);
  saveProgress(earned);
  return earned;
}

export function clearProgress() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    // Ignore.
  }
  return new Set();
}

export function exportProgress(earned, settings) {
  const payload = {
    app: 'vice-legends',
    game: 'Grand Theft Auto VI',
    exported_at: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    settings: { hideSpoilers: !!settings.hideSpoilers },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vice-legends-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function importProgressFile(file) {
  return file.text().then((text) => {
    const parsed = JSON.parse(text);
    const earned = Array.isArray(parsed.earned)
      ? parsed.earned
      : Array.isArray(parsed)
        ? parsed
        : null;
    if (!earned) throw new Error('This file has no earned-trophy list.');
    const ids = earned.filter((n) => Number.isInteger(n));
    const settings = {};
    if (parsed && typeof parsed.settings === 'object' && parsed.settings) {
      settings.hideSpoilers = !!parsed.settings.hideSpoilers;
    }
    return { earned: new Set(ids), settings };
  });
}
