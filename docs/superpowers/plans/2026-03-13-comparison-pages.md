# Casino Comparison Pages Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build dynamic `/compare/{casino-a}-vs-{casino-b}` pages that auto-generate from existing casino review frontmatter data, targeting high-intent "X vs Y" search queries.

**Architecture:** Single Astro dynamic route (`[...slugs].astro`) generates all comparison pairs from `contentType: "review"` posts. A helper library handles pair generation (alphabetical slug sorting for canonical dedup), data extraction, and dynamic verdict text. No content files are created or modified.

**Tech Stack:** Astro 5.x, Tailwind CSS 4.x, existing `src/lib/posts.ts` + `src/lib/casino-filters.ts` helpers

---

## Chunk 1: Comparison Helper Library

### Task 1: Create `src/lib/compare.ts`

**Files:**
- Create: `src/lib/compare.ts`

This file provides all comparison logic: pair generation, URL construction, data extraction, and dynamic verdict text generation.

- [ ] **Step 1: Create the comparison helper library**

```typescript
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

/** Parse a compare slug back into two individual slugs */
export function parseCompareSlug(slug: string): [string, string] | null {
  const match = slug.match(/^(.+)-vs-(.+)$/);
  if (!match) return null;
  return [match[1], match[2]];
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

  // Overall rating verdict
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

  // Withdrawal speed comparison
  const speedA = (a.data as any).cryptoWithdrawalSpeedMinutes;
  const speedB = (b.data as any).cryptoWithdrawalSpeedMinutes;
  if (typeof speedA === "number" && typeof speedB === "number" && speedA !== speedB) {
    const faster = speedA < speedB ? nameA : nameB;
    const fasterSpeed = getWithdrawalSpeedLabel(speedA < speedB ? a : b);
    const slowerSpeed = getWithdrawalSpeedLabel(speedA > speedB ? a : b);
    parts.push(`${faster} processes crypto withdrawals faster (${fasterSpeed} vs ${slowerSpeed}).`);
  }

  // Wagering comparison
  const wrA = (a.data as any).wageringMultiplier;
  const wrB = (b.data as any).wageringMultiplier;
  if (typeof wrA === "number" && typeof wrB === "number" && wrA !== wrB) {
    const better = wrA < wrB ? nameA : nameB;
    const betterWr = Math.min(wrA, wrB);
    const worseWr = Math.max(wrA, wrB);
    parts.push(`${better} has friendlier bonus terms with ${betterWr}x wagering compared to ${worseWr}x.`);
  }

  // KYC comparison
  const kycA = (a.data as any).kycRequired;
  const kycB = (b.data as any).kycRequired;
  if (kycA === false && kycB === true) {
    parts.push(`${nameA} lets you play without identity verification, while ${nameB} requires KYC.`);
  } else if (kycB === false && kycA === true) {
    parts.push(`${nameB} lets you play without identity verification, while ${nameA} requires KYC.`);
  }

  // Crypto support comparison
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
  const nameA = getCasinoName(a);
  const nameB = getCasinoName(b);

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
      winner: "tie" as const, // Bonuses are subjective
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
      // No KYC is "better" for the user
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
      winner: "tie" as const, // Licensing is nuanced
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
```

- [ ] **Step 2: Verify the file was created**

Run: `cat src/lib/compare.ts | head -5`
Expected: First 5 lines of the file

- [ ] **Step 3: Commit**

```bash
git add src/lib/compare.ts
git commit -m "feat: add comparison helper library for casino vs casino pages"
```

---

## Chunk 2: Comparison Page Template

### Task 2: Create `src/pages/compare/[...slugs].astro`

**Files:**
- Create: `src/pages/compare/[...slugs].astro`

This is the dynamic route that generates all comparison pages. It uses rest params (`[...slugs]`) to capture the `{casino-a}-vs-{casino-b}` slug pattern.

- [ ] **Step 1: Create the comparison page template**

The template includes:
1. **Hero** — "{Casino A} vs {Casino B}" with logos and ratings side by side
2. **Quick Verdict** — Auto-generated paragraph summarizing differences
3. **Comparison Table** — Row-by-row category comparison with winner highlighting
4. **Pros & Cons** — Side-by-side pros/cons from frontmatter
5. **Crypto Support** — Which coins each casino accepts (shared + unique)
6. **FAQ Schema** — Auto-generated FAQs from both casinos' FAQ data
7. **Breadcrumb** — Home > Compare > {Casino A} vs {Casino B}
8. **CTAs** — Links to individual reviews + affiliate links through `/go/`
9. **Related Comparisons** — Other comparison pages involving either casino

