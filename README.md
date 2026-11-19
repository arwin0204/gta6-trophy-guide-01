# Vice Legends — GTA VI Trophy Guide & Tracker

[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/arwin0204/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/arwin0204/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of **Grand Theft Auto VI** — entered in [make.fun's GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Checklist** of every trophy with its official name, description and grade, saved in the browser (localStorage), with export to a JSON file and import back.
- **Filters** by kind (story, missable, collectibles, activities, online), by grade, and by search text — plus a hide-earned switch.
- **Spoiler setting** that hides the names and descriptions of story trophies until they are earned.
- **Platinum roadmap** in five stages, from Chapter 1 to the 100% cleanup, in the order to earn them.
- **Missables page**: the one real miss risk (Positive Mental Attitude, Chapter 1), the time-sensitive Race Against Yago, the save strategy (no mission replay), and the five trophies whose unlock method is still unconfirmed — each marked plainly instead of guessed.
- **A cited guide for every trophy**, written for this page: what to do, where and how, and when it can be missed, with its sources named beside it.

## How to run it

Serve `app/` with any static file server and open `index.html`:

```sh
cd app && python3 -m http.server 8080
# open http://localhost:8080
```

It works with the network off: every file it loads is one of its own. No build step, no dependencies.

Open with `?demo=1` to preview the tracker with example progress (13 of 55 earned); open with `?spoiler=1` to preview the spoiler setting on.

## Where the facts come from

- Names, descriptions, grades and hidden flags: the official PlayStation list as published on [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi) — the two agree on every name, description and grade.
- Unlock methods: the launch-week trophy guides that checked them, chiefly [Output Lag's trophy list](https://outputlag.com/guides/gta-6-trophy-list/). Where no guide has confirmed a method, the guide says so instead of inventing one.

## Layout

- `main.ts` — the entry program: copies `app/` and `screenshots/` to the output and writes `dossier.json`.
- `app/index.html`, `app/style.css` — the shell and the look.
- `app/app.js` — boot, state and routing; `app/store.js` — progress storage, export/import; `app/filters.js` — kind, grade, search and spoiler rules; `app/views.js` — checklist, guide pane, roadmap, missables and about pages.
- `app/data/trophies.json` — the 55 trophies with their official data, guides and sources.
- `screenshots/` — four renders of the guide, taken by its maker.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

## License

MIT. Grand Theft Auto is a trademark of Take-Two Interactive; this guide is independent and fan-made, and shows no Rockstar logo, artwork or game screenshots.
