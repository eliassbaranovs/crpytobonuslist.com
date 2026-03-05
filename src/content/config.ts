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
      bonus: z.string().optional(),
      bonusType: z.string().optional(),
      bonusPercentage: z.string().optional(),
      bonusDuration: z.string().optional(),
      code: z.preprocess((v) => toStr(v), z.string().optional()),
      maxBonus: z.string().optional(),
      maximumBonusAmount: z.string().optional(),
      freeSpins: z.preprocess((v) => toStr(v), z.string().optional()),
      freeSpinsCount: z.preprocess((v) => toNum(v), z.number().optional()),
      freeSpinsWr: z.string().optional(),
      wagering: z.string().optional(),
      wageringRequirements: z.string().optional(),
      exclusive: z.preprocess((v) => toBool(v), z.boolean().optional()),
      verified: z.preprocess((v) => toBool(v), z.boolean().optional()),
      expires_at: z.coerce.date().optional(),
      claim_url: z.string().optional(),
      rating: z.preprocess((v) => toNum(v), z.number().min(0).max(10).optional()),
      ourRating: z.preprocess((v) => toNum(v), z.number().min(0).max(10).optional()),
      playerRating: z.preprocess((v) => toNum(v), z.number().min(0).max(10).optional()),
      playerRatingCount: z.preprocess((v) => toStr(v), z.string().optional()),
      pros: z.preprocess((v) => toStrArray(v), z.array(z.string()).optional()),
      cons: z.preprocess((v) => toStrArray(v), z.array(z.string()).optional()),
      casino: z.string().optional(),
      casino_name: z.string().optional(),
      casinoName: z.string().optional(),
      casinoReviewUrl: z.string().optional(),
      casinoType: z.string().optional(),
      website: z.string().optional(),
      company: z.string().optional(),
      established: z.preprocess((v) => toStr(v), z.string().optional()),
      languages: z.string().optional(),
      mobileApps: z.string().optional(),
      readReview: z.string().optional(),
      licences: z.string().optional(),
      rtp: z.string().optional(),
      rngTested: z.string().optional(),
      currencies: z.string().optional(),
      deposit_methods: z.string().optional(),
      depositMethods: z.string().optional(),
      withdrawal_methods: z.string().optional(),
      withdrawalMethods: z.string().optional(),
      minimum_deposit: z.string().optional(),
      minimumDeposit: z.string().optional(),
      minimumWithdrawalAmount: z.preprocess((v) => toStr(v), z.string().optional()),
      withdrawal_time: z.string().optional(),
      withdrawalTimes: z.string().optional(),
      withdrawalFees: z.preprocess((v) => toStr(v), z.string().optional()),
      withdrawalLimit: z.string().optional(),
      pendingTime: z.string().optional(),
      game_providers: z.string().optional(),
      gameProviders: z.string().optional(),
      live_chat: z.preprocess(
        (v) => typeof v === "string" ? v : v === true ? "Yes" : v === false ? "No" : undefined,
        z.string().optional(),
      ),
      liveChat: z.preprocess(
        (v) => typeof v === "string" ? v : v === true ? "Yes" : v === false ? "No" : undefined,
        z.string().optional(),
      ),
      email_support: z.string().optional(),
      emailSupport: z.string().optional(),
      complaintResponse: z.string().optional(),
      vipLoyaltyProgram: z.string().optional(),
      affiliate_program: z.string().optional(),
      affiliateProgram: z.string().optional(),
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
    })
    .transform((data) => ({
      ...data,
      updatedAt: data.updatedAt ?? (data.lastModified ? new Date(data.lastModified) : data.publishedAt),
      image: data.image || data.coverImage || "",
      author: data.author || data.authorName || "",
      imageAlt: data.imageAlt || data.title,
      seoTitle: data.seoTitle || data.title,
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
    expertise: z.preprocess(
      (v) => (Array.isArray(v) ? v : undefined),
      z.array(z.string()).optional(),
    ),
    avatar: z.string().optional(),
    socialLinks: z.preprocess(
      (v) => typeof v === "object" && v !== null && !Array.isArray(v) ? v : undefined,
      z.record(z.string()).optional(),
    ),
    joinedAt: z.string(),
  }),
});

export const collections = { posts, news, authors };