```astro
---
import { getCollection } from "astro:content";
import Layout from "../../layouts/Layout.astro";
import { isReview } from "../../lib/posts";
import {
  getCasinoName,
  generatePairs,
  parseCompareSlug,
  getCompareUrl,
  generateVerdict,
  getComparisonCategories,
  getCryptoList,
  getReviewUrl,
  getClaimUrl,
  getRatingBg,
} from "../../lib/compare";

export async function getStaticPaths() {
  const posts = await getCollection("posts");
  const reviews = posts.filter(isReview).filter((r) => !r.data.draft);
  const pairs = generatePairs(posts);

  return pairs.map((pair) => {
    const a = reviews.find((r) => r.data.slug === pair.slugA)!;
    const b = reviews.find((r) => r.data.slug === pair.slugB)!;
    return {
      params: { slugs: pair.compareSlug },
      props: { a, b },
    };
  });
}

const { a, b } = Astro.props;
const nameA = getCasinoName(a);
const nameB = getCasinoName(b);
const siteUrl = "https://cryptobonuslist.com";
const pageUrl = `${siteUrl}/compare/${Astro.params.slugs}`;
const verdict = generateVerdict(a, b);
const categories = getComparisonCategories(a, b);
const cryptosA = getCryptoList(a);
const cryptosB = getCryptoList(b);
const sharedCryptos = cryptosA.filter((c) => cryptosB.map((x) => x.toLowerCase()).includes(c.toLowerCase()));
const uniqueA = cryptosA.filter((c) => !cryptosB.map((x) => x.toLowerCase()).includes(c.toLowerCase()));
const uniqueB = cryptosB.filter((c) => !cryptosA.map((x) => x.toLowerCase()).includes(c.toLowerCase()));

// Related comparisons (other pages involving either casino)
const allPosts = await getCollection("posts");
const allPairs = generatePairs(allPosts);
const relatedPairs = allPairs
  .filter((p) => p.compareSlug !== Astro.params.slugs)
  .filter((p) => p.slugA === a.data.slug || p.slugB === a.data.slug || p.slugA === b.data.slug || p.slugB === b.data.slug)
  .slice(0, 6);

const allReviews = allPosts.filter(isReview).filter((r) => !r.data.draft);

// Auto-generate FAQ from both casinos' FAQs
const combinedFaqs = [
  ...(a.data.faqs || []).slice(0, 2).map((f) => ({
    question: f.question,
    answer: f.answer,
  })),
  ...(b.data.faqs || []).slice(0, 2).map((f) => ({
    question: f.question,
    answer: f.answer,
  })),
  {
    question: `Which is better, ${nameA} or ${nameB}?`,
    answer: verdict,
  },
];

// JSON-LD
const schemaJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: `${nameA} vs ${nameB}: Which Crypto Casino Is Better?`,
      description: `Side-by-side comparison of ${nameA} and ${nameB}. Ratings, bonuses, withdrawal speeds, crypto support, and more.`,
      url: pageUrl,
      dateModified: new Date(
        Math.max(
          new Date(a.data.updatedAt || a.data.publishedAt).getTime(),
          new Date(b.data.updatedAt || b.data.publishedAt).getTime()
        )
      ).toISOString(),
      publisher: { "@type": "Organization", name: "CryptoBonusList", url: siteUrl },
      author: { "@type": "Organization", name: "CryptoBonusList", url: siteUrl },
    },
    {
      "@type": "FAQPage",
      mainEntity: combinedFaqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Compare Casinos", item: `${siteUrl}/compare` },
        { "@type": "ListItem", position: 3, name: `${nameA} vs ${nameB}` },
      ],
    },
  ],
});

const ratingA = a.data.ourRating || 0;
const ratingB = b.data.ourRating || 0;
const ratingBgA = getRatingBg(ratingA);
const ratingBgB = getRatingBg(ratingB);
---

<Layout
  title={`${nameA} vs ${nameB} (2026) | CryptoBonusList`}
  description={`${nameA} vs ${nameB} compared side by side. Ratings, bonuses, withdrawal speed, crypto support, KYC policy, and more.`}
  jsonld={schemaJsonLd}
  ogType="article"
  canonical={pageUrl}
>
  <article class="px-6 py-12">
    <div class="max-w-5xl mx-auto">
      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" class="mb-6 text-sm font-[JetBrains_Mono]">
        <ol class="flex flex-wrap items-center gap-2">
          <li><a href="/" class="text-[#D4D4D4] hover:text-[#39FF14]">Home</a></li>
          <li class="text-[#D4D4D4]">/</li>
          <li><a href="/compare" class="text-[#D4D4D4] hover:text-[#39FF14]">Compare</a></li>
          <li class="text-[#D4D4D4]">/</li>
          <li class="text-white" aria-current="page">{nameA} vs {nameB}</li>
        </ol>
      </nav>

      <!-- Hero -->
      <header class="border-[3px] border-white bg-black p-6 md:p-8 mb-8 shadow-[6px_6px_0px_0px_#8A2BE2]">
        <p class="font-[JetBrains_Mono] text-[#8A2BE2] text-xs mb-4 tracking-wider uppercase">&gt; HEAD-TO-HEAD COMPARISON</p>
        <h1 class="font-[Space_Grotesk] text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
          {nameA} <span class="text-[#8A2BE2]">vs</span> {nameB}
        </h1>

        <!-- Side by side rating cards -->
        <div class="grid grid-cols-2 gap-4">
          <div class="border-[3px] border-white bg-[#0A0A0A] p-4 text-center">
            {a.data.logo && <img src={a.data.logo} alt={`${nameA} logo`} width="48" height="48" class="mx-auto mb-2" loading="eager" />}
            <p class="font-[Space_Grotesk] font-bold text-white text-lg mb-2">{nameA}</p>
            <span class={`${ratingBgA} font-[JetBrains_Mono] font-bold px-3 py-1 text-lg inline-block`}>
              {ratingA.toFixed(1)}/10
            </span>
          </div>
          <div class="border-[3px] border-white bg-[#0A0A0A] p-4 text-center">
            {b.data.logo && <img src={b.data.logo} alt={`${nameB} logo`} width="48" height="48" class="mx-auto mb-2" loading="eager" />}
            <p class="font-[Space_Grotesk] font-bold text-white text-lg mb-2">{nameB}</p>
            <span class={`${ratingBgB} font-[JetBrains_Mono] font-bold px-3 py-1 text-lg inline-block`}>
              {ratingB.toFixed(1)}/10
            </span>
          </div>
        </div>
      </header>

      <!-- Quick Verdict -->
      <section class="mb-8">
        <h2 class="font-[Space_Grotesk] text-2xl font-bold mb-4 border-b-[3px] border-[#39FF14] pb-2">
          QUICK VERDICT
        </h2>
        <p class="text-[#D4D4D4] font-[Public_Sans] text-lg leading-relaxed">{verdict}</p>
        <div class="flex flex-wrap gap-3 mt-4">
          <a href={getClaimUrl(a)} target="_blank" rel="noopener noreferrer nofollow sponsored"
            class="inline-block bg-[#39FF14] text-black font-[Space_Grotesk] font-bold px-5 py-2 border-[3px] border-[#39FF14] hover:bg-[#2ecc0e] transition-colors text-sm">
            VISIT {nameA.toUpperCase()}
          </a>
          <a href={getClaimUrl(b)} target="_blank" rel="noopener noreferrer nofollow sponsored"
            class="inline-block bg-[#8A2BE2] text-white font-[Space_Grotesk] font-bold px-5 py-2 border-[3px] border-[#8A2BE2] hover:bg-[#7a1fd2] transition-colors text-sm">
            VISIT {nameB.toUpperCase()}
          </a>
        </div>
      </section>

      <!-- Comparison Table -->
      <section class="mb-8">
        <h2 class="font-[Space_Grotesk] text-2xl font-bold mb-4 border-b-[3px] border-[#39FF14] pb-2">
          SIDE-BY-SIDE COMPARISON
        </h2>
        <div class="overflow-x-auto border-[3px] border-white">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-white text-black font-[Space_Grotesk] text-sm uppercase tracking-wider">
                <th class="px-4 py-3">Category</th>
                <th class="px-4 py-3">{nameA}</th>
                <th class="px-4 py-3">{nameB}</th>
              </tr>
            </thead>
            <tbody class="font-[Public_Sans] text-sm">
              {categories.map((cat, i) => (
                <tr class={`border-t-[2px] border-white/20 ${i % 2 === 0 ? "bg-[#0A0A0A]" : "bg-[#111111]"}`}>
                  <td class="px-4 py-3 font-[Space_Grotesk] font-bold text-white text-xs uppercase tracking-wider">{cat.label}</td>
                  <td class={`px-4 py-3 font-[JetBrains_Mono] text-xs ${cat.winner === "a" ? "text-[#39FF14] font-bold" : "text-[#D4D4D4]"}`}>
                    {cat.winner === "a" && <span class="mr-1">&#9654;</span>}
                    {cat.valueA}
                  </td>
                  <td class={`px-4 py-3 font-[JetBrains_Mono] text-xs ${cat.winner === "b" ? "text-[#39FF14] font-bold" : "text-[#D4D4D4]"}`}>
                    {cat.winner === "b" && <span class="mr-1">&#9654;</span>}
                    {cat.valueB}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Pros & Cons -->
      <section class="mb-8">
        <h2 class="font-[Space_Grotesk] text-2xl font-bold mb-4 border-b-[3px] border-[#39FF14] pb-2">
          PROS & CONS
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Casino A -->
          <div class="border-[3px] border-white bg-black p-5">
            <h3 class="font-[Space_Grotesk] font-bold text-white text-lg mb-4">{nameA}</h3>
            {(a.data.pros || []).length > 0 && (
              <div class="mb-4">
                <p class="text-[#39FF14] font-[JetBrains_Mono] text-xs font-bold mb-2 uppercase">Pros</p>
                <ul class="space-y-2">
                  {(a.data.pros || []).map((pro) => (
                    <li class="text-[#D4D4D4] font-[Public_Sans] text-sm flex items-start gap-2">
                      <span class="text-[#39FF14] font-bold shrink-0">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(a.data.cons || []).length > 0 && (
              <div>
                <p class="text-[#FAFF00] font-[JetBrains_Mono] text-xs font-bold mb-2 uppercase">Cons</p>
                <ul class="space-y-2">
                  {(a.data.cons || []).map((con) => (
                    <li class="text-[#D4D4D4] font-[Public_Sans] text-sm flex items-start gap-2">
                      <span class="text-[#FAFF00] font-bold shrink-0">-</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <!-- Casino B -->
          <div class="border-[3px] border-white bg-black p-5">
            <h3 class="font-[Space_Grotesk] font-bold text-white text-lg mb-4">{nameB}</h3>
            {(b.data.pros || []).length > 0 && (
              <div class="mb-4">
                <p class="text-[#39FF14] font-[JetBrains_Mono] text-xs font-bold mb-2 uppercase">Pros</p>
                <ul class="space-y-2">
                  {(b.data.pros || []).map((pro) => (
                    <li class="text-[#D4D4D4] font-[Public_Sans] text-sm flex items-start gap-2">
                      <span class="text-[#39FF14] font-bold shrink-0">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(b.data.cons || []).length > 0 && (
              <div>
                <p class="text-[#FAFF00] font-[JetBrains_Mono] text-xs font-bold mb-2 uppercase">Cons</p>
                <ul class="space-y-2">
                  {(b.data.cons || []).map((con) => (
                    <li class="text-[#D4D4D4] font-[Public_Sans] text-sm flex items-start gap-2">
                      <span class="text-[#FAFF00] font-bold shrink-0">-</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <!-- Crypto Support -->
      {(cryptosA.length > 0 || cryptosB.length > 0) && (
        <section class="mb-8">
          <h2 class="font-[Space_Grotesk] text-2xl font-bold mb-4 border-b-[3px] border-[#39FF14] pb-2">
            CRYPTO SUPPORT
          </h2>
          {sharedCryptos.length > 0 && (
            <div class="mb-4">
              <p class="text-white font-[Space_Grotesk] font-bold text-sm mb-2">Both accept:</p>
              <div class="flex flex-wrap gap-2">
                {sharedCryptos.map((coin) => (
                  <span class="inline-block bg-[#1a1a1a] border-[2px] border-white/30 text-[#D4D4D4] text-xs font-[JetBrains_Mono] px-3 py-1">{coin}</span>
                ))}
              </div>
            </div>
          )}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uniqueA.length > 0 && (
              <div>
                <p class="text-[#39FF14] font-[Space_Grotesk] font-bold text-sm mb-2">{nameA} only:</p>
                <div class="flex flex-wrap gap-2">
                  {uniqueA.map((coin) => (
                    <span class="inline-block bg-[#0A0A0A] border-[2px] border-[#39FF14]/30 text-[#39FF14] text-xs font-[JetBrains_Mono] px-3 py-1">{coin}</span>
                  ))}
                </div>
              </div>
            )}
            {uniqueB.length > 0 && (
              <div>
                <p class="text-[#8A2BE2] font-[Space_Grotesk] font-bold text-sm mb-2">{nameB} only:</p>
                <div class="flex flex-wrap gap-2">
                  {uniqueB.map((coin) => (
                    <span class="inline-block bg-[#0A0A0A] border-[2px] border-[#8A2BE2]/30 text-[#8A2BE2] text-xs font-[JetBrains_Mono] px-3 py-1">{coin}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <!-- Best For -->
      {(a.data.best_for || b.data.best_for) && (
        <section class="mb-8">
          <h2 class="font-[Space_Grotesk] text-2xl font-bold mb-4 border-b-[3px] border-[#39FF14] pb-2">
            WHO IS EACH CASINO BEST FOR?
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {a.data.best_for && (
              <div class="border-[3px] border-white bg-black p-5">
                <p class="text-[#39FF14] font-[JetBrains_Mono] text-xs font-bold mb-2">{nameA.toUpperCase()}</p>
                <p class="text-[#D4D4D4] font-[Public_Sans] text-sm leading-relaxed">{a.data.best_for}</p>
              </div>
            )}
            {b.data.best_for && (
              <div class="border-[3px] border-white bg-black p-5">
                <p class="text-[#8A2BE2] font-[JetBrains_Mono] text-xs font-bold mb-2">{nameB.toUpperCase()}</p>
                <p class="text-[#D4D4D4] font-[Public_Sans] text-sm leading-relaxed">{b.data.best_for}</p>
              </div>
            )}
          </div>
        </section>
      )}

      <!-- FAQ -->
      {combinedFaqs.length > 0 && (
        <section class="mb-8">
          <h2 class="font-[Space_Grotesk] text-2xl font-bold mb-4 border-b-[3px] border-[#39FF14] pb-2">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <div class="space-y-4">
            {combinedFaqs.map((faq) => (
              <details class="group border-[3px] border-white bg-black">
                <summary class="cursor-pointer px-6 py-4 font-[Space_Grotesk] font-bold text-white flex items-center justify-between hover:bg-[#111111] transition-colors">
                  <span class="pr-4">{faq.question}</span>
                  <span class="text-[#39FF14] font-[JetBrains_Mono] group-open:rotate-45 transition-transform text-xl shrink-0">+</span>
                </summary>
                <div class="px-6 py-4 border-t-[2px] border-white/20 font-[Public_Sans] text-[#D4D4D4] text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      <!-- CTAs -->
      <section class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border-[3px] border-white bg-black p-6 shadow-[6px_6px_0px_0px_#39FF14]">
            <h3 class="font-[Space_Grotesk] font-bold text-white text-xl mb-2">{nameA}</h3>
            <p class="text-[#D4D4D4] font-[Public_Sans] text-sm mb-4">{a.data.bonus || "Check site for current offers"}</p>
            <div class="flex gap-3">
              <a href={getClaimUrl(a)} target="_blank" rel="noopener noreferrer nofollow sponsored"
                class="flex-1 text-center font-[Space_Grotesk] font-bold bg-[#39FF14] text-black px-4 py-3 border-[3px] border-[#39FF14] hover:bg-[#2ecc0e] transition-colors text-sm">
                VISIT CASINO
              </a>
              <a href={getReviewUrl(a)}
                class="flex-1 text-center font-[Space_Grotesk] font-bold border-[3px] border-white text-white px-4 py-3 hover:bg-white hover:text-black transition-colors text-sm">
                READ REVIEW
              </a>
            </div>
          </div>
          <div class="border-[3px] border-white bg-black p-6 shadow-[6px_6px_0px_0px_#8A2BE2]">
            <h3 class="font-[Space_Grotesk] font-bold text-white text-xl mb-2">{nameB}</h3>
            <p class="text-[#D4D4D4] font-[Public_Sans] text-sm mb-4">{b.data.bonus || "Check site for current offers"}</p>
            <div class="flex gap-3">
              <a href={getClaimUrl(b)} target="_blank" rel="noopener noreferrer nofollow sponsored"
                class="flex-1 text-center font-[Space_Grotesk] font-bold bg-[#8A2BE2] text-white px-4 py-3 border-[3px] border-[#8A2BE2] hover:bg-[#7a1fd2] transition-colors text-sm">
                VISIT CASINO
              </a>
              <a href={getReviewUrl(b)}
                class="flex-1 text-center font-[Space_Grotesk] font-bold border-[3px] border-white text-white px-4 py-3 hover:bg-white hover:text-black transition-colors text-sm">
                READ REVIEW
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Comparisons -->
      {relatedPairs.length > 0 && (
        <aside class="mt-12 pt-8 border-t-[3px] border-white" aria-label="Related comparisons">
          <h2 class="font-[Space_Grotesk] text-2xl font-bold mb-6 text-[#FAFF00]">MORE COMPARISONS</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPairs.map((pair) => {
              const reviewA = allReviews.find((r) => r.data.slug === pair.slugA);
              const reviewB = allReviews.find((r) => r.data.slug === pair.slugB);
              if (!reviewA || !reviewB) return null;
              const pairNameA = getCasinoName(reviewA);
              const pairNameB = getCasinoName(reviewB);
              return (
                <a href={`/compare/${pair.compareSlug}`} class="group block bg-black border-[3px] border-white p-5 shadow-none hover:shadow-[6px_6px_0px_0px_#8A2BE2] transition-all">
                  <h3 class="font-[Space_Grotesk] text-sm font-bold text-white mb-1 group-hover:text-[#8A2BE2] transition-colors">
                    {pairNameA} vs {pairNameB}
                  </h3>
                  <p class="text-[#D4D4D4] text-xs font-[JetBrains_Mono]">
                    {(reviewA.data.ourRating || 0).toFixed(1)} vs {(reviewB.data.ourRating || 0).toFixed(1)}
                  </p>
                </a>
              );
            })}
          </div>
        </aside>
      )}

      <!-- Back link -->
      <div class="mt-12 pt-8 border-t-[3px] border-white">
        <a href="/compare" class="inline-block bg-transparent text-white font-[Space_Grotesk] font-bold px-6 py-3 border-[3px] border-white shadow-[6px_6px_0px_0px_#8A2BE2] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#8A2BE2] transition-all">
          ALL COMPARISONS
        </a>
      </div>
    </div>
  </article>
</Layout>
```

