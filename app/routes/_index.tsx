import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Navbar } from "~/components/Navbar";
import { HeroSection } from "~/components/HeroSection";
import { ContentRow } from "~/components/ContentRow";
import { Footer } from "~/components/Footer";
import { getFeaturedPerformances, getPerformancesByCategory } from "~/data/performances.server";

export const meta: MetaFunction = () => {
  return [
    { title: "catalystSTREAM — Impervious Streaming Platform" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "description", content: "Official Exclusive Streaming of Panggung Gembira" },
    { icon: "/favicon.ico" }
  ];
};

export async function loader(_args: LoaderFunctionArgs) {
  const featuredItems = await getFeaturedPerformances();
  const musicPerformances = await getPerformancesByCategory("Seni Musik");
  const dancePerformances = await getPerformancesByCategory("Seni Tari");
  const artPerformances = await getPerformancesByCategory("Seni Rupa");

  return json({ featuredItems, musicPerformances, dancePerformances, artPerformances });
}

export default function Index() {
  const { featuredItems, musicPerformances, dancePerformances, artPerformances } = useLoaderData<typeof loader>();

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
