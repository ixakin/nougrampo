# Publicar Nou Grampo en Cloudflare Pages

## Recomendación

Cloudflare Pages es adecuado para esta web: contiene HTML, CSS, JavaScript e imágenes estáticas y no necesita un servidor ni un paso de compilación. La guía oficial admite proyectos HTML sin framework y la carpeta publicada será la raíz de este proyecto.

## Primera publicación

1. Crea la cuenta de Cloudflare y abre **Workers & Pages**.
2. Crea un proyecto Pages con **Direct Upload** y elige un nombre de proyecto, por ejemplo `nougrampo`.
3. Sube el contenido de esta carpeta manteniendo la estructura: `index.html`, las páginas HTML, `assets/`, `ca/`, `en/`, `de/`, `styles.css`, `secondary.css`, `script.js`, `_headers` y `404.html`.
4. No uses un comando de build; si el formulario lo exige, usa `exit 0`. La carpeta de salida es la raíz (`/`).
5. Abre la URL `*.pages.dev` y comprueba las cinco páginas, los cuatro idiomas, las imágenes, la navegación y el envío de los dos formularios.

**Elección de publicación:** Cloudflare indica que un proyecto creado con Direct Upload no se puede convertir después a integración Git. Este repositorio no tiene remoto Git configurado. Si quieres despliegues automáticos cada vez que actualices la web, primero habrá que subir el proyecto a GitHub o GitLab y elegir integración Git desde el principio. Para publicar ahora con menos preparación, Direct Upload es el camino corto.

## Dominio y buscadores

- Cuando decidas el dominio final, añádelo en **Custom domains** dentro del proyecto Pages. Cloudflare configura el DNS de la zona alojada en esa misma cuenta; si el dominio está en otro proveedor, habrá que seguir el método de conexión que indique el panel.
- Después de elegir el dominio, generar `sitemap.xml` con las URLs definitivas y publicarlo junto a `robots.txt`. No se incluye un sitemap con dominios ficticios.
- Añade el sitio a Google Search Console con el dominio final y envía el sitemap.
- Configura Google Analytics cuando tengas el ID de medición. No se ha añadido un ID de ejemplo para evitar registrar visitas en una propiedad ajena.

## Formularios

Los formularios apuntan temporalmente a `ixakin@gmail.com` mediante FormSubmit. La primera prueba requiere que la página esté publicada en una URL HTTP/HTTPS y que se confirme el correo inicial de FormSubmit. Antes del lanzamiento público, cambia el destinatario a `info@nougrampo.es` y confirma también ese buzón.

## Notas

- `_headers` añade cabeceras básicas de seguridad. Cloudflare Pages sirve los archivos estáticos y aplica compresión automáticamente.
- La página `404.html` proporciona una salida sencilla para URLs que no existen.
- Conserva una copia local de la carpeta publicada. Para cambios posteriores, vuelve a subir los archivos o migra a integración Git con un proyecto Pages nuevo.

## Documentación oficial

- [Desplegar HTML estático](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [Carga directa](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Configuración de compilación](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Dominios personalizados](https://developers.cloudflare.com/pages/configuration/custom-domains/)