- [ ] **Step 2: Verify the file was created**

Run: `head -10 src/pages/compare/\[...slugs\].astro`
Expected: First 10 lines with frontmatter

- [ ] **Step 3: Commit**

```bash
git add src/pages/compare/\[...slugs\].astro
git commit -m "feat: add dynamic casino comparison page template"
```

---

### Task 3: Create `src/pages/compare/index.astro` (Compare Index Page)

**Files:**
- Create: `src/pages/compare/index.astro`

Index page listing all available comparisons, grouped and linked. This page serves as both a navigation hub and an SEO anchor for the `/compare` section.

- [ ] **Step 1: Create the compare index page**

```astro
---
import { getCollection } from "astro:content";
import Layout from "../../layouts/Layout.astro";
import { isReview } from "../../lib/posts";
import { generatePairs, getCasinoName, getRatingBg } from "../../lib/compare";

const allPosts = await getCollection("posts");
const reviews = allPosts.filter(isReview).filter((r) => !r.data.draft).sort((a, b) => (b.data.ourRating || 0) - (a.data.ourRating || 0));
const pairs = generatePairs(allPosts);

const siteUrl = "https://cryptobonuslist.com";

const schemaJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: "Compare Crypto Casinos",
      description: "Side-by-side crypto casino comparisons. Ratings, bonuses, withdrawal speeds, and more.",
      url: `${siteUrl}/compare`,
      publisher: { "@type": "Organization", name: "CryptoBonusList", url: siteUrl },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Compare Casinos" },
      ],
    },
  ],
});
---

<Layout
  title="Compare Crypto Casinos | CryptoBonusList"
  description="Side-by-side crypto casino comparisons. Pick two casinos and see how they stack up on ratings, bonuses, withdrawal speed, and crypto support."
  jsonld={schemaJsonLd}
  canonical={`${siteUrl}/compare`}
>
  <section class="px-6 py-12">
    <div class="max-w-7xl mx-auto">
      <h1 class="font-[Space_Grotesk] text-4xl md:text-6xl font-bold mb-4">
        COMPARE <span class="text-[#8A2BE2]">CASINOS</span>
      </h1>
      <p class="text-[#D4D4D4] font-[Public_Sans] text-lg mb-10 max-w-2xl">
        Pick any two casinos and see how they compare on the things that matter. Ratings, bonuses, wagering, payout speed, and crypto support.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pairs.map((pair) => {
          const reviewA = reviews.find((r) => r.data.slug === pair.slugA);
          const reviewB = reviews.find((r) => r.data.slug === pair.slugB);
          if (!reviewA || !reviewB) return null;
          const pairNameA = getCasinoName(reviewA);
          const pairNameB = getCasinoName(reviewB);
          const ratingA = reviewA.data.ourRating || 0;
          const ratingB = reviewB.data.ourRating || 0;
          return (
            <a href={`/compare/${pair.compareSlug}`} class="card-brutal block bg-black border-[3px] border-white p-5 shadow-[6px_6px_0px_0px_#8A2BE2]">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  {reviewA.data.logo && <img src={reviewA.data.logo} alt="" width="24" height="24" loading="lazy" />}
                  <span class="font-[Space_Grotesk] font-bold text-white text-sm">{pairNameA}</span>
                </div>
                <span class="text-[#8A2BE2] font-[JetBrains_Mono] text-xs font-bold">VS</span>
                <div class="flex items-center gap-2">
                  <span class="font-[Space_Grotesk] font-bold text-white text-sm">{pairNameB}</span>
                  {reviewB.data.logo && <img src={reviewB.data.logo} alt="" width="24" height="24" loading="lazy" />}
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class={`${getRatingBg(ratingA)} font-[JetBrains_Mono] font-bold px-2 py-0.5 text-xs`}>{ratingA.toFixed(1)}</span>
                <span class="text-[#D4D4D4] font-[JetBrains_Mono] text-xs">vs</span>
                <span class={`${getRatingBg(ratingB)} font-[JetBrains_Mono] font-bold px-2 py-0.5 text-xs`}>{ratingB.toFixed(1)}</span>
              </div>
            </a>
          );
        })}
      </div>

      <!-- Related -->
      <div class="mt-12 border-t-[3px] border-white pt-8">
        <p class="text-[#D4D4D4] font-[Public_Sans]">
          Looking for individual reviews? Check our <a href="/casinos" class="text-[#39FF14] underline">casino reviews</a> or <a href="/best-crypto-casinos" class="text-[#39FF14] underline">best crypto casinos</a> ranking.
        </p>
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/compare/index.astro
git commit -m "feat: add compare index page listing all casino comparisons"
```

