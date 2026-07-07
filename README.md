# Bloom Nails Spa - Producción V2

Versión preparada para GitHub Pages con:

- Open Graph actualizado con `og-image.jpg` para evitar caché antigua de WhatsApp/Meta.
- SEO técnico: title, description, canonical, robots, sitemap y keywords locales.
- Schema.org BeautySalon / Local Business.
- PWA básica: manifest, iconos, apple-touch-icon y service worker.
- Tracking layer para eventos: WhatsApp, Reservar, Contacto y Trabaja con nosotros.
- Optimización de imágenes: WebP para recursos internos y OG JPG 1200x630.

## Importante: IDs pendientes

Para activar analítica real debes crear tus cuentas y reemplazar los placeholders en `index.html`:

- Google Tag Manager: `GTM-XXXXXXX`
- GA4: se recomienda instalarlo desde Google Tag Manager.
- Meta Pixel: instalarlo desde Google Tag Manager.
- Microsoft Clarity: instalarlo desde Google Tag Manager o pegar el script de Clarity.
- Google Search Console: verificar el dominio desde Search Console.

Los eventos ya quedan listos para capturarse cuando GTM/GA4/Meta/Clarity estén configurados.

## Publicación

Reemplaza los archivos en tu repositorio `bloom-nails-form`, luego haz:

1. Commit to main
2. Push origin
3. Esperar 1-2 minutos a GitHub Pages

## Caché WhatsApp

Después de publicar, comparte `https://bloomnailssalon.com/` sin `#`. Si WhatsApp aún muestra una vista previa antigua, usa Meta Sharing Debugger y presiona Scrape Again.
