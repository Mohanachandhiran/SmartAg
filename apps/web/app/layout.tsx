import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/components/shared/LanguageContext';
import Header from '@/components/shared/Header';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['600', '700'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
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
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${jetBrainsMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <Header />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <footer className="border-t border-border bg-card py-4 text-center text-xs text-muted-foreground font-sans">
              © {new Date().getFullYear()} SmartAg Collective. Made for Indian Agriculture. All rights reserved.
            </footer>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
