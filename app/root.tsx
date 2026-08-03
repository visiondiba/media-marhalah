import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
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
