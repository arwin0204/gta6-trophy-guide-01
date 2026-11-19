// Vice Legends — views: the checklist, the guide pane, the platinum roadmap,
// the missables page and the about page. Rendering only; state lives in app.js.

import { isMissableTrophy, isSpoilerMasked, isStoryTrophy } from './filters.js';

export function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function displayName(trophy, earned, hideSpoilers) {
  if (isSpoilerMasked(trophy, earned, hideSpoilers)) return 'Hidden story trophy';
  return trophy.name;
}

export function displayDescription(trophy, earned, hideSpoilers) {
  if (isSpoilerMasked(trophy, earned, hideSpoilers)) {
    return 'A story trophy — its name and description stay hidden until you earn it.';
  }
  return trophy.description;
}

export function renderProgress(el, trophies, earned, isDemo) {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] || [0, 0];
    byGrade[t.grade][1] += 1;
    if (earned.has(t.id)) byGrade[t.grade][0] += 1;
  }
  const parts = ['platinum', 'gold', 'silver', 'bronze']
    .filter((g) => byGrade[g])
    .map((g) => `${byGrade[g][0]}/${byGrade[g][1]} ${g}`)
    .join(' · ');
  el.innerHTML = `<div class="big">${done} / ${total}</div>`
    + `<div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>`
    + `<div class="sub">${pct}% — ${esc(parts)}</div>`
    + (isDemo ? `<div><span class="demo-pill">Demo progress — example data</span></div>` : '');
}

function tagHtml(trophy, earned, hideSpoilers) {
  const tags = [];
  if (isMissableTrophy(trophy)) tags.push('<span class="tag missable">Missable</span>');
  if (trophy.hidden) tags.push('<span class="tag hidden">Hidden</span>');
  if (isStoryTrophy(trophy)) tags.push('<span class="tag">Story</span>');
  if (trophy.kinds && trophy.kinds.includes('collectibles')) tags.push('<span class="tag">Collectibles</span>');
  if (trophy.kinds && trophy.kinds.includes('activities')) tags.push('<span class="tag">Activities</span>');
  return tags.join('');
}

export function renderList(el, trophies, earned, hideSpoilers, onToggle, onSelect) {
  el.innerHTML = '';
  for (const t of trophies) {
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
    li.dataset.id = String(t.id);
    const masked = isSpoilerMasked(t, earned, hideSpoilers);
    li.innerHTML = `<input type="checkbox" ${earned.has(t.id) ? 'checked' : ''} aria-label="Mark ${esc(masked ? 'hidden story trophy' : t.name)} earned">`
      + `<div><div class="name">${esc(displayName(t, earned, hideSpoilers))}</div>`
      + `<div class="desc">${esc(displayDescription(t, earned, hideSpoilers))}</div>`
      + `<div class="tags">${tagHtml(t, earned, hideSpoilers)}</div></div>`
      + `<div class="grade ${esc(t.grade)}"><span class="dot"></span>${esc(gradeLabel(t.grade))}</div>`;
    li.querySelector('input').addEventListener('click', (ev) => {
      ev.stopPropagation();
      onToggle(t.id);
    });
    li.addEventListener('click', () => onSelect(t.id));
    el.appendChild(li);
  }
}

