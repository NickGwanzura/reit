import type { MetadataRoute } from "next";
import { articles } from "./articles/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://mutirikwireitzim.com/",
      changeFrequency: "monthly",
      priority: 1,
      images: ["https://mutirikwireitzim.com/assets/lake-mutirikwi-hero.jpg"],
    },
    ...articles.map((article) => ({
      url: `https://mutirikwireitzim.com/articles/${article.slug}`,
      lastModified: new Date(`${article.date}T00:00:00+02:00`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
