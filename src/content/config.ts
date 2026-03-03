import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const bonuses = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/bonuses" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    seoTitle: z.string(),
    tags: z.array(z.string()),
    publishedAt: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    author: z.string(),
    bonusType: z.string().default("welcome"),
    schema_jsonld: z.union([z.array(z.any()), z.record(z.any())]).optional(),
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
    publishedAt: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    author: z.string(),
    schema_jsonld: z.union([z.array(z.any()), z.record(z.any())]).optional(),
  }),
});

export const collections = { bonuses, news };
