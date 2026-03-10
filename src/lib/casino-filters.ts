import type { CollectionEntry } from "astro:content";

type Post = CollectionEntry<"posts">;

/**
 * Casino filter helpers.
 * Each function checks for a clean machine-readable field first,
 * then falls back to parsing the human-readable text field.
 * When the automation pipeline adds clean fields, parsing is skipped automatically.
 */

export function isReview(post: Post): boolean {
  return (post.data.contentType || "").toLowerCase() === "review";
}

export function getReviews(posts: Post[]): Post[] {
  return posts
    .filter(isReview)
    .filter((p) => !p.data.draft)
    .sort((a, b) => (b.data.ourRating || 0) - (a.data.ourRating || 0));
}

/** Check if casino accepts a specific cryptocurrency */
export function acceptsCrypto(review: Post, coin: string): boolean {
  // Clean field: acceptedCryptos array
  const accepted = (review.data as any).acceptedCryptos;
  if (Array.isArray(accepted)) {
    return accepted.some((c: string) => c.toLowerCase() === coin.toLowerCase());
  }
  // Fallback: parse depositMethods string
  const methods = review.data.depositMethods || (review.data as any).deposit_methods || "";
  return methods.toLowerCase().includes(coin.toLowerCase());
}

/** Check if casino has fast crypto withdrawals (under 6 hours) */
export function hasFastWithdrawal(review: Post): boolean {
  // Clean field: cryptoWithdrawalSpeedMinutes
  const speed = (review.data as any).cryptoWithdrawalSpeedMinutes;
  if (speed !== undefined && speed !== null) {
    return speed <= 360;
  }
  // Fallback: parse withdrawalTimes text
  const times = review.data.withdrawalTimes || (review.data as any).withdrawal_time || "";
  const cryptoMatch = times.match(/crypto:\s*(?:(\d+)\s*-\s*)?(\d+)\s*hour/i);
  if (cryptoMatch) {
    const maxHours = parseInt(cryptoMatch[2]);
    return maxHours <= 6;
  }
  return false;
}

/** Get withdrawal speed label from data */
export function getWithdrawalSpeedLabel(review: Post): string {
  const speed = (review.data as any).cryptoWithdrawalSpeedMinutes;
  if (speed !== undefined && speed !== null) {
    if (speed <= 30) return "Instant";
    if (speed <= 60) return "< 1 hour";
    if (speed <= 360) return "< 6 hours";
    if (speed <= 1440) return "< 24 hours";
    return "24+ hours";
  }
  const times = review.data.withdrawalTimes || (review.data as any).withdrawal_time || "";
  const cryptoMatch = times.match(/crypto:\s*[^|]*/i);
  return cryptoMatch ? cryptoMatch[0].replace(/crypto:\s*/i, "").trim() : "N/A";
}

/** Check if casino has low or no wagering requirements */
export function hasLowWagering(review: Post): boolean {
  // Clean field: wageringMultiplier
  const multiplier = (review.data as any).wageringMultiplier;
  if (multiplier !== undefined && multiplier !== null) {
    return multiplier <= 10;
  }
  // Fallback: parse wageringRequirements text
  const wr = review.data.wageringRequirements || (review.data as any).wagering || "";
  const match = wr.match(/(\d+)x/i);
  if (match) {
    return parseInt(match[1]) <= 10;
  }
  return false;
}

/** Get wagering multiplier as number */
export function getWageringNumber(review: Post): number | null {
  const multiplier = (review.data as any).wageringMultiplier;
  if (multiplier !== undefined && multiplier !== null) return multiplier;
  const wr = review.data.wageringRequirements || (review.data as any).wagering || "";
  const match = wr.match(/(\d+)x/i);
  return match ? parseInt(match[1]) : null;
}

/** Check if casino was established recently (within 2 years) */
export function isNewCasino(review: Post): boolean {
  const flag = (review.data as any).isNewCasino;
  if (flag !== undefined) return flag;
  const est = review.data.established;
  if (!est) return false;
  const year = parseInt(est);
  const currentYear = new Date().getFullYear();
  return currentYear - year <= 1;
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
  if (claimUrl && (claimUrl.startsWith("http://") || claimUrl.startsWith("https://"))) {
    return claimUrl;
  }
  // Otherwise route through /go/ using the post slug (matches [slug].astro generation)
  return `/go/${review.data.slug}`;
}

export type { Post };
