# SEO Homepage & Site Architecture Prompt

> Use this as a prompt/checklist when building any new website. It distills every SEO technique our content engine implements into actionable rules. Niche-agnostic — works for casinos, SaaS, e-commerce, blogs, anything.

---

## 1. Page Title & Meta

- **Title tag**: 50-60 characters. Lead with the primary keyword. Include brand name at the end after a separator (`|` or `–`).
- **Meta description**: 120-155 characters. Write it like ad copy — include a benefit, a number, and a soft CTA. This is your SERP sales pitch.
- **SEO title vs display title**: These can differ. The `<title>` tag targets search queries; the on-page `<h1>` targets humans. Use both.
- **Canonical URL**: Every page must have a self-referencing `<link rel="canonical">`. Prevents duplicate content penalties across URL variants (trailing slashes, query params, www vs non-www).

## 2. Heading Hierarchy

- **Exactly ONE `<h1>` per page.** It should contain your primary keyword naturally.
- **`<h2>` for main sections**, `<h3>` for subsections within those. Never skip levels (no h2 → h4 jumps).
- **Make headings keyword-rich but readable.** They're both navigation aids and ranking signals.
- **FAQ sections** use `<h3>` for each question inside an `<h2>` "Frequently Asked Questions" wrapper.
- **Homepage rule**: Your `<h1>` should communicate what the site IS and who it's FOR in one line.

## 3. Content Structure (GEO Writing)

These patterns optimize for both traditional search AND AI-generated answers (Google SGE, ChatGPT search):

- **Direct answer first**: Every section opens with a 1-sentence answer to the implicit question. Don't bury the lead.
- **Entity-first paragraphs**: Name the primary subject in the first paragraph. Search engines use this for entity association.
- **Specific numbers**: Include at least 2 concrete data points per article with attribution. Vague claims rank poorly.
- **Quotable conclusions**: End with a "Bottom Line" or "Final Verdict" section. AI snippets love pulling these.
- **Present tense for current facts**, past tense for events. Consistency signals freshness.
- **Word count**: Target 1500-3000 words for pillar content, 800-1500 for supporting pages. Quality over quantity, but thin pages don't rank.

## 4. Schema.org / JSON-LD (Structured Data)

Every page needs at least one schema type. This is non-negotiable for rich results:

| Page Type | Schema Type | Key Fields |
|-----------|------------|------------|
| Homepage | `WebSite` + `Organization` | name, url, logo, sameAs (socials), searchAction |
| Blog/News article | `NewsArticle` or `Article` | headline, datePublished, dateModified, author (Person), image, wordCount, timeRequired |
| Review page | `Review` + `AggregateRating` | itemReviewed, reviewRating, ratingValue, ratingCount, bestRating, positiveNotes, negativeNotes |
| FAQ section | `FAQPage` | mainEntity → array of Question + acceptedAnswer |
| Product/Service | `Product` or `Service` | name, description, offers, aggregateRating |
| Author page | `Person` | name, jobTitle, image, hasCredential, knowsAbout, sameAs |
| How-to guide | `HowTo` | step[], totalTime, tool[], supply[] |

**Author schema matters more than ever.** Include:
- `hasCredential`: Array of `EducationalOccupationalCredential` (certifications, degrees)
- `knowsAbout`: Expert knowledge areas
- `sameAs`: Links to social profiles, LinkedIn, personal site
- `image`: Real headshot (not avatar)
- `jobTitle`: Professional role

**AggregateRating** (for review sites): Derive ratings from real data, not made-up numbers. Use a scoring system with documented methodology. Google penalizes fake/inflated ratings.

## 5. E-E-A-T Signals (Experience, Expertise, Authoritativeness, Trustworthiness)

This is Google's quality framework. Build these signals into every page:

### Experience
- Author bylines with real names and photos
- "Years of experience" stated in author bios
- Review methodology explained ("How we test")
- First-person insights where appropriate

### Expertise
- Author credentials displayed prominently (certifications, qualifications)
- Topic-specific expertise areas listed
- Published works / portfolio links
- Professional role and job title

