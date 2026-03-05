import type { CollectionEntry } from "astro:content";

type Post = CollectionEntry<"posts">;

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

export function isNews(post: Post): boolean {
  return (post.data.contentType || "").toLowerCase() === "news";
}

export function isReview(post: Post): boolean {
  return (post.data.contentType || "").toLowerCase() === "review";
}

export function isGuide(post: Post): boolean {
  return (post.data.contentType || "").toLowerCase() === "guide";
}

export function sortByDate(posts: Post[]): Post[] {
  return [...posts].sort(
    (a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
  );
}