---

## Chunk 3: Internal Linking & Navigation

### Task 4: Add "Compare with..." section to casino review pages

**Files:**
- Modify: `src/pages/casinos/[slug].astro`

Add a "Compare {Casino} with..." section at the bottom of each casino review page, linking to all comparison pages that involve that casino. This creates a dense internal linking mesh.

- [ ] **Step 1: Read `src/pages/casinos/[slug].astro` fully to find insertion point**

The section should go after the existing related reviews section, before the closing `</div></article>`.

- [ ] **Step 2: Add imports and comparison data to the frontmatter**

Add to the existing frontmatter block:

```typescript
import { generatePairs, getCasinoName, getCompareUrl } from "../../lib/compare";

// After existing allPosts usage
const comparisonPairs = generatePairs(allPosts)
  .filter((p) => p.slugA === d.slug || p.slugB === d.slug)
  .slice(0, 6);
const comparisonReviews = allPosts.filter(isReview).filter((r) => !r.data.draft);
```

- [ ] **Step 3: Add comparison links section to the template**

Insert before the closing `</div>` of the article:

```astro
{/* Compare with other casinos */}
{comparisonPairs.length > 0 && (
  <section class="mt-12 pt-8 border-t-[3px] border-white">
    <h2 class="font-[Space_Grotesk] text-2xl font-bold mb-6 text-[#FAFF00]">
      COMPARE {(d.casino_name || d.casinoName || d.title.replace(/ Review.*$/i, "")).toUpperCase()}
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {comparisonPairs.map((pair) => {
        const otherSlug = pair.slugA === d.slug ? pair.slugB : pair.slugA;
        const otherReview = comparisonReviews.find((r) => r.data.slug === otherSlug);
        if (!otherReview) return null;
        const otherName = getCasinoName(otherReview);
        return (
          <a href={`/compare/${pair.compareSlug}`} class="group block bg-black border-[3px] border-white p-4 shadow-none hover:shadow-[6px_6px_0px_0px_#8A2BE2] transition-all">
            <p class="font-[Space_Grotesk] text-sm font-bold text-white group-hover:text-[#8A2BE2] transition-colors">
              vs {otherName}
            </p>
            <p class="text-[#D4D4D4] text-xs font-[JetBrains_Mono] mt-1">
              {(otherReview.data.ourRating || 0).toFixed(1)}/10
            </p>
          </a>
        );
      })}
    </div>
  </section>
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/casinos/[slug].astro
git commit -m "feat: add comparison links to casino review pages"
```

