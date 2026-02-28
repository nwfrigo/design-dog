# Design Dog — Project Conventions & Standards

> This is the boot file for Design Dog. It covers project basics, environment setup, and universal rules.
> Detailed docs live in the reference files listed below — read them before starting work.

---

## Project Overview

Design Dog is an AI-powered design asset generator for Cority (B2B EHS software company). It lets non-designers create brand-compliant marketing assets. Built with Next.js, deployed on Vercel.

**Stack:** Next.js (App Router), React, TypeScript, Zustand (state), Tailwind CSS, Vercel (hosting + blob storage)

**Project root:** `~/claude-projects/design-dog/web/` — this is the ONLY git repo. All work happens here.

---

## On Session Start

Before beginning any work, read all reference docs to understand the full system:

1. **ARCHITECTURE.md** — System design, state management, export pipeline, API endpoints
2. **TEMPLATES.md** — Template catalog, multi-page collateral, module types, checklists
3. **BRAND.md** — Colors, typography, Figma overrides, image handling, dimensions

These files live alongside this one in `.claude/`. Always consult the relevant reference doc before making changes in that area.

---

## Reference Docs

| File | Scope |
|------|-------|
| `ARCHITECTURE.md` | Template architecture, props, state management (Zustand), export system, PDF upload flow, API endpoints, draft persistence, editor patterns |
| `TEMPLATES.md` | Full template catalog, multi-page collateral (SO, FAQ, Stacker), module types, "adding a new template" checklist, template-specific gotchas |
| `BRAND.md` | Brand colors, typography, Figma override rules, solution pills, image handling, image libraries, template dimensions, dark mode colors |

---

## Environment Variables

- `ANTHROPIC_API_KEY` — for AI copy generation
- `BLOB_READ_WRITE_TOKEN` — for PDF uploads (Vercel Blob)
- `RESEND_API_KEY` — for feature request emails
- Restart dev server after adding env vars
- Vercel requires redeploy after adding environment variables

### Local Development

**Required:** `BLOB_READ_WRITE_TOKEN` in `.env.local`

Get token from: Vercel Dashboard → Project → Storage → Blob Store → Tokens

```bash
# .env.local
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
```

**Common error:** `Vercel Blob: Failed to retrieve the client token`
- Cause: Token missing or commented out (check for `#` prefix)
- Fix: Add/uncomment token, restart dev server

---

## Git & Development

### Workflow
```bash
cd ~/claude-projects/design-dog/web
claude  # Start Claude Code from here

# Separate terminal for dev server:
cd ~/claude-projects/design-dog/web
npm run dev
```

### Commit Pattern
- Build check before commit: `npm run build`
- Commit with descriptive message
- Push to main

---

## Critical Gotchas (Universal)

These apply across the entire codebase — memorize them:

- **Figma outline → border:** Always convert. This is the #1 regression source. (Details in BRAND.md)
- **Figma logo divs:** Always replace with SVG component. (Details in BRAND.md)
- **Export params missing:** Every prop visible in the template MUST appear in exportParams. (Details in ARCHITECTURE.md)
- **Grayscale in export:** Must be passed in exportParams AND handled in render page.
- **Vercel body limit:** PDFs must go through Blob storage, not direct upload. (Details in ARCHITECTURE.md)
- **Two state systems:** Auto-create uses `generatedAssets` + `templateType`; manual mode uses `selectedAssets` + `currentAssetIndex`. Don't mix them. (Details in ARCHITECTURE.md)
- **Modal state persistence:** Use React `key` prop or `useEffect` cleanup to reset modal state on mount.
- **Local PDF uploads:** Require `BLOB_READ_WRITE_TOKEN` in `.env.local`.
- **Local state vs store state:** Editor screens using `useState` for editing MUST sync to store via `useEffect` for draft persistence to work. (Details in ARCHITECTURE.md)
- **PDF export sub-pixel rendering:** Sub-pixel CSS values render inconsistently in Puppeteer PDF export — borders appear thicker, rectangles get distorted. Fix: Round dimensions to integers. Applies to Stacker module borders/dimensions.

---

## No Required Fields

Headline is NOT required. No red asterisks. All buttons (export, queue, save) work even with empty fields. Templates show fallback text when fields are empty.

---

## Auto-Create (formerly Quick Start) Flow

### Screens
1. **Kit Selection** — choose campaign type (webinar, ebook, etc.)
2. **Content Source** — upload PDF or enter text manually
3. **Asset Selection** — pick which assets to generate (checkboxes)
4. **Generating** — progress screen
5. **Editor** — edit generated assets with sidebar navigation

### Key UX Decisions
- No breadcrumbs on auto-create screens
- Full clickable cards for asset selection (not just image area)
- "Deselect All" button next to selection count
- Generate button disabled when 0 assets selected
- Generate button is blue
- About blurb at bottom of sidebar in monospace style

---

## Homepage

### Layout
- Main area: Visual grid of templates by channel (Digital > Email, Social, Website, Newsletter)
- Right sidebar: Auto-Create entry point (formerly "Quick Start" placeholder)
- Expand-in-place interaction for channel categories
- Only one channel expanded at a time

### Template Tiles
- Miniature preview, name, dimensions
- Hover effects (subtle elevation/glow)
- "Request new template" card with feature request form (Resend API)
