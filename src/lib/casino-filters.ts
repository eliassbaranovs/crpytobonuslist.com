import type { CollectionEntry } from "astro:content";
import { isReview } from "./posts";

type Post = CollectionEntry<"posts">;

/**
 * Casino filter helpers.
 * Functions parse the human-readable text fields from the schema.
 * Fields are normalized in config.ts transform, so camelCase is always available.
 */

export function getReviews(posts: Post[]): Post[] {
  return posts
    .filter(isReview)
    .filter((p) => !p.data.draft)
    .sort((a, b) => (b.data.ourRating || 0) - (a.data.ourRating || 0));
}

/** Check if casino accepts a specific cryptocurrency */
export function acceptsCrypto(review: Post, coin: string): boolean {
  // Parse depositMethods string (normalized in config.ts transform)
  const methods = review.data.depositMethods || "";
  return methods.toLowerCase().includes(coin.toLowerCase());
}

/** Check if casino has fast crypto withdrawals (under 6 hours) */
export function hasFastWithdrawal(review: Post): boolean {
  // Parse withdrawalTimes text (normalized in config.ts transform)
  const times = review.data.withdrawalTimes || "";
  const cryptoMatch = times.match(/crypto:\s*(?:(\d+)\s*-\s*)?(\d+)\s*hour/i);
  if (cryptoMatch) {
    const maxHours = parseInt(cryptoMatch[2]);
    return maxHours <= 6;
  }
  return false;
}

/** Get withdrawal speed label from data */
export function getWithdrawalSpeedLabel(review: Post): string {
  const times = review.data.withdrawalTimes || "";
  const cryptoMatch = times.match(/crypto:\s*[^|]*/i);
  return cryptoMatch ? cryptoMatch[0].replace(/crypto:\s*/i, "").trim() : "N/A";
}

/** Check if casino has low or no wagering requirements */
export function hasLowWagering(review: Post): boolean {
  // Parse wagering text (normalized in config.ts transform)
  const wr = review.data.wagering || "";
  const match = wr.match(/(\d+)x/i);
  if (match) {
    return parseInt(match[1]) <= 10;
  }
  return false;
}

/** Get wagering multiplier as number */
export function getWageringNumber(review: Post): number | null {
  const wr = review.data.wagering || "";
  const match = wr.match(/(\d+)x/i);
  return match ? parseInt(match[1]) : null;
}

/** Check if casino was established recently (within 2 years) */
export function isNewCasino(review: Post): boolean {
  const est = review.data.established;
  if (!est) return false;
  const year = parseInt(est);
  const currentYear = new Date().getFullYear();
  return currentYear - year <= 2;
}

/** Get rating color class based on score */
export function getRatingColor(rating: number): string {
  if (rating >= 8) return "text-[#39FF14]";
  if (rating >= 6) return "text-[#FAFF00]";
  if (rating >= 4) return "text-[#8A2BE2]";
  return "text-white";
}

/** Get rating bg class based on score */
export function getRatingBg(rating: number): string {
  if (rating >= 8) return "bg-[#39FF14] text-black";
  if (rating >= 6) return "bg-[#FAFF00] text-black";
  if (rating >= 4) return "bg-[#8A2BE2] text-white";
  return "bg-white text-black";
}

/** Get review URL */
export function getReviewUrl(review: Post): string {
  return `/casinos/${review.data.slug}`;
}

/** Get claim URL */
export function getClaimUrl(review: Post): string {
  const claimUrl = review.data.claim_url;
  // If claim_url is a full external URL, use it directly
  if (claimUrl && claimUrl.startsWith("https://")) {
    return claimUrl;
  }
  // Otherwise route through /go/ using the post slug (matches [slug].astro generation)
  return `/go/${review.data.slug}`;
}

export { isReview };
export type { Post };
