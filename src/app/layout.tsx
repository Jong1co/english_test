import type { Metadata, Viewport } from 'next';
import { Hahmlet, Newsreader } from 'next/font/google';

import { Colors } from '@/styles/colors';
import { tokensCss } from '@/styles/tokens-css';

import './globals.css';

const hahmlet = Hahmlet({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-korean',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-english',
});

export const metadata: Metadata = {
  title: 'English Test',
};

export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: Colors.light.bgPage },
    { media: '(prefers-color-scheme: dark)', color: Colors.dark.bgPage },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${hahmlet.variable} ${newsreader.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: tokensCss() }} />
      </head>
      <body>
        <div className="app">{children}</div>
      </body>
    </html>
  );
}
