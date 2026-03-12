# Content Output Specification

Exact frontmatter + body structure for each content type produced by the SEO Content Engine pipeline. Use this to validate whether a target static site can accept the output.

---

## 1. News Articles (`contentType: "news"` — CryptoCasinoNews profile)

### Frontmatter

```yaml
---
title: "string"
slug: "string"
description: "string"
seoTitle: "string"
excerpt: "string"
publishedAt: 2026-03-12T00:00:00.000Z    # ISO, unquoted
publishDate: "2026-03-12"                  # quoted date string
updatedAt: 2026-03-12T00:00:00.000Z       # ISO, unquoted
tags:
  - "tag1"
  - "tag2"
image: "/images/{slug}.webp"
imageAlt: "string"
imageWidth: 1792
imageHeight: 1024
imageLoading: "lazy"
imageFetchPriority: "auto"
author: "string"
authorSlug: "string"
canonical: "https://cryptobonuslist.com/..."
contentType: "news"
draft: false
noIndex: false
robots: "index, follow"
featured: false
category: "string"
lastVerified: "2026-03-12"
schemaJsonLd: |
  [{"@context":"https://schema.org","@type":"NewsArticle",...},{"@type":"BreadcrumbList",...},{"@type":"WebSite",...}]
wordCount: 1200                            # injected at publish
readingTime: "6 min read"                  # injected at publish
---
```

### Body

Free-form markdown. LLM replicates demo file structure. Typically `## Heading` sections with paragraphs, optional FAQ, optional blockquote disclaimer.

---

## 2. Bonus/Promotion Pages (`contentType: "promotion"` — CryptoCasinoBonus profile)

### Frontmatter

```yaml
---
title: "string"
slug: "string"
description: "string"
seoTitle: "string"
excerpt: "string"
publishedAt: 2026-03-12T00:00:00.000Z
publishDate: "2026-03-12"
updatedAt: 2026-03-12T00:00:00.000Z
tags:
  - "tag1"
image: "/images/{slug}.webp"
imageAlt: "string"
imageWidth: 1792
imageHeight: 1024
imageLoading: "lazy"
imageFetchPriority: "auto"
logo: "/images/logos/{slug}.webp"
author: "string"
authorSlug: "string"
canonical: "https://cryptobonuslist.com/.../"  # trailing slash, injected at publish
contentType: "promotion"
draft: false
noIndex: false
robots: "index, follow"
featured: true
category: "string"

# Casino Information
casino: "string"
casinoName: "string"
casinoReviewUrl: "/casinos/{casino-slug}/"   # injected at publish
casinoType: "string"
website: "string"

# Bonus Details
bonus: "string"
bonusType: "string"
bonusPercentage: "string"                     # force-quoted
bonusDuration: "string"
code: "string"                                # force-quoted
maxBonus: "string"
maximumBonusAmount: "string"
freeSpins: "string"
freeSpinsCount: 0
freeSpinsWr: "string"                         # force-quoted
wagering: "string"
wageringRequirements: "string"
exclusive: false
verified: false
expires_at: 2026-12-31T23:59:59.000Z
claim_url: "string"

# Ratings
ourRating: 0
playerRating: 0
playerRatingCount: "0"
rating: 0

# Pros and Cons
pros:
  - "string"
cons:
  - "string"

# Additional Casino Details
established: "string"                         # force-quoted
licences: "string"
currencies: "string"
depositMethods: "string"
withdrawalMethods: "string"
minimumDeposit: "string"                      # force-quoted
minimumWithdrawalAmount: "string"             # force-quoted
withdrawalTimes: "string"
withdrawalFees: "string"
gameProviders: "string"
liveChat: "string"
emailSupport: "string"
vipLoyaltyProgram: "string"

lastVerified: "2026-03-12"
schemaJsonLd: |
  [{"@context":"https://schema.org",...},{"@type":"BreadcrumbList",...},{"@type":"WebSite",...}]

# --- Derived fields (injected at publish) ---
acceptedCryptos:
  - "Bitcoin"
  - "Ethereum"
cryptoWithdrawalSpeedMinutes: 60
wageringMultiplier: 40
isNewCasino: false
wordCount: 1500
readingTime: "8 min read"
---
```

### Body

Free-form markdown. Bonus terms, how to claim, pros/cons, FAQ.

---

## 3. Casino Reviews (entity mode — uses `casino-review` rewrite route)

### Frontmatter

Built programmatically from `CASINO_REVIEW_SCHEMA` (127 canonical fields). Only fields with `frontmatter_key` land in YAML:

