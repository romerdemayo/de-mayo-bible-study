# De Mayo Bible Ministry — Version 13 — Repaired

A responsive GitHub Pages Bible ministry app with the complete offline King James Version (KJV).

## Version 13 — Repaired improvements

- Clickable Scripture references throughout devotionals, exhortations, Bible studies, kids lessons, and prayer resources
- Direct opening to the correct KJV book, chapter, and verse
- Selected verse highlighting and Back to resource navigation
- Full Help & User Guide
- Responsive navigation for iPhone, Android, iPad, Windows, and Mac
- Bible search, favourites, highlights, verse notes, prayer journal, sermon builder, kids planner, reading plan, creator, and private backup

## Deploy to GitHub Pages

Upload all files and folders from this package to the root of the `de-mayo-bible-study` repository. Replace the older files. In GitHub Settings → Pages, deploy from the `main` branch and `/root`, or use the included GitHub Actions workflow.

Live address: `https://romerdemayo.github.io/de-mayo-bible-study/`

After deployment, refresh the website. On iPhone, remove an older Home Screen installation and add the site again if the old cached version remains.


## Version 13 repair
- Added cache-busted assets to prevent stale iPhone and browser files.
- Changed the service worker to prefer the latest GitHub files while retaining offline fallback.
- Added visible startup error messages when a required file fails to load.
- Kept the complete offline KJV Bible and clickable Scripture references.
