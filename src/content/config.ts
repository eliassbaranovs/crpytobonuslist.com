import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

// ============================================================
// HELPER: Safely coerce any value to string (handles numbers,
// booleans, Date objects from YAML auto-parsing)
// ============================================================
const toStr = (v: unknown) => (v == null || v === "" ? undefined : String(v));

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

const bonuses = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/bonuses" }),
  schema: z
    .object({
      // ==========================================
      // MANDATORY CORE FIELDS (ALL CONTENT TYPES)
      // ==========================================
      title: z.string(),
      slug: z.string(),
      description: z.string(), // SEO meta description
      seoTitle: z.string(), // Custom SEO title (H1 vs meta title)
      excerpt: z.string().optional(), // Content summary
      publishedAt: z.coerce.date(), // ISO string → Date
      updatedAt: z.coerce.date().optional(), // ISO string → Date (falls back to publishedAt if missing)
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
      live_chat: z.preprocess(
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
    })
    .transform((data) => ({
      ...data,
      // Ensure updatedAt always exists: fallback to lastModified → publishedAt
      updatedAt:
        data.updatedAt ??
        (data.lastModified ? new Date(data.lastModified) : data.publishedAt),
    })),
});

const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z
    .object({
      title: z.string(),
      slug: z.string(),
      description: z.string(),
      seoTitle: z.string().optional(),
      excerpt: z.string().optional(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      publishDate: z.preprocess(
        (v) => (v instanceof Date ? v.toISOString().split("T")[0] : toStr(v)),
        z.string().optional(),
      ),
      tags: z.preprocess((v) => toStrArray(v) ?? [], z.array(z.string())),
      image: z.string(),
      imageAlt: z.string().optional(),
      imageWidth: z.preprocess((v) => toNum(v) ?? 1792, z.number()),
      imageHeight: z.preprocess((v) => toNum(v) ?? 1024, z.number()),
      imageLoading: z.enum(["lazy", "eager"]).default("lazy"),
      imageFetchPriority: z.enum(["high", "low", "auto"]).default("auto"),
      logo: z.string().optional(),
      author: z.string(),
      authorSlug: z.preprocess((v) => toStr(v) ?? "", z.string()),
      canonical: z.string().default(""),
      schema_jsonld: z.preprocess(
        (v) => (typeof v === "object" && v !== null ? JSON.stringify(v) : v),
        z.string().default(""),
      ),
      contentType: z.string().default("news"),
      draft: z.preprocess((v) => toBool(v), z.boolean().optional()),
      noIndex: z.preprocess((v) => toBool(v), z.boolean().optional()),
      robots: z.string().optional(),
      featured: z.preprocess((v) => toBool(v), z.boolean().optional()),
      category: z.string().optional(),
      relatedPosts: z.array(z.string()).optional(),
      
      // ==========================================
      // AUTOMATION COMPATIBILITY FIELDS (UNUSED)
      // Accept all fields from universal schema but ignore them in news
      // ==========================================
      coverImage: z.string().optional(),
      authorName: z.string().optional(),
      schemaJsonLd: z.string().optional(),
      createdAt: z.coerce.date().optional(),
      lastModified: z.preprocess(
        (v) => (v instanceof Date ? v.toISOString().split("T")[0] : toStr(v)),
        z.string().optional(),
      ),
      // Casino/Bonus fields (ignored for news)
      code: z.string().optional(),
      cons: z.string().optional(),
      pros: z.string().optional(),
      bonus: z.string().optional(),
      casino: z.string().optional(),
      maxBonus: z.string().optional(),
      wagering: z.string().optional(),
      bonusType: z.string().optional(),
      exclusive: z.string().optional(),
      freeSpins: z.string().optional(),
      ourRating: z.string().optional(),
      verified: z.string().optional(),
      company: z.string().optional(),
      website: z.string().optional(),
      casinoName: z.string().optional(),
      casinoType: z.string().optional(),
      licences: z.string().optional(),
      liveChat: z.string().optional(),
      emailSupport: z.string().optional(),
      currencies: z.string().optional(),
      depositMethods: z.string().optional(),
      withdrawalMethods: z.string().optional(),
      minimumDeposit: z.string().optional(),
      withdrawalFees: z.string().optional(),
      withdrawalLimit: z.string().optional(),
      withdrawalTimes: z.string().optional(),
      gameProviders: z.string().optional(),
      vipLoyaltyProgram: z.string().optional(),
      affiliateProgram: z.string().optional(),
      bonusPercentage: z.string().optional(),
      bonusDuration: z.string().optional(),
      maximumBonusAmount: z.string().optional(),
      wageringRequirements: z.string().optional(),
      freeSpinsCount: z.string().optional(),
      freeSpinsWr: z.string().optional(),
      casinoReviewUrl: z.string().optional(),
      playerRating: z.string().optional(),
      established: z.string().optional(),
      minimumWithdrawalAmount: z.string().optional(),
      
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
    })
    .transform((data) => ({
      ...data,
      // Ensure updatedAt always exists: fallback to lastModified → publishedAt
      updatedAt: data.updatedAt ?? 
        (data.lastModified ? new Date(data.lastModified) : data.publishedAt),
      // Use coverImage as fallback for image if needed
      image: data.image || data.coverImage || "",
      // Normalize author name
      author: data.author || data.authorName || "",
      imageAlt: data.imageAlt || data.title,
    })),
});

const authors = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/authors" }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    role: z.string(),
    bio: z.string(),
    expertise: z.array(z.string()).optional(),
    joinedAt: z.coerce.string(),
    image: z.string().optional(),
    social: z
      .object({
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { bonuses, news, authors };
