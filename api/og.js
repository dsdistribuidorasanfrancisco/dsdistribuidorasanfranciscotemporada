// api/og.js — Genera HTML con meta tags Open Graph por producto
// Vercel Serverless Function (Node.js)

const https = require("https");

const FIREBASE_URL = "https://dsdistribuidorasfctemporada-default-rtdb.firebaseio.com/products.json";

const STORE_NAME = "DS Distribuidora San Francisco Temporada";
const STORE_DESC = "Los mejores productos al mejor precio";

function toSlug(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function fetchProducts() {
  return new Promise((resolve, reject) => {
    https.get(FIREBASE_URL, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const obj = JSON.parse(data);
          if (!obj) return resolve([]);
          const arr = Object.values(obj);
          resolve(arr);
        } catch (e) {
          resolve([]);
        }
      });
    }).on("error", reject);
  });
}

function buildHTML(title, description, image, url, price) {
  const priceTag = price
    ? `<meta property="og:price:amount" content="${price}">
       <meta property="og:price:currency" content="GTQ">`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">

<!-- Open Graph / Facebook / WhatsApp -->
<meta property="og:type" content="product">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
${image ? `<meta property="og:image" content="${image}">
<meta property="og:image:width" content="800">
<meta property="og:image:height" content="800">` : ""}
${priceTag}

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
${image ? `<meta name="twitter:image" content="${image}">` : ""}

<!-- Redirigir al SPA inmediatamente -->
<script>window.location.replace("/?producto_slug=" + encodeURIComponent(window.location.pathname.split("/").filter(Boolean).pop() || ""));</script>
</head>
<body>
<p>Cargando producto...</p>
</body>
</html>`;
}

module.exports = async (req, res) => {
  try {
    // Obtener el slug desde la query que Vercel pasa
    const slug = (req.query.slug || "").toLowerCase().trim();

    if (!slug) {
      // Ruta raíz — redirigir al index
      res.setHeader("Location", "/");
      res.status(302).end();
      return;
    }

    // Buscar el producto en Firebase
    const products = await fetchProducts();
    const product = products.find(p => p && toSlug(p.name) === slug);

    const baseUrl = `https://${req.headers.host}`;
    const pageUrl = `${baseUrl}/${slug}`;

    if (!product) {
      // Producto no encontrado — redirigir al index
      const html = buildHTML(STORE_NAME, STORE_DESC, "", baseUrl, null);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(html);
      return;
    }

    const img = product.img || product.imgUrl || "";
    const price = product.price ? product.price.toFixed(2) : null;
    const desc = product.desc
      ? product.desc.substring(0, 150)
      : `Q${price} — ${STORE_NAME}`;

    const html = buildHTML(product.name, desc, img, pageUrl, price);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    res.status(200).send(html);

  } catch (err) {
    console.error(err);
    res.setHeader("Location", "/");
    res.status(302).end();
  }
};

