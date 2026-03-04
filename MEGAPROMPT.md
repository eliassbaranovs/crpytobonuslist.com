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
- **Layout Structure** [ e.g., Asymmetrical overlapping grids, strict Bento-box UI, classic vertical SaaS, horizontal scrolling sections, terminal/CLI style ]

# Required Output Structure

Your generated `.md` file MUST strictly follow this structure:

1. **SEO Strategy & Content Architecture:** Define the Hub-and-Spoke (Silo) internal linking strategy. Provide the Tagline, Value Proposition, and generate 3-4 **Niche Keyword Silos** (e.g., `/no-kyc-casinos`, `/fast-withdrawal-casinos`). NO lorem ipsum.
2. **Tech Stack & Semantic Requirements:** Define the framework and styling. You MUST specify strict rules for Semantic HTML (`<article>`, `<aside>`, `<nav>`, proper `H1` -> `H3` nesting). Define exactly what Schema.org markup (Review, FAQPage, Article, Organization) is required on which routes. **Ensure `datePublished` and `dateModified` are strictly mapped in the Schema.**
3. **Design Aesthetic Rules:** Provide strict, unambiguous CSS rules. Define exact shadow styles, border thicknesses, typography sizing (using `clamp()`), and color hex codes. Layout Engine Directives: Based on the Design Style, dictate the specific Flexbox/Grid behaviors. Do NOT default to standard centered containers. Specify if the layout should use edge-to-edge full-viewport sections, heavy asymmetrical overlapping, or strict masonry bento grids.
4. **Deep Site Architecture (Mandatory SEO, Trust & CRO Pages):** Map out the exact routing structure. You MUST include:
   - **High-Converting "Money Pages" (Keyword Hubs):** Setup instructions for generating static paths for category silos. **CRO MANDATE:** These pages must feature a "Toplist" UI component above the fold—a high-contrast comparison table or card stack ranking the top casinos with massive, unavoidable CTA buttons. These pages must feature a "Toplist" UI component above the fold. The visual structure of this Toplist MUST adapt to the Design Style (e.g., if Neo-Brutalist, use massive overlapping cards; if Minimalist, use a razor-thin data table).
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

   // ============================================================
   // HELPER: Safely coerce any value to string (handles numbers,
   // booleans, Date objects from YAML auto-parsing)
   // ============================================================
   const toStr = (v: unknown) =>
     v == null || v === "" ? undefined : String(v);

   // HELPER: Coerce "Yes"/"No"/"true"/"false"/boolean → boolean
   const toBool = (v: unknown) =>
     v === true || v === "true" || v === "Yes"
       ? true
       : v === false || v === "false" || v === "No"
         ? false
         : undefined;

   // HELPER: Turn pipe-separated strings into arrays, pass arrays through
   const toStrArray = (v: unknown): string[] | undefined => {
     if (Array.isArray(v)) return v.map(String);
     if (typeof v === "string" && v.trim())
       return v
         .split("|")
         .map((s) => s.trim())
         .filter(Boolean);
     return undefined;
   };

   // HELPER: Coerce to number, reject NaN / empty string
   const toNum = (v: unknown): number | undefined => {
     if (v == null || v === "") return undefined;
     const n = Number(v);
     return isNaN(n) ? undefined : n;
   };

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
       excerpt: z.string().optional(), // Content summary
       publishedAt: z.coerce.date(), // ISO string → Date
       updatedAt: z.coerce.date().optional(), // ISO string → Date (optional - may be missing on first publish)
       // publishDate arrives as Date (YAML auto-parses "2026-03-04")
       // so we accept any type and always output a string
       publishDate: z.preprocess(
         (v) => (v instanceof Date ? v.toISOString().split("T")[0] : toStr(v)),
         z.string().optional(),
       ),
       tags: z.preprocess((v) => toStrArray(v) ?? [], z.array(z.string())),
       image: z.string(), // Path: /images/covers/{slug}.webp
       imageAlt: z.string(),
       imageWidth: z.preprocess((v) => toNum(v) ?? 1792, z.number()),
       imageHeight: z.preprocess((v) => toNum(v) ?? 1024, z.number()),
       imageLoading: z.enum(["lazy", "eager"]).default("lazy"),
       imageFetchPriority: z.enum(["high", "low", "auto"]).default("auto"),
       logo: z.string().optional(), // Path: /images/logos/{slug}.{ext}
       author: z.string(),
       authorSlug: z.preprocess((v) => toStr(v) ?? "", z.string()), // For linking to /team/{authorSlug}
       canonical: z.string().default(""), // Full canonical URL
       // schema_jsonld may arrive as object (YAML parses JSON) or string
       schema_jsonld: z.preprocess(
         (v) => (typeof v === "object" && v !== null ? JSON.stringify(v) : v),
         z.string().default(""),
       ),
       // contentType: accepts ANY string from pipeline ("bonus", "default",
       // "promotion", "news", etc.) — never reject content over this field
       contentType: z.string().default("promotion"),

       // SEO Control Fields
       draft: z.preprocess((v) => toBool(v), z.boolean().optional()),
       noIndex: z.preprocess((v) => toBool(v), z.boolean().optional()),
       robots: z.string().optional(), // e.g., "index, follow"

       // ==========================================
       // CASINO/REVIEW FIELDS (OPTIONAL)
       // Scraped ratings use 0-10 scale, NOT 1-5
       // ==========================================
       rating: z.preprocess(
         (v) => toNum(v),
         z.number().min(0).max(10).optional(),
       ),
       ourRating: z.preprocess(
         (v) => toNum(v),
         z.number().min(0).max(10).optional(),
       ),
       playerRating: z.preprocess(
         (v) => toNum(v),
         z.number().min(0).max(10).optional(),
       ),
       playerRatingCount: z.preprocess((v) => toStr(v), z.string().optional()), // e.g., "142 reviews"
       verified: z.preprocess((v) => toBool(v), z.boolean().optional()), // "Verified by our team" badge

       // Review Content — pipeline sends pipe-separated strings
       pros: z.preprocess((v) => toStrArray(v), z.array(z.string()).optional()),
       cons: z.preprocess((v) => toStrArray(v), z.array(z.string()).optional()),

       // Casino Identity
       casino: z.string().optional(),
       casino_name: z.string().optional(),
       casinoName: z.string().optional(), // Alias (camelCase)
       casinoReviewUrl: z.string().optional(),
       casinoType: z.string().optional(),
       website: z.string().optional(),
       company: z.string().optional(),
       // established: arrives as number (YAML parses "2024" → 2024)
       established: z.preprocess((v) => toStr(v), z.string().optional()),
       languages: z.string().optional(),
       mobileApps: z.string().optional(),
       readReview: z.string().optional(),

       // Licensing & Security
       licences: z.string().optional(),
       rtp: z.string().optional(),
       rngTested: z.string().optional(),

       // Payment Methods
       currencies: z.string().optional(),
       deposit_methods: z.string().optional(),
       depositMethods: z.string().optional(), // Alias (camelCase)
       withdrawal_methods: z.string().optional(),
       withdrawalMethods: z.string().optional(), // Alias (camelCase)

       // Withdrawal Details
       minimum_deposit: z.string().optional(),
       minimumDeposit: z.string().optional(), // Alias (camelCase)
       minimumWithdrawalAmount: z.string().optional(),
       withdrawal_time: z.string().optional(),
       withdrawalTimes: z.string().optional(),
       withdrawalFees: z.preprocess((v) => toStr(v), z.string().optional()), // May arrive as boolean from YAML
       withdrawalLimit: z.string().optional(),
       pendingTime: z.string().optional(),

       // Games & Providers
       game_providers: z.string().optional(),
       gameProviders: z.string().optional(), // Alias (camelCase)

       // Support
       // live_chat: may be boolean, or string like "24/7", "Limited Hours"
       liveChat: z.preprocess(
         (v) =>
           typeof v === "string"
             ? v
             : v === true
               ? "Yes"
               : v === false
                 ? "No"
                 : undefined,
         z.string().optional(),
       ),
       email_support: z.string().optional(),
       emailSupport: z.string().optional(), // Alias (camelCase)
       complaintResponse: z.string().optional(),

       // Loyalty & VIP
       vipLoyaltyProgram: z.string().optional(),
       affiliate_program: z.string().optional(),
       affiliateProgram: z.string().optional(), // Alias (camelCase)

       // ==========================================
       // BONUS/PROMOTION FIELDS (OPTIONAL)
       // ==========================================
       bonus: z.string().optional(), // e.g., "100% up to $500"
       bonusType: z.string().optional(), // WELCOME/NO-DEPOSIT/etc.
       bonusPercentage: z.string().optional(),
       bonusDuration: z.string().optional(),
       code: z.string().optional(), // Bonus code
       maxBonus: z.string().optional(),
       maximumBonusAmount: z.string().optional(),

       // Free Spins — may arrive as number or empty string
       freeSpins: z.preprocess((v) => toStr(v), z.string().optional()),
       freeSpinsCount: z.preprocess((v) => toNum(v), z.number().optional()),
       freeSpinsWr: z.string().optional(),

       // Wagering Requirements
       wagering: z.string().optional(),
       wageringRequirements: z.string().optional(),

       // Promotion Flags
       exclusive: z.preprocess((v) => toBool(v), z.boolean().optional()),
       expires_at: z.coerce.date().optional(),
       claim_url: z.string().optional(), // Affiliate link slug for /go/{slug}

       // ==========================================
       // RESPONSIBLE GAMING TOOLS (OPTIONAL)
       // Critical for SEO & regulatory compliance
       // ==========================================
       depositLimitTool: z.string().optional(),
       lossLimitTool: z.string().optional(),
       wagerLimitTool: z.string().optional(),
       selfExclusionTool: z.string().optional(),
       coolOffTimeOutTool: z.string().optional(),
       realityCheckTool: z.string().optional(),
       timeSessionLimitTool: z.string().optional(),
       selfAssessmentTest: z.string().optional(),
       gameHistoryFeature: z.string().optional(),
       selfExclusionRegisterParticipation: z.string().optional(),

       // ==========================================
       // NEWS / GENERAL FIELDS (OPTIONAL)
       // ==========================================
       featured: z.preprocess((v) => toBool(v), z.boolean().optional()),
       category: z.string().optional(), // Display category label
       // Extra aliases the pipeline may send
       authorName: z.string().optional(),
       coverImage: z.string().optional(),
       schemaJsonLd: z.preprocess(
         (v) => (typeof v === "object" && v !== null ? JSON.stringify(v) : v),
         z.string().optional(),
       ),
       createdAt: z.coerce.date().optional(),
       lastModified: z.preprocess(
         (v) => (v instanceof Date ? v.toISOString().split("T")[0] : toStr(v)),
         z.string().optional(),
       ),

       // ==========================================
       // FAQs FOR SCHEMA.ORG FAQPAGE MARKUP
       // ==========================================
       faqs: z.preprocess(
         (v) => Array.isArray(v) ? v : undefined,
         z.array(z.object({
           question: z.string(),
           answer: z.string()
         })).optional()
       ),
     }),
   }).transform((data) => ({
     ...data,
     // Ensure updatedAt always exists (fallback to publishedAt for new content)
     updatedAt: data.updatedAt || data.publishedAt,
   }));

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
   - Dynamic Routing Logic: Use the contentType or tags field to dynamically populate the specific Niche Keyword Silos generated in Section 1 (e.g., mapping contentType === "review" to /no-kyc-casinos/). The universal detail page should be /casinos/[slug] or /bonus/[slug] rather than a generic /posts/ directory.

Generate the `.md` specification now.
