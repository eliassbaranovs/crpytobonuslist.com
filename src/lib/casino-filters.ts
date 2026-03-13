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
  const lower = coin.toLowerCase();
  // Check acceptedCryptos array first
  const cryptos = (review.data as any).acceptedCryptos;
  if (Array.isArray(cryptos) && cryptos.some((c: string) => c.toLowerCase().includes(lower))) {
    return true;
  }
  // Fall back to depositMethods string
  const methods = review.data.depositMethods || "";
  return methods.toLowerCase().includes(lower);
}

/** Check if casino has fast crypto withdrawals (under 6 hours) */
export function hasFastWithdrawal(review: Post): boolean {
  // Use structured field when available
  const minutes = (review.data as any).cryptoWithdrawalSpeedMinutes;
  if (typeof minutes === "number") {
    return minutes <= 360;
  }
  // Fall back to parsing withdrawalTimes text
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
  // Use structured field when available
  const minutes = (review.data as any).cryptoWithdrawalSpeedMinutes;
  if (typeof minutes === "number") {
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes === 60) return "1 hour";
    if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
    return `${Math.round(minutes / 1440)} days`;
  }
  // Fall back to parsing withdrawalTimes text
  const times = review.data.withdrawalTimes || "";
  const cryptoMatch = times.match(/crypto:\s*[^|]*/i);
  return cryptoMatch ? cryptoMatch[0].replace(/crypto:\s*/i, "").trim() : "N/A";
}

/** Check if casino has low or no wagering requirements */
export function hasLowWagering(review: Post): boolean {
  // Use structured field when available
  const multiplier = (review.data as any).wageringMultiplier;
  if (typeof multiplier === "number") {
    return multiplier <= 10;
  }
  // Fall back to parsing wagering text
  const wr = review.data.wagering || "";
  const match = wr.match(/(\d+)x/i);
  if (match) {
    return parseInt(match[1]) <= 10;
  }
  return false;
}

/** Get wagering multiplier as number */
export function getWageringNumber(review: Post): number | null {
  // Use structured field when available
  const multiplier = (review.data as any).wageringMultiplier;
  if (typeof multiplier === "number") {
    return multiplier;
  }
  // Fall back to parsing wagering text
  const wr = review.data.wagering || "";
  const match = wr.match(/(\d+)x/i);
  return match ? parseInt(match[1]) : null;
}

/** Check if casino does not require KYC */
export function isNoKyc(review: Post): boolean {
  const kyc = (review.data as any).kycRequired;
  if (kyc === false) return true;
  return false;
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
  if (rating >= 4) return "text-[#A855F7]";
  return "text-white";
}

/** Get rating bg class based on score */
export function getRatingBg(rating: number): string {
  if (rating >= 8) return "bg-[#39FF14] text-black";
  if (rating >= 6) return "bg-[#FAFF00] text-black";
  if (rating >= 4) return "bg-[#A855F7] text-white";
  return "bg-white text-black";
}

/** Get review URL */
export function getReviewUrl(review: Post): string {
  return `/casinos/${review.data.slug}`;
}

/** Get claim URL - always routes through /go/ redirect */
export function getClaimUrl(review: Post): string {
  const claimUrl = review.data.claim_url;
  // Route through /go/ using claim_url as slug if it's a plain slug, otherwise use post slug
  if (claimUrl && !claimUrl.includes("/")) {
    return `/go/${claimUrl}`;
  }
  return `/go/${review.data.slug}`;
}

export { isReview };
export type { Post };
