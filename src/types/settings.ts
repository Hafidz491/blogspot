export interface SiteSettings {
  // Branding
  brandName: string;
  brandTagline: string;

  // Hero Section (/blogs)
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;

  // Newsletter Section
  newsletterBadge: string;
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterButtonText: string;

  // Footer Section
  footerAboutTitle: string;
  footerAboutDescription: string;
  copyrightText: string;
  contactEmail: string;

  // Social Links
  socialTwitter?: string;
  socialLinkedIn?: string;
  socialInstagram?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: "Kindsight",
  brandTagline: "Modern Insights & Resources",
  heroBadge: "Editorial & Insights",
  heroTitle: "The Kindsight Blog",
  heroDescription:
    "Practical strategies, thoughtful perspectives, and tools for modern philanthropy.",
  newsletterBadge: "VIP Newsletter",
  newsletterTitle: "Be the first to read our resources.",
  newsletterDescription:
    "The creative fundraising revolution — and our collaborative ideas starting in our VIP inbox will provide you real insights and transparency sent straight to your inbox.",
  newsletterButtonText: "Subscribe Now",
  footerAboutTitle: "The Kindsight Blog",
  footerAboutDescription:
    "Curated perspectives on nonprofit growth, donor relationships, modern fundraising strategies, and philanthropic innovations.",
  copyrightText: "© 2026 The Kindsight Blog. All rights reserved.",
  contactEmail: "editorial@kindsight.org",
  socialTwitter: "https://twitter.com",
  socialLinkedIn: "https://linkedin.com",
  socialInstagram: "https://instagram.com",
};
