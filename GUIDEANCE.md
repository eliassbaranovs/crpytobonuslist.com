# Astro Casino Site -- Pipeline Compatibility Guide

> **Purpose:** This document tells an AI agent (or developer) exactly how to build an Astro static site that is fully compatible with the SEO Content Engine automation pipeline. Every field name, content type, route, frontmatter rule, and Schema.org structure is defined here. Follow it precisely -- the pipeline will not adapt to your site; your site must adapt to the pipeline.

---

## 1. System Overview

The Content Engine is an automated pipeline that:

| Step | Action | Output |
|------|--------|--------|
| **Ingest** | Fetches RSS feeds and scrapes sources | `raw_items` in database |
| **Analyze** | AI scores relevance (0-100), classifies topic, suggests rewrite angle | `analysis` record |
| **Rewrite** | AI rewrites article with SEO metadata, generates FAQ, internal/external links | `drafts` record |
| **Image** | DALL-E generates cover image (1792x1024), compressed to WebP 80% | Image binary + alt text |
| **Publish** | Batch commits markdown + images to GitHub repo via Tree API | Markdown files in `src/content/posts/` |
| **Index** | IndexNow pings to search engines | Faster indexation |

The pipeline outputs **one markdown file per article** with YAML frontmatter + body content. Your Astro site must accept these files without modification.

---

## 2. Astro Content Collection Schema

Your `src/content/config.ts` must define a single `posts` collection that accepts ALL of the following fields. Use `.optional()` liberally -- the pipeline only sends fields relevant to each content type.

### 2.1 Core Fields (ALL content types)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Article headline (H1) |
| `slug` | `string` | Yes | URL slug (e.g., `best-crypto-casino-bonus`) |
| `description` | `string` | Yes | SEO meta description (150-160 chars) |
| `seoTitle` | `string` | Yes | Custom `<title>` tag (may differ from H1) |
| `excerpt` | `string` | Optional | Short content summary for cards/lists |
| `publishedAt` | `date` | Yes | ISO 8601 date string, coerced to Date |
| `updatedAt` | `date` | Optional | ISO 8601 date string; falls back to `publishedAt` |
| `publishDate` | `string` | Optional | Date as `YYYY-MM-DD` string (display helper) |
| `tags` | `string[]` | Yes | Always present, even if empty array `[]` |
| `image` | `string` | Yes | Path: `/images/covers/{slug}.webp` |
| `imageAlt` | `string` | Yes | AI-generated SEO alt text (<125 chars) |
| `imageWidth` | `number` | Yes | Default `1792` |
| `imageHeight` | `number` | Yes | Default `1024` |
| `imageLoading` | `"lazy" or "eager"` | Yes | Default `"lazy"` |
| `author` | `string` | Yes | Display name of author persona |
| `authorSlug` | `string` | Yes | For linking to `/team/{authorSlug}` |
| `canonical` | `string` | Yes | Full canonical URL |
| `contentType` | `string` | Yes | One of: `"news"`, `"promotion"`, `"review"`, `"guide"` |
| `schema_jsonld` | `string` | Yes | Stringified JSON-LD Schema.org markup |
| `draft` | `boolean` | Optional | If `true`, page is not published |
| `noIndex` | `boolean` | Optional | If `true`, adds `noindex` meta tag |
| `robots` | `string` | Optional | e.g., `"index, follow"` |
| `wordCount` | `number` | Optional | Word count of body content |
| `readingTime` | `string` | Optional | e.g., `"5 min read"` |
| `relatedPosts` | `string[]` | Optional | Array of related slugs |

### 2.2 News Fields

| Field | Type | Description |
|-------|------|-------------|
| `featured` | `boolean` | Highlight on homepage / news hub |
| `category` | `string` | Display category label |

### 2.3 Promotion / Bonus Fields

