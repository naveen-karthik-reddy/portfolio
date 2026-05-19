import { Inter } from 'next/font/google';
import Script from 'next/script';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import Providers from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Naveen Karthik | Frontend Developer',
  description:
    'Frontend-focused Full Stack Developer specializing in React, TypeScript, and Next.js. Building fast, data-intensive products.',
  authors: [{ name: 'Naveen Karthik' }],
  metadataBase: new URL('https://naveenkarthik.com'),
  openGraph: {
    siteName: 'Naveen Karthik',
    locale: 'en_US',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/jpeg" href="/profilePick.jpeg" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* Runs before React — reads localStorage and sets data attributes so CSS
            can apply the correct background instantly, preventing theme flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var d=localStorage.getItem('darkMode')==='true';var t=localStorage.getItem('theme')||'default';document.documentElement.setAttribute('data-dark',d?'true':'false');document.documentElement.setAttribute('data-theme',t);}catch(e){}})()` }} />
      </head>
      <body>
        <AppRouterCacheProvider>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WS0KJWV4S4"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-WS0KJWV4S4',{send_page_view:false});`}
        </Script>
      </body>
    </html>
  );
}
