
import React from "react";
import { Helmet } from "react-helmet";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  twitterHandle?: string;
  structuredData?: Record<string, any>;
  noIndex?: boolean;
}

const SEOHead: React.FC<SEOProps> = ({
  title = "Blog Forge - AI-Powered Content Platform",
  description = "Create, edit, and manage content with AI assistance. Generate articles, images, analyze code, and more with Blog Forge.",
  keywords = "AI content, blog generator, image generator, content creation, AI tools, blog forge",
  ogImage = "/og-image.jpg", // Default OG image
  ogUrl = "https://www.blogforge.ai", // Default URL
  canonical,
  twitterHandle = "@BlogForgeAI",
  structuredData,
  noIndex = false,
}) => {
  const fullTitle = title.includes("Blog Forge")
    ? title
    : `${title} | Blog Forge`;
    
  // Prepare structured data for JSON-LD
  let jsonLD;
  
  if (structuredData) {
    jsonLD = JSON.stringify(structuredData);
  } else {
    // Default structured data
    jsonLD = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Blog Forge",
      "description": description,
      "applicationCategory": "ContentCreationApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "url": ogUrl,
    });
  }
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* No Index (if specified) */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Structured Data / JSON-LD */}
      <script type="application/ld+json">{jsonLD}</script>
    </Helmet>
  );
};

export default SEOHead;