function sourcesHtml(trophy) {
  if (!trophy.sources || !trophy.sources.length) return '';
  const links = trophy.sources
    .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`)
    .join(' · ');
  return `<h3>Sources</h3><p class="sources">${links}</p>`;
}

export function renderDetail(el, trophy, earned, hideSpoilers, onToggle) {
  if (!trophy) {
    el.innerHTML = '<h2>Pick a trophy</h2><p>Select any trophy on the left to read its guide, its sources and when it can be missed. Your progress is saved in this browser.</p>';
    return;
  }
  const masked = isSpoilerMasked(trophy, earned, hideSpoilers);
  const isEarned = earned.has(trophy.id);
  const steps = (trophy.steps || []).map((s) => `<li>${esc(s)}</li>`).join('');
  const unconfirmed = trophy.unconfirmed
    ? `<div class="unconfirmed"><strong>Metode belum terkonfirmasi.</strong> No published guide has confirmed the exact trigger yet — the official description is the only hint so far. The guide below says only what the sources have actually confirmed.</div>`
    : '';
  const missable = isMissableTrophy(trophy)
    ? `<div class="warn"><strong>Missable.</strong> ${esc(trophy.missableNote || 'This trophy can be missed — read the Missables page before you pass the point of no return.')}</div>`
    : '';
  const count = trophy.count
    ? `<p><strong>PSN target:</strong> ${esc(String(trophy.count))}</p>`
    : '';
  el.innerHTML = `<h2>${esc(displayName(trophy, earned, hideSpoilers))}</h2>`
    + `<p class="desc">${esc(displayDescription(trophy, earned, hideSpoilers))}</p>`
    + `<div class="tags">${tagHtml(trophy, earned, hideSpoilers)}<span class="tag">${esc(gradeLabel(trophy.grade))}</span>${trophy.hidden ? '<span class="tag hidden">Hidden on PSN</span>' : ''}</div>`
    + (masked ? '<p>Turn off “Hide story spoilers”, or earn this trophy, to read its guide.</p>' : '')
    + (masked ? '' : `${missable}${unconfirmed}<h3>Guide</h3><p>${esc(trophy.guide || '')}</p>${steps ? `<h3>Steps</h3><ol>${steps}</ol>` : ''}${count}${sourcesHtml(trophy)}`)
    + `<button class="primary earn-btn" type="button">${isEarned ? 'Mark as not earned' : 'Mark as earned'}</button>`;
  el.querySelector('.earn-btn').addEventListener('click', () => onToggle(trophy.id));
}

export const ROADMAP_STAGES = [
  {
    n: 1,
    title: 'Chapter 1 — First steps',
    text: 'Play the opening, and do the one thing you can never go back for: Lucia’s balcony meditation. Keep a manual save at the start of the chapter.',
    ids: [2, 3, 28, 20, 21, 16],
  },
  {
    n: 2,
    title: 'Chapter 2 — Leonida opens up',
    text: 'Jason and Lucia can switch now, so partner trophies open. Garages and the Scooter Bros app unlock here; buy garages before you register cars.',
    ids: [4, 46, 54, 55, 8, 9],
  },
  {
    n: 3,
    title: 'Chapter 3 — Heists and robberies',
    text: 'The robbery tools arrive: the Snap Gun, shop robberies with your partner, and the time-sensitive Race Against Yago. Save before each one.',
    ids: [5, 39, 34, 25, 37, 10, 11],
  },
  {
    n: 4,
    title: 'Chapter 4 — Endgame',
    text: 'Bank vaults unlock near the end of the chapter. Bring your partner: vaults hand you a 4-star wanted level, and escaping together earns two trophies at once.',
    ids: [6, 40, 33, 41, 38, 12, 13],
  },
  {
    n: 5,
    title: 'After the credits — cleanup and 100%',
    text: 'Everything outside the story stays open. Finish the side-story finales, then grind the counts: 300 stunts, 70 of 80 Challenges, 200 of 277 vehicles, and the rest of the 100% checklist. The final mission and the platinum sit at the end of this stage.',
    ids: [7, 14, 1, 15, 17, 18, 19, 22, 23, 24, 26, 27, 29, 30, 31, 32, 35, 36, 42, 43, 44, 45, 47, 48, 49, 50, 51, 52, 53],
  },
];

export function renderRoadmap(el, trophies, earned, onSelect) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  let html = '<h2>Roadmap to the platinum</h2>'
    + '<p>Play the story in order, do the missable things in their chapters, and leave the counting to the end. There is no mission replay and no New Game Plus, so keep one manual save at the start of every chapter and one untouched save from just before the final mission. The platinum, <strong>Vice Got a Price!</strong>, pops when the other 54 are earned.</p>';
  for (const stage of ROADMAP_STAGES) {
    const items = stage.ids.map((id) => byId.get(id)).filter(Boolean);
    const done = items.filter((t) => earned.has(t.id)).length;
    html += `<div class="card"><div class="stage-head"><h3>Stage ${stage.n} — ${esc(stage.title)}</h3><span class="done">${done}/${items.length} earned</span></div>`
      + `<p>${esc(stage.text)}</p><ul class="stage-list">`
      + items.map((t) => `<li data-id="${t.id}" class="${earned.has(t.id) ? 'earned' : ''}"><input type="checkbox" ${earned.has(t.id) ? 'checked' : ''} tabindex="-1" aria-hidden="true"><span>${esc(t.name)}</span><span class="g">${esc(gradeLabel(t.grade))}</span></li>`).join('')
      + '</ul></div>';
  }
  el.innerHTML = html;
  el.querySelectorAll('.stage-list li').forEach((li) => {
    li.addEventListener('click', () => onSelect(Number(li.dataset.id)));
  });
}

export function renderMissables(el, trophies, earned, onSelect) {
  const unconfirmed = trophies.filter((t) => t.unconfirmed);
  let html = '<h2>Missables — read this first</h2>'
    + '<div class="card"><div class="warn"><strong>One trophy is a real miss risk: Positive Mental Attitude.</strong> '
    + 'One meditation spot is Lucia’s balcony at Jason’s house in Chapter 1, and it disappears when the chapter ends. '
    + 'There is no mission replay, so a missed spot means a second playthrough.</div>'
    + '<h3>How to stay safe</h3><ol>'
    + '<li>Keep a manual save at the start of every chapter (the game has 15 manual slots plus one autosave).</li>'
    + '<li>In Chapter 1, after the mission Down to Earth, check the kitchen in the morning: Lucia heads out to the balcony to meditate. Follow her and accept the optional task.</li>'
    + '<li>Meditate with your partner whenever you can — each outdoor spot should count twice, once per character.</li>'
    + '<li>Keep your Chapter 1 save until Positive Mental Attitude pops. It is not confirmed that the trophy strictly needs the balcony spot, so do it anyway.</li>'
    + '<li>Never test cheats on your trophy save: cheats should switch off trophies and saving.</li>'
    + '</ol></div>'
    + '<div class="card"><h3>Time-sensitive, but not missable</h3>'
    + '<p><strong>Race Against Yago</strong> (Chapter 3, Yago’s street-racing strand) is time-sensitive — it shows an hourglass icon. '
    + 'It counts toward Strangers &amp; Freaks, so do it the moment it appears and save first. The side-story finales (Kenton, Billy, Andy, Randy, Tyrone, Bret) all stay available after the credits.</p></div>'
    + '<div class="card"><h3>Five trophies with no confirmed method yet</h3>'
    + '<p>These five have no confirmed unlock method at launch. Their official descriptions are the only hint, and some may pop while you play normally. This guide claims nothing more — each one is marked <strong>metode belum terkonfirmasi</strong> in its own guide.</p><ul class="stage-list">'
    + unconfirmed.map((t) => `<li data-id="${t.id}"><span>${esc(t.name)}</span><span class="g">${esc(t.description)}</span></li>`).join('')
    + '</ul></div>';
  el.innerHTML = html;
  el.querySelectorAll('.stage-list li').forEach((li) => {
    li.addEventListener('click', () => onSelect(Number(li.dataset.id)));
  });
}

export function renderAbout(el) {
  el.innerHTML = '<h2>About this guide</h2>'
    + '<div class="card"><h3>What it is</h3>'
    + '<p>Vice Legends is an offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI. '
    + 'It lists every trophy with its official name, description and grade, a guide in its own words that cites its sources, '
    + 'a roadmap to the platinum, and a checklist whose progress is saved in your browser (localStorage). It works with the network off: every file it loads is one of its own.</p></div>'
    + '<div class="card"><h3>Where the facts come from</h3>'
    + '<p>Names, descriptions, grades and hidden flags are the official PlayStation list as published on Exophase and PSNProfiles (the two agree on every name, description and grade). '
    + 'Unlock methods come from the launch-week trophy guides that checked them, chiefly Output Lag’s trophy list, and each trophy’s guide names its sources beside it. '
    + 'Where no guide has confirmed a method, the guide says so plainly instead of inventing one.</p></div>'
    + '<div class="card"><h3>Your progress</h3>'
    + '<p>Ticking a trophy saves it in this browser only — nothing leaves your machine. Export downloads your progress as a JSON file; Import reads one back. '
    + 'Use it to move progress between browsers or keep a backup before a long grind.</p></div>'
    + '<div class="card"><h3>Honesty notes</h3>'
    + '<p>The game launched 19 November 2026 and this list was checked the same day. Five trophies have no confirmed unlock method yet, and one meditation spot is only reported as possibly missable — both are labelled as such, not stated as fact. '
    + 'Estimates such as “around 200 hours” for the platinum come from the guides cited, not from this page. No Rockstar logo, artwork or game screenshot appears anywhere in this guide.</p></div>';
}
