import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const bonuses = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/bonuses" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    casino: z.string().optional(),
    bonus: z.string().optional(),
    code: z.string().optional(),
    verified: z.boolean().optional(),
    publishDate: z.coerce.string().optional(),
    bonusType: z.string().optional(),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    seoTitle: z.string(),
    tags: z.array(z.string()),
    publishedAt: z.coerce.string(),
    image: z.string(),
    imageAlt: z.string(),
    author: z.string(),
    schema_jsonld: z.union([z.array(z.any()), z.record(z.any()), z.string()]).optional(),
  }),
});

export const collections = { bonuses, news };
