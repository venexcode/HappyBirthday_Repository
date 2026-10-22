// =====================================================================
// CAPTURA "CANVA" PARA DRIVE — diseño original de velada_1.css
// Cargar DESPUÉS de script.js:
//   <script src="js/script.js"></script>
//   <script src="js/captura-canva.js"></script>
//
// Cómo funciona: antes de sacar la foto, la COPIA de la tarjeta (nunca la
// tarjeta real) se reconstruye con estilos escritos directamente en cada
// elemento, copiados de velada_1.css. Por eso la imagen sale igual aunque
// la pantalla use el diseño 2 o cualquier otro CSS.
// =====================================================================
console.info("captura-canva.js activo: las imágenes de Drive usan el diseño original");

async function capturarTarjetaComoPNG(cardElement) {
  // Datos de la tarjeta real
  const nombre = (cardElement.querySelector(".post-author h4") || {}).textContent || "";
  const relacion = (cardElement.querySelector(".post-author span") || {}).textContent || "";
  const mensaje = (cardElement.querySelector(".post-content") || {}).textContent || "";
  const tieneFoto = !!cardElement.querySelector(".post-media img");
  const ancho = Math.round(cardElement.getBoundingClientRect().width);
  const colorTarjeta = cardElement.style.backgroundColor || selectedColor || "#FBF3E4";

  cardElement.dataset.capturaId = "1";

  try {
    const canvas = await html2canvas(cardElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: colorTarjeta,
      ignoreElements: (el) => el.tagName === "CANVAS",
      onclone: (doc) => {
        const clon = doc.querySelector('[data-captura-id="1"]');
        if (!clon) return;

        const img = clon.querySelector(".post-media img"); // se reutiliza la misma foto
        const el = (tag, css, texto) => {
          const e = doc.createElement(tag);
          if (css) e.style.cssText = css;
          if (texto !== undefined) e.textContent = texto;
          return e;
        };

        // Tarjeta: sin clases (así ningún CSS del diseño 2 la afecta) + estilos de velada_1
        clon.removeAttribute("class");
        clon.textContent = "";
        clon.style.cssText =
          `position:relative;display:flex;flex-direction:column;justify-content:space-between;gap:16px;` +
          `box-sizing:border-box;width:${ancho}px;margin:0;padding:24px 22px 20px;` +
          `border-radius:26px 8px 22px 10px;background-color:${colorTarjeta};color:#241b2c;` +
          `font:400 16px/1.5 Archivo,'Segoe UI',sans-serif;`;

        // Sello de esquina (📝 texto / 🖼️ foto)
        clon.appendChild(el("div",
          "position:absolute;top:-10px;right:18px;width:34px;height:34px;display:flex;align-items:center;" +
          "justify-content:center;font-size:0.95rem;line-height:1;background:#fbf3e4;border-radius:50%;" +
          "box-shadow:0 4px 10px rgba(36,27,44,0.18);",
          tieneFoto ? "🖼️" : "📝"));

        // Contenido
        const cuerpo = el("div");
        const cabecera = el("div", "display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px;");
        const autor = el("div");
        autor.appendChild(el("h4",
          "margin:0 0 2px;font-family:'Cormorant Garamond','Iowan Old Style',serif;font-weight:600;" +
          "font-size:1.15rem;line-height:1.5;color:#241b2c;", nombre));
        autor.appendChild(el("span", "font-size:0.78rem;color:rgba(36,27,44,0.62);", relacion));
        cabecera.appendChild(autor);
        cuerpo.appendChild(cabecera);
        cuerpo.appendChild(el("p", "margin:0 0 4px;font-size:0.97rem;line-height:1.55;color:#241b2c;", mensaje));

        if (img) {
          img.removeAttribute("class");
          img.style.cssText = "display:block;width:100%;max-width:100%;height:auto;border-radius:inherit;";
          const marco = el("div", "margin-top:10px;border-radius:14px 6px 14px 6px;overflow:hidden;");
          marco.appendChild(img);
          cuerpo.appendChild(marco);
        }
        clon.appendChild(cuerpo);

        // Espacio invisible de los botones de reacción (mantiene el alto de siempre)
        const reacc = el("div", "display:flex;gap:8px;padding-top:14px;visibility:hidden;");
        ["❤️ 1", "👏 1"].forEach((t) =>
          reacc.appendChild(el("button", "padding:6px 14px;border:none;border-radius:999px;font-size:0.84rem;font-family:inherit;", t)));
        clon.appendChild(reacc);
      },
    });
    return canvas.toDataURL("image/png");
  } finally {
    delete cardElement.dataset.capturaId;
  }
}