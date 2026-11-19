// Vice Legends — filtering: kind chips, grade, search text, hide-earned and the
// spoiler rule. Pure functions over the trophy list; no DOM here except none.

export const KIND_LABELS = {
  all: 'All',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export const KIND_ORDER = ['all', 'story', 'missable', 'collectibles', 'activities', 'online'];

// A trophy is shown under each kind in its kinds array. The platinum carries no
// kind: it appears under All and in the roadmap, never under a kind filter.
export function trophyKinds(trophy) {
  return Array.isArray(trophy.kinds) ? trophy.kinds : [];
}

export function isStoryTrophy(trophy) {
  return trophyKinds(trophy).includes('story');
}

export function isMissableTrophy(trophy) {
  return trophyKinds(trophy).includes('missable');
}

// Spoiler rule: a story trophy whose name and description stay hidden until it is
// earned. Hidden (secret) trophies are never masked: their names are public.
export function isSpoilerMasked(trophy, earned, hideSpoilers) {
  if (!hideSpoilers) return false;
  if (earned.has(trophy.id)) return false;
  return isStoryTrophy(trophy);
}

export function filterTrophies(trophies, earned, opts) {
  const query = (opts.query || '').trim().toLowerCase();
  return trophies.filter((t) => {
    if (opts.kind && opts.kind !== 'all' && !trophyKinds(t).includes(opts.kind)) return false;
    if (opts.grade && t.grade !== opts.grade) return false;
    if (opts.hideEarned && earned.has(t.id)) return false;
    if (query) {
      const hay = `${t.name} ${t.description} ${t.guide || ''}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

export function countByGrade(trophies, earned) {
  const out = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    if (!out[t.grade]) out[t.grade] = [0, 0];
    out[t.grade][1] += 1;
    if (earned.has(t.id)) out[t.grade][0] += 1;
  }
  return out;
}