---

### Task 5: Add "Compare" to navigation

**Files:**
- Modify: `src/layouts/Layout.astro`

Add a "Compare" link to the Casinos dropdown in both desktop and mobile navigation menus.

- [ ] **Step 1: Read Layout.astro and find the Casinos dropdown**

- [ ] **Step 2: Add compare link to desktop Casinos dropdown**

After the existing "New Casinos" link, add:

```html
<a href="/compare" class="block px-4 py-3 text-[#D4D4D4] hover:text-[#39FF14] hover:bg-white/5 text-xs tracking-wider" role="menuitem">Compare Casinos</a>
```

Note: Remove `border-b border-white/20` from the "New Casinos" link since it's no longer the last item. Add it to the new "Compare Casinos" link instead... actually, the last item should NOT have a border-bottom, so add border to the current last item (New Casinos) and don't add it to Compare.

Wait — looking at the existing code, "New Casinos" already has no bottom border class, so just add the new link after it with no border. But we need to add `border-b border-white/20` to the "New Casinos" link.

- [ ] **Step 3: Add compare link to mobile nav**

Add after the "New Casinos" mobile link:

```html
<a href="/compare" class="text-[#D4D4D4] hover:text-[#39FF14] px-4 py-2">Compare Casinos</a>
```

- [ ] **Step 4: Add `isActive` check for `/compare` path**