### Authoritativeness
- Author pages with full bios (dedicated `/authors/{slug}` URLs)
- Social proof links (LinkedIn, Twitter, industry profiles)
- Internal linking from author page to all their articles
- Company/organization info on About page

### Trustworthiness
- YMYL compliance (for financial, health, legal content):
  - Responsible gambling disclaimers
  - Affiliate relationship disclosures
  - Jurisdictional restrictions noted
  - Links to helplines and support resources
- Transparent methodology for ratings/scores
- Last updated dates displayed prominently
- Contact information accessible
- Privacy policy and terms of service linked

## 6. Internal Linking Architecture

### Silo Structure
Organize content into topical clusters (silos). Each silo has:

- **Pillar page**: The main hub (e.g., "/best-crypto-casinos"). Links DOWN to all children.
- **Cornerstone pages**: High-value supporting pages. Link UP to pillar and ACROSS to related cornerstones.
- **Child pages**: Individual articles. Link UP to pillar, ACROSS to siblings in same silo.

**Rules:**
- Every child page links to its pillar page
- Pillar pages link to all children
- Max 1 cross-silo link per page (to prevent dilution)
- Cornerstone pages get priority in link placement

### Semantic Link Matching
- Use content embeddings (vector similarity) to find the most relevant pages to link to — not just keyword matching.
- 2-4 internal links per article, placed naturally in context.
- Bold internal links for visual emphasis: `**[Link Text](url)**`
- Related posts widget at the bottom (3 posts, tag-overlap based)

### Link Text Rules
- Descriptive anchor text (not "click here")
- Include target page's primary keyword in anchor when natural
- Vary anchor text across pages linking to the same target

## 7. External Linking

- 1-2 outbound links per article to authoritative sources
- Link to primary sources (studies, official announcements, documentation)
- Use semantic matching against a curated external link database
- Never link to direct competitors from money pages
- Affiliate links go through `/go/{slug}` redirect (blocked in robots.txt, meta-refresh redirect)

## 8. Image Optimization

- **Format**: WebP (quality 80). Fallback to PNG/JPG only if transparency needed.
- **Dimensions**: 1792x1024px for hero/cover images (16:9, works as YouTube thumbnails too).
- **Alt text**: Descriptive, keyword-rich, written for accessibility. Should describe the actual image content, not just repeat the title.
- **File naming**: `{slug}.webp` — clean, descriptive, URL-friendly.
- **Loading**: `loading="lazy"` for below-fold images. `fetchpriority="high"` for hero image.
- **Dedicated image paths**: `/images/{content-type}/{slug}.webp` for covers, `/images/logos/{slug}.ext` for logos.
- **Author headshots**: Real photos in schema. Generate consistent AI headshots using multi-angle reference sheets if needed.

## 9. URL Structure

- **Lowercase**, hyphens only (no underscores, no spaces)
- **Short and descriptive**: `/casinos/stake-review` not `/casinos/stake-casino-review-2026-updated-guide`
- **Content type in path**: `/{content-type}/{slug}` (e.g., `/news/`, `/bonuses/`, `/reviews/`)
- **Consistent slug derivation**: `name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80)`
- **Unique slug enforcement**: Check for duplicates, append `-2`, `-3` if needed
- **No date in URL** for evergreen content. Dates in URL only for news/time-sensitive content.

## 10. Technical SEO Essentials

### Robots & Crawling
- `robots.txt`: Block `/go/` (affiliate redirects), admin paths, API routes
- Sitemap.xml: Auto-generated, submitted via IndexNow after each publish
- IndexNow integration: Ping search engines immediately on publish (Bing, Yandex, others)

### Performance
- Static site generation (SSG) for all content pages — fastest possible TTFB
- WebP images with compression (quality 80)
- Minimal JavaScript on content pages
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

### Canonical & Deduplication
- Self-referencing canonical on every page
- Content hashing to prevent duplicate ingestion from sources
- One URL per piece of content — no alternate versions without canonicals

