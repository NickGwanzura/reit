import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://mutirikwireitzim.com/",
      changeFrequency: "monthly",
      priority: 1,
      images: ["https://mutirikwireitzim.com/assets/lake-mutirikwi.jpg"],
    },
  ];
}