| Field | Type | Description |
|-------|------|-------------|
| `bonusType` | `string` | `WELCOME`, `NO-DEPOSIT`, `FREE-SPINS`, `RELOAD`, `CASHBACK`, etc. |
| `bonus` | `string` | Human-readable: `"100% up to $500"` |
| `code` | `string` | Bonus code (if required) |
| `exclusive` | `boolean` | Pipeline-verified exclusive deal |
| `verified` | `boolean` | Team-verified badge |
| `wagering` | `string` | e.g., `"35x"` |
| `wageringRequirements` | `string` | Alias for longer display |
| `minimum_deposit` | `string` | e.g., `"$20"` |
| `minimumDeposit` | `string` | camelCase alias |
| `casino_name` | `string` | Associated casino |
| `expires_at` | `date` | Promotion expiry (for countdown timers) |
| `claim_url` | `string` | Affiliate link slug for `/go/{slug}` |
| `bonusPercentage` | `string` | e.g., `"100%"` |
| `bonusDuration` | `string` | e.g., `"30 days"` |
| `maxBonus` | `string` | e.g., `"$500"` |
| `maximumBonusAmount` | `string` | Alias |
| `freeSpins` | `string` | e.g., `"200 Free Spins"` |
| `freeSpinsCount` | `number` | Numeric count |
| `freeSpinsWr` | `string` | Free spins wagering requirement |

### 2.4 Review / Casino Fields

| Field | Type | Description |
|-------|------|-------------|
| `rating` | `number (0-10)` | **NOT 1-5 scale.** Overall rating 0-10 |
| `ourRating` | `number (0-10)` | Editorial rating |
| `playerRating` | `number (0-10)` | Aggregated player rating |
| `playerRatingCount` | `string` | e.g., `"142 reviews"` |
| `pros` | `string[]` | Pipeline sends pipe-separated, schema coerces to array |
| `cons` | `string[]` | Pipeline sends pipe-separated, schema coerces to array |
| `casino` | `string` | Casino name |
| `casino_name` | `string` | Alias |
| `casinoName` | `string` | camelCase alias |
| `casinoReviewUrl` | `string` | URL to full review |
| `casinoType` | `string` | e.g., `"Crypto"`, `"Hybrid"` |
| `website` | `string` | Casino website URL |
| `company` | `string` | Operating company |
| `established` | `string` | Year established (arrives as number, coerced to string) |
| `languages` | `string` | Supported languages |
| `mobileApps` | `string` | Mobile app availability |
| `licences` | `string` | Licensing info (e.g., `"Curacao eGaming"`) |
| `rtp` | `string` | Average RTP |
| `rngTested` | `string` | RNG certification status |
| `currencies` | `string` | Accepted currencies |
| `deposit_methods` | `string` | Deposit methods |
| `depositMethods` | `string` | camelCase alias |
| `withdrawal_methods` | `string` | Withdrawal methods |
| `withdrawalMethods` | `string` | camelCase alias |
| `withdrawal_time` | `string` | Typical withdrawal time |
| `withdrawalTimes` | `string` | Alias |
| `withdrawalFees` | `string` | Fee info (may arrive as boolean from YAML) |
| `withdrawalLimit` | `string` | Per-transaction or monthly limit |
| `minimumWithdrawalAmount` | `string` | Min withdrawal |
| `pendingTime` | `string` | Pending period before processing |
| `game_providers` | `string` | Software providers |
| `gameProviders` | `string` | camelCase alias |
| `liveChat` | `string` | `"Yes"`, `"No"`, `"24/7"`, `"Limited Hours"` |
| `email_support` | `string` | Email support info |
| `emailSupport` | `string` | camelCase alias |
| `complaintResponse` | `string` | Complaint handling info |
| `vipLoyaltyProgram` | `string` | VIP/loyalty program details |
| `affiliate_program` | `string` | Affiliate program info |
| `affiliateProgram` | `string` | camelCase alias |

### 2.5 Responsible Gaming Fields (10 fields)

These are critical for SEO trust signals and regulatory compliance:

| Field | Type | Description |
|-------|------|-------------|
| `depositLimitTool` | `string` | Deposit limit feature availability |
| `lossLimitTool` | `string` | Loss limit feature |
| `wagerLimitTool` | `string` | Wager limit feature |
| `selfExclusionTool` | `string` | Self-exclusion option |
| `coolOffTimeOutTool` | `string` | Cool-off / timeout feature |
| `realityCheckTool` | `string` | Reality check reminders |
| `timeSessionLimitTool` | `string` | Session time limits |
| `selfAssessmentTest` | `string` | Self-assessment quiz |
| `gameHistoryFeature` | `string` | Game history access |
| `selfExclusionRegisterParticipation` | `string` | National register participation |

