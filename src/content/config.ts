import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const toStr = (v: unknown) => (v == null || v === "" ? undefined : String(v));

const toBool = (v: unknown) =>
  v === true || v === "true" || v === "Yes"
    ? true
    : v === false || v === "false" || v === "No"
      ? false
      : undefined;

const toStrArray = (v: unknown): string[] | undefined => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v.trim())
    return v.split("|").map((s) => s.trim()).filter(Boolean);
  return undefined;
};

const toNum = (v: unknown): number | undefined => {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
};

// Pipeline-safe optional string: accepts string, number, or boolean from YAML
const pStr = () => z.preprocess((v) => toStr(v), z.string().optional());

// Pipeline-safe optional string that coerces bool to Yes/No
const pStrBool = () => z.preprocess(
  (v) => typeof v === "string" ? v : v === true ? "Yes" : v === false ? "No" : toStr(v),
  z.string().optional(),
);

// Shared schema for all content types (posts + news)
const contentSchema = z
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
        (v) =>
          typeof v === "object" && v !== null
            ? JSON.stringify(v)
            : v === "[object Object]" ? "" : v,
        z.string().default(""),
      ),
      contentType: z.string().default("promotion"),
      draft: z.preprocess((v) => toBool(v), z.boolean().optional()),
      noIndex: z.preprocess((v) => toBool(v), z.boolean().optional()),
      robots: z.string().optional(),
      wordCount: z.preprocess((v) => toNum(v), z.number().optional()),
      readingTime: z.string().optional(),
      relatedPosts: z.preprocess((v) => toStrArray(v), z.array(z.string()).optional()),
      featured: z.preprocess((v) => toBool(v), z.boolean().optional()),
      category: z.string().optional(),
      // Bonus fields
      bonus: z.string().optional(),
      bonusType: z.string().optional(),
      bonusPercentage: pStr(),
      bonus_percentage: pStr(),
      bonusDuration: z.string().optional(),
      bonus_title: z.string().optional(),
      code: pStr(),
      bonus_code: pStr(),
      maxBonus: pStr(),
      max_bonus: pStr(),
      maximumBonusAmount: pStr(),
      freeSpins: pStr(),
      free_spins: pStr(),
      freeSpinsCount: z.preprocess((v) => toNum(v), z.number().optional()),
      freeSpinsWr: pStr(),
      wagering: pStr(),
      wageringRequirements: pStr(),
      exclusive: z.preprocess((v) => toBool(v), z.boolean().optional()),
      verified: z.preprocess((v) => toBool(v), z.boolean().optional()),
      expires_at: z.coerce.date().optional(),
      claim_url: z.string().optional(),
      // Ratings
      rating: z.preprocess((v) => toNum(v), z.number().min(0).max(10).optional()),
      ourRating: z.preprocess((v) => toNum(v), z.number().min(0).max(10).optional()),
      playerRating: z.preprocess((v) => toNum(v), z.number().min(0).max(10).optional()),
      player_rating: pStr(),
      playerRatingCount: pStr(),
      // Pros and Cons
      pros: z.preprocess((v) => toStrArray(v), z.array(z.string()).optional()),
      cons: z.preprocess((v) => toStrArray(v), z.array(z.string()).optional()),
      // Casino identity
      casino: z.string().optional(),
      casino_name: z.string().optional(),
      casinoName: z.string().optional(),
      casinoReviewUrl: z.string().optional(),
      casinoType: z.string().optional(),
      casino_type: z.string().optional(),
      website: z.string().optional(),
      company: z.string().optional(),
      established: pStr(),
      best_for: z.string().optional(),
      // General info
      languages: z.string().optional(),
      mobileApps: z.string().optional(),
      readReview: z.string().optional(),
      licences: z.string().optional(),
      rtp: pStr(),
      rngTested: pStr(),
      currencies: z.string().optional(),
      // Payment fields (snake_case + camelCase)
      deposit_methods: z.string().optional(),
      depositMethods: z.string().optional(),
      withdrawal_methods: z.string().optional(),
      withdrawalMethods: z.string().optional(),
      minimum_deposit: pStr(),
      minimumDeposit: pStr(),
      min_deposit: pStr(),
      minimumWithdrawalAmount: pStr(),
      withdrawal_time: z.string().optional(),
      withdrawalTimes: z.string().optional(),
      withdrawalFees: pStr(),
      withdrawalLimit: pStr(),
      pendingTime: z.string().optional(),
      // Game providers (snake_case + camelCase)
      game_providers: z.string().optional(),
      gameProviders: z.string().optional(),
      // Support fields
      live_chat: pStrBool(),
      liveChat: pStrBool(),
      email_support: pStr(),
      emailSupport: pStr(),
      complaintResponse: z.string().optional(),
      // VIP / affiliate
      vipLoyaltyProgram: pStrBool(),
      vip_program: pStrBool(),
      affiliate_program: z.string().optional(),
      affiliateProgram: z.string().optional(),
      // Casino review: accepted coins (can be array or pipe-delimited string)
      accepted_coins: z.preprocess(
        (v) => {
          if (Array.isArray(v)) return v.map(String).join(" | ");
          return toStr(v);
        },
        z.string().optional(),
      ),
      // Responsible gambling tools
      depositLimitTool: pStrBool(),
      lossLimitTool: pStrBool(),
      wagerLimitTool: pStrBool(),
      selfExclusionTool: pStrBool(),
      coolOffTimeOutTool: pStrBool(),
      realityCheckTool: pStrBool(),
      timeSessionLimitTool: pStrBool(),
      selfAssessmentTest: pStrBool(),
      gameHistoryFeature: pStrBool(),
      selfExclusionRegisterParticipation: pStrBool(),
      // Misc
      difficulty: z.string().optional(),
      showToc: z.preprocess((v) => toBool(v), z.boolean().optional()),
      faqs: z.preprocess(
        (v) => (Array.isArray(v) ? v : undefined),
        z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
      ),
      authorName: z.string().optional(),
      coverImage: z.string().optional(),
      schemaJsonLd: z.preprocess(
        (v) =>
          typeof v === "object" && v !== null
            ? JSON.stringify(v)
            : v === "[object Object]" ? "" : v,
        z.string().optional(),
      ),
      createdAt: z.coerce.date().optional(),
      lastModified: z.preprocess(
        (v) => (v instanceof Date ? v.toISOString().split("T")[0] : toStr(v)),
        z.string().optional(),
      ),
      lastVerified: z.preprocess(
        (v) => (v instanceof Date ? v.toISOString().split("T")[0] : toStr(v)),
        z.string().optional(),
      ),
      // Casino review: section images from scraper
      sectionImages: z.preprocess(
        (v) => (Array.isArray(v) ? v : undefined),
        z.array(z.object({ section: z.string(), path: z.string() })).optional(),
      ),
      // Trust scoring (entity mode reviews)
      trustScore: pStr(),
      trustBadge: z.string().optional(),
      // Derived fields (injected at publish)
      acceptedCryptos: z.preprocess((v) => toStrArray(v), z.array(z.string()).optional()),
      cryptoWithdrawalSpeedMinutes: z.preprocess((v) => toNum(v), z.number().optional()),
      wageringMultiplier: z.preprocess((v) => toNum(v), z.number().optional()),
      isNewCasino: z.preprocess((v) => toBool(v), z.boolean().optional()),
      kycRequired: z.preprocess((v) => toBool(v), z.boolean().optional()),
    })
    .transform((data) => ({
      ...data,
      // Existing normalizations
      updatedAt: data.updatedAt ?? (data.lastModified ? new Date(data.lastModified) : data.publishedAt),
      image: data.image || data.coverImage || "",
      author: data.author || data.authorName || "",
      imageAlt: data.imageAlt || data.title,
      seoTitle: data.seoTitle || data.title,
      // Normalize snake_case -> camelCase for all duplicate field pairs
      depositMethods: data.depositMethods || data.deposit_methods || "",
      withdrawalMethods: data.withdrawalMethods || data.withdrawal_methods || "",
      gameProviders: data.gameProviders || data.game_providers || "",
      casinoName: data.casinoName || data.casino_name || data.casino || "",
      casinoType: data.casinoType || data.casino_type || "",
      liveChat: data.liveChat || data.live_chat || "",
      emailSupport: data.emailSupport || data.email_support || "",
      minimumDeposit: data.minimumDeposit || data.minimum_deposit || data.min_deposit || "",
      withdrawalTimes: data.withdrawalTimes || data.withdrawal_time || "",
      affiliateProgram: data.affiliateProgram || data.affiliate_program || "",
      wagering: data.wageringRequirements || data.wagering || "",
      bonusPercentage: data.bonusPercentage || data.bonus_percentage || "",
      maxBonus: data.maxBonus || data.max_bonus || "",
      code: data.code || data.bonus_code || "",
      freeSpins: data.freeSpins || data.free_spins || "",
      vipLoyaltyProgram: data.vipLoyaltyProgram || data.vip_program || "",
    }));

