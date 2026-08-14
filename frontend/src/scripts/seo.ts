import { useEffect } from "react";

type SeoOptions = {
  title: string;
  description: string;
  pathname?: string;
  image?: string;
  robots?: string;
  type?: "website" | "article";
  siteName?: string;
  structuredData?: Record<string, unknown>;
};

const DEFAULT_SITE_URL = "https://watchroom.party";
const SITE_URL = (import.meta.env.VITE_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, "");

const TAGS = {
  description: "seo-description",
  robots: "seo-robots",
  ogTitle: "seo-og-title",
  ogDescription: "seo-og-description",
  ogType: "seo-og-type",
  ogUrl: "seo-og-url",
  ogImage: "seo-og-image",
  ogImageAlt: "seo-og-image-alt",
  twitterCard: "seo-twitter-card",
  twitterTitle: "seo-twitter-title",
  twitterDescription: "seo-twitter-description",
  twitterImage: "seo-twitter-image",
  twitterImageAlt: "seo-twitter-image-alt",
  canonical: "seo-canonical",
  appName: "seo-app-name",
  appleAppName: "seo-apple-app-name",
  themeColor: "seo-theme-color",
  structuredData: "seo-structured-data",
} as const;

function resolveUrl(pathname: string) {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  return `${SITE_URL}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
}

function createOrGetMeta(id: string, attrName: "name" | "property", attrValue: string) {
  let element = document.getElementById(id) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.id = id;
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }

  return element;
}

function createOrGetLink(id: string, rel: string) {
  let element = document.getElementById(id) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    element.id = id;
    element.rel = rel;
    document.head.appendChild(element);
  }

  return element;
}

function createOrGetScript(id: string) {
  let element = document.getElementById(id) as HTMLScriptElement | null;

  if (!element) {
    element = document.createElement("script");
    element.id = id;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }

  return element;
}

function setContent(
  element: HTMLMetaElement,
  content: string,
): () => void {
  const previous = element.getAttribute("content");
  element.setAttribute("content", content);

  return () => {
    if (previous === null) {
      element.remove();
      return;
    }

    element.setAttribute("content", previous);
  };
}

function setHref(element: HTMLLinkElement, href: string): () => void {
  const previous = element.getAttribute("href");
  element.setAttribute("href", href);

  return () => {
    if (previous === null) {
      element.remove();
      return;
    }

    element.setAttribute("href", previous);
  };
}

function setText(element: HTMLScriptElement, text: string): () => void {
  const previous = element.textContent;
  element.textContent = text;

  return () => {
    if (previous === null) {
      element.remove();
      return;
    }

    element.textContent = previous;
  };
}

export function useSeo({
  title,
  description,
  pathname = "/",
  image = "/og-image.svg",
  robots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
  type = "website",
  siteName = "WatchRoom",
  structuredData,
}: SeoOptions) {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const previousTitle = document.title;
    document.title = title;
    cleanups.push(() => {
      document.title = previousTitle;
    });

    cleanups.push(
      setContent(
        createOrGetMeta(TAGS.description, "name", "description"),
        description,
      ),
    );
    cleanups.push(
      setContent(createOrGetMeta(TAGS.robots, "name", "robots"), robots),
    );
    cleanups.push(
      setContent(createOrGetMeta(TAGS.ogTitle, "property", "og:title"), title),
    );
    cleanups.push(
      setContent(
        createOrGetMeta(TAGS.ogDescription, "property", "og:description"),
        description,
      ),
    );
    cleanups.push(
      setContent(createOrGetMeta(TAGS.ogType, "property", "og:type"), type),
    );
    cleanups.push(
      setContent(
        createOrGetMeta(TAGS.ogUrl, "property", "og:url"),
        resolveUrl(pathname),
      ),
    );
    cleanups.push(
      setContent(
        createOrGetMeta(TAGS.ogImage, "property", "og:image"),
        resolveUrl(image),
      ),
    );
    cleanups.push(
      setContent(
        createOrGetMeta(TAGS.ogImageAlt, "property", "og:image:alt"),
        `${siteName} preview image`,
      ),
    );
    cleanups.push(
      setContent(
        createOrGetMeta(TAGS.twitterCard, "name", "twitter:card"),
        "summary_large_image",
      ),
    );
    cleanups.push(
      setContent(
        createOrGetMeta(TAGS.twitterTitle, "name", "twitter:title"),
        title,
      ),
    );
    cleanups.push(
      setContent(
        createOrGetMeta(TAGS.twitterDescription, "name", "twitter:description"),
        description,
      ),
    );
    cleanups.push(
      setContent(
        createOrGetMeta(TAGS.twitterImage, "name", "twitter:image"),
        resolveUrl(image),
      ),
    );
    cleanups.push(
      setContent(
        createOrGetMeta(TAGS.twitterImageAlt, "name", "twitter:image:alt"),
        `${siteName} preview image`,
      ),
    );
    cleanups.push(
      setHref(createOrGetLink(TAGS.canonical, "canonical"), resolveUrl(pathname)),
    );
    cleanups.push(
      setContent(createOrGetMeta(TAGS.appName, "name", "application-name"), siteName),
    );
    cleanups.push(
      setContent(
        createOrGetMeta(TAGS.appleAppName, "name", "apple-mobile-web-app-title"),
        siteName,
      ),
    );
    cleanups.push(
      setContent(createOrGetMeta(TAGS.themeColor, "name", "theme-color"), "#863bff"),
    );

    if (structuredData) {
      cleanups.push(
        setText(
          createOrGetScript(TAGS.structuredData),
          JSON.stringify(structuredData),
        ),
      );
    } else {
      const script = document.getElementById(TAGS.structuredData);
      if (script) {
        const previous = script.textContent;
        script.remove();
        cleanups.push(() => {
          if (previous === null) return;
          const restored = createOrGetScript(TAGS.structuredData);
          restored.textContent = previous;
        });
      }
    }

    return () => {
      for (let index = cleanups.length - 1; index >= 0; index -= 1) {
        cleanups[index]();
      }
    };
  }, [
    title,
    description,
    pathname,
    image,
    robots,
    type,
    siteName,
    structuredData,
  ]);
}
