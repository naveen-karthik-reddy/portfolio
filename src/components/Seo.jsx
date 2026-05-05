const BASE_URL = "https://naveenkarthik.com";
const SITE_NAME = "Naveen Karthik";

export default function Seo({
  title,
  description,
  canonical,
  keywords,
  type = "website",
  image,
  publishedTime,
  modifiedTime,
  author = SITE_NAME,
}) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {image && (
        <>
          <meta property="og:image" content={image.url} />
          <meta property="og:image:width" content={String(image.width)} />
          <meta property="og:image:height" content={String(image.height)} />
          <meta property="og:image:alt" content={image.alt || fullTitle} />
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image.url} />}

      {/* Article-level meta */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      <meta property="article:author" content={author} />
    </>
  );
}
