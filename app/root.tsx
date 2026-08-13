import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import plyrStyles from "plyr/dist/plyr.css?url";
import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;900&family=Lato:wght@300;400;500;600;700&display=swap",
  },
  { rel: "stylesheet", href: plyrStyles },
];

export const meta: MetaFunction = () => [
  { charSet: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { title: "catalystSTREAM — Impervious Streaming Platform" },
  {
    name: "description",
    content:
      "Platform streaming eksklusif resmi untuk Panggung Gembira Impervious Generation. Tonton siaran langsung dan arsip video penampilan panggung terbaik di sini.",
  },
  {icon: "/favicon.ico"}
];

function GlobalLoading() {
  const navigation = useNavigation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const isNavigating = navigation.state === "loading";
  const isLoading = isInitialLoad || isNavigating;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070503] transition-all duration-500 ease-out select-none ${
        isLoading ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      }`}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes runner-bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }
      `}} />

      <div className="relative flex flex-col items-center">
        {/* Minimalist Runner */}
        <img 
          src="/lari.png" 
          alt="Loading" 
          className="h-10 w-auto object-contain"
          style={{ animation: 'runner-bob 0.5s infinite ease-in-out' }}
        />

        {/* Minimalist Thin Progress Bar */}
        <div className="relative mt-5 h-[1.5px] w-20 overflow-hidden bg-zinc-800">
          <div 
            className="h-full w-8 bg-primary"
            style={{ 
              animation: 'progress-slide 1s infinite cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <GlobalLoading />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
