# Panel de contenido de Bloom — Guía

Con esto tu administradora puede subir fotos y reels desde el celular o la computadora,
verlos en una **vista previa** y recién después **publicarlos** en bloomnailssalon.com.

```
Panel (Pages CMS) ──guarda──▶ rama "borrador" ──▶ Vista previa (Cloudflare, privada)
                                     │
                         botón "Publicar en la web"
                                     ▼
                              rama "main" ──▶ bloomnailssalon.com (GitHub Pages)
```

---

## Parte 1 · Configuración (la haces tú una sola vez, ~30 minutos)

### 1. Publica primero la web v5
Si aún no lo hiciste, sube el contenido de `bloom-web-v5.zip` a tu repositorio y haz Push.

### 2. Agrega los archivos del panel
1. Descomprime `bloom-panel.zip` **dentro** de la carpeta de tu repositorio.
   Son archivos y carpetas ocultas (`.pages.yml`, `.github`). En Windows activa *Ver > Elementos ocultos* para verlos.
2. En GitHub Desktop: commit `Panel de contenido` y **Push origin**.
3. Al hacer Push se crea sola la rama **borrador** (tarda 1 minuto). Puedes verla en GitHub, en el selector de ramas.

### 3. Permisos en GitHub (en la web de github.com, dentro de tu repositorio)
1. **Settings > Actions > General > Workflow permissions**: marca *Read and write permissions* y guarda.
2. **Settings > Pages**: confirma que la fuente sea *Deploy from a branch*, rama **main**, carpeta **/ (root)**.
3. **Settings > General > Default branch**: cámbiala a **borrador**. Así el panel siempre abre el borrador y nadie edita la web real por error.

> Desde ahora, si tú haces cambios con GitHub Desktop, trabaja también en **borrador** y publica con el mismo botón. Si alguna vez subes algo directo a main, se copia solo al borrador.

### 4. Vista previa privada (Cloudflare, gratis)
1. Crea una cuenta en https://dash.cloudflare.com
2. Ve a **Workers & Pages > Crear > Pages > Conectar con Git** y autoriza tu cuenta de GitHub.
3. Elige tu repositorio y configura:
   - Rama de producción: **borrador**
   - Framework: **Ninguno**
   - Comando de compilación: *(vacío)*
   - Directorio de salida: **/**
4. Guarda. Cloudflare te dará una dirección tipo `https://bloom-nails.pages.dev`. **Esa es la vista previa**: compártela con tu administradora.
   Google no la indexa (lo evita el archivo `_headers`), así que no compite con tu web real.

### 5. Panel (Pages CMS, gratis)
1. Entra a https://app.pagescms.org y elige **Iniciar sesión con GitHub**.
2. Instala la aplicación de Pages CMS **solo en tu repositorio** de la web.
3. Abre el repositorio en el panel (debe decir rama **borrador**).
4. En **Colaboradores**, invita el correo de tu administradora. **Ella no necesita cuenta de GitHub**: entra con el enlace que le llega por correo.

### 6. Prueba juntas
Sube una foto de prueba, espera 3 minutos, revísala en la vista previa y pulsa **Publicar en la web**.
Si algo no funciona, en GitHub > pestaña **Actions** verás qué paso falló.

---

## Parte 2 · Guía rápida para la administradora

**Subir una foto a la galería**
1. Entra al panel y abre **Galería de fotos**.
2. Pulsa **Agregar** al final de la lista (o arrástrala arriba para que salga primero).
3. Sube la foto, escribe el **nombre del diseño**, elige la **técnica** y activa **Mostrar en la web**.
4. Opcional: escribe la descripción para Google, por ejemplo *"Uñas acrílicas rojas en Miraflores - Bloom Nails Spa"*.
5. Pulsa **Guardar**.

**Subir un reel**
1. Abre **Reels** y pulsa **Agregar**.
2. Sube el video **vertical** (ideal: menos de 60 segundos), escribe el texto y activa **Mostrar en la web**.
3. La portada es opcional: si no subes una, se crea sola.
4. Pulsa **Guardar**.

**Ocultar sin borrar**: desactiva **Mostrar en la web**. Para editar una etiqueta, cambia el texto y guarda.

**Actualizar las reseñas de Google**: una vez al mes, en **Secciones de la web**, cambia la cantidad de reseñas (y la calificación si cambió) por la que muestra Google, y publica.

**Revisar y publicar**
1. Espera **unos 3 minutos** después de guardar: en ese tiempo las fotos y videos se optimizan solos y la vista previa se actualiza.
2. Abre la **vista previa** y revisa cómo quedó (en el celular también).
3. Si todo está bien, en el panel pulsa **Publicar en la web** y confirma. En 1 o 2 minutos aparece en bloomnailssalon.com.

**Consejos**
- Fotos: con buena luz, sin filtros fuertes. Puedes subirlas tal cual sale del celular: se achican solas.
- Videos: grábalos en 1080p (no 4K) para que suban más rápido. Se comprimen solos a 720p.
- Si te equivocas antes de publicar, simplemente corrige y guarda: nada llega a la web hasta pulsar Publicar.
