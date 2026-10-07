# AGENTS.md — smartergpt.dev

> **Purpose:** Static marketing/docs site for SmarterGPT, Lex, and LexRunner.

This document orients all agents (human and automated) toward the correct file structure and conventions for the smartergpt.dev website.

---

## 1) Critical: File Structure

**ALL site files live in `/public/` — this is the only directory served by nginx.**

```
/srv/www/smartergpt/
├── .git/
├── .github/              # CI/CD workflows, repo config
├── .gitignore
├── .smartergpt/          # Lex workspace (not site content)
├── .smartergpt.local/    # Local workspace (not site content)
├── AGENTS.md             # This file
└── public/               # ⚠️ ALL SITE FILES GO HERE
    ├── assets/
    │   ├── app.js
    │   └── styles.css
    ├── docs/
    │   ├── how-to-use/
    │   ├── merge-pyramid/
    │   ├── research/
    │   └── the-moat/
    ├── projects/
    │   ├── lex/
    │   ├── lex-pr/
    │   └── lex-serve/
    ├── index.html
    ├── request-access.html
    ├── roadmap.html
    └── robots.txt
```

### Rules

1. **NEVER create site files outside `/public/`** — they won't be served.
2. **NEVER create a duplicate directory structure** (e.g., `/docs/` at root level).
3. **When editing HTML/CSS/JS**, always edit files in `/public/`.
4. **Git tracks `/public/`** — it is NOT in `.gitignore`.

---

## 2) Tech Stack

- **Static HTML** — no build system, no SSG, no bundler.
- **CSS** — single stylesheet at `/public/assets/styles.css`.
- **JS** — minimal, single file at `/public/assets/app.js`.
- **Hosting** — nginx serving `/public/` (mounted as `/usr/share/nginx/html` in container).

---

## 3) Site Conventions

### HTML Structure

All pages follow this pattern:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Page Title | SmarterGPT.dev</title>
    <link rel="stylesheet" href="../../assets/styles.css" />
</head>
<body>
    <header class="container nav">...</header>
    <main class="container">...</main>
    <footer class="container footer">...</footer>
    <script src="../../assets/app.js"></script>
</body>
</html>
```

### CSS Classes

- `.container` — max-width wrapper
- `.hero` — hero section (use `display: block` for single-column pages)
- `.card` — bordered content card
- `.grid` — 3-column responsive grid
- `.kicker` — section label (uppercase, muted)
- `.badge` — small status pill
- `.button`, `.button.primary`, `.button.ghost` — CTA buttons
- `.pill` — nav/tag pills
- `.hr` — gradient horizontal rule

### Link Paths

Use relative paths from the current file:
- From `/public/docs/research/index.html` to root: `../../index.html`
- From `/public/docs/research/index.html` to assets: `../../assets/styles.css`
- From `/public/index.html` to docs: `docs/research/index.html`

---

## 4) Content Types

| Directory | Content |
|-----------|---------|
| `/public/` | Root pages (index, roadmap, request-access) |
| `/public/docs/research/` | Research papers, essays, think pieces |
| `/public/docs/how-to-use/` | User guides |
| `/public/docs/the-moat/` | Strategic positioning docs |
| `/public/docs/merge-pyramid/` | Merge pyramid concept |
| `/public/projects/lex/` | Lex OSS project page |
| `/public/projects/lex-pr/` | LexRunner project page |
| `/public/projects/lex-serve/` | Lex-serve project page |

---

## 5) Deployment

- **Branch:** `production` is the default and deployed branch.
- **Process:** The Build & Deploy workflow copies `/public/` to `dist` and publishes to Cloudflare Pages on a push to `production`.
- **Verification:** Wait for that exact commit's deployment to succeed, then inspect the live page's actual changed text. A successful HTTP response or a license keyword alone does not verify release-status copy.
- **Release status:** Check the homepage, roadmap, stack, licensing, access and affected project pages together. Preserve historical documents and distinguish public package access from hosted-system authority.
- **No application build step** — HTML is served directly.

### Current project positioning

- LexThority is historical research with no active product commitment, per Joseph's 2026-09-06 direction. Keep its historical page and source links; do not market it as an active product or remove independent authorization requirements.
- ContextForge is the pure context-linking library tracked in Lex #837. Ownership and input contracts are ratified, and the first local implementation (LINK-1B1, version 0.1.0) is tested. It remains private and unpublished; live adapters and a LexRunner consumer are future work. Do not advertise a public npm package, public source repository, or execution authority.

---

## 6) External Links

When linking to Lex repo docs:
```html
<a href="https://github.com/Guffawaffle/lex/blob/main/docs/control-stack/index.md"
   target="_blank" rel="noopener">Control Stack Docs</a>
```

Research papers in Lex repo:
- Atlas Frames: `https://github.com/Guffawaffle/lex/blob/main/docs/research/adjacency-constrained-episodic-memory.pdf`
- LexSona: `https://github.com/Guffawaffle/lex/blob/main/docs/research/LexSona/lexsona_paper.md`
- Control Stack: `https://github.com/Guffawaffle/lex/blob/main/docs/control-stack/index.md`

---

## 7) Common Mistakes to Avoid

❌ Creating `/docs/` at repo root (should be `/public/docs/`)
❌ Creating `/assets/` at repo root (should be `/public/assets/`)
❌ Editing files outside `/public/` expecting them to appear on site
❌ Adding `public/` to `.gitignore`
❌ Forgetting to push after edits (no build step, but git push required)

---

## 8) Checklist for New Pages

- [ ] Created in `/public/` directory
- [ ] Correct relative paths to `assets/styles.css` and `assets/app.js`
- [ ] Nav links updated if adding new top-level page
- [ ] Title follows pattern: `Page Name | SmarterGPT.dev`
- [ ] Meta description added
- [ ] Committed and pushed to `production` branch
