import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Modern, lively, non-stiff heading font
const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Ultra-clean, modern body sans font
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blog's — Modern Insights & Resources",
  description: "Modern editorial blog platform for thoughtful insights, guides, and creative perspectives.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakartaSans.variable} font-sans antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-stone-200">
        {children}
      </body>
    </html>
  );
}
