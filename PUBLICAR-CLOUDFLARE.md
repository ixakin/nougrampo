# Publicar Nou Grampo en Cloudflare Workers

## Configuración preparada

El sitio usa Workers Static Assets y un Worker pequeño para la API del catálogo. Los productos se guardan en D1; las imágenes cargadas desde el editor se guardan como datos en D1 y las fotos de ejemplo usan archivos locales de `assets/`.

Las peticiones a los recursos estáticos se sirven gratuitamente en Workers Free. [Precios y límites de Static Assets](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)

## Conectar GitHub y desplegar

1. La configuración `wrangler.jsonc` ya apunta al ID de D1 asignado a Nou Grampo. Si se crea otra base, registra su ID en ese archivo; el binding debe llamarse `DB` y coincidir con el Worker.
2. Aplica el esquema: `npx wrangler d1 migrations apply nougrampo-products --remote`.
3. Define la contraseña privada (mínimo 16 caracteres) como secreto, sin guardarla en Git: `npx wrangler secret put ADMIN_PASSWORD`. Usa una contraseña larga y única.
4. En Cloudflare, abre **Workers & Pages** y elige **Create application** > **GitHub**.
5. Autoriza la aplicación de Cloudflare en GitHub con acceso solo al repositorio `ixakin/nougrampo`.
6. Selecciona el repositorio y la rama `main`.
7. Usa el nombre de Worker `nougrampo`, que debe coincidir con `name` en `wrangler.jsonc`.
8. No configures un comando de build; el despliegue usa Wrangler y los ajustes del archivo `wrangler.jsonc`.
9. Despliega y comprueba la URL `nougrampo.<subdominio-de-la-cuenta>.workers.dev` que muestre Cloudflare.

La primera carga del catálogo crea 32 productos de muestra (cuatro de cada tipo, con 24 activos y 8 inactivos). Se insertan solo cuando D1 aún está vacío. La contraseña habilita la gestión privada; el catálogo público solo recibe productos activos.

D1 ofrece plan gratuito con límites de uso. En el plan Workers Free incluye 5 millones de filas leídas al día y 100.000 filas escritas al día; cada base de datos puede ocupar hasta 500 MB. Si se alcanza un límite diario, las consultas se pausan hasta el reinicio del contador. [Precios y límites oficiales de D1](https://developers.cloudflare.com/d1/platform/pricing/) · [Límites de D1](https://developers.cloudflare.com/d1/platform/limits/)

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
- [D1](https://developers.cloudflare.com/d1/)
