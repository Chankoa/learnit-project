import type { Metadata } from "next";

const defaultSiteUrl = "https://learnit.dev";
const defaultImage = "/images/learnit-hub-hero.png";

type PageMetadataInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl;
}

export function createPageMetadata({
  title,
  description,
  path = "/",
  image = defaultImage,
  noIndex = false
}: PageMetadataInput): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: "LearnIt",
      locale: "fr_FR",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    },
    robots: noIndex
      ? {
          index: false,
          follow: false
        }
      : undefined
  };
}
