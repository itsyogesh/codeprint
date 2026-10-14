import type { Metadata, Viewport } from "next"
import { Merriweather, Mulish, Source_Code_Pro } from "next/font/google"
import { WebSiteJsonLd } from "@/components/seo/json-ld"
import { AnalyticsProvider } from "@/components/shared/analytics"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ogImageUrl } from "@/lib/og"
import { SITE_URL } from "@/lib/site"
import "./globals.css"

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700"],
  display: "swap",
})

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "600"],
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
}

export const metadata: Metadata = {
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Codeprint | Code, Markdown, and CSV to PDF",
    template: "%s | Codeprint",
  },
  description:
    "Convert code, Markdown, and CSV to print-ready PDFs. Get syntax highlighting, line numbers, custom layouts, and 20+ languages. Everything is free and private in your browser.",
  keywords: [
    "code printer",
    "print code",
    "syntax highlighting",
    "code formatting",
    "PDF export",
    "code review",
    "print preview",
    "markdown to PDF",
    "CSV to PDF",
  ],
  openGraph: {
    title: "Codeprint | Code, Markdown, and CSV to PDF",
    description: "Convert code, Markdown, and CSV to print-ready PDFs with syntax colors and custom layouts.",
    siteName: "Codeprint",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: ogImageUrl("code"),
        width: 1200,
        height: 630,
        alt: "Codeprint turns code, Markdown, and CSV into print-ready PDFs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Codeprint | Code, Markdown, and CSV to PDF",
    description: "Convert code, Markdown, and CSV to print-ready PDFs in your browser.",
    images: [ogImageUrl("code")],
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png?v=2026-08-12-2",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png?v=2026-08-12-2",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg?v=2026-08-12-2",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png?v=2026-08-12-2",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${mulish.variable} ${merriweather.variable} ${sourceCodePro.variable}`}
      suppressHydrationWarning
    >
      <body
        data-clarity-mask="True"
        className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-[#030712]"
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
        <WebSiteJsonLd />
        <AnalyticsProvider googleId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      </body>
    </html>
  )
}
