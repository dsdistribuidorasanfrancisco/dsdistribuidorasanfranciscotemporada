// api/og.js — Genera meta tags Open Graph por producto
// Detecta si es un bot (Linktree, WhatsApp, Facebook) o usuario real

module.exports = async (req, res) => {
  const slug = (req.query.slug || "").toLowerCase().trim();
  const title = req.query.title || "";
  const image = req.query.img || "";
  const price = req.query.price || "";
  const desc = req.query.desc || "";

  const STORE_NAME = "DS Distribuidora San Francisco Temporada";
  const baseUrl = "https://" + req.headers.host;

  if (!slug) {
    res.setHeader("Location", "/");
    res.status(302).end();
    return;
  }

  const pageUrl = baseUrl + "/" + slug;
  const ogTitle = title || STORE_NAME;
  const ogDesc = desc || (price ? "Q" + price + " — " + STORE_NAME : STORE_NAME);
  const ogImage = image || "";

  // Detectar si es un bot de redes sociales o Linktree
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  const isBot = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|slack|discord|pinterest|linktree|crawl|bot|spider|preview|fetch|curl|python/i.test(ua);

  if (!isBot) {
    // Usuario real — redirigir directo al SPA con el slug
    res.setHeader("Location", "/?producto_slug=" + encodeURIComponent(slug));
    res.status(302).end();
    return;
  }

  // Bot — devolver HTML con meta tags completos
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${ogTitle}</title>
<meta name="description" content="${ogDesc}">
<meta property="og:type" content="product">
<meta property="og:url" content="${pageUrl}">
<meta property="og:title" content="${ogTitle}">
<meta property="og:description" content="${ogDesc}">
<meta property="og:site_name" content="${STORE_NAME}">
${ogImage ? '<meta property="og:image" content="' + ogImage + '">
<meta property="og:image:width" content="800">
<meta property="og:image:height" content="800">' : ""}
${price ? '<meta property="og:price:amount" content="' + price + '">
<meta property="og:price:currency" content="GTQ">' : ""}
<meta name="twitter:card" content="${ogImage ? "summary_large_image" : "summary"}">
<meta name="twitter:title" content="${ogTitle}">
<meta name="twitter:description" content="${ogDesc}">
${ogImage ? '<meta name="twitter:image" content="' + ogImage + '">' : ""}
</head>
<body><p>Cargando...</p></body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600");
  res.status(200).send(html);
};
