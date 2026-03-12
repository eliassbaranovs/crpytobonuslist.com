# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server at localhost:4321
npm run build      # Production build to ./dist/
npm run preview    # Preview production build locally
```

No test runner or linter is configured.

## Deployment

Deploys via cPanel git push. `.cpanel.yml` triggers `deploy.sh`, which runs `npm install && npm run build` on the server and copies `dist/` to the web root.

## Architecture

Astro 5.x static site with Tailwind CSS 4.x (via `@tailwindcss/vite` plugin, not the Astro integration).

### Unified Content Model

All content lives in `src/content/posts/` as Markdown files with YAML frontmatter. The `contentType` field determines routing:

| contentType | URL pattern | Page template |
|---|---|---|
| `promotion`, `bonus`, `default` (or missing) | `/bonus/{slug}` | `src/pages/bonus/[slug].astro` |
| `news` | `/news/{slug}` | `src/pages/news/[slug].astro` |
| `review` | `/casinos/{slug}` | `src/pages/casinos/[slug].astro` |
| `guide` | `/guides/{slug}` | `src/pages/guides/[slug].astro` |

A legacy `src/content/news/` collection also exists and is merged into news pages via `getAllNews()` in `src/lib/posts.ts`.

### Key Files

- `src/content/config.ts` - Single Zod schema (`contentSchema`) shared by all content types. Heavy use of `z.preprocess` for pipeline compatibility (string/bool/array coercion).
- `src/lib/posts.ts` - Routing helpers (`getPostUrl`), type guards (`isBonus`, `isNews`, `isReview`, `isGuide`), and `sortByDate`. Canonical source for shared functions - `casino-filters.ts` imports from here.
- `src/lib/casino-filters.ts` - Casino-specific filtering (by crypto, withdrawal speed, wagering), rating helpers, `getReviewUrl`, `getClaimUrl`.
- `src/layouts/Layout.astro` - Sole layout. Handles JSON-LD injection, OG tags, canonical URLs. No component library; pages inline their markup.
- `src/pages/go/[slug].astro` - Affiliate redirect endpoint using `claim_url` from frontmatter.
- `src/styles/global.css` - Tailwind 4 `@theme` block defining design tokens (colors: `acid` #39FF14, `cyber` #FAFF00, `violet` #8A2BE2, `void` #0A0A0A; fonts: Space Grotesk / Public Sans / JetBrains Mono).

### Design System

Brutalist aesthetic: no border-radius anywhere (`border-radius: 0 !important`), 3px solid white borders, offset box shadows (`shadow-brutal-*`), dark background (#0A0A0A). The `.card-brutal` class provides hover interaction (shadow crush). Typography uses `.prose-brutal` overrides for dark theme.

### Content Pipeline

An external pipeline publishes Markdown files directly into `src/content/posts/`. **Never edit files in `src/content/posts/` or `src/content/news/`** - they are pipeline-managed. Frontmatter includes pipeline-generated fields like `schema_jsonld`, `rating` (0-10 scale, not 1-5), `pros`/`cons` (pipe-delimited strings or arrays), and dual-format fields (`camelCase` and `snake_case` variants for the same data). The schema's `.transform()` normalizes all duplicate fields to camelCase (e.g., `deposit_methods` -> `depositMethods`), so templates should always use camelCase field names.

### Static "Category" Pages

Pages like `best-crypto-casinos.astro`, `no-kyc-crypto-casinos.astro`, `bitcoin-casinos.astro` etc. are hand-built static pages (not dynamic routes). They query the posts collection and filter/sort inline.

## Content Writing Rules

All written content must follow `CONTENT_GUIDE.md`. Key constraints:
- Write like an experienced user, not a marketer
- No em dashes, semicolons, or decorative punctuation
- No AI-tell phrases ("It's important to note", "When it comes to", "Let's dive in", "In conclusion")
- No banned words (see full list in CONTENT_GUIDE.md)
- Short paragraphs (max ~3 lines), short sentences, active voice
- Content should read like a forum post, not a marketing blog

## Custom Agents (`.claude/agents/`)

Specialized agents are defined for use with the Agent tool. Use `subagent_type` matching the agent name:

| Agent | subagent_type | Use When |
|---|---|---|
| **Agents Orchestrator** | `Agents Orchestrator` | Orchestrating multi-step development workflows across agents |
| **Casino Data Auditor** | `Casino Data Auditor` | Auditing scraped casino metadata completeness, field normalization, data quality |
| **Draft Reviewer** | `Draft Reviewer` | Reviewing casino review/bonus drafts for frontmatter, broken images, schema markup, SEO quality |
| **Pre-Publish Validator** | `Pre-Publish Validator` | Validating approved drafts against Astro schema before deployment |
| **Reality Checker** | `Reality Checker` | Evidence-based certification before marking work production-ready |
| **Image Prompt Engineer** | `Image Prompt Engineer` | Crafting AI image generation prompts for cover photos |
| **UI Designer** | `UI Designer` | Visual design systems, component libraries, pixel-perfect interfaces |
| **Frontend Developer** | `Frontend Developer` | Astro/frontend implementation and performance optimization |
| **Backend Architect** | `Backend Architect` | System design, database architecture, API development |
| **AI Engineer** | `AI Engineer` | ML model integration, data pipelines, AI-powered features |
| **DevOps Automator** | `DevOps Automator` | Infrastructure automation, CI/CD pipelines |
| **Code Reviewer** | `Code Reviewer` | Constructive code review focused on correctness and security |
| **Content Creator** | `Content Creator` | Editorial calendars, content strategy, brand copy |
| **SEO Specialist** | `SEO Specialist` | Technical SEO, content optimization, organic search growth |

## SEO Architecture

- **Canonical URLs**: Computed at the template level from the route pattern (e.g., `https://cryptobonuslist.com/casinos/${slug}`). Never trust frontmatter `canonical` - the pipeline writes wrong `/posts/` paths.
- **JSON-LD**: Built programmatically in each `[slug].astro` template. Casino reviews use `Review` + `CasinoAndGamblingBusiness`, bonuses use `Article` + `Product`. Pipeline `schema_jsonld` is ignored in favor of computed schemas.
- **BreadcrumbList**: Emitted on all detail and index pages via JSON-LD `@graph` arrays.
- **Affiliate redirects**: `/go/{slug}` validates HTTPS-only URLs. Non-HTTPS `claim_url` values are excluded from generation.
- **Trailing slash**: `trailingSlash: 'never'` in astro.config.mjs.

## Known Quirks

- Write/Edit tools may fail with EEXIST on OneDrive-synced paths. Workaround: write a .js script to a temp dir, then run with `node`.
- The `src/content/bonuses/` and `src/content/news/` directories are legacy and unused (but `news` collection is still defined in config.ts for backward compat).
- Frontmatter has duplicate fields in both camelCase and snake_case. The `.transform()` in config.ts normalizes to camelCase - always use camelCase in templates.
