import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

type Post = CollectionEntry<"posts">;
type NewsEntry = CollectionEntry<"news">;
type AnyPost = Post | NewsEntry;

export function getPostUrl(post: Post): string {
  const ct = (post.data.contentType || "promotion").toLowerCase();
  if (ct === "news") return `/news/${post.data.slug}`;
  if (ct === "promotion" || ct === "bonus" || ct === "default") return `/bonus/${post.data.slug}`;
  if (ct === "review") return `/casinos/${post.data.slug}`;
  if (ct === "guide") return `/guides/${post.data.slug}`;
  return `/bonus/${post.data.slug}`;
}

export function isBonus(post: Post): boolean {
  const ct = (post.data.contentType || "promotion").toLowerCase();
  return ct === "promotion" || ct === "bonus" || ct === "default";
}

export function isNews(post: AnyPost): boolean {
  return (post.data.contentType || "").toLowerCase() === "news";
}

export function isReview(post: Post): boolean {
  return (post.data.contentType || "").toLowerCase() === "review";
}

export function isGuide(post: Post): boolean {
  return (post.data.contentType || "").toLowerCase() === "guide";
}

export function sortByDate(posts: AnyPost[]): AnyPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
  );
}

/** Merge news from both the `posts` collection (contentType=news) and the `news` collection */
export async function getAllNews(): Promise<AnyPost[]> {
  const [posts, newsEntries] = await Promise.all([
    getCollection("posts"),
    getCollection("news"),
  ]);
  const fromPosts = posts.filter(isNews);
  const all = [...fromPosts, ...newsEntries];
  return sortByDate(all);
}

export interface BonusInfo {
  text: string;
  url: string | null;
}

/** Build a map of casinoName -> { bonus text, bonus post URL } from bonus/promotion posts */
export function buildBonusMap(allPosts: Post[]): Map<string, BonusInfo> {
  const map = new Map<string, BonusInfo>();
  for (const p of allPosts) {
    if (!isBonus(p)) continue;
    const name = (p.data.casinoName || p.data.casino_name || "").toLowerCase();
    if (name && p.data.bonus) {
      map.set(name, { text: p.data.bonus, url: `/bonus/${p.data.slug}` });
    }
  }
  return map;
}

/** Look up bonus text and optional link for a review, cross-referencing bonus posts */
export function getBonusInfo(review: Post, bonusMap: Map<string, BonusInfo>, fallback = "No bonus listed"): BonusInfo {
  const d = review.data;
  // Direct bonus field on the review itself
  const directText = d.bonus || d.bonus_title || null;
  if (directText) {
    const name = (d.casinoName || d.casino_name || "").toLowerCase();
    const mapped = name ? bonusMap.get(name) : undefined;
    return { text: directText, url: mapped?.url || null };
  }
  // Cross-reference from bonus posts
  const name = (d.casinoName || d.casino_name || "").toLowerCase();
  const mapped = name ? bonusMap.get(name) : undefined;
  if (mapped) return mapped;
  // maxBonus as last resort (raw number) — prefer bonusTitle for display
  if (d.maxBonus) {
    return { text: d.maxBonus, url: null };
  }
  return { text: fallback, url: null };
}

/** Simple text-only helper for backwards compat */
export function getBonusText(review: Post, bonusMap: Map<string, BonusInfo>, fallback = "No bonus listed"): string {
  return getBonusInfo(review, bonusMap, fallback).text;
}

export type { Post, NewsEntry, AnyPost };
