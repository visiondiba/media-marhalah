import type { MetaFunction } from "@remix-run/node";
import { Navbar } from "~/components/Navbar";
import { HeroSection } from "~/components/HeroSection";
import { ContentRow } from "~/components/ContentRow";
import { Footer } from "~/components/Footer";
import { getFeaturedPerformances, getPerformancesByCategory } from "~/data/performances";

export const meta: MetaFunction = () => {
  return [
    { title: "Impervious Play — Impervious Streaming Platform" },
    { name: "description", content: "Official Exclusive Streaming of Panggung Gembira" },
    { icon: "/favicon.ico" }
  ];
};

export default function Index() {
  const featuredItems = getFeaturedPerformances();
  const musicPerformances = getPerformancesByCategory("Seni Musik");
  const dancePerformances = getPerformancesByCategory("Seni Tari");
  const artPerformances = getPerformancesByCategory("Seni Rupa");
  
  return (
    <div className="min-h-screen bg-[#0A0804]">
      <Navbar />
      
      <HeroSection featuredItems={featuredItems} />
      
      <main className="mx-auto max-w-7xl pb-24 sm:pb-10">
        <ContentRow 
          title="Seni Musik" 
          performances={musicPerformances} 
          seeAllLink="/browse" 
        />
        
        <ContentRow 
          title="Seni Tari" 
          performances={dancePerformances} 
          seeAllLink="/browse" 
        />
        
        <ContentRow 
          title="Seni Rupa & Lainnya" 
          performances={artPerformances} 
          seeAllLink="/browse" 
        />
      </main>
      
      <Footer />
    </div>
  );
}