### 2.6 Guide Fields

| Field | Type | Description |
|-------|------|-------------|
| `difficulty` | `string` | `"beginner"`, `"intermediate"`, `"advanced"` |
| `showToc` | `boolean` | Whether to render table of contents |

---

## 3. Content Type Mapping

The `contentType` frontmatter field drives routing, Schema.org type, and which UI components render.

| Content Type | `contentType` Value | Schema.org Type | Route Pattern |
|-------------|----------------------|-----------------|---------------|
| News articles | `"news"` | `NewsArticle` | `/news/{slug}` |
| Bonuses & promotions | `"promotion"` | `Review` | `/bonus/{slug}` |
| Casino reviews | `"review"` | `Review` + `reviewRating` | `/casinos/{slug}` |
| Guides & how-tos | `"guide"` | `HowTo` | `/guides/{slug}` |

**Important:** The pipeline may also send `contentType: "bonus"` or `contentType: "default"` -- your schema must accept ANY string and route accordingly.

---

## 4. Routing Architecture

### 4.1 Content Routes

All automated content lives in `src/content/posts/{slug}.md`. The `contentType` field determines the URL:

```
/news/{slug}          -> contentType === "news"
/bonus/{slug}         -> contentType === "promotion" || "bonus"
/casinos/{slug}       -> contentType === "review"
/guides/{slug}        -> contentType === "guide"
```

### 4.2 Hub Pages (Keyword Silos)

Static hub pages aggregate content by topic. Examples:

```
/no-kyc-casinos/           -> Filters reviews where tags include "no-kyc"
/fast-withdrawal-casinos/  -> Filters reviews by withdrawal speed
/best-crypto-bonuses/      -> Filters promotions by crypto tags
/free-spins-bonuses/       -> Filters promotions where freeSpins exists
```

Each hub page needs a **Toplist component** above the fold -- a high-contrast comparison table or card stack ranking items with prominent CTA buttons.

### 4.3 Static Pages

```
/                          -> Homepage
/news/                     -> News index
/bonus/                    -> Bonus index
/casinos/                  -> Casino review index
/guides/                   -> Guide index
```

---

## 5. Required Pages

### 5.1 Trust & Authority Pages

These are mandatory for E-E-A-T compliance and Google's quality guidelines:

| Page | Route | Purpose |
|------|-------|---------|
| How We Rate | `/how-we-rate` | Review methodology transparency |
| Responsible Gambling | `/responsible-gambling` | Regulatory compliance, trust signal |
| Affiliate Disclosure | `/affiliate-disclosure` | FTC compliance |
| Team / Author Bios | `/team/{authorSlug}` | E-E-A-T author authority |

### 5.2 CRO Components

Every content page should include:

- **Toplist Component** -- Above-the-fold comparison on hub/index pages
- **Sticky Mobile CTA** -- Fixed bottom bar on mobile with "Claim Bonus" button
- **Pros/Cons UI** -- Visual component for review `pros[]` and `cons[]` arrays
- **Countdown Timer** -- If `expires_at` is set, show time remaining
- **Related Posts** -- 3-4 related items at bottom (use `relatedPosts[]` slugs or tag matching)

### 5.3 Additional Required Pages

| Page | Route | Notes |
|------|-------|-------|
| 404 Page | `/404` | Show "Top 3 Active Bonuses Today" |
| Privacy Policy | `/privacy-policy` | Legal boilerplate |
| Terms of Service | `/terms` | Legal boilerplate |
| Contact | `/contact` | Form only -- no physical address or phone |
| Affiliate Link Cloaker | `/go/{slug}` | Meta-refresh redirect to affiliate URL |

---

## 6. Frontmatter Rules

These rules are non-negotiable. The pipeline enforces them and your schema must handle them:

### 6.1 Field Inclusion Rules

