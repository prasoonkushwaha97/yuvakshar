import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://yuvakshar.org";

  // Static routes
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/magazine",
    "/privacy-policy",
    "/terms-and-conditions",
    "/authors",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.7,
  }));

  // Dynamic categories
  const categories = [
    "samachar",
    "vishesh-lekh",
    "vichar",
    "sahitya",
    "sakshatkar",
    "shiksha",
    "paryavaran",
    "itihas",
    "video",
    "patrika",
  ].map((cat) => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Dynamic pre-seeded authors
  const authors = [
    "prasoon-kushwaha",
    "amit-sharma",
    "dr-rajesh-singh",
    "sanjay-kumar",
    "ravi-kumar",
  ].map((auth) => ({
    url: `${baseUrl}/authors/${auth}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categories, ...authors];
}
