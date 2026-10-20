# Publicar Nou Grampo en Cloudflare Pages

## Recomendación

Cloudflare Pages es adecuado para esta web: contiene HTML, CSS, JavaScript e imágenes estáticas y no necesita un servidor ni un paso de compilación. La guía oficial admite proyectos HTML sin framework y la carpeta publicada será la raíz de este proyecto.

## Primera publicación

El proyecto ya está en GitHub: [ixakin/nougrampo](https://github.com/ixakin/nougrampo). Para obtener despliegues automáticos:

1. Crea la cuenta de Cloudflare y abre **Workers & Pages**.
2. Crea un proyecto Pages y selecciona **Import an existing Git repository**.
3. Autoriza la conexión con GitHub y elige `ixakin/nougrampo`.
4. Configura la rama de producción como `main`. No hay framework ni compilación; deja el comando de build vacío o usa `exit 0` si la pantalla lo requiere. La raíz del repositorio contiene el sitio.
5. Despliega y abre la URL `*.pages.dev`. Comprueba las cinco páginas, los cuatro idiomas, las imágenes, la navegación y el envío de los formularios.

La integración Git desplegará las actualizaciones de `main` automáticamente. Cloudflare también ofrece Direct Upload, pero un proyecto creado con ese método no se puede convertir después a integración Git.

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
- Conserva una copia local del proyecto; los cambios enviados a `main` se desplegarán mediante la integración Git.

## Documentación oficial

- [Desplegar HTML estático](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [Carga directa](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Configuración de compilación](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Dominios personalizados](https://developers.cloudflare.com/pages/configuration/custom-domains/)
