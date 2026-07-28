import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'd0 Trade Showcase — Powered by Donut AI',
  description: 'Top trades, weekly leaderboard & shareable proof cards from the Donut ecosystem',
  metadataBase: new URL(process.env.SITE_URL || 'https://d0-trade-showcase.vercel.app'),
  openGraph: {
    title: 'd0 Trade Showcase',
    description: 'Top trades, weekly leaderboard & shareable proof cards from the Donut ecosystem',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0f] text-[#e8e8f0] font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
