# Bloom Nails Spa — Production V3.3 Marketing Tracking Edition

Incluye la versión lista para GitHub Pages con:

- Google Tag Manager instalado: `GTM-TFHLNXBX`
- Google Analytics 4 instalado: `G-XG3P540G1B`
- Microsoft Clarity listo vía Google Tag Manager
- SEO local y Open Graph actualizado
- `og-image.jpg` para WhatsApp/Facebook/LinkedIn
- PWA básica: manifest + service worker + iconos móviles
- Sitemap y robots.txt
- Schema.org BeautySalon con AggregateRating real: 4.9 / 91 reseñas
- Eventos personalizados enviados a `dataLayer`, GA4, Clarity y Meta Pixel cuando esté disponible

## Eventos incluidos

- `page_ready`
- `click_whatsapp`
- `conversion_reserva_intent`
- `click_reservar`
- `click_instagram`
- `click_tiktok`
- `click_maps`
- `click_phone`
- `click_email`
- `click_contacto`
- `click_trabaja_con_nosotros`
- `click_promotion`
- `click_gallery`
- `click_review`
- `scroll_50`
- `scroll_90`
- `form_submit`
- `submit_contact_form`
- `submit_job_form`

## Cómo publicar

1. Descomprime el ZIP.
2. Copia todo el contenido dentro de tu carpeta local del repositorio `bloom-nails-form`.
3. En GitHub Desktop haz commit con el mensaje: `Bloom V3.3 Marketing Tracking`.
4. Haz `Push origin`.
5. Espera 1–2 minutos.
6. Abre `https://bloomnailssalon.com` en incógnito.
7. Revisa Google Analytics > Tiempo real y Microsoft Clarity > Panel.

## Pendientes opcionales

- Crear Meta Pixel y agregarlo desde Google Tag Manager.
- Crear Google Search Console y verificar dominio.
- Crear dashboard en Looker Studio con GA4.


## Bloom V4.0 Marketing Intelligence

Incluye capa de tracking para GA4/GTM/Clarity/Meta Pixel:
- clics en WhatsApp, Reservar, Instagram, Maps, teléfono, email, reseñas, promociones y galería
- view_section para secciones visitadas
- view_service, view_promotion y view_testimonial
- scroll_depth (25/50/75/90/100, como parámetro de un mismo evento)
- video_progress (25/50/75%) y video_start / video_complete
- engaged_time a los 30/60/120/180/300 segundos
- form_start y form_submit
- Los clics de administración (modo edición de galería/promos/testimonios) quedan excluidos del tracking para no contaminar los datos con actividad interna.

Conversión sugerida en GA4 (marcar como evento clave):
- `conversion_reserva_intent` — único evento de conversión "canónico". Se dispara con cualquier clic a WhatsApp con intención de reservar, venga de una promo, servicio o experiencia.
- `submit_job_form` — postulación de trabajo enviada con éxito.

`click_whatsapp`, `click_reservar`, `click_promotion`, etc. son eventos de **diagnóstico** (para saber por dónde entra la gente) y no deben marcarse como conversión — ya están representados dentro de `conversion_reserva_intent` para ese mismo clic, y marcarlos también duplicaría el conteo total de conversiones en los reportes de GA4.