In the Layout frontmatter `isActive` function, add:

```typescript
if (prefix === '/compare') return currentPath === '/compare' || currentPath.startsWith('/compare/');
```

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add Compare Casinos link to navigation"
```

---

### Task 6: Add "Compare" to footer navigation

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Add compare link to footer "BROWSE" section**

After the "Guides" link in the footer BROWSE nav, add:

```html
<li><a href="/compare" class="text-[#D4D4D4] hover:text-[#39FF14] hover:translate-x-1 inline-block transition-all">Compare Casinos</a></li>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add Compare Casinos to footer navigation"
```

---

## Chunk 4: Build & Verify

### Task 7: Build and verify

- [ ] **Step 1: Run the build**

Run: `npm run build`
Expected: Build succeeds with no errors. Check output for `/compare/` pages being generated.

- [ ] **Step 2: Verify page count**

8 reviews = 28 comparison pairs + 1 index page = 29 new pages.

Run: `ls dist/compare/ | head -30`
Expected: 28 comparison directories + index.html

- [ ] **Step 3: Spot-check a comparison page**

Run: `cat dist/compare/bc-game-vs-stake-us/index.html | grep -o '<title>[^<]*</title>'`
Expected: `<title>BC.GAME vs Stake.us (2026) | CryptoBonusList</title>`

- [ ] **Step 4: Verify JSON-LD**

Run: `cat dist/compare/bc-game-vs-stake-us/index.html | grep -o 'application/ld+json' | wc -l`
Expected: 1 (one JSON-LD block)

- [ ] **Step 5: Final commit with all files**

```bash
git add -A
git commit -m "feat: complete casino comparison pages with internal linking"
```
