# Bloom Nails Spa — Web v5

Web nueva de bloomnailssalon.com con pestañas, portada en video y contenido editable.

## Cómo publicar (igual que siempre)

1. Descomprime el ZIP.
2. Copia **todo** su contenido dentro de la carpeta local de tu repositorio, reemplazando los archivos.
3. En GitHub Desktop haz commit con el mensaje `Bloom v5 nueva web` y luego **Push origin**.
4. Espera 1–2 minutos y abre https://bloomnailssalon.com en modo incógnito.
5. Revisa Google Analytics > Tiempo real y Microsoft Clarity para confirmar que llegan visitas.

Los archivos viejos que ya no se usan (`assets/videos/video_001_…mp4` y `assets/fonts/font_00…woff2`) se pueden borrar del repositorio, pero no molestan si se quedan.

## Qué se conservó

- Mismo dominio, mismo título y descripción para Google, mismas palabras clave.
- Todas las fotos con sus mismas direcciones y textos alternativos (siguen apareciendo en Google Imágenes).
- Google Tag Manager `GTM-TFHLNXBX`, Google Analytics 4 `G-XG3P540G1B`, Clarity (vía GTM) y todos los eventos (`conversion_reserva_intent`, `click_whatsapp`, `view_section`, etc.).
- Formularios con el mismo Formspree (`mdavryko`): Trabaja con nosotros y Libro de Reclamaciones.
- Los enlaces viejos siguen funcionando: `#servicios`, `#galeria`, `#testimonios`, `#contacto`, `#trabaja`, `#bloom-experience`, `#momentos`, `#promociones`.

## Qué se mejoró para buscadores e IA

- Encabezado principal con palabras clave: "Salón de manicure y pedicure en Miraflores, Lima".
- Datos estructurados ampliados: cada servicio con su descripción, horario, ubicación, calificación, redes y botón de reserva.
- Preguntas frecuentes visibles en la web y marcadas para Google (sección Contacto).
- `llms.txt`: resumen del negocio pensado para ChatGPT, Perplexity, Claude y Gemini.
- `robots.txt` permite explícitamente a los buscadores con IA.
- `sitemap.xml` incluye todas las fotos.
- Todo el contenido está en la página aunque esté en otra pestaña, así Google lo lee completo.

## Nuevos eventos de seguimiento

- `select_page_tab`: qué pestaña del menú abren (inicio, servicios, galeria, reels, opiniones, contacto).
- `select_experience_tab`, `filter_gallery`, `gallery_show_more`, `open_reclamo_form`.
- El video de portada no cuenta como `video_start` para no inflar los datos.

## Contenido editable (sin tocar el diseño)

| Archivo | Para qué |
|---|---|
| `content/galeria.json` | Fotos de la galería: imagen, título, técnica (Manicure, Nail art o Pedicure), texto para Google y si se ve o no |
| `content/reels.json` | Reels: video, portada, texto y si se ve o no |
| `content/ajustes.json` | Mostrar u ocultar Packs y Experiencias, y cuántas fotos se ven al inicio |
| `content/packs.json` | Packs guardados para cuando los actives |

Las fotos nuevas deben subirse comprimidas (webp, máx. ~200 KB) y los videos en 720p, menos de 5 MB.

## Pendientes recomendados

- En Google Search Console: enviar `https://bloomnailssalon.com/sitemap.xml` y pedir "Solicitar indexación" de la página principal.
- Activar la actualización automática de reseñas (ver abajo).

## Reseñas de Google automáticas

El archivo `.github/workflows/actualizar-resenas.yml` consulta Google todos los días a las 6:00 a. m.
y actualiza la calificación y el número de reseñas en la web, en los datos para Google y en `llms.txt`.
Para activarlo (una sola vez):

1. En https://console.cloud.google.com crea un proyecto, activa la facturación y habilita **Places API (New)**.
2. En *APIs y servicios > Credenciales* crea una **clave de API** y restríngela solo a *Places API (New)*.
3. En GitHub, en tu repositorio: *Settings > Secrets and variables > Actions > New repository secret*,
   nombre `GOOGLE_PLACES_API_KEY`, valor: tu clave.
4. En la pestaña **Actions**, abre "Actualizar reseñas de Google" y pulsa **Run workflow** para probarlo.
   En el registro verás el número de reseñas y el *Place ID* de tu negocio. Guárdalo también como secreto
   `GOOGLE_PLACE_ID` para que la consulta sea más precisa y económica.

Una consulta al día queda dentro del uso gratuito mensual de Google. Si la clave falta o falla,
la web simplemente sigue mostrando el último número guardado.
- Confirmar la respuesta "¿Atienden sin cita?" en Preguntas frecuentes.

## Conversiones de campañas de Google Ads

La web ya registra cada clic en Reservar (WhatsApp) como `conversion_reserva_intent`, con la campaña de origen.
Además:

- **Recuerda la campaña 30 días** en el navegador de la clienta: si vio el anuncio y vuelve días después, la reserva igual se atribuye a esa campaña.
- **Agrega un código al mensaje de WhatsApp** cuando la visita viene de una campaña, por ejemplo `(ref: G-OCTUBRE)`. `G` = Google, `M` = Meta, `T` = TikTok. Las visitas que no vienen de anuncios no llevan código.
- **Mensaje en inglés para turistas:** si la visita viene de la campaña `searchen`, el mensaje de WhatsApp se abre en inglés (por ejemplo *"Hi Bloom! I would like to book a Manicure Gel appointment. (ref: G-SEARCHEN)"*). Para agregar otra campaña en inglés, súmala a `CAMPANAS_EN` en `assets/js/tracking.js`.

### Configuración (una sola vez)

1. **Vincular cuentas:** en Google Ads > Herramientas > Cuentas vinculadas, vincula tu propiedad de Google Analytics 4. Verifica que el **etiquetado automático** esté activado (Configuración de la cuenta).
2. **Marcar la conversión en GA4:** Administrar > Eventos (o Eventos clave) > marca `conversion_reserva_intent` como **evento clave**. Aparece después de que alguien haya hecho clic al menos una vez.
3. **Importarla en Google Ads:** Objetivos > Conversiones > Nueva acción de conversión > Importar > Google Analytics 4 > elige `conversion_reserva_intent`. Recuento: **Una** por clic. Déjala como acción **principal** para que las campañas optimicen hacia reservas.
4. **Nombre corto por campaña:** en cada campaña, en Configuración > Opciones de URL de la campaña > *Sufijo de URL final*, escribe por ejemplo
   `utm_source=google&utm_medium=cpc&utm_campaign=octubre`
   Sufijos de las campañas actuales:
   - G-Search_Captura_Salón_Miraflores_26: `utm_source=google&utm_medium=cpc&utm_campaign=searchsalon`
   - Bloom_Search_Visitors_EN_Miraflores_2026: `utm_source=google&utm_medium=cpc&utm_campaign=searchen`
   - Bloom_PMax_Miraflores_Prueba_2026: `utm_source=google&utm_medium=cpc&utm_campaign=pmax`

   El nombre (`octubre`) es el que aparece en el código de WhatsApp: úsalo corto, sin espacios (máximo 12 letras).

### Medir reservas reales

Quien atiende WhatsApp anota el código `ref` de cada clienta que **sí agenda** (una hoja simple: fecha, código, servicio).
A fin de mes comparas, por campaña: clics en Reservar (Google Ads o GA4) contra reservas reales (tu hoja). Así sabes cuánto te cuesta realmente cada clienta.