- **Only type-allowed fields are sent.** A news article will NOT have `rating`, `pros`, `wagering`, etc.
- **Null/empty values are omitted entirely.** If `code` is empty, the field will not appear in frontmatter.
- **`tags` is always present**, even as an empty array: `tags: []`
- **`schema_jsonld` is a stringified JSON string**, not an object. Your schema must handle both (preprocess object to string).

### 6.2 Type Coercion Rules

The pipeline may send values in unexpected types due to YAML auto-parsing:

| Scenario | Example | Solution |
|----------|---------|----------|
| Year as number | `established: 2024` | Coerce to string |
| Boolean as string | `verified: "true"` | Coerce with `toBool()` helper |
| Date as Date object | `publishedAt: 2026-03-04` | Use `z.coerce.date()` |
| Pipe-separated arrays | `pros: "Fast payouts\|Good support"` | Split on pipe to array |
| Number as string | `freeSpins: "200"` | Keep as string or coerce as needed |
| Boolean for string field | `withdrawalFees: false` | Coerce to string `"No"` |

### 6.3 Rating Scale

**Ratings use 0-10 scale, NOT 1-5.** All rating fields (`rating`, `ourRating`, `playerRating`) are `number` with `min(0).max(10)`.

---

## 7. SEO & Schema.org Rules

### 7.1 Schema.org per Content Type

The pipeline generates `schema_jsonld` per article. Your layout must inject it:

```astro
{frontmatter.schema_jsonld && (
  <script type="application/ld+json" set:html={frontmatter.schema_jsonld} />
)}
```

| Content Type | Schema Types |
|-------------|-------------|
| News | `NewsArticle`, optionally `FAQPage` |
| Promotion | `Review`, optionally `FAQPage` |
| Casino Review | `Review` + `reviewRating` (aggregateRating), `FAQPage` |
| Guide | `HowTo`, optionally `FAQPage` |

Schema always includes `datePublished` (from `publishedAt`) and `dateModified` (from `updatedAt`).

### 7.2 FAQ Section Structure

When the pipeline includes FAQ content, it follows this exact markdown structure:

```markdown
## Frequently Asked Questions

### Is {Casino} safe to play at?

{Answer paragraph}

### What is the wagering requirement?

{Answer paragraph}
```

Your site should parse `## Frequently Asked Questions` sections and render them in an accordion/expandable UI. The corresponding `FAQPage` schema is included in `schema_jsonld`.

### 7.3 Internal Linking

Pipeline-generated internal links use **bold markdown** to signal internal pages:

```markdown
Check out our **[complete guide to no-KYC casinos](/no-kyc-casinos/)** for more options.
```

### 7.4 External Linking

External links use **regular markdown** (no bold) and point to partner/reference pages:

```markdown
According to [Curacao eGaming](https://www.curacao-egaming.com/), licensed operators must...
```

External links should get `rel="nofollow noopener"` and `target="_blank"` in your Astro rendering.

### 7.5 GEO (Generative Engine Optimization) Rules

Content is optimized for AI answer engines (Google SGE, Perplexity, etc.):

- **Direct answer sentences** in the first paragraph (concise, factual statements)
- **Entity naming** -- casino names, provider names, specific products mentioned by name
- **Specific numbers** -- exact percentages, amounts, counts (not vague qualifiers)
- **"The Bottom Line" section** at the end of every article -- a 2-3 sentence summary for AI extraction
- **Structured data throughout** -- tables, lists, comparison blocks that AI can parse

---

## 8. Image Generation & Handling

### 8.1 Cover Images

| Property | Value |
|----------|-------|
| Generator | DALL-E 3 |
| Size | 1792 x 1024 px |
| Format | WebP (80% quality via Sharp) |
| Path | `/images/covers/{slug}.webp` |
| Alt text | AI-generated, SEO-optimized, <125 chars |

### 8.2 Logos (Scraped)

Casino logos may be scraped and stored:

| Property | Value |
|----------|-------|
| Path | `/images/logos/{slug}.{ext}` |
| Format | PNG or SVG (as scraped) |
| Usage | Casino review headers, toplist cards |

### 8.3 Image Display Rules

- All images below the fold: `loading="lazy"`
- LCP image (hero/cover): `loading="eager"` + `fetchpriority="high"`
- Always include `width` and `height` attributes (prevents CLS)
- Use `<img>` or Astro's `<Image />` component with explicit dimensions