// Unified posts collection - pipeline publishes to src/content/posts/{slug}.md
// contentType determines routing:
//   "news"                -> /news/{slug}
//   "promotion" | "bonus" -> /bonus/{slug}
//   "review"              -> /casinos/{slug}
//   "guide"               -> /guides/{slug}
const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: contentSchema,
});

// Separate news collection - pipeline can also publish to src/content/news/{slug}.md
const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: contentSchema,
});

const authors = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/authors" }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    role: z.string().optional(),
    bio: z.string().optional(),
    layout: z.string().optional(),
    image: z.string().optional(),
    avatar: z.string().optional(),
    expertise: z.preprocess(
      (v) => (Array.isArray(v) ? v : undefined),
      z.array(z.string()).optional(),
    ),
    credentials: z.preprocess(
      (v) => (Array.isArray(v) ? v : undefined),
      z.array(z.string()).optional(),
    ),
    yearsExperience: z.preprocess(
      (v) => toNum(v),
      z.number().optional(),
    ),
    socialLinks: z.preprocess(
      (v) => typeof v === "object" && v !== null && !Array.isArray(v) ? v : undefined,
      z.record(z.string()).optional(),
    ),
    joinedAt: z.string().optional(),
    schemaJsonLd: z.preprocess(
      (v) =>
        typeof v === "object" && v !== null
          ? JSON.stringify(v)
          : v === "[object Object]" ? "" : v,
      z.string().optional(),
    ),
  }),
});

export const collections = { posts, news, authors };