```yaml
---
# Base fields (always present)
title: "string"
slug: "string"
description: "string"
seoTitle: "string"
publishedAt: 2026-03-12T00:00:00.000Z
publishDate: "2026-03-12"
updatedAt: 2026-03-12T00:00:00.000Z
image: "/images/{slug}.webp"
imageAlt: "string"
canonical: "https://cryptobonuslist.com/casinos/{slug}/"  # trailing slash
lastVerified: "2026-03-12"
schemaJsonLd: |
  [{"@context":"https://schema.org","@type":"Review","itemReviewed":...,"aggregateRating":{"@type":"AggregateRating",...}},{"@type":"BreadcrumbList",...},{"@type":"WebSite",...}]

# Schema-driven fields (from metadata, only if non-empty)
casino_name: "string"
established: "string"                         # force-quoted
company: "string"
licences: "string"
casino_type: "string"
rating: 8.5
player_rating: 7.2
best_for: "string"
bonus_title: "string"
bonus_percentage: "string"
max_bonus: "string"
bonus_code: "string"
min_deposit: "string"
wagering: "string"
free_spins: "string"
deposit_methods: "string"
withdrawal_methods: "string"
currencies: "string"
accepted_coins: "string"
game_providers: "string"
vip_program: "string"

# Section images (if scraped — compressed to WebP at scrape time)
sectionImages:
  - section: "Games and Software"
    path: "/images/casino-name-games.webp"

# Trust scoring (if entity mode)
trustScore: "7.5"
trustBadge: "Good"
relatedPosts:
  - "other-slug"

# Derived fields (injected at publish)
acceptedCryptos:
  - "Bitcoin"
  - "Ethereum"
cryptoWithdrawalSpeedMinutes: 60
wageringMultiplier: 40
isNewCasino: false
wordCount: 2800
readingTime: "14 min read"
---
```

### Body

LLM generates body only (no frontmatter). Structured sections: Overview, At a Glance, Games, Deposits/Withdrawals, Bonuses, VIP, Licensing, Responsible Gambling (with hardcoded charity links), Support, Pros & Cons, Final Verdict, FAQ.

---

## Key Rules for Validation

| Rule | Detail |
|---|---|
| **Force-quoted fields** | `established`, `publishDate`, `minimumDeposit`, `minimumWithdrawalAmount`, `withdrawalLimit`, `code`, `bonusPercentage`, `freeSpinsWr`, `lastModified` — always `"string"` even if numeric |
| **Block scalar** | `schemaJsonLd` uses YAML `|` notation (indented JSON on next lines) |
| **Arrays** | `tags`, `pros`, `cons`, `acceptedCryptos`, `relatedPosts`, `sectionImages` — YAML list format |
| **Unquoted timestamps** | `publishedAt`, `updatedAt` — bare ISO strings |
| **Image paths** | Must be `/images/...` relative paths, never external URLs (sanitized at publish) |
| **Canonical** | Injected by publish step with trailing slash — external URLs stripped |
| **Derived fields** | `wordCount`, `readingTime`, `acceptedCryptos`, `wageringMultiplier`, `cryptoWithdrawalSpeedMinutes`, `isNewCasino`, `casinoReviewUrl` — all computed at publish, never from LLM |
| **Schema array** | `schemaJsonLd` is always a JSON array: main schema + BreadcrumbList + WebSite + Organization |
| **Casino review tags** | Enriched from metadata: casino name, license jurisdiction, crypto types, fast withdrawals, low wagering, etc. (max 10) |
| **Section images** | Compressed to WebP (quality 80, max 800px width) at scrape time via Sharp |

---

## Field Source Summary

| Source | When Applied | Examples |
|---|---|---|
| **LLM-generated** | During rewrite | `title`, `slug`, `description`, `seoTitle`, `excerpt`, `tags`, body content |
| **Demo file template** | LLM follows structure | All frontmatter keys defined in demo file |
| **Metadata (scraped)** | Mapped via schema | `casino_name`, `established`, `licences`, `wagering`, `deposit_methods`, etc. |
| **Dynamic injection** | At publish time | `publishedAt`, `publishDate`, `updatedAt`, `image`, `canonical`, `lastVerified`, `schemaJsonLd`, `relatedPosts`, `trustScore`, `trustBadge` |
| **Derived computation** | At publish time | `wordCount`, `readingTime`, `acceptedCryptos`, `cryptoWithdrawalSpeedMinutes`, `wageringMultiplier`, `isNewCasino`, `casinoReviewUrl` |
| **Sanitized** | At publish time | `image` (strip external URLs), `canonical` (strip external domains) |

---

## 4. Author Pages (published via `publish-authors` route)

### Frontmatter

```yaml
---
name: "string"
slug: "string"
role: "string"
bio: "string"
layout: "../../layouts/AuthorLayout.astro"
image: "/images/team/{slug}_profile.webp"   # 512x512 WebP
expertise:
  - "string"
credentials:
  - "string"
yearsExperience: 10
socialLinks:
  twitter: "https://..."
  linkedin: "https://..."
schemaJsonLd: |
  {"@context":"https://schema.org","@type":"Person","name":"...","jobTitle":"...","knowsAbout":[...],"hasCredential":[...],"sameAs":[...]}
---
```

### Body

Structured markdown: `# Name`, role, bio, `## Credentials` list, years of experience, `## Review Methodology`, `## Areas of Expertise` list, `## Published Articles` (links to all articles by this author), `## Connect` (social links).
