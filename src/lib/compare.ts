import type { CollectionEntry } from "astro:content";
import { isReview } from "./posts";
import { getReviewUrl, getClaimUrl, getWithdrawalSpeedLabel, getRatingBg } from "./casino-filters";

type Post = CollectionEntry<"posts">;

/** Casino name extraction - strips "Review" suffix from titles */
export function getCasinoName(review: Post): string {
  return review.data.casino_name || review.data.casinoName || review.data.title.replace(/ Review.*$/i, "");
}

/** Sort two slugs alphabetically and join with "-vs-" for canonical URL */
export function getCompareSlug(slugA: string, slugB: string): string {
  const sorted = [slugA, slugB].sort();
  return `${sorted[0]}-vs-${sorted[1]}`;
}

/** Get comparison page URL */
export function getCompareUrl(slugA: string, slugB: string): string {
  return `/compare/${getCompareSlug(slugA, slugB)}`;
}

/** Generate all valid comparison pairs from reviews */
export function generatePairs(reviews: Post[]): Array<{ slugA: string; slugB: string; compareSlug: string }> {
  const validReviews = reviews
    .filter(isReview)
    .filter((r) => !r.data.draft)
    .sort((a, b) => a.data.slug.localeCompare(b.data.slug));

  const pairs: Array<{ slugA: string; slugB: string; compareSlug: string }> = [];

  for (let i = 0; i < validReviews.length; i++) {
    for (let j = i + 1; j < validReviews.length; j++) {
      const slugA = validReviews[i].data.slug;
      const slugB = validReviews[j].data.slug;
      pairs.push({
        slugA,
        slugB,
        compareSlug: getCompareSlug(slugA, slugB),
      });
    }
  }

  return pairs;
}

/** Determine winner for a numeric field (higher is better) */
export function compareHigher(valA: number | undefined, valB: number | undefined): "a" | "b" | "tie" {
  const a = valA ?? 0;
  const b = valB ?? 0;
  if (a > b) return "a";
  if (b > a) return "b";
  return "tie";
}

/** Determine winner for a numeric field (lower is better) */
export function compareLower(valA: number | undefined, valB: number | undefined): "a" | "b" | "tie" {
  const a = valA ?? Infinity;
  const b = valB ?? Infinity;
  if (a < b) return "a";
  if (b < a) return "b";
  return "tie";
}

/** Count accepted cryptos from the acceptedCryptos array or accepted_coins string */
export function countCryptos(review: Post): number {
  const cryptos = (review.data as any).acceptedCryptos;
  if (Array.isArray(cryptos)) return cryptos.length;
  const coins = review.data.accepted_coins || "";
  if (!coins) return 0;
  return coins.split("|").map((s: string) => s.trim()).filter(Boolean).length;
}

/** Get crypto list as array */
export function getCryptoList(review: Post): string[] {
  const cryptos = (review.data as any).acceptedCryptos;
  if (Array.isArray(cryptos)) return cryptos;
  const coins = review.data.accepted_coins || "";
  if (!coins) return [];
  return coins.split("|").map((s: string) => s.trim()).filter(Boolean);
}

/** Count game providers */
export function countProviders(review: Post): number {
  const providers = review.data.gameProviders || "";
  if (!providers) return 0;
  return providers.split(",").map((s: string) => s.trim()).filter(Boolean).length;
}

