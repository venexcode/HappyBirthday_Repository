# 🎉 Muro de Felicitaciones

Página web (HTML + CSS + JavaScript, sin frameworks ni compilación) donde familiares y amigos dejan un saludo de cumpleaños en forma de **texto, foto, audio o video**. Las publicaciones se guardan en **Google Drive / Google Sheets** mediante un **Google Apps Script**, se moderan desde la hoja de cálculo y, una vez aprobadas, aparecen en el muro.

> **Importante:** este repositorio contiene solo el **front-end**. El backend (Google Apps Script) es un proyecto aparte; en la sección [Contrato con el backend](#6-contrato-con-el-backend-google-apps-script) se explica exactamente qué espera recibir y qué debe devolver.

---

## Índice

1. [Qué hace](#1-qué-hace)
2. [Estructura de archivos](#2-estructura-de-archivos)
3. [Dependencias externas](#3-dependencias-externas)
4. [Puesta en marcha](#4-puesta-en-marcha)
5. [Configuración](#5-configuración)
6. [Contrato con el backend (Google Apps Script)](#6-contrato-con-el-backend-google-apps-script)
7. [Cómo funciona una publicación, paso a paso](#7-cómo-funciona-una-publicación-paso-a-paso)
8. [Detalle de cada archivo](#8-detalle-de-cada-archivo)
9. [Personalización del diseño](#9-personalización-del-diseño)
10. [Funciones opcionales (filtros y corazones)](#10-funciones-opcionales-filtros-y-corazones)
11. [Limitaciones y problemas conocidos](#11-limitaciones-y-problemas-conocidos)
12. [Solución de problemas](#12-solución-de-problemas)
13. [Lista de pruebas antes de publicar](#13-lista-de-pruebas-antes-de-publicar)
14. [Privacidad y seguridad](#14-privacidad-y-seguridad)

---

## 1. Qué hace

| Función | Descripción |
|---|---|
| **Enviar texto** | Mensaje de felicitación con el nombre y la relación del que escribe. |
| **Enviar foto + mensaje** | La pestaña *Foto* permite subir una imagen y, opcionalmente, escribir un mensaje que la acompaña. |
| **Enviar audio** | Grabar la voz directamente desde el navegador (micrófono) o subir un archivo `.mp3`, `.m4a`, `.wav`. |
| **Enviar video** | Subir un archivo de video desde el dispositivo. |
| **Color de tarjeta** | Cada persona elige el color de su tarjeta (4 opciones). |
| **Imagen de respaldo para Drive** | Con texto o foto, se genera una imagen PNG de la tarjeta (diseño original) y se guarda en Drive. La web nunca muestra esa imagen: siempre arma la tarjeta con texto y foto reales. |
| **Moderación** | Todo llega como `pendiente`. Se publica al cambiar la columna `estado` a `aprobado` en la hoja. |
| **Muro** | Las publicaciones aprobadas se cargan al abrir la página, con diseño de "entradas" perforadas. |
| **Botón de confeti** | El 🎉 junto al título lanza confeti desde su propia posición. También hay confeti al abrir la página y al publicar. |
| **Decoración** | Fondo fijo con globos, flores y el texto "Happy Birthday", visible mientras se hace scroll. |
| **Adaptado a móviles** | Diseño pensado primero para celular; botón de publicar fijo abajo, selector de tipo en una sola fila. |

---

## 2. Estructura de archivos

```
proyecto/
├── index.html
├── README.md
├── css/
│   └── velada_diseño_2.css
└── js/
    ├── script.js                      ← lógica principal (envío, grabación, carga del muro)
    ├── capturaCanva.js                ← imagen de respaldo para Drive (versión reforzada v2)
    └── parche-filtros-reacciones.js   ← OPCIONAL: filtros y corazones (ver sección 10)
```

**Orden de carga de los scripts** (al final de `index.html`; el orden importa):

```html
<script src="js/script.js"></script>
<script src="js/capturaCanva.js"></script>
```

`capturaCanva.js` debe ir **después** de `script.js` porque redefine la función `capturarTarjetaComoPNG`, y la última definición es la que se usa.

> **Nota sobre el nombre del CSS:** `velada_diseño_2.css` contiene una "ñ". Funciona bien en la mayoría de los servidores, pero si alguno da error 404 con ese archivo, renombralo a `velada_diseno_2.css` y actualizá el `<link>` en `index.html`.

---

## 3. Dependencias externas

Todas se cargan por internet (CDN); **hace falta conexión** para que funcionen.

| Recurso | Versión | Para qué sirve |
|---|---|---|
| [canvas-confetti](https://github.com/catdad/canvas-confetti) | 1.6.0 | Efecto de confeti. |
| [html2canvas](https://html2canvas.hertzen.com/) | 1.4.1 | Convertir la tarjeta en imagen PNG para Drive. |
| Google Fonts: **Cormorant Garamond** y **Archivo** | — | Títulos (serif cursiva) y texto (sans). |

No hay `npm`, ni compilación, ni dependencias locales.

**Navegadores:** versiones recientes de Chrome, Edge, Safari y Firefox.

- La grabación de voz requiere `MediaRecorder` y un **contexto seguro** (`https://` o `localhost`).
- El indicador deslizante de las pestañas y la etiqueta del talón de las tarjetas usan `:has()` (Chrome/Edge 105+, Safari 15.4+, Firefox 121+). En navegadores más viejos hay un respaldo visual: la pestaña activa se ve con fondo oscuro, sin deslizamiento.

---

## 4. Puesta en marcha

### Opción A: probar en tu computadora

El micrófono **no funciona abriendo el archivo con doble clic** (`file://`). Usá un servidor local, por ejemplo:

```bash
# con Python (desde la carpeta del proyecto)
python3 -m http.server 8000
# luego abrí http://localhost:8000
```

o la extensión *Live Server* de VS Code.

### Opción B: publicarlo

Subí la carpeta completa a cualquier hosting estático **con HTTPS** (GitHub Pages, Netlify, Cloudflare Pages, Vercel, etc.). No necesita servidor propio.

### Antes de abrirlo

1. Tené desplegado el backend de Google Apps Script (ver sección 6).
2. Pegá la URL de tu despliegue en `SCRIPT_URL` (ver sección 5).
3. Si cambiaste archivos y no ves los cambios, recargá sin caché: **Ctrl + F5** (en celular: borrar caché del navegador).

---

## 5. Configuración

Todo se configura en la parte superior de `js/script.js`.

### `SCRIPT_URL`

```js
const SCRIPT_URL = "https://script.google.com/macros/s/XXXXXXXX/exec";
```

URL de tu despliegue de Apps Script (*Implementar → Implementación de aplicación web*). Se usa tanto para **enviar** (POST) como para **cargar** el muro (GET con `callback`).

El despliegue debe estar configurado con acceso **"Cualquier persona"**; si no, el navegador no podrá comunicarse con él.

### Límites de tamaño

```js
const LIMITE_VIDEO_MB = 25;
const LIMITE_AUDIO_MB = 10;
```

Se validan en el navegador para avisar antes de enviar. **Deben coincidir con los límites del backend.** Si subís el límite acá pero no en Apps Script, el servidor rechazará el archivo sin avisar (ver limitaciones).

### Colores de tarjeta

Son los círculos del selector en `index.html`. Cada uno lleva el color en su `onclick`:

```html
<div class="color-opt c-marfil active" onclick="selectColor('#FBF3E4', this)"></div>
```

Para cambiar un color hay que modificar **dos cosas**: el valor del `onclick` y la clase del círculo en el CSS (`.c-marfil { background: ... }`). El color que se elige se guarda en la hoja y se vuelve a usar al cargar el muro.

### Identificador del dispositivo

Al primer ingreso se crea un `user_device_id` aleatorio guardado en `localStorage`. Sirve para marcar las tarjetas como propias (`data-owner-id`) y para guardar las reacciones del dispositivo si se activa el parche opcional. No identifica personas.

---

## 6. Contrato con el backend (Google Apps Script)

El backend no está incluido. Para que el front funcione, tu Apps Script debe cumplir lo siguiente.

### 6.1 Recibir publicaciones: `doPost(e)`

El front envía un `POST` con cuerpo JSON (como `text/plain`) y `mode: "no-cors"`:

```json
{
  "tipo": "tarjeta | video | audio",
  "autor": "Nombre",
  "relacion": "Familiar 💛",
  "mensaje": "Texto del saludo (puede estar vacío)",
  "color": "#FBF3E4",
  "archivoBase64": "data:image/png;base64,....",
  "mimeType": "image/png",
  "extension": "png",
  "disenioBase64": "data:image/png;base64,...."
}
```

| Campo | Cuándo viene |
|---|---|
| `tipo` | Siempre. `tarjeta` = solo texto **o** foto (con o sin mensaje). `video` y `audio` para esos tipos. |
| `autor`, `relacion`, `mensaje`, `color` | Siempre (`mensaje` puede ser `""`). |
| `archivoBase64`, `mimeType`, `extension` | Solo si hay foto, audio o video. Es el archivo original. |
| `disenioBase64` | Solo si `tipo` es `tarjeta` y la captura se generó bien. Es la imagen de la tarjeta para guardar en Drive. |

El backend debería guardar la fila en la hoja con `estado = "pendiente"`, guardar los archivos en Drive y validar tamaños y tipos del lado del servidor.

### 6.2 Entregar el muro: `doGet(e)` con JSONP

El front pide las publicaciones con una etiqueta `<script>` a `SCRIPT_URL?callback=jsonpMuro_123...`. La respuesta debe ser JavaScript que **llame a la función indicada en `callback`**:

```js
jsonpMuro_123({
  "result": "success",
  "posts": [
    {
      "autor": "Mamá",
      "mensaje": "¡Feliz cumpleaños!",
      "fecha": "2026-10-23T14:30:00Z",
      "color": "#F6E8C9",
      "tipo": "tarjeta | video | audio",
      "mediaBase64": "data:image/jpeg;base64,..."   // foto, video o audio; ausente si es solo texto
    }
  ]
})
```

- Solo deben devolverse las filas con `estado = "aprobado"`.
- `mediaBase64` debe ser un *data URI*. Si falta en un video o audio, el muro muestra "(No se pudo cargar...)".
- Por qué JSONP: Apps Script no permite leer su respuesta con `fetch` desde otro dominio (CORS). Una etiqueta `<script>` no tiene esa restricción.

### 6.3 Moderación

Se hace **en la hoja de cálculo**, columna `estado`:

| Valor | Efecto |
|---|---|
| `pendiente` | Estado inicial. No se muestra en el muro. |
| `aprobado` | Se muestra en el muro. |
| `rechazado` | Se descarta. |

---

## 7. Cómo funciona una publicación, paso a paso

1. La persona completa **nombre**, **relación** y elige una pestaña (Texto, Foto, Audio o Video).
2. Al enviar, `script.js` revisa **qué contenido hay realmente cargado** (no la última pestaña tocada) y valida:
   - Hay nombre.
   - Hay mensaje o un archivo.
   - Video ≤ 25 MB. Audio subido ≤ 10 MB.
3. Si hay varios tipos a la vez, se envía **solo uno** con esta prioridad: **video → audio → foto → solo texto**.
4. Se agrega la tarjeta al muro de inmediato (versión local, con el aviso *"⏳ Enviado, pendiente de revisión"*) y se lanza confeti.
5. Si es `tarjeta` (texto o foto), se genera la **imagen de respaldo** (`capturaCanva.js`) y se adjunta como `disenioBase64`.
6. Se envía todo al backend con `fetch` en modo `no-cors`.
7. Se reinicia el formulario.

> **Por qué el aviso dice "pendiente":** con `no-cors` el navegador no puede leer la respuesta del servidor, así que **no puede saber si se aceptó o se rechazó**. Para saber qué pasó realmente, revisá siempre la columna `estado` de tu hoja.

### Cómo se unen el texto y la foto

En la pestaña **Foto** hay una barra de mensaje opcional (`#messageTextFoto`). `script.js` solo lee `#messageText` (la de la pestaña Texto), por eso ambas están **sincronizadas** con un pequeño script al final de `index.html`: lo que escribís en una aparece en la otra. Resultado: foto + mensaje viajan juntos y salen juntos en la imagen de Drive.

---

## 8. Detalle de cada archivo

### `index.html`

Estructura de arriba hacia abajo:

| Bloque | Contenido |
|---|---|
| `<head>` | Fuentes, enlace al CSS, canvas-confetti y html2canvas. |
| `.fondo-recuerdos` | Decoración fija: símbolos SVG (`#globo`, `#flor`, `#hoja`), dos textos "Happy Birthday", dos ramos de globos, dos globos sueltos y dos ramos de flores. |
| `header.hero-header` | Insignia "Día Especial", título animado (`h1.titulo`) y descripción. |
| `section.form-card` | Formulario `#wishesForm`: nombre, relación, selector de tipo (`.media-tabs`), paneles de cada pestaña, selector de color y botón de publicar. |
| `section` de galería | Encabezado con filtros (`.filter-btn`) y la grilla `#wallGrid`. |
| Scripts | `script.js`, `capturaCanva.js` y un script corto de apoyo (ver abajo). |

**Script de apoyo al final del HTML.** Hace tres cosas, sin modificar `script.js`:
1. Sincroniza `#messageText` ↔ `#messageTextFoto`.
2. Muestra la vista previa de la foto elegida.
3. Calcula hacia qué lado se mueve el usuario entre pestañas, para que los paneles entren desde ese lado.

**IDs que usan los scripts (no los cambies):**
`wishesForm`, `senderName`, `relationship`, `messageText`, `messageTextFoto`, `photoInput`, `videoInput`, `audioFileInput`, `btnOptMic`, `btnOptFile`, `subtab-mic`, `subtab-file`, `btnMic`, `btnMicText`, `recStatusText`, `recTimer`, `audioPreview`, `wallGrid`, `tab-texto`, `tab-foto`, `tab-audio`, `tab-video`.

**Clases que usan los scripts:** `.tab-btn`, `.tab-content`, `.color-opt`, `.btn-submit`, `.card-post`, `.post-*`, `.react-btn`, `.btn-delete`, `.filter-btn`.

**Funciones llamadas desde atributos `onclick`:** `switchTab`, `toggleAudioSubTab`, `toggleRecording`, `selectColor`, `deletePost`.

**Tarjetas de ejemplo:** el HTML trae 3 tarjetas escritas a mano dentro de `#wallGrid` (Mamá, Lucas & Sofía, Tío Roberto). **Borralas antes de compartir el link**: no vienen del backend.

### `css/velada_diseño_2.css`

Secciones, en orden:

| Sección | Qué controla |
|---|---|
| Variables `:root` | Colores, tipografías, ancho del talón de las entradas. |
| Fondo | Capa fija `.fondo-recuerdos` (las reglas viejas de `img` ya no se usan). |
| Hero | Guirnalda de luces que titila, insignia, botón antiguo. |
| Formulario | Papel de carta, campos, selector de tipo, grabadora, selector de color, botón publicar. |
| Galería | Encabezado fijo en móvil, filtros deslizables. |
| Muro | Tarjetas tipo entrada perforada: muescas con `mask`, talón con etiqueta (Mensaje/Foto/Video/Audio) según el contenido. |
| Responsive | Columnas 1 → 2 → 3, inclinación leve de tarjetas en escritorio. |
| Accesibilidad | Con "reducir movimiento" se desactivan todas las animaciones. |
| Transiciones del selector | Indicador deslizante y entrada de paneles. |
| Decoración de fondo | Globos, flores, texto, variable `--opacidad-fondo`. |
| Título | Animaciones del `h1` y del 🎉. |

### `js/script.js`

Funciones principales:

| Función | Qué hace |
|---|---|
| `switchTab(tab)` | Cambia de pestaña (alterna la clase `active`). |
| `toggleAudioSubTab(sub)` | Alterna entre *Grabar voz* y *Subir archivo*. |
| `toggleRecording()` | Inicia/detiene la grabación con `MediaRecorder` y muestra el cronómetro. |
| `selectColor(color, el)` | Guarda el color elegido para la tarjeta. |
| `fireConfetti()` | Lanza confeti (se usa al publicar). |
| `cargarPublicacionesGuardadas()` | Pide el muro al backend por JSONP. |
| `pintarPublicaciones(posts)` | Crea una tarjeta por cada publicación aprobada. |
| `deletePost(button)` | Oculta la tarjeta **solo en esa pantalla** (no borra nada). |
| `archivoABase64(file)` | Convierte un archivo en *data URI*. |
| `enviarAlBackend(payload)` | Envía el `POST` (modo `no-cors`). |
| `escapeHTML(str)` | Evita inyección de HTML en nombres y mensajes. |
| Evento `submit` | Validación, tarjeta local, captura, envío y reinicio del formulario. |

### `js/capturaCanva.js` (versión reforzada v2)

Reemplaza la función `capturarTarjetaComoPNG`. **La imagen de Drive tiene siempre el mismo diseño original**, sin importar el diseño de la pantalla: la copia de la tarjeta se reconstruye con estilos escritos directamente en cada elemento (esquinas orgánicas, sello con emoji arriba a la derecha, nombre en Cormorant, parentesco como texto simple).

Pasos que realiza:

1. Espera a que carguen las tipografías.
2. Convierte la foto en una imagen embebida y la reduce a máximo 1400 px de lado.
3. Captura la tarjeta con `html2canvas` (escala ×2).
4. Devuelve el PNG como *data URI*.

**Mensajes en la consola del navegador** (F12 → Console):

| Mensaje | Significado |
|---|---|
| `captura-canva.js v2 activo...` | El archivo se cargó correctamente. |
| `[captura] imagen de respaldo generada: N KB` | La imagen se creó bien. |
| `[captura] FALLÓ la imagen de respaldo...` | Error al generar la imagen; se publica igual, pero sin ella. |
| `[captura] La imagen es muy pesada...` | Más de 6000 KB; Apps Script podría rechazar el envío. |

---

## 9. Personalización del diseño

### Colores y tipografías

En `:root` al inicio del CSS:

```css
--ink: #1d1426;        /* fondo oscuro */
--wine: #8c3b4b;       /* vino */
--gold: #d3a24a;       /* dorado */
--gold-light: #f0d9a0; /* dorado claro */
--paper: #fbf3e4;      /* marfil de tarjetas */
--sage: #5d7d65;       /* verde (talón "Audio") */
```

### Opacidad de la decoración de fondo

```css
:root { --opacidad-fondo: 0.5; }   /* 0.35 más sutil · 0.7 más intenso */
```

### Posición y tamaño de globos y flores

Cada elemento decorativo en `index.html` tiene un `style` con sus coordenadas, en unidades relativas a la pantalla:

```html
<svg class="deco" style="left:-4vw; bottom:-3vh; width:clamp(160px,26vw,360px); --r:-4deg; --d:9s">
```

`left`/`right`/`top`/`bottom` posicionan; `width` define el tamaño; `--r` es la inclinación; `--d` es la duración del movimiento de flotar. Los ramos de flores llevan además la clase `deco--quieta` (sin movimiento).

### Textos "Happy Birthday"

Son los elementos `.fondo-texto--1` y `.fondo-texto--2`; su altura se ajusta con `top` en el CSS.

### Título y botón de confeti

- El título está en `h1.titulo`: línea chica (`.titulo-linea--chica`), línea grande con brillo dorado (`.pal--oro`) y subrayado (`.titulo-subrayado`).
- El 🎉 (`.titulo-emoji`) es un `<button>`; su `onclick` lanza el confeti desde su propia posición. Para cambiar la cantidad de confeti, modificá `particleCount: 120` en ese `onclick`.
- La velocidad del brillo dorado es el `7s` de `animation: ... brillo 7s` en `.pal--oro`.

### Selector de tipo (pestañas)

El indicador oscuro se desplaza con CSS (`.tab-indicador`). Si agregás o quitás pestañas, hay que actualizar `width: calc((100% - 8px) / 4)` y las reglas `:nth-of-type`.

---

## 10. Funciones opcionales (filtros y corazones)

En el estado actual, los botones de **filtro** (Todos, Videos, Fotos, Audios, Texto) y los de **reacción** (❤️ 👏) son **solo visuales**: `script.js` no les asigna ninguna acción.

Para activarlos hay un archivo opcional, `js/parche-filtros-reacciones.js`. Agregalo **después** de `capturaCanva.js`:

```html
<script src="js/script.js"></script>
<script src="js/capturaCanva.js"></script>
<script src="js/parche-filtros-reacciones.js"></script>
```

Qué activa:

- **Filtros:** detectan el tipo de cada tarjeta por su contenido (video, audio, foto o texto) y ocultan las demás. Muestran un aviso si un filtro no tiene resultados.
- **Reacciones:** ❤️ y 👏 se pueden dar y quitar con un toque; el número sube o baja en uno.

Las reacciones se guardan **solo en el navegador de cada persona** (`localStorage`). No se suman entre visitantes: para eso haría falta guardar los contadores en el backend.

---

## 11. Limitaciones y problemas conocidos

| Tema | Detalle | Cómo mitigarlo |
|---|---|---|
| **Sin confirmación real** | Con `no-cors` no se puede leer la respuesta del servidor. El aviso "pendiente de revisión" se muestra aunque el servidor haya rechazado el envío. | Revisar siempre la hoja. |
| **Un solo tipo por publicación** | Si se adjuntan varios (por ejemplo foto y audio), se envía solo uno (video → audio → foto) y el resto se descarta sin avisar. | Pedir una publicación por cada tipo. |
| **El formulario siempre se vacía** | Se reinicia tras publicar, **incluso si falló el envío**; el usuario pierde lo escrito. | Modificar el bloque `finally` del `submit` para que solo reinicie en caso de éxito. |
| **Color por defecto** | `script.js` arranca con `selectedColor = "#E8F1F9"` (celeste), que **no está en el selector**. Si alguien no elige color, su tarjeta sale celeste. También se usa como respaldo en `pintarPublicaciones`. | Cambiar ambos `#E8F1F9` por `#FBF3E4`. |
| **Audio grabado en iPhone** | La grabación siempre se declara como `audio/webm`, pero Safari graba en `mp4`. | Usar `mediaRecorder.mimeType` al crear el `Blob` y para la extensión. |
| **Límite de audio grabado** | El límite de 10 MB solo se valida en archivos subidos, no en grabaciones. | Validar también `recordedAudioBlob.size`. |
| **"Ocultar" es local** | El botón 🗑️ de las tarjetas propias solo las oculta en esa pantalla. No borra nada. | Borrar o rechazar desde la hoja. |
| **Reacciones locales** | Ver sección 10. | Guardar contadores en el backend. |
| **Peso de la carga inicial** | El backend devuelve foto, video y audio incrustados en base64. Con muchas publicaciones la carga se vuelve pesada. | Devolver URLs de Drive en lugar de contenido incrustado. |
| **Relación en tarjetas cargadas** | Las tarjetas que vienen del backend no muestran el parentesco (solo las recién publicadas). | Agregar `relacion` en `pintarPublicaciones`. |
| **Fecha en formato `es-ES`** | `formatearFecha` usa `es-ES`. | Cambiar a `es-AR` si se prefiere. |
| **Tarjetas de ejemplo** | Están escritas a mano en el HTML. | Borrarlas. |

---

## 12. Solución de problemas

**La foto con mensaje no aparece en Drive**
1. Abrí la consola (F12) y publicá de nuevo.
2. Buscá `[captura]`:
   - `FALLÓ...` → la imagen no se generó; el error indica por qué.
   - `generada: N KB` → se creó y se envió; el problema está en el backend o en Drive.
3. Revisá si apareció la fila en la hoja. Sin fila, el envío no llegó (revisá `SCRIPT_URL` y que el despliegue sea público).
4. Verificá que `capturaCanva.js` esté cargado **después** de `script.js` y que veas el mensaje `captura-canva.js v2 activo`.
5. Si `N` supera ~6000 KB, usá una foto más liviana.

**La imagen de Drive sale con otro diseño o texto espejado**
`capturaCanva.js` no se está cargando o hay una versión vieja en caché. Recargá con Ctrl + F5 y confirmá el orden de los scripts.

**El micrófono no graba**
- Debe abrirse por `https://` o `localhost`, no con `file://`.
- Verificá el permiso del navegador para el micrófono.

**El muro aparece vacío**
- Revisá `SCRIPT_URL`.
- Confirmá que haya filas con `estado = "aprobado"`.
- En la consola puede aparecer *"No se pudieron cargar las publicaciones guardadas"*; indica fallo de red o URL incorrecta.
- Verificá que el backend responda con la función indicada en `callback` (sección 6.2).

**Los filtros o los corazones no hacen nada**
Es lo esperado: son opcionales. Ver sección 10.

**Los cambios de diseño no se ven**
Caché del navegador: Ctrl + F5, o abrí en una ventana privada.

**Las pestañas no tienen el indicador deslizante**
Tu navegador no soporta `:has()`. Se usa el respaldo (fondo oscuro en la pestaña activa); todo funciona igual.

**Las animaciones no se ven**
Si el dispositivo tiene activada la opción "reducir movimiento", se desactivan a propósito. El contenido se muestra completo y quieto.

---

## 13. Lista de pruebas antes de publicar

- [ ] `SCRIPT_URL` apunta a tu despliegue y es público.
- [ ] Publicación de **solo texto**: llega a la hoja como `pendiente` y se genera la imagen en Drive.
- [ ] Publicación de **foto con mensaje**: llegan foto, mensaje e imagen de Drive.
- [ ] Publicación de **audio** (grabado y subido).
- [ ] Publicación de **video** (dentro del límite).
- [ ] Un archivo que **supere el límite** muestra el aviso y no se envía.
- [ ] Cambiar una fila a `aprobado` y recargar: aparece en el muro.
- [ ] El 🎉 del título lanza el confeti.
- [ ] Se ve bien en **celular**: pestañas en una fila, botón de publicar fijo, filtros deslizables.
- [ ] Tarjetas de ejemplo borradas.
- [ ] Probado también desde iPhone (audio) y Android.

---

## 14. Privacidad y seguridad

- **`SCRIPT_URL` es pública** (cualquiera que vea el código la ve). Por eso el backend debe **validar todo del lado del servidor**: tipos de archivo, tamaños, longitud de textos.
- Todo contenido enviado por los visitantes se **modera** antes de publicarse.
- Los textos se pasan por `escapeHTML` antes de mostrarse. El contenido multimedia se incrusta como *data URI* y viene solo de tu backend.
- La página guarda en el navegador solo un identificador aleatorio de dispositivo (`user_device_id`) y, si se activa el parche opcional, las reacciones dadas. No usa cookies ni servicios de seguimiento propios.
- Las fotos, audios, videos y mensajes quedan en **tu** Google Drive y Google Sheets. Avisá a quienes participan de que sus saludos se guardan allí.
- No subas contenido de terceros que no tengas derecho a compartir.
