// api/og.js — Genera meta tags Open Graph sin consultar Firebase
// Los datos del producto se pasan como query params desde el cliente

module.exports = async (req, res) => {
  const slug = (req.query.slug || "").toLowerCase().trim();
  const title = req.query.title || "";
  const image = req.query.img || "";
  const price = req.query.price || "";
  const desc = req.query.desc || "";

  const STORE_NAME = "DS Distribuidora San Francisco Temporada";
  const baseUrl = `https://${req.headers.host}`;

  if (!slug) {
    res.setHeader("Location", "/");
    res.status(302).end();
    return;
  }

  const pageUrl = `${baseUrl}/${slug}`;
  const ogTitle = title || STORE_NAME;
  const ogDesc = desc || (price ? `Q${price} — ${STORE_NAME}` : STORE_NAME);
  const ogImage = image || "";

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
${ogImage ? `<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="800">
<meta property="og:image:height" content="800">` : ""}
${price ? `<meta property="og:price:amount" content="${price}">
<meta property="og:price:currency" content="GTQ">` : ""}
<meta name="twitter:card" content="${ogImage ? "summary_large_image" : "summary"}">
<meta name="twitter:title" content="${ogTitle}">
<meta name="twitter:description" content="${ogDesc}">
${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ""}
<script>
  var slug = decodeURIComponent(window.location.pathname.split("/").filter(Boolean).pop() || "");
  if(slug) { window.location.replace("/?producto_slug=" + encodeURIComponent(slug)); }
  else { window.location.replace("/"); }
</script>
</head>
<body><p style="font-family:sans-serif;text-align:center;padding:2rem">Cargando...</p></body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600");
  res.status(200).send(html);
};
