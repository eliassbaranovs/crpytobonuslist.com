import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const bonuses = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/bonuses" }),
  schema: z.object({
    // ==========================================
    // MANDATORY CORE FIELDS (ALL CONTENT TYPES)
    // ==========================================
    title: z.string(),
    slug: z.string().optional(),
    description: z.string(),
    seoTitle: z.string().optional(),
    excerpt: z.string().optional(),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    publishDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    imageWidth: z.number().default(1792).optional(),
    imageHeight: z.number().default(1024).optional(),
    imageLoading: z.enum(["lazy", "eager"]).default("lazy").optional(),
    imageFetchPriority: z
      .enum(["high", "low", "auto"])
      .default("auto")
      .optional(),
    logo: z.string().optional(),
    author: z.string().optional(),
    authorSlug: z.string().optional(),
    canonical: z.string().optional(),
    schema_jsonld: z.string().optional(),
    contentType: z.enum(["promotion", "deal", "news", "review"]).optional(),

    // SEO Control Fields
    draft: z.boolean().optional(),
    noIndex: z.boolean().optional(),
    robots: z.string().optional(),

    // ==========================================
    // CASINO/REVIEW FIELDS (OPTIONAL)
    // ==========================================
    // Ratings & Verification
    rating: z.number().min(1).max(5).optional(),
    ourRating: z.number().min(1).max(5).optional(),
    playerRating: z.number().min(1).max(5).optional(),
    verified: z.boolean().optional(),

    // Review Content
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),

    // Casino Identity
    casino: z.string().optional(),
    casino_name: z.string().optional(),
    casinoReviewUrl: z.string().optional(),
    casinoType: z.string().optional(),
    website: z.string().optional(),
    company: z.string().optional(),
    established: z.string().optional(),

    // Licensing & Security
    licences: z.string().optional(),

    // Payment Methods
    currencies: z.string().optional(),
    deposit_methods: z.string().optional(),
    withdrawal_methods: z.string().optional(),

    // Withdrawal Details
    minimum_deposit: z.string().optional(),
    minimumWithdrawalAmount: z.string().optional(),
    withdrawal_time: z.string().optional(),
    withdrawalTimes: z.string().optional(),
    withdrawalFees: z.string().optional(),
    withdrawalLimit: z.string().optional(),

    // Games & Providers
    game_providers: z.string().optional(),

    // Support
    live_chat: z.boolean().optional(),
    email_support: z.string().optional(),

    // Loyalty & VIP
    vipLoyaltyProgram: z.string().optional(),
    affiliate_program: z.string().optional(),

    // ==========================================
    // BONUS/PROMOTION FIELDS (OPTIONAL)
    // ==========================================
    // Bonus Details
    bonus: z.string().optional(),
    bonusType: z.string().optional(),
    bonusPercentage: z.string().optional(),
    bonusDuration: z.string().optional(),
    code: z.string().optional(),
    maxBonus: z.string().optional(),
    maximumBonusAmount: z.string().optional(),

    // Free Spins
    freeSpins: z.string().optional(),
    freeSpinsCount: z.number().optional(),
    freeSpinsWr: z.string().optional(),

    // Wagering Requirements
    wagering: z.string().optional(),
    wageringRequirements: z.string().optional(),

    // Promotion Flags
    exclusive: z.boolean().optional(),
    expires_at: z.coerce.date().optional(),
    claim_url: z.string().optional(),

    // ==========================================
    // NEWS FIELDS (OPTIONAL)
    // ==========================================
    featured: z.boolean().optional(),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object({
    // ==========================================
    // MANDATORY CORE FIELDS (ALL CONTENT TYPES)
    // ==========================================
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    seoTitle: z.string().optional(),
    excerpt: z.string().optional(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    publishDate: z.string().optional(),
    tags: z.array(z.string()),
    image: z.string(),
    imageAlt: z.string(),
    imageWidth: z.number().default(1792).optional(),
    imageHeight: z.number().default(1024).optional(),
    imageLoading: z.enum(["lazy", "eager"]).default("lazy").optional(),
    imageFetchPriority: z
      .enum(["high", "low", "auto"])
      .default("auto")
      .optional(),
    logo: z.string().optional(),
    author: z.string(),
    authorSlug: z.string().optional(),
    canonical: z.string().optional(),
    schema_jsonld: z.any().optional(),
    contentType: z
      .enum(["promotion", "deal", "news", "review"])
      .default("news")
      .optional(),

    // SEO Control Fields
    draft: z.boolean().optional(),
    noIndex: z.boolean().optional(),
    robots: z.string().optional(),

    // ==========================================
    // NEWS FIELDS (OPTIONAL)
    // ==========================================
    featured: z.boolean().optional(),

    // Related Content
    relatedPosts: z.array(z.string()).optional(),
  }),
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