## 11. Content Freshness

- **`updatedAt` / `dateModified`** in both frontmatter and schema. Update this when content changes.
- **Staleness detection**: For review/entity content, track if the underlying data has drifted since publish. If score drift exceeds threshold (e.g., 15%), flag for re-review.
- **Relative timestamps** for news content ("3 hours ago" display).
- **Regular content audits**: Decay pipeline checks for stale content and flags it automatically.

## 12. Homepage-Specific Rules

When building the homepage:

1. **`<h1>` = Value proposition.** What is this site? Who is it for? One line.
2. **Above the fold**: Primary CTA, key value prop, hero image. No fluff.
3. **Featured content section**: Surface your best/newest content. Link to pillar pages.
4. **Schema**: `WebSite` (with `SearchAction` if you have search) + `Organization` (logo, name, sameAs socials).
5. **Internal links**: Link to ALL pillar pages from homepage. These are your most important pages.
6. **Trust signals above the fold**: Ratings count, years active, credentials, partner logos.
7. **FAQ section on homepage**: Answers "what is this site" questions. Gets FAQ schema rich results.
8. **Speed**: Homepage must be the fastest page on your site. No heavy JS, no carousels, no autoplay video.

## 13. Content Type Configuration

For each content type on your site, define:

```yaml
content_type: "review"           # Internal identifier
schema_type: "Review"            # Schema.org type
publish_path: "src/content/reviews/{{slug}}.md"
image_path: "public/images/reviews/{{slug}}.webp"
include_faq: true                # Auto-generate FAQ section
generate_image: true             # Auto-generate cover image
silo: "casino-reviews"           # Content cluster
ymyl_rules: |                    # Compliance rules (if applicable)
  - Mention responsible gambling
  - Disclose affiliate relationships
  - Note jurisdictional restrictions
```

## 14. Multi-Author Strategy

- Assign authors by expertise match (crypto expert writes crypto, not cooking)
- Round-robin for general topics to distribute bylines
- Each author needs: name, slug, bio, role, credentials, expertise areas, headshot, social links
- Author pages are ranking assets — treat them as pillar content
- Author voice consistency: define tone, formality level, vocabulary, signature phrases per author

## 15. Trust Scoring (For Review/Entity Sites)

If your site reviews entities (products, services, companies):

- **Track trust signals**: licensing, complaints, terms fairness, payment reliability, support quality, transparency
- **Weight categories**: licensing (25%), complaints (20%), terms (20%), payment (15%), support (10%), transparency (10%)
- **Compute aggregate score**: 0-10 scale derived from weighted positive/negative signals
- **Display badges**: Excellent (8+), Good (6-7.9), Fair (4-5.9), Poor (2-3.9), Avoid (<2)
- **Feed into AggregateRating schema**: Real data, not opinions
- **Track history**: Score changes over time with reasons (new data, complaint resolved, etc.)
- **Staleness alerts**: If entity score drifts >15% from publish-time snapshot, flag content for update

---

## Quick Checklist: Before You Publish Any Page

- [ ] Title tag: 50-60 chars, primary keyword, brand name
- [ ] Meta description: 120-155 chars, benefit + number + CTA
- [ ] Single `<h1>`, proper heading hierarchy (h2 → h3, no skips)
- [ ] Canonical URL set (self-referencing)
- [ ] Schema.org JSON-LD appropriate for page type
- [ ] Author byline with link to author page
- [ ] 2-4 internal links (silo-aware, semantic match)
- [ ] 1-2 external links to authoritative sources
- [ ] Cover image: WebP, 1792x1024, descriptive alt text
- [ ] FAQ section (if applicable) with FAQ schema
- [ ] YMYL disclaimers (if financial/health/legal content)
- [ ] `publishedAt` and `updatedAt` dates set
- [ ] Content type and tags assigned
- [ ] Slug is clean, lowercase, descriptive
- [ ] Related posts linked
- [ ] Mobile-friendly layout verified
- [ ] Page speed acceptable (< 2.5s LCP)
