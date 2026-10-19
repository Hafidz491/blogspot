/**
 * Auto-generate a clean, URL-friendly slug from title
 * Example: "How to write a sponsor blog/letter" -> "how-to-write-a-sponsor-blog-letter"
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // separate accent marks from letters
    .replace(/[\u0300-\u036f]/g, "") // remove accent marks
    .replace(/[^a-z0-9 -]/g, "") // remove invalid characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-") // replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // trim hyphens from start
    .replace(/-+$/, ""); // trim hyphens from end
}

/**
 * Format relative time or clean date
 * e.g., "10 min read", "2h ago", or formatted date string
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Draft";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "Recently";
  }
}

/**
 * Calculate estimated reading time from HTML content
 */
export function calculateReadingTime(htmlContent: string): string {
  if (!htmlContent) return "1 min read";
  const text = htmlContent.replace(/<[^>]*>/g, " ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / 200);
  return `${Math.max(1, minutes)} min read`;
}
