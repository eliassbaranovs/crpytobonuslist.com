# Role & Objective

You are a Principal Technical SEO Architect and an Elite Astro Front-End Engineer.
Your objective is to generate a comprehensive, production-ready project specification `.md` file for an autonomous coding agent.

Do not give me pleasantries. Do not explain the code. Output ONLY the raw Markdown specification based on the parameters below.

# Project Parameters

- **Project Name:** [ e.g., CryptoBonusList ]
- **Target URL:** [ e.g., https://cryptobonuslist.com ]
- **Niche:** [ e.g., Crypto Casino Reviews & Bonuses ]
- **Core Tech Stack:** Astro (latest) for SSG, Tailwind CSS, React (only for interactive islands and ONLY IF NEEDED). MUST include `@astrojs/sitemap`.
- **Design Style:** [ e.g., Dark Neo-Brutalism, High-Contrast, Text-Heavy ]
- **Primary Keywords:** [ e.g., best crypto casino bonus, no kyc crypto casinos ]
- **Overall Vibe:** [ e.g., Authoritative, blunt, data-driven, player-first ]

# Required Output Structure

Your generated `.md` file MUST strictly follow this structure:

1. **SEO Strategy & Content Architecture:** Define the Hub-and-Spoke (Silo) internal linking strategy. Provide the Tagline, Value Proposition, and generate 3-4 **Niche Keyword Silos** (e.g., `/no-kyc-casinos`, `/fast-withdrawal-casinos`). NO lorem ipsum.
2. **Tech Stack & Semantic Requirements:** Define the framework and styling. You MUST specify strict rules for Semantic HTML (`<article>`, `<aside>`, `<nav>`, proper `H1` -> `H3` nesting). Define exactly what Schema.org markup (Review, FAQPage, Article, Organization) is required on which routes. **Ensure `datePublished` and `dateModified` are strictly mapped in the Schema.**
3. **Design Aesthetic Rules:** Provide strict, unambiguous CSS rules. Define exact shadow styles, border thicknesses, typography sizing (using `clamp()`), and color hex codes.
4. **Deep Site Architecture (Mandatory SEO, Trust & CRO Pages):** Map out the exact routing structure. You MUST include:
   - **High-Converting "Money Pages" (Keyword Hubs):** Setup instructions for generating static paths for category silos. **CRO MANDATE:** These pages must feature a "Toplist" UI component above the fold—a high-contrast comparison table or card stack ranking the top casinos with massive, unavoidable CTA buttons.
   - **Review / Bonus Slugs:** Dynamic slugs parsed from Markdown. **CRO MANDATE:** Must feature a custom UI block for "Pros and Cons", and implement a "Sticky Mobile CTA" (e.g., "Claim Bonus") that remains anchored to the bottom of the viewport on mobile devices. Include a "Related Posts/Casinos" component at the bottom to prevent orphan pages.
   - **"First-Hand Testing" Components:** Require the UI design for review slugs to include a distinct section highlighting personal testing data (e.g., "Actual Withdrawal Time") to satisfy Google's "Information Gain" requirements.
   - **The Automated Affiliate Link Cloaker (`/go/[slug].astro`):** A dynamic routing mechanism using Astro's `getStaticPaths` to automatically generate clean URLs at build time by mapping over a JSON dictionary/frontmatter, outputting a fast meta-refresh redirect to the raw affiliate link.
   - **High-Converting 404 Funnel (`404.html`):** A custom error page displaying the "Top 3 Active Bonuses Today".
   - **Trust Pages:** Generate detailed blueprints for: How We Rate / Review Methodology, Dedicated Affiliate Disclosure, Editorial Team / Author Biographies, and Responsible Gambling.
   - **Contact Page (STRICT LOGIC):** React-island contact form. **Do NOT include any physical address or phone number.** Client-side validation required. **Simulation Logic:** On submit, prevent default, show a disabled/loading state for a random 1-3 seconds, then display a success message. Do not build a backend.
   - **Legal:** Privacy Policy and Terms of Service boilerplate.
5. **Implementation & Build Rules:** Give the coding agent strict rules focusing on:
   - **Technical SEO Lock-Down:** Generate a `robots.txt` that explicitly `Disallow: /go/`. Configure `@astrojs/sitemap` in `astro.config.mjs` immediately. Ensure root directory support for Google Search Console HTML verification files.
   - **Media & Performance:** All images must be WebP/AVIF with strict `alt` tags. The LCP image must have `fetchpriority="high"`. All below-the-fold images must be `loading="lazy"`.
   - **UX / Penalty Avoidance:** Explicitly forbid any intrusive pop-ups or full-screen interstitials on page load.
   - **Content Freshness:** The UI must prominently display "Last Updated" timestamps on all reviews and guides.

6. **Automation-Ready Content Collection Schema (CRITICAL):** The Astro Content Collections schema MUST be designed to accept automated content generation. Copy this EXACT schema into `src/content/config.ts`:

   ```typescript
   import { z, defineCollection } from "astro:content";

   const postsCollection = defineCollection({
     type: "content",
     schema: z.object({
       // ==========================================
       // MANDATORY CORE FIELDS (ALL CONTENT TYPES)
       // ==========================================
       title: z.string(),
       slug: z.string(),
       description: z.string(), // SEO meta description
       seoTitle: z.string(), // Custom SEO title (H1 vs meta title)
       excerpt: z.string().optional(), // Content summary (different from meta description)
       publishedAt: z.coerce.date(), // ISO 8601 string, coerced to Date
       updatedAt: z.coerce.date(), // ISO 8601 string, coerced to Date
       publishDate: z.string().optional(), // YYYY-MM-DD format for display
       tags: z.array(z.string()),
       image: z.string(), // Path: /images/covers/{slug}.webp
       imageAlt: z.string(),
       imageWidth: z.number().default(1792),
       imageHeight: z.number().default(1024),
       imageLoading: z.enum(["lazy", "eager"]).default("lazy"),
       imageFetchPriority: z.enum(["high", "low", "auto"]).default("auto"),
       logo: z.string().optional(), // Path: /images/logos/{slug}.{ext}
       author: z.string(),
       authorSlug: z.string(), // For linking to /team/{authorSlug}
       canonical: z.string(), // Full canonical URL
       schema_jsonld: z.string(), // CRITICAL: JSON.stringify'd schema
       contentType: z.enum(["promotion", "deal", "news", "review"]),

       // SEO Control Fields
       draft: z.boolean().optional(),
       noIndex: z.boolean().optional(),
       robots: z.string().optional(), // e.g., "index, follow"

       // ==========================================
       // CASINO/REVIEW FIELDS (OPTIONAL)
       // ==========================================
       // Ratings & Verification
       rating: z.number().min(1).max(5).optional(), // Editorial rating (1-5 stars)
       ourRating: z.number().min(1).max(5).optional(), // Editorial rating (alias)
       playerRating: z.number().min(1).max(5).optional(), // User/community rating
       verified: z.boolean().optional(), // "Verified by our team" badge

       // Review Content
       pros: z.array(z.string()).optional(), // Bullet list for UI
       cons: z.array(z.string()).optional(), // Bullet list for UI

       // Casino Identity
       casino: z.string().optional(), // Casino short identifier
       casino_name: z.string().optional(), // Full casino name
       casinoReviewUrl: z.string().optional(), // Link to full casino review
       casinoType: z.string().optional(), // regular/crypto/hybrid
       website: z.string().optional(), // Official casino website URL
       company: z.string().optional(), // Operating company
       established: z.string().optional(), // Year established

       // Licensing & Security
       licences: z.string().optional(), // Licensing info (comma-separated or formatted)

       // Payment Methods
       currencies: z.string().optional(), // Accepted currencies
       deposit_methods: z.string().optional(), // Deposit methods (comma-separated)
       withdrawal_methods: z.string().optional(), // Withdrawal methods (array or string)

       // Withdrawal Details
       minimum_deposit: z.string().optional(), // e.g., "$10"
       minimumWithdrawalAmount: z.string().optional(), // Min withdrawal limit
       withdrawal_time: z.string().optional(), // e.g., "24-48 hours"
       withdrawalTimes: z.string().optional(), // Processing times (detailed)
       withdrawalFees: z.string().optional(), // Fee structure
       withdrawalLimit: z.string().optional(), // Max withdrawal limits

       // Games & Providers
       game_providers: z.string().optional(), // Software providers

       // Support
       live_chat: z.boolean().optional(), // Live chat availability
       email_support: z.string().optional(), // Support email

       // Loyalty & VIP
       vipLoyaltyProgram: z.string().optional(), // VIP program details
       affiliate_program: z.string().optional(), // Affiliate program info

       // ==========================================
       // BONUS/PROMOTION FIELDS (OPTIONAL)
       // ==========================================
       // Bonus Details
       bonus: z.string().optional(), // e.g., "100% up to $500"
       bonusType: z.string().optional(), // welcome/reload/cashback/etc.
       bonusPercentage: z.string().optional(), // Match percentage
       bonusDuration: z.string().optional(), // How long bonus is valid
       code: z.string().optional(), // Bonus code
       maxBonus: z.string().optional(), // Maximum bonus amount
       maximumBonusAmount: z.string().optional(), // Cap on bonus value (alias)

       // Free Spins
       freeSpins: z.string().optional(), // Free spins offer summary
       freeSpinsCount: z.number().optional(), // Number of free spins
       freeSpinsWr: z.string().optional(), // Free spins wagering requirement

       // Wagering Requirements
       wagering: z.string().optional(), // e.g., "40x"
       wageringRequirements: z.string().optional(), // Full wagering details

       // Promotion Flags
       exclusive: z.boolean().optional(), // "Exclusive" badge
       expires_at: z.coerce.date().optional(), // Deal expiration
       claim_url: z.string().optional(), // Affiliate link slug for /go/{slug}

       // ==========================================
       // NEWS FIELDS (OPTIONAL)
       // ==========================================
       featured: z.boolean().optional(), // Pin to top of news feed
     }),
   });

   export const collections = {
     posts: postsCollection,
   };
   ```

   **Schema.org Integration Method:**
   - Schema is stored as a **JSON string** in the `schema_jsonld` frontmatter field
   - Layout component MUST parse this string and inject it into `<head>` as:

     ```astro
     {frontmatter.schema_jsonld && (
       <script type="application/ld+json" set:html={frontmatter.schema_jsonld} />
     )}
     ```

   - DO NOT generate schema in components—it comes pre-generated from automation
   - Schema will include `datePublished` (from `publishedAt`) and `dateModified` (from `updatedAt`)

   **Image Path Conventions (STRICT):**
   - Cover images: `/images/covers/{slug}.webp` (1792x1024, WebP, 80% quality)
   - Logos: `/images/logos/{slug}.{ext}` (PNG or SVG, if scraped from source)
   - All images lazy-loaded except LCP image
   - LCP image gets `fetchpriority="high"`

   **Author Integration:**
   - Author bio pages MUST exist at `/team/{authorSlug}`
   - Display author name with link: `<a href="/team/{authorSlug}">{author}</a>`
   - Author personas establish E-E-A-T credibility

   **Date Display Requirements:**
   - Show "Last Updated: {updatedAt}" prominently on all content pages
   - Use relative time for news (e.g., "2 hours ago")
   - Format with Intl.DateTimeFormat for locale-aware display

   **Related Content Logic:**
   - If `relatedPosts` array exists in frontmatter, use those slugs
   - Otherwise, fallback to tag-based matching (same tags)
   - Display 3-4 related items to prevent orphan pages

   **Content Freshness Indicators:**
   - Reviews: Show "Last Tested: {updatedAt}" badge
   - Deals/Promotions: Show countdown timer if `expires_at` exists
   - News: Show relative timestamp ("3 days ago")

   **Multi-Content-Type Support:**
   - Site MAY use all content types (promotions, deals, news, reviews) or only a subset
   - Content Collection schema MUST support ALL fields (use optional fields with `?`)
   - Filtering/routing should be dynamic based on `contentType` field
   - Example routes:
     - `/promotions/` - List all contentType === "promotion"
     - `/deals/` - List all contentType === "deal"
     - `/news/` - List all contentType === "news"
     - `/reviews/` - List all contentType === "review"
     - `/posts/{slug}` - Universal detail page, UI adapts based on contentType

Generate the `.md` specification now.