/** Generate a dynamic verdict paragraph comparing two casinos */
export function generateVerdict(a: Post, b: Post): string {
  const nameA = getCasinoName(a);
  const nameB = getCasinoName(b);
  const ratingA = a.data.ourRating || 0;
  const ratingB = b.data.ourRating || 0;
  const ratingDiff = Math.abs(ratingA - ratingB);

  const parts: string[] = [];

  if (ratingDiff >= 1.5) {
    const winner = ratingA > ratingB ? nameA : nameB;
    const loser = ratingA > ratingB ? nameB : nameA;
    const winScore = Math.max(ratingA, ratingB).toFixed(1);
    const loseScore = Math.min(ratingA, ratingB).toFixed(1);
    parts.push(`${winner} scores ${winScore}/10 in our testing, putting it clearly ahead of ${loser} at ${loseScore}/10.`);
  } else if (ratingDiff > 0) {
    const winner = ratingA > ratingB ? nameA : nameB;
    parts.push(`${winner} edges ahead with a ${Math.max(ratingA, ratingB).toFixed(1)}/10 rating versus ${Math.min(ratingA, ratingB).toFixed(1)}/10, but the gap is close enough that your priorities should decide.`);
  } else {
    parts.push(`Both casinos score ${ratingA.toFixed(1)}/10 in our testing. The right choice depends on what matters most to you.`);
  }

  const speedA = (a.data as any).cryptoWithdrawalSpeedMinutes;
  const speedB = (b.data as any).cryptoWithdrawalSpeedMinutes;
  if (typeof speedA === "number" && typeof speedB === "number" && speedA !== speedB) {
    const faster = speedA < speedB ? nameA : nameB;
    const fasterSpeed = getWithdrawalSpeedLabel(speedA < speedB ? a : b);
    const slowerSpeed = getWithdrawalSpeedLabel(speedA > speedB ? a : b);
    parts.push(`${faster} processes crypto withdrawals faster (${fasterSpeed} vs ${slowerSpeed}).`);
  }

  const wrA = (a.data as any).wageringMultiplier;
  const wrB = (b.data as any).wageringMultiplier;
  if (typeof wrA === "number" && typeof wrB === "number" && wrA !== wrB) {
    const better = wrA < wrB ? nameA : nameB;
    const betterWr = Math.min(wrA, wrB);
    const worseWr = Math.max(wrA, wrB);
    parts.push(`${better} has friendlier bonus terms with ${betterWr}x wagering compared to ${worseWr}x.`);
  }

  const kycA = (a.data as any).kycRequired;
  const kycB = (b.data as any).kycRequired;
  if (kycA === false && kycB === true) {
    parts.push(`${nameA} lets you play without identity verification, while ${nameB} requires KYC.`);
  } else if (kycB === false && kycA === true) {
    parts.push(`${nameB} lets you play without identity verification, while ${nameA} requires KYC.`);
  }

  const cryptoCountA = countCryptos(a);
  const cryptoCountB = countCryptos(b);
  if (cryptoCountA > 0 && cryptoCountB > 0 && Math.abs(cryptoCountA - cryptoCountB) >= 3) {
    const more = cryptoCountA > cryptoCountB ? nameA : nameB;
    const moreCount = Math.max(cryptoCountA, cryptoCountB);
    parts.push(`${more} supports more cryptocurrencies with ${moreCount}+ accepted coins.`);
  }

  return parts.join(" ");
}

/** Get comparison categories with winner determination */
export function getComparisonCategories(a: Post, b: Post) {
  return [
    {
      label: "Our Rating",
      valueA: a.data.ourRating ? `${a.data.ourRating.toFixed(1)}/10` : "N/A",
      valueB: b.data.ourRating ? `${b.data.ourRating.toFixed(1)}/10` : "N/A",
      winner: compareHigher(a.data.ourRating, b.data.ourRating),
    },
    {
      label: "Welcome Bonus",
      valueA: a.data.bonus || a.data.maxBonus || "N/A",
      valueB: b.data.bonus || b.data.maxBonus || "N/A",
      winner: "tie" as const,
    },
    {
      label: "Wagering",
      valueA: a.data.wagering || "N/A",
      valueB: b.data.wagering || "N/A",
      winner: compareLower((a.data as any).wageringMultiplier, (b.data as any).wageringMultiplier),
    },
    {
      label: "Crypto Withdrawal Speed",
      valueA: getWithdrawalSpeedLabel(a),
      valueB: getWithdrawalSpeedLabel(b),
      winner: compareLower((a.data as any).cryptoWithdrawalSpeedMinutes, (b.data as any).cryptoWithdrawalSpeedMinutes),
    },
    {
      label: "Accepted Cryptos",
      valueA: `${countCryptos(a)} coins`,
      valueB: `${countCryptos(b)} coins`,
      winner: compareHigher(countCryptos(a), countCryptos(b)),
    },
    {
      label: "KYC Required",
      valueA: (a.data as any).kycRequired === false ? "No" : (a.data as any).kycRequired === true ? "Yes" : "Unknown",
      valueB: (b.data as any).kycRequired === false ? "No" : (b.data as any).kycRequired === true ? "Yes" : "Unknown",
      winner: (a.data as any).kycRequired === false && (b.data as any).kycRequired !== false
        ? ("a" as const)
        : (b.data as any).kycRequired === false && (a.data as any).kycRequired !== false
          ? ("b" as const)
          : ("tie" as const),
    },
    {
      label: "License",
      valueA: a.data.licences || "N/A",
      valueB: b.data.licences || "N/A",
      winner: "tie" as const,
    },
    {
      label: "Established",
      valueA: a.data.established || "N/A",
      valueB: b.data.established || "N/A",
      winner: "tie" as const,
    },
    {
      label: "Game Providers",
      valueA: countProviders(a) > 0 ? `${countProviders(a)}+ providers` : "N/A",
      valueB: countProviders(b) > 0 ? `${countProviders(b)}+ providers` : "N/A",
      winner: compareHigher(countProviders(a), countProviders(b)),
    },
    {
      label: "VIP Program",
      valueA: a.data.vipLoyaltyProgram === "Yes" ? "Yes" : a.data.vipLoyaltyProgram === "No" ? "No" : "N/A",
      valueB: b.data.vipLoyaltyProgram === "Yes" ? "Yes" : b.data.vipLoyaltyProgram === "No" ? "No" : "N/A",
      winner: "tie" as const,
    },
  ];
}

export { getReviewUrl, getClaimUrl, getRatingBg };
export type { Post };
