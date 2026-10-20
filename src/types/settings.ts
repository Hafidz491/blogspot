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
  brandName: "Blog's",
  brandTagline: "Modern Insights & Resources",
  heroBadge: "Editorial & Insights",
  heroTitle: "Blog's",
  heroDescription:
    "Practical strategies, thoughtful perspectives, and tools for modern storytelling and insights.",
  newsletterBadge: "VIP Newsletter",
  newsletterTitle: "Be the first to read our resources.",
  newsletterDescription:
    "The creative ideas and curated perspectives starting in our VIP inbox will provide you real insights sent straight to your inbox.",
  newsletterButtonText: "Subscribe Now",
  footerAboutTitle: "Blog's",
  footerAboutDescription:
    "Curated perspectives on growth, modern strategies, thoughtful stories, and creative innovations.",
  copyrightText: "© 2026 Blog's. All rights reserved.",
  contactEmail: "editorial@blogs.org",
  socialTwitter: "https://twitter.com",
  socialLinkedIn: "https://linkedin.com",
  socialInstagram: "https://instagram.com",
};
