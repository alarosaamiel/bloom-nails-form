/* Bloom Nails Spa — Asistente guiado de la web (v2)
   Crea el botón «¿Te ayudo?» y el chat. Va después de tracking.js. */
(function () {
  if (document.getElementById('ab-panel')) { return; }
  var cont = document.createElement('div');
  cont.innerHTML = `<button class="ab-lanzador" id="ab-lanzador" type="button" aria-haspopup="dialog" aria-controls="ab-panel" data-track-label="Abrir asistente">
  <span class="ab-flor" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#FDFCFB" stroke-width="1.2"><ellipse cx="12" cy="7.2" rx="2.6" ry="4.2" transform="rotate(0 12 12)"/><ellipse cx="12" cy="7.2" rx="2.6" ry="4.2" transform="rotate(72 12 12)"/><ellipse cx="12" cy="7.2" rx="2.6" ry="4.2" transform="rotate(144 12 12)"/><ellipse cx="12" cy="7.2" rx="2.6" ry="4.2" transform="rotate(216 12 12)"/><ellipse cx="12" cy="7.2" rx="2.6" ry="4.2" transform="rotate(288 12 12)"/><circle cx="12" cy="12" r="1.8" fill="#FDFCFB" stroke="none"/></svg></span>
  <span id="ab-lanzador-texto">¿Te ayudo?</span>
</button>

<section class="ab-panel" id="ab-panel" role="dialog" aria-modal="false" aria-labelledby="ab-nombre" hidden>
  <div class="ab-cabeza">
    <span class="ab-flor" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#FDFCFB" stroke-width="1.2"><ellipse cx="12" cy="7.2" rx="2.6" ry="4.2" transform="rotate(0 12 12)"/><ellipse cx="12" cy="7.2" rx="2.6" ry="4.2" transform="rotate(72 12 12)"/><ellipse cx="12" cy="7.2" rx="2.6" ry="4.2" transform="rotate(144 12 12)"/><ellipse cx="12" cy="7.2" rx="2.6" ry="4.2" transform="rotate(216 12 12)"/><ellipse cx="12" cy="7.2" rx="2.6" ry="4.2" transform="rotate(288 12 12)"/><circle cx="12" cy="12" r="1.8" fill="#FDFCFB" stroke="none"/></svg></span>
    <div class="ab-titulo"><strong id="ab-nombre">Bloom Nails Spa</strong><span id="ab-sub">Asistente del salón · Miraflores</span></div>
    <button class="ab-idioma" id="ab-idioma" type="button" lang="en" aria-label="Switch to English">EN</button>
    <button class="ab-cerrar" id="ab-cerrar" type="button" aria-label="Cerrar asistente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  </div>
  <div class="ab-log" id="ab-log" role="log" aria-live="polite"></div>
  <div class="ab-pie"><span id="ab-pie-texto">¿Prefieres escribir tú?</span> <a id="ab-pie-wa" href="https://wa.me/51938578189?text=Hola%20Bloom%21" target="_blank" rel="noopener" data-track-label="Asistente: WhatsApp directo">Abre WhatsApp</a></div>
</section>`;
  while (cont.firstElementChild) { document.body.appendChild(cont.firstElementChild); }
})();

