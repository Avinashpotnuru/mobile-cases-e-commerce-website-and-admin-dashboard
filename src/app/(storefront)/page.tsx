import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/storefront/home/hero";
import { BrandDiscovery } from "@/components/storefront/home/brand-discovery";
import { FeaturedProducts } from "@/components/storefront/home/featured-products";
import { StatsBar } from "@/components/storefront/home/stats-bar";
import { OffersSection } from "@/components/storefront/home/offers-section";
import { PromoSection } from "@/components/storefront/home/promo-section";
import { ShopFaq } from "@/components/storefront/home/shop-faq";
import { SiteFooter } from "@/components/storefront/home/site-footer";
import { LoadingState } from "@/components/ui/states";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Home",
  description:
    "Browse premium mobile cases for iPhone, Samsung Galaxy, Google Pixel and more.",
};

function SectionFallback() {
  return <LoadingState className="py-16" />;
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<SectionFallback />}>
        <BrandDiscovery />
      </Suspense>
      <Suspense fallback={null}>
        <StatsBar />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <OffersSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <FeaturedProducts />
      </Suspense>
      <PromoSection />
      <ShopFaq />
      <SiteFooter />
    </>
  );
}