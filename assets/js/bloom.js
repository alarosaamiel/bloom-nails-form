/* ═══════════════════════════════════════════════
   BLOOM NAILS SPA — Web v5
   Pestañas, galería, reels, video, mapa y formularios.
   El contenido editable vive en /content/*.json
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  var WA = 'https://wa.me/51938578189?text=';
  var FORMSPREE_ID = 'mdavryko';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function track(nombre, datos) { if (window.bloomTrack) { try { window.bloomTrack(nombre, datos || {}); } catch (e) {} } }
  function cargarJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.json(); });
  }
  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var reducirMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── Pestañas principales (menú) ───────── */
  var paginas = $$('[data-pagina]');
  var mapa = window.__bloomMapa || {};
  var actual = window.__bloomPagina || 'inicio';

  function mostrarPagina(id, opciones) {
    opciones = opciones || {};
    if (!$('[data-pagina="' + id + '"]')) { id = 'inicio'; }
    paginas.forEach(function (p) { p.classList.toggle('activa', p.getAttribute('data-pagina') === id); });
    $$('.menu a').forEach(function (a) {
      if (a.getAttribute('data-ir') === id) { a.setAttribute('aria-current', 'page'); } else { a.removeAttribute('aria-current'); }
    });
    var enlaceActivo = $('.menu a[aria-current="page"]');
    if (enlaceActivo && enlaceActivo.scrollIntoView && window.innerWidth < 1000) {
      try { enlaceActivo.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {}
    }
    var cambio = id !== actual;
    actual = id;
    controlarPortada();
    if (opciones.historial) {
      var url = id === 'inicio' ? location.pathname + location.search : '#' + id;
      try { history.pushState({ pagina: id }, '', url); } catch (e) {}
    }
    if (opciones.desplazarA) {
      var destino = document.getElementById(opciones.desplazarA);
      if (destino) { setTimeout(function () { destino.scrollIntoView({ behavior: reducirMovimiento ? 'auto' : 'smooth', block: 'start' }); }, 30); }
    } else if (opciones.arriba !== false) {
      window.scrollTo(0, 0);
    }
    if (cambio || opciones.forzarEvento) { track('select_page_tab', { tab: id }); }
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-ir]');
    if (!a) { return; }
    if (e.metaKey || e.ctrlKey || e.shiftKey) { return; }
    e.preventDefault();
    mostrarPagina(a.getAttribute('data-ir'), { historial: true });
  });

  function seccionDesdeHash() {
    var h = (location.hash || '').replace('#', '');
    var pagina = mapa[h] || 'inicio';
    var interna = h && h !== pagina && document.getElementById(h) ? h : null;
    return { pagina: pagina, interna: interna, hash: h };
  }
  window.addEventListener('popstate', function () {
    var d = seccionDesdeHash();
    mostrarPagina(d.pagina, { desplazarA: d.interna });
  });
  (function inicial() {
    var d = seccionDesdeHash();
    mostrarPagina(d.pagina, { desplazarA: d.interna, arriba: false });
    if (d.hash === 'trabaja') { abrirTrabaja(true); }
  })();

  /* ───────── Pestañas internas (Bloom Experience y servicios) ───────── */
  function activarPestanas(lista, pestanaSel, alCambiar) {
    var tabs = $$(pestanaSel, lista);
    function elegir(tab, enfocar) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) { panel.classList.toggle('activo', on); }
      });
      if (enfocar) { tab.focus(); }
      if (alCambiar) { alCambiar(tab); }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { elegir(t); });
      t.addEventListener('keydown', function (e) {
        var j = null;
        if (e.key === 'ArrowRight') { j = (i + 1) % tabs.length; }
        if (e.key === 'ArrowLeft') { j = (i - 1 + tabs.length) % tabs.length; }
        if (e.key === 'Home') { j = 0; }
        if (e.key === 'End') { j = tabs.length - 1; }
        if (j !== null) { e.preventDefault(); elegir(tabs[j], true); }
      });
    });
    return elegir;
  }
  var listaExp = $('#bloom-experience [role="tablist"]');
  if (listaExp) {
    activarPestanas(listaExp, '.pestana', function (tab) {
      $$('#bloom-experience video').forEach(function (v) { v.pause(); });
      track('select_experience_tab', { tab: tab.textContent.trim() });
    });
  }
  // Servicios: se expone bloomSwitchService para que el seguimiento registre select_service_tab
  var listaServicios = $('#servicios [role="tablist"]');
  if (listaServicios) {
    var elegirServicio = activarPestanas(listaServicios, '.servicio-tab');
    window.bloomSwitchService = function (nombre) {
      var t = $('#servicios .servicio-tab[data-tab="' + nombre + '"]');
      if (t) { elegirServicio(t); }
      return false;
    };
    $$('#servicios .servicio-tab').forEach(function (t) {
      t.addEventListener('click', function () { window.bloomSwitchService(t.getAttribute('data-tab')); });
    });
  }

  /* ───────── Video de portada ───────── */
  var videoPortada = $('.portada-video');
  var portadaLista = false;
  function ahorroDeDatos() {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return !!(c && (c.saveData || /2g/.test(c.effectiveType || '')));
  }
  function controlarPortada() {
    if (!videoPortada) { return; }
    if (actual !== 'inicio') { videoPortada.pause(); return; }
    if (reducirMovimiento || ahorroDeDatos()) { return; }
    if (!portadaLista) {
      var movil = window.matchMedia('(max-width: 767px)').matches;
      videoPortada.src = movil ? videoPortada.getAttribute('data-src-movil') : videoPortada.getAttribute('data-src');
      videoPortada.muted = true;
      videoPortada.setAttribute('muted', '');
      videoPortada.playsInline = true;
      videoPortada.preload = 'auto';
      portadaLista = true;
      videoPortada.addEventListener('playing', function () { var p = $('.portada-poster'); if (p) { p.style.visibility = 'hidden'; } }, { once: true });
    }
    var r = videoPortada.play();
    if (r && r.catch) { r.catch(function () {}); }
  }
  // Se inicia cuando la página terminó de cargar, para no competir con el contenido principal
  if (document.readyState === 'complete') { controlarPortada(); }
  else { window.addEventListener('load', controlarPortada); }
  document.addEventListener('visibilitychange', function () {
    if (!videoPortada) { return; }
    if (document.hidden) { videoPortada.pause(); } else { controlarPortada(); }
  });

  /* ───────── Videos que cargan al tocar (Experience 03 y reels) ───────── */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.poster-btn[data-video]');
    if (!b) { return; }
    $$('video').forEach(function (v) { if (v !== videoPortada) { v.pause(); } });
    var v = document.createElement('video');
    v.src = b.getAttribute('data-video');
    var img = b.querySelector('img');
    if (img) { v.poster = img.currentSrc || img.src; }
    v.controls = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.preload = 'auto';
    v.setAttribute('aria-label', b.getAttribute('aria-label') || 'Video');
    b.replaceWith(v);
    var r = v.play();
    if (r && r.catch) { r.catch(function () {}); }
  });

  /* ───────── Ajustes: secciones que se muestran u ocultan ───────── */
  cargarJSON('/content/ajustes.json').then(function (aj) {
    $$('[data-opcional]').forEach(function (s) {
      s.hidden = !aj[s.getAttribute('data-opcional')];
    });
    if (aj.mostrar_packs) { cargarPacks(); }
    if (aj.resenas_google) {
      var nota = Number(aj.calificacion_google || 4.9);
      var tn = $('#g-nota'), tt = $('#g-total');
      if (tn) { tn.textContent = nota.toFixed(1).replace('.', ','); }
      if (tt) { tt.textContent = aj.resenas_google; }
      $$('script[type="application/ld+json"]').forEach(function (sc) {
        try {
          var d = JSON.parse(sc.textContent);
          if (d.aggregateRating) { d.aggregateRating.reviewCount = String(aj.resenas_google); d.aggregateRating.ratingValue = String(nota); sc.textContent = JSON.stringify(d); }
        } catch (e) {}
      });
    }
    if (aj.fotos_visibles_al_inicio) { porPagina = aj.fotos_visibles_al_inicio; pintarGaleria(); }
  }).catch(function () {});

  function cargarPacks() {
    cargarJSON('/content/packs.json').then(function (d) {
      var cont = $('#lista-packs');
      if (!cont) { return; }
      cont.innerHTML = (d.packs || []).filter(function (p) { return p.visible !== false; }).map(function (p) {
        return '<article class="promo-card">' +
          (p.etiqueta ? '<span class="promo-tag">' + esc(p.etiqueta) + '</span>' : '') +
          '<h3 class="promo-name">' + esc(p.titulo) + '</h3>' +
          '<p class="texto-suave">' + esc(p.descripcion) + '</p>' +
          '<a class="enlace" target="_blank" rel="noopener" href="' + WA + encodeURIComponent('Hola Bloom! Me interesa el pack ' + p.titulo) + '">Reservar este pack</a>' +
          '</article>';
      }).join('');
    }).catch(function () {});
  }

  /* ───────── Galería ───────── */
  var fotos = [];
  var filtro = 'todas';
  var porPagina = 12;
  var mostrandoTodas = false;
  var visibles = [];
  var rejilla = $('#rejilla-galeria');
  var verMas = $('#ver-mas');

  function pintarGaleria() {
    if (!rejilla) { return; }
    var filtradas = fotos.filter(function (f) { return f.visible !== false && (filtro === 'todas' || f.tecnica === filtro); });
    visibles = mostrandoTodas ? filtradas : filtradas.slice(0, porPagina);
    rejilla.innerHTML = visibles.map(function (f, i) {
      return '<figure class="g-card">' +
        '<button type="button" data-foto="' + i + '" aria-label="Ver en grande: ' + esc(f.titulo) + '">' +
        '<img src="' + esc(f.imagen) + '" alt="' + esc(f.descripcion_seo || f.titulo) + '" loading="lazy" decoding="async"' +
        (f.ancho ? ' width="' + f.ancho + '" height="' + f.alto + '"' : '') + '>' +
        '</button>' +
        '<figcaption class="g-caption"><span>' + esc(f.tecnica) + '</span><strong>' + esc(f.titulo) + '</strong></figcaption>' +
        '</figure>';
    }).join('');
    if (verMas) { verMas.hidden = mostrandoTodas || filtradas.length <= porPagina; }
  }
  function ocultarFiltrosVacios() {
    $$('#filtros-galeria .chip').forEach(function (b) {
      var f = b.getAttribute('data-filtro');
      if (f === 'todas') { return; }
      b.hidden = !fotos.some(function (x) { return x.visible !== false && x.tecnica === f; });
    });
  }
  cargarJSON('/content/galeria.json').then(function (d) { fotos = d.fotos || []; ocultarFiltrosVacios(); pintarGaleria(); }).catch(function () {
    if (rejilla) { rejilla.innerHTML = '<p class="texto-suave">No pudimos cargar la galería. Míranos en Instagram.</p>'; }
  });
  $$('#filtros-galeria .chip').forEach(function (b) {
    b.addEventListener('click', function () {
      filtro = b.getAttribute('data-filtro');
      mostrandoTodas = false;
      $$('#filtros-galeria .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      pintarGaleria();
      track('filter_gallery', { filtro: filtro });
    });
  });
  if (verMas) { verMas.addEventListener('click', function () { mostrandoTodas = true; pintarGaleria(); track('gallery_show_more', {}); }); }

  /* Visor */
  var visor = $('#visor');
  var indiceVisor = 0;
  function abrirDialogo(d) {
    if (!d) { return; }
    if (typeof d.showModal === 'function') { d.showModal(); } else { d.setAttribute('open', ''); }
    document.documentElement.style.overflow = 'hidden';
  }
  function cerrarDialogo(d) {
    if (!d) { return; }
    if (typeof d.close === 'function' && d.open) { d.close(); } else { d.removeAttribute('open'); }
    document.documentElement.style.overflow = '';
  }
  function mostrarFoto(i) {
    if (!visibles.length) { return; }
    indiceVisor = (i + visibles.length) % visibles.length;
    var f = visibles[indiceVisor];
    $('#visor-img').src = f.imagen;
    $('#visor-img').alt = f.descripcion_seo || f.titulo;
    $('#visor-titulo').textContent = f.titulo;
    $('#visor-wa').href = WA + encodeURIComponent('Hola Bloom! Vi en su galería el diseño "' + f.titulo + '" (' + f.tecnica + ') y me gustaría reservarlo. ¿Cuándo tienen disponibilidad?');
  }
  if (rejilla) {
    rejilla.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-foto]');
      if (!b) { return; }
      mostrarFoto(parseInt(b.getAttribute('data-foto'), 10));
      abrirDialogo(visor);
    });
  }
  if ($('#visor-ant')) { $('#visor-ant').addEventListener('click', function () { mostrarFoto(indiceVisor - 1); }); }
  if ($('#visor-sig')) { $('#visor-sig').addEventListener('click', function () { mostrarFoto(indiceVisor + 1); }); }
  if (visor) {
    var x0 = null;
    visor.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener('touchend', function (e) {
      if (x0 === null) { return; }
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) { mostrarFoto(indiceVisor + (dx < 0 ? 1 : -1)); }
      x0 = null;
    }, { passive: true });
  }

  /* Cerrar diálogos */
  $$('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) { cerrarDialogo(d); } });
    d.addEventListener('close', function () { document.documentElement.style.overflow = ''; });
    $$('[data-cerrar]', d).forEach(function (b) { b.addEventListener('click', function () { cerrarDialogo(d); }); });
  });

  /* ───────── Reels ───────── */
  cargarJSON('/content/reels.json').then(function (d) {
    var cont = $('#lista-reels');
    if (!cont) { return; }
    var reels = (d.reels || []).filter(function (r) { return r.visible !== false && r.video; });
    cont.innerHTML = reels.map(function (r) {
      return '<div class="reel">' +
        '<button class="poster-btn" type="button" data-video="' + esc(r.video) + '" aria-label="Reproducir: ' + esc(r.titulo) + '">' +
        (r.portada ? '<img src="' + esc(r.portada) + '" alt="" loading="lazy" decoding="async">' : '') +
        '<span class="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z" fill="#FDFCFB"/></svg></span>' +
        '</button><p>' + esc(r.titulo) + '</p></div>';
    }).join('') +
      '<div class="reel-cta"><p>Más reels en nuestras redes</p>' +
      '<a class="btn btn-claro" href="https://www.instagram.com/bloomnailsmiraflores/" target="_blank" rel="noopener">Instagram</a>' +
      '<a class="btn btn-claro" href="https://www.tiktok.com/@bloomnailsmiraflores" target="_blank" rel="noopener">TikTok</a></div>';
  }).catch(function () {});

  /* ───────── Mapa (se carga solo al tocarlo) ───────── */
  var botonMapa = $('#cargar-mapa');
  if (botonMapa) {
    botonMapa.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Bloom Nails Spa, C. Grimaldo del Solar 236, Miraflores, Lima') + '&output=embed';
      f.title = 'Mapa de Bloom Nails Spa en Miraflores';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.setAttribute('allowfullscreen', '');
      botonMapa.replaceWith(f);
      track('click_maps', { label: 'Ver mapa', section: 'contacto' });
    });
  }

  /* ───────── Formularios (Formspree, igual que antes) ───────── */
  function enviar(datos) {
    return fetch('https://formspree.io/f/' + FORMSPREE_ID, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(datos)
    });
  }
  function valor(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function marcado(nombre) { var el = $('input[name="' + nombre + '"]:checked'); return el ? el.value : ''; }
  function mostrarError(id, texto) { var el = document.getElementById(id); if (el) { el.textContent = texto; el.hidden = !texto; } }

  function abrirTrabaja(forzar) {
    var caja = $('#caja-trabaja');
    var b = $('#abrir-trabaja');
    if (!caja || !b) { return; }
    var abrir = forzar === true ? true : caja.hidden;
    caja.hidden = !abrir;
    b.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    if (abrir) { setTimeout(function () { caja.scrollIntoView({ behavior: reducirMovimiento ? 'auto' : 'smooth', block: 'start' }); }, 40); }
  }
  if ($('#abrir-trabaja')) { $('#abrir-trabaja').addEventListener('click', function () { abrirTrabaja(); }); }

  var formTrabaja = $('#trabajaForm');
  if (formTrabaja) {
    formTrabaja.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = { nombre: valor('tj-nombre'), telefono: valor('tj-telefono'), correo: valor('tj-email'), experiencia: marcado('experiencia'), horario: marcado('horario') };
      var falta = !d.nombre ? 'tu nombre completo' : !d.telefono ? 'tu teléfono' : !d.correo ? 'tu correo electrónico' : !d.experiencia ? 'tus años de experiencia' : !d.horario ? 'tu interés de horario' : '';
      if (falta) { mostrarError('tj-error', 'Por favor completa ' + falta + '.'); return; }
      mostrarError('tj-error', '');
      var btn = $('#tj-enviar');
      btn.disabled = true; btn.textContent = 'Enviando…';
      var attr = (window.bloomGetAttribution && window.bloomGetAttribution()) || {};
      enviar({ _subject: 'Nueva postulante — Bloom Nails Spa', _replyto: d.correo, nombre: d.nombre, telefono: d.telefono, correo: d.correo, experiencia: d.experiencia, horario: d.horario, origen: JSON.stringify(attr) })
        .then(function (r) {
          if (!r.ok) { throw new Error('http_' + r.status); }
          formTrabaja.hidden = true;
          $('#trabajaSuccess').hidden = false;
          track('submit_job_form', { form_label: 'trabajaForm', experiencia: d.experiencia, horario: d.horario });
        })
        .catch(function (err) {
          btn.disabled = false; btn.textContent = 'Enviar postulación';
          mostrarError('tj-error', 'No pudimos enviar tu postulación. Revisa tu conexión e intenta de nuevo.');
          track('error_form', { form_label: 'trabajaForm', reason: String(err && err.message || 'error') });
        });
    });
  }

  var libro = $('#reclamoModal');
  if ($('#abrir-libro')) { $('#abrir-libro').addEventListener('click', function () { abrirDialogo(libro); track('open_reclamo_form', {}); }); }
  var formLibro = $('#reclamoForm');
  if (formLibro) {
    formLibro.addEventListener('submit', function (e) {
      e.preventDefault();
      var req = [['lr-nombre', 'tu nombre completo'], ['lr-dni', 'tu DNI o CE'], ['lr-domicilio', 'tu domicilio'], ['lr-telefono', 'tu teléfono'], ['lr-email', 'tu correo electrónico'], ['lr-descripcion', 'la descripción del producto o servicio'], ['lr-detalle', 'el detalle de tu reclamación'], ['lr-pedido', 'tu pedido']];
      for (var i = 0; i < req.length; i++) {
        if (!valor(req[i][0])) { mostrarError('lr-error', 'Por favor completa ' + req[i][1] + '.'); document.getElementById(req[i][0]).focus(); return; }
      }
      mostrarError('lr-error', '');
      var btn = $('#lr-submit-btn');
      btn.disabled = true; btn.textContent = 'Enviando…';
      var fecha = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
      enviar({
        _subject: 'Nuevo Reclamo/Queja — Libro de Reclamaciones — Bloom Nails Spa', _replyto: valor('lr-email'),
        formulario: 'Libro de Reclamaciones', fecha: fecha, nombre: valor('lr-nombre'), dni_ce: valor('lr-dni'), domicilio: valor('lr-domicilio'),
        telefono: valor('lr-telefono'), email: valor('lr-email'), apoderado: valor('lr-apoderado') || '(no aplica)',
        tipo_bien: marcado('lr-tipobien') || '(no especificado)', descripcion: valor('lr-descripcion'), monto_reclamado: valor('lr-monto') || '(no especificado)',
        tipo_reclamo: marcado('lr-tiporeclamo') || '(no especificado)', detalle: valor('lr-detalle'), pedido: valor('lr-pedido')
      }).then(function (r) {
        if (!r.ok) { throw new Error('http_' + r.status); }
        formLibro.hidden = true;
        $('#lr-success').hidden = false;
        track('submit_reclamo_form', { form_label: 'reclamoModal' });
      }).catch(function (err) {
        btn.disabled = false; btn.textContent = 'Enviar reclamación';
        mostrarError('lr-error', 'No pudimos enviar tu reclamación. Revisa tu conexión e intenta de nuevo.');
        track('error_form', { form_label: 'reclamoModal', reason: String(err && err.message || 'error') });
      });
    });
  }
})();