(function () {
  var WA = 'https://wa.me/51938578189?text=';
  var MAPS = 'https://maps.google.com/?cid=1905064884877981482';
  var panel = document.getElementById('ab-panel');
  var lanzador = document.getElementById('ab-lanzador');
  var log = document.getElementById('ab-log');
  var btnIdioma = document.getElementById('ab-idioma');
  var lento = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var iniciado = false;
  var datos = {};
  var idioma = 'es';

  /* ── Textos en español e inglés ── */
  var T = {
    es: {
      lanzador: '¿Te ayudo?', sub: 'Asistente del salón · Miraflores', pie: '¿Prefieres escribir tú?', pieWa: 'Abre WhatsApp', pieMsg: 'Hola Bloom!',
      cerrar: 'Cerrar asistente', cambiar: 'Switch to English', cambiarCorto: 'EN',
      hola: '¡Hola! 🌸 Bienvenida a Bloom Nails Spa, en Miraflores. Soy el asistente del salón y me gustaría ayudarte. ¿Qué te gustaría hacer?',
      masAyuda: '¿En qué más te ayudo?',
      bServicios: 'Servicios', bPrecio: 'Precio y disponibilidad', bUbicacion: 'Ubicación y horario', bReservar: 'Reservar', bMenu: 'Menú',
      bManicure: 'Manicure', bPedicure: 'Pedicure', bConviene: '¿Cuál me conviene?', bDisenos: 'Ver diseños', bLlegar: 'Cómo llegar', bWa: 'Continuar en WhatsApp',
      servicios: 'Todos nuestros servicios incluyen exfoliación, masaje, nutrición profunda y una bebida de cortesía de nuestra carta ✨ ¿Qué te interesa?',
      manicure: 'Nuestros servicios de manicure:<ul><li>Clásico</li><li>Gel (dura hasta 3 semanas)</li><li>Rubber base</li><li>Rubber + gel (máxima duración)</li><li>Kapping en polygel, acrílico o builder</li><li>Polygel con tips o molde</li><li>Uñas acrílicas</li><li>Soft gel (tipo Gel X)</li><li>Uñas híbridas</li></ul>',
      pedicure: 'Nuestros pedicures:<ul><li>Clásico: exfoliación, cutícula y esmaltado</li><li>Gel: esmaltado duradero</li></ul>',
      conviene: 'Te cuento rápido 💅<ul><li><b>Rubber base:</b> sobre tu uña natural, para mejor adherencia.</li><li><b>Soft gel:</b> tips flexibles de cobertura total, acabado natural.</li><li><b>Polygel:</b> extensiones livianas con tips o moldeadas.</li><li><b>Acrílicas:</b> uñas esculpidas, muy resistentes.</li></ul>Si aún tienes dudas, una especialista te asesora según tu tipo de uña.',
      ubicacion: '📍 C. Grimaldo del Solar 236, Miraflores\n🕐 Lunes a viernes de 11:00 a 21:00\n🕐 Sábados y domingos de 10:00 a 21:00\n\nTe recomendamos reservar para asegurar tu horario.',
      pregPrecio: '¿De qué servicio quieres saber el precio?', pregReserva: '¡Genial! ¿Qué servicio quieres reservar?', pregDia: '¿Qué día te acomoda?',
      servicios_: ['Manicure clásico', 'Manicure gel', 'Rubber base', 'Rubber + gel', 'Kapping', 'Polygel', 'Uñas acrílicas', 'Soft gel', 'Uñas híbridas', 'Pedicure clásico', 'Pedicure gel', 'Nail art', 'Aún no sé'],
      dias_: ['Hoy', 'Mañana', 'Este fin de semana', 'Otro día'],
      avisoPrecio: 'Listo 🌸 Te paso con una especialista por WhatsApp para confirmarte el precio y si hay disponibilidad. El mensaje ya va escrito, solo tienes que enviarlo.',
      avisoReserva: 'Listo 🌸 Te paso con una especialista por WhatsApp para confirmarte el horario. El mensaje ya va escrito, solo tienes que enviarlo.'
    },
    en: {
      lanzador: 'Need help?', sub: 'Salon assistant · Miraflores', pie: 'Prefer to type?', pieWa: 'Open WhatsApp', pieMsg: 'Hi Bloom!',
      cerrar: 'Close assistant', cambiar: 'Cambiar a español', cambiarCorto: 'ES',
      hola: 'Hi! 🌸 Welcome to Bloom Nails Spa in Miraflores. I’m the salon’s assistant and I’d love to help. What would you like to do?',
      masAyuda: 'Anything else I can help with?',
      bServicios: 'Services', bPrecio: 'Price and availability', bUbicacion: 'Location and hours', bReservar: 'Book', bMenu: 'Menu',
      bManicure: 'Manicure', bPedicure: 'Pedicure', bConviene: 'Which one suits me?', bDisenos: 'See designs', bLlegar: 'Get directions', bWa: 'Continue on WhatsApp',
      servicios: 'Every service includes exfoliation, massage, deep nourishment and a complimentary drink from our menu ✨ What are you interested in?',
      manicure: 'Our manicure services:<ul><li>Classic</li><li>Gel (lasts up to 3 weeks)</li><li>Rubber base</li><li>Rubber + gel (longest lasting)</li><li>Kapping in polygel, acrylic or builder</li><li>Polygel with tips or forms</li><li>Acrylic nails</li><li>Soft gel (Gel X style)</li><li>Hybrid nails</li></ul>',
      pedicure: 'Our pedicures:<ul><li>Classic: exfoliation, cuticle care and polish</li><li>Gel: long-lasting gel polish</li></ul>',
      conviene: 'A quick guide 💅<ul><li><b>Rubber base:</b> on your natural nail, for better adhesion.</li><li><b>Soft gel:</b> flexible full-cover tips, natural finish.</li><li><b>Polygel:</b> lightweight extensions with tips or forms.</li><li><b>Acrylic:</b> sculpted nails, very strong.</li></ul>Still unsure? Our specialists will recommend the best option for your nails.',
      ubicacion: '📍 C. Grimaldo del Solar 236, Miraflores, Lima\n🕐 Monday to Friday, 11:00 to 21:00\n🕐 Saturday and Sunday, 10:00 to 21:00\n\nWe recommend booking ahead to secure your time.',
      pregPrecio: 'Which service would you like a price for?', pregReserva: 'Great! Which service would you like to book?', pregDia: 'Which day works for you?',
      servicios_: ['Classic manicure', 'Gel manicure', 'Rubber base', 'Rubber + gel', 'Kapping', 'Polygel', 'Acrylic nails', 'Soft gel', 'Hybrid nails', 'Classic pedicure', 'Gel pedicure', 'Nail art', 'Not sure yet'],
      dias_: ['Today', 'Tomorrow', 'This weekend', 'Another day'],
      avisoPrecio: 'Done 🌸 I’ll connect you with a specialist on WhatsApp to confirm the price and availability. The message is already written, just send it.',
      avisoReserva: 'Done 🌸 I’ll connect you with a specialist on WhatsApp to confirm your time. The message is already written, just send it.'
    }
  };
  function t(k) { return T[idioma][k]; }

  // Mensaje que llega a WhatsApp, en ambos idiomas (i = posición del servicio y del día en las listas)
  function mensajes(tipo, si, di) {
    var esS = T.es.servicios_[si], enS = T.en.servicios_[si];
    var ultimo = T.es.servicios_.length - 1;
    var es = 'Hola Bloom! Quiero reservar ' + (si === ultimo ? 'un servicio (necesito asesoría para elegir)' : esS) +
      (di === 3 ? '' : ' para ' + T.es.dias_[di].toLowerCase()) + '.' +
      (tipo === 'precio' ? ' ¿Me confirman el precio y la disponibilidad?' : ' ¿Qué horarios tienen?');
    var en = 'Hi Bloom! I would like to book ' + (si === ultimo ? 'a service (I need advice choosing)' : 'a ' + enS) +
      (di === 3 ? '' : ' for ' + T.en.dias_[di].toLowerCase()) + '.' +
      (tipo === 'precio' ? ' Could you confirm the price and availability?' : ' What times do you have?');
    return { es: es, en: en };
  }

  function verSimulador() { if (document.getElementById('pv-sim')) { document.documentElement.classList.add('ab-con-simulador'); } }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', verSimulador); } else { verSimulador(); }

  var ICONO_WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.8 11.8 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.2z"/></svg>';

  function track(nombre, extra) { try { if (window.bloomTrack) { window.bloomTrack(nombre, extra || {}); } } catch (e) {} }
  function bajar() { log.scrollTop = log.scrollHeight; }

  function burbuja(html, quien) {
    var d = document.createElement('div');
    d.className = 'ab-msg ' + (quien === 'yo' ? 'ab-yo' : 'ab-bot');
    if (quien === 'yo') { d.textContent = html; } else { d.innerHTML = html; }
    log.appendChild(d); bajar();
  }

  function desactivarOpciones() {
    Array.prototype.forEach.call(log.querySelectorAll('.ab-opciones button'), function (b) { b.disabled = true; });
  }

  var turno = 0; // evita que respuestas pendientes aparezcan después de cambiar de idioma

  function bot(html, opciones) {
    desactivarOpciones();
    var miTurno = turno;
    var esperar = function (fin) {
      if (!lento) { fin(); return; }
      var ti = document.createElement('div'); ti.className = 'ab-escribiendo'; ti.setAttribute('aria-hidden', 'true');
      ti.innerHTML = '<i></i><i></i><i></i>'; log.appendChild(ti); bajar();
      setTimeout(function () { ti.remove(); if (miTurno === turno) { fin(); } }, 550);
    };
    esperar(function () {
      burbuja(html, 'bot');
      if (opciones && opciones.length) {
        var caja = document.createElement('div'); caja.className = 'ab-opciones';
        opciones.forEach(function (o) {
          var el;
          if (o.wa) {
            el = document.createElement('a'); el.className = 'ab-wa';
            el.href = WA + encodeURIComponent(idioma === 'en' ? o.wa.en : o.wa.es);
            el.setAttribute('data-msg-en', o.wa.en);
            el.target = '_blank'; el.rel = 'noopener'; el.innerHTML = ICONO_WA + '<span>' + o.texto + '</span>';
            el.setAttribute('data-track-label', 'Asistente: Continuar en WhatsApp');
          } else if (o.ir) {
            el = document.createElement('a'); el.className = 'ab-chip'; el.href = '#' + o.ir; el.setAttribute('data-ir', o.ir);
            el.textContent = o.texto; el.addEventListener('click', cerrar);
          } else if (o.href) {
            el = document.createElement('a'); el.className = 'ab-chip'; el.href = o.href; el.target = '_blank'; el.rel = 'noopener';
            el.textContent = o.texto;
          } else {
            el = document.createElement('button'); el.type = 'button'; el.className = 'ab-chip'; el.textContent = o.texto;
            el.addEventListener('click', function () {
              burbuja(o.texto, 'yo');
              track('chatbot_opcion', { opcion: o.texto, idioma: idioma });
              o.accion();
            });
          }
          caja.appendChild(el);
        });
        log.appendChild(caja); bajar();
        var primero = caja.querySelector('button, a'); if (primero && panel.contains(document.activeElement)) { primero.focus({ preventScroll: true }); }
      }
    });
  }

  function volver() { return { texto: t('bMenu'), accion: function () { menu(); } }; }
  function irPrecio() { return { texto: t('bPrecio'), accion: function () { datos = { tipo: 'precio' }; elegirServicio(); } }; }
  function irReserva() { return { texto: t('bReservar'), accion: function () { datos = { tipo: 'reserva' }; elegirServicio(); } }; }

  function menu(primeraVez) {
    bot(primeraVez ? t('hola') : t('masAyuda'), [
      { texto: t('bServicios'), accion: servicios }, irPrecio(),
      { texto: t('bUbicacion'), accion: ubicacion }, irReserva()
    ]);
  }
  function servicios() {
    bot(t('servicios'), [
      { texto: t('bManicure'), accion: manicure }, { texto: t('bPedicure'), accion: pedicure },
      { texto: t('bConviene'), accion: cualConviene }, { texto: t('bDisenos'), ir: 'galeria' }
    ]);
  }
  function manicure() { bot(t('manicure'), [irPrecio(), { texto: t('bConviene'), accion: cualConviene }, volver()]); }
  function pedicure() { bot(t('pedicure'), [irPrecio(), volver()]); }
  function cualConviene() { bot(t('conviene'), [irPrecio(), volver()]); }
  function ubicacion() { bot(t('ubicacion'), [{ texto: t('bLlegar'), href: MAPS }, irReserva(), volver()]); }

  function elegirServicio() {
    bot(datos.tipo === 'precio' ? t('pregPrecio') : t('pregReserva'), t('servicios_').map(function (s, i) {
      return { texto: s, accion: function () { datos.si = i; elegirDia(); } };
    }));
  }
  function elegirDia() {
    bot(t('pregDia'), t('dias_').map(function (d, i) {
      return { texto: d, accion: function () { datos.di = i; pasarAPersona(); } };
    }));
  }
  function pasarAPersona() {
    track('chatbot_a_whatsapp', { tipo: datos.tipo, servicio: T.es.servicios_[datos.si], dia: T.es.dias_[datos.di], idioma: idioma });
    bot(datos.tipo === 'precio' ? t('avisoPrecio') : t('avisoReserva'), [
      { texto: t('bWa'), wa: mensajes(datos.tipo, datos.si, datos.di) }, volver()
    ]);
  }

  function aplicarIdioma(nuevo) {
    idioma = nuevo;
    panel.setAttribute('lang', idioma);
    document.getElementById('ab-lanzador-texto').textContent = t('lanzador');
    document.getElementById('ab-sub').textContent = t('sub');
    document.getElementById('ab-pie-texto').textContent = t('pie');
    var pie = document.getElementById('ab-pie-wa');
    pie.textContent = t('pieWa'); pie.href = WA + encodeURIComponent(t('pieMsg'));
    document.getElementById('ab-cerrar').setAttribute('aria-label', t('cerrar'));
    btnIdioma.textContent = t('cambiarCorto');
    btnIdioma.setAttribute('aria-label', t('cambiar'));
    btnIdioma.setAttribute('lang', idioma === 'es' ? 'en' : 'es');
  }

  // Inglés automático si la visita viene de la campaña para turistas
  try { if (window.bloomEnIngles && window.bloomEnIngles()) { aplicarIdioma('en'); } } catch (e) {}

  btnIdioma.addEventListener('click', function () {
    aplicarIdioma(idioma === 'es' ? 'en' : 'es');
    track('chatbot_idioma', { idioma: idioma });
    turno++; log.innerHTML = ''; datos = {}; menu(true);
  });

  function abrir() {
    panel.hidden = false;
    document.documentElement.classList.add('ab-abierto', 'ab-visto');
    lanzador.setAttribute('aria-expanded', 'true');
    track('chatbot_abrir', { idioma: idioma });
    if (!iniciado) { iniciado = true; menu(true); }
    setTimeout(function () { (log.querySelector('.ab-opciones:last-child button:not([disabled]), .ab-opciones:last-child a') || document.getElementById('ab-cerrar')).focus({ preventScroll: true }); }, lento ? 650 : 50);
  }
  function cerrar() {
    panel.hidden = true;
    document.documentElement.classList.remove('ab-abierto');
    lanzador.setAttribute('aria-expanded', 'false');
  }

  lanzador.setAttribute('aria-expanded', 'false');
  lanzador.addEventListener('click', abrir);
  document.getElementById('ab-cerrar').addEventListener('click', function () { cerrar(); lanzador.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { cerrar(); lanzador.focus(); } });
  window.bloomAbrirAsistente = abrir;
})();