### 8.4 Style Guide for DALL-E

Cover images follow a consistent visual identity:

- Modern, clean, professional blog cover aesthetic
- Minimalist design with subtle gradients
- **No text or words in the image** -- ever
- Abstract or symbolic representation of the article topic
- Consistent color palette across the site
- Custom style prompts can be set per content profile

---

## 9. Publishing & File Structure

### 9.1 Output Structure

The pipeline commits files to your GitHub repo in this structure:

```
src/content/posts/{slug}.md     -> Article markdown with frontmatter
public/images/covers/{slug}.webp -> Cover image
public/images/logos/{slug}.{ext} -> Casino logo (if available)
```

### 9.2 Frontmatter Format

Every published file looks like:

```yaml
---
title: "Best Crypto Casino Bonuses in 2026"
slug: "best-crypto-casino-bonuses-2026"
description: "Compare the top crypto casino welcome bonuses..."
seoTitle: "Best Crypto Casino Bonuses - March 2026 | SiteName"
publishedAt: "2026-03-05T10:30:00Z"
updatedAt: "2026-03-05T10:30:00Z"
tags: ["crypto", "welcome-bonus", "bitcoin"]
image: "/images/covers/best-crypto-casino-bonuses-2026.webp"
imageAlt: "Comparison of top cryptocurrency casino welcome bonuses"
imageWidth: 1792
imageHeight: 1024
author: "Alex Rivera"
authorSlug: "alex-rivera"
canonical: "https://example.com/bonus/best-crypto-casino-bonuses-2026"
contentType: "promotion"
schema_jsonld: '{"@context":"https://schema.org","@type":"Review",...}'
bonusType: "WELCOME"
bonus: "100% up to 1 BTC"
wagering: "40x"
casino_name: "CryptoVegas"
claim_url: "cryptovegas-welcome"
---

Article body in markdown...
```

### 9.3 Demo File Mode

When a content profile has a `demo_file` set, the AI generates complete frontmatter + body matching the demo format exactly. The publish step only injects dynamic fields (dates, image paths, canonical URLs).

---

## 10. Technical SEO Checklist

Your Astro site must implement:

- [ ] `robots.txt` -- `Disallow: /go/` (hide affiliate redirects)
- [ ] `@astrojs/sitemap` configured in `astro.config.mjs`
- [ ] Google Search Console verification file support
- [ ] Canonical URLs on every page
- [ ] Open Graph + Twitter Card meta tags
- [ ] Proper heading hierarchy (single H1, nested H2-H3)
- [ ] Semantic HTML (`<article>`, `<aside>`, `<nav>`, `<section>`)
- [ ] No intrusive pop-ups or interstitials on page load
- [ ] "Last Updated" timestamps displayed on all content pages
- [ ] Mobile-responsive (Core Web Vitals optimized)
- [ ] Breadcrumb navigation with `BreadcrumbList` schema

---

## 11. Content Freshness & Decay

The pipeline supports content expiry and refresh:

- **Content Decay:** Articles older than a configured threshold are flagged for refresh
- **Re-scrape:** Sources can be re-scraped to update casino data
- **Date Handling:** `updatedAt` is updated on every republish; `publishedAt` stays original
- **Display:** Show "Last Updated" prominently -- reviews show "Last Tested: {date}"

---

## 12. Quick Reference: Pipeline Output to Astro Input

| Pipeline Sends | Astro Receives | Notes |
|----------------|---------------|-------|
| Markdown file | `src/content/posts/{slug}.md` | One file per article |
| WebP image | `public/images/covers/{slug}.webp` | 1792x1024, 80% quality |
| Logo image | `public/images/logos/{slug}.{ext}` | If scraped |
| JSON-LD string | `schema_jsonld` frontmatter field | Inject into `<head>` |
| Pipe-separated values | Array fields (`pros`, `cons`, `tags`) | Schema coerces to arrays |
| ISO date strings | `publishedAt`, `updatedAt` | Schema coerces to Date |
| Rating 0-10 | `rating`, `ourRating`, `playerRating` | NOT 1-5 scale |
