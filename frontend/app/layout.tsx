import type { Metadata } from 'next';
import { Inter, Poppins, Noto_Sans, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { LanguageProvider } from '@/components/shared/LanguageContext';
import Header from '@/components/shared/Header';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin', 'devanagari', 'tamil'],
  weight: ['400', '500', '600', '700'],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-ibm-plex',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'SmartAg Collective — Farmers AI Collective Platform',
  description: 'Agricultural SaaS maximizing farmer income via collective selling, FPO logistics, buyer bids, and real-time state monitoring.',
};

import { ThemeProvider } from '@/components/shared/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${notoSans.variable} ${ibmPlexSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <Header />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <footer className="border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} SmartAg Collective. Made for Indian Agriculture. All rights reserved.
            </footer>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
