# Publicar Nou Grampo en Cloudflare Workers

## Configuración preparada

Este repositorio usa Workers Static Assets. El archivo `wrangler.jsonc` configura el Worker `nougrampo` y sirve el contenido estático desde la raíz, sin ejecutar código dinámico. `_headers` establece las cabeceras web y `.assetsignore` evita publicar los archivos de documentación y configuración.

Las peticiones a los recursos estáticos se sirven gratuitamente en Workers Free. [Precios y límites de Static Assets](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)

## Conectar GitHub y desplegar

1. En Cloudflare, abre **Workers & Pages** y elige **Create application** > **GitHub**.
2. Autoriza la aplicación de Cloudflare en GitHub con acceso solo al repositorio `ixakin/nougrampo`.
3. Selecciona el repositorio y la rama `main`.
4. Usa el nombre de Worker `nougrampo`, que debe coincidir con `name` en `wrangler.jsonc`.
5. No configures un comando de build; no se usa framework ni compilación. El despliegue usará Wrangler y los ajustes del archivo `wrangler.jsonc`.
6. Despliega y comprueba la URL `nougrampo.<subdominio-de-la-cuenta>.workers.dev` que muestre Cloudflare. Si la cuenta usa `ixakin.workers.dev` y el nombre está libre, será `nougrampo.ixakin.workers.dev`.

Cloudflare Workers Builds puede conectar el repositorio y publicar las actualizaciones de `main` automáticamente. [Integración GitHub](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/)

## Comprobaciones posteriores

- Revisar las páginas, los idiomas, imágenes y navegación en móvil y escritorio desde la URL publicada.
- Probar los formularios en la web publicada y confirmar el primer mensaje de FormSubmit.
- Antes del lanzamiento público, cambiar el destinatario de `ixakin@gmail.com` a `info@nougrampo.es` en los formularios de inicio y contacto de los cuatro idiomas, y confirmar el buzón en FormSubmit.
- Cuando haya dominio definitivo, conectarlo al Worker y preparar `sitemap.xml`, `robots.txt`, Google Search Console y Google Analytics.
- Sustituir los enlaces sociales de ejemplo por las cuentas reales, añadir el mapa de Google Maps y revisar los textos legales y de privacidad.

## Documentación oficial

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Desplegar un sitio estático](https://developers.cloudflare.com/workers/static-assets/get-started/)
- [Configuración de assets y Wrangler](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Builds de Workers](https://developers.cloudflare.com/workers/ci-cd/builds/)
