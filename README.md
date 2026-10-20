# Nou Grampo

Web estática corporativa de Nou Grampo, preparada para publicarse como Cloudflare Worker con Static Assets.

Repositorio: [github.com/ixakin/nougrampo](https://github.com/ixakin/nougrampo)

## Estado actual

- Cinco páginas principales en español: inicio, empresa, productos, contacto e información.
- Traducciones de esas páginas al catalán, inglés y alemán.
- Navegación entre páginas e idiomas, con banderas locales.
- Diseño adaptable, estilos compartidos y recursos gráficos en `assets/`.
- Formularios en inicio y contacto conectados a FormSubmit. El destinatario está puesto temporalmente en `ixakin@gmail.com`.
- Página `404.html` y cabeceras web básicas en `_headers`.
- Configuración de Workers Static Assets en [`wrangler.jsonc`](wrangler.jsonc), con archivos de documentación excluidos por `.assetsignore`.
- Guía de publicación en [`PUBLICAR-CLOUDFLARE.md`](PUBLICAR-CLOUDFLARE.md).

## Estructura

```text
/
├── index.html, empresa.html, productos.html, contacto.html, informacion.html
├── ca/                  # catalán
├── en/                  # inglés
├── de/                  # alemán
├── assets/              # imágenes y banderas
├── styles.css           # estilos de inicio y elementos comunes
├── secondary.css        # estilos de páginas interiores
├── script.js            # comportamiento común y envío AJAX de formularios
├── 404.html             # página no encontrada
├── _headers             # cabeceras HTTP de Cloudflare
├── wrangler.jsonc       # Worker estático `nougrampo`
└── .assetsignore        # excluye README y archivos de configuración del despliegue
```

## Desarrollo y publicación

No hay dependencias ni proceso de compilación. La raíz del repositorio es la carpeta pública. El Worker estático se configura en `wrangler.jsonc`. Conecta este repositorio a Cloudflare Workers Builds, con `main` como rama de producción y el nombre `nougrampo`, y Cloudflare desplegará las actualizaciones automáticamente.

Consulta [`PUBLICAR-CLOUDFLARE.md`](PUBLICAR-CLOUDFLARE.md) para los pasos de despliegue, dominio y formularios.

## Pendiente antes de publicar

- Conectar el Worker `nougrampo` a este repositorio de GitHub y revisar la primera versión desplegada.
- Comprobar las páginas, navegación, traducciones, imágenes y diseño en móvil, tablet y escritorio desde la URL `pages.dev`.
- Probar los formularios desde la web publicada y confirmar el primer mensaje de FormSubmit.
- Antes de abrir la web al público, cambiar `ixakin@gmail.com` por `info@nougrampo.es` en los formularios de los ocho HTML de inicio y contacto, y confirmar el nuevo destinatario en FormSubmit.
- Elegir y conectar el dominio definitivo. Después, generar `sitemap.xml` con las URLs finales, publicar `robots.txt` y registrar el sitio y el sitemap en Google Search Console.
- Añadir el ID de Google Analytics cuando esté disponible y revisar la información de privacidad/cookies en los cuatro idiomas.
- Sustituir los enlaces sociales de muestra por las URLs reales, incluida la cuenta de Instagram.
- Añadir un mapa de Google Maps con la ubicación correcta y revisar su impacto en privacidad y cookies.
- Revisar y aprobar los textos legales y las traducciones antes del lanzamiento.

## Formularios de prueba

Los formularios utilizan FormSubmit y envían actualmente a `ixakin@gmail.com`. FormSubmit necesita que el sitio esté servido por HTTP/HTTPS; la apertura directa de los HTML como archivos no sirve para validar el envío. La primera recepción requiere confirmar el mensaje de activación del servicio.
