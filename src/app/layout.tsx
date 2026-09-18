import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/brief", label: "Brief" },
  { href: "/results/demo", label: "Results" },
  { href: "/boards", label: "Boards" },
  { href: "/health", label: "Health" },
];

export const metadata: Metadata = {
  title: "Brand Identity Compass",
  description: "Find your brand's true north.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <header className="border-b border-border bg-background">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <Link
              href="/"
              className="font-heading text-lg font-semibold tracking-tight text-foreground"
            >
              Brand Compass
            </Link>
            <nav className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-foreground hover:text-muted-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
