/* Bloom — capa de seguimiento (GTM, GA4, Clarity, Meta Pixel).
   Misma lógica de la landing anterior, actualizada para la web v5. */
/* Bloom V4.0 Marketing Intelligence tracking layer.
   Objetivo: medir conversiones, secciones visitadas, scroll, tiempo en página,
   servicios/promociones/galería y clics clave.
   Envía eventos a:
   - dataLayer para Google Tag Manager
   - GA4 directo como fallback temporal
   - Meta Pixel cuando exista fbq
   - Microsoft Clarity cuando esté cargado por GTM
*/
(function(){
  window.dataLayer = window.dataLayer || [];
  var BLOOM_VERSION = '5.0 Nueva web';

  function cleanText(value){
    return (value || '').toString().replace(/\s+/g,' ').trim().slice(0,160);
  }

  function nowIso(){
    try { return new Date().toISOString(); } catch(e){ return ''; }
  }

  /* ── Attribution: UTMs + click IDs + referrer, persistidos por sesión ── */
  var ATTR_KEY = 'bloom_attr_v2';
  function captureAttribution(){
    try {
      var params = new URLSearchParams(window.location.search);
      var keys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid','wbraid','gbraid'];
      var found = {};
      keys.forEach(function(k){ var v = params.get(k); if(v) found[k] = v; });
      if(Object.keys(found).length){
        found.landing_page = window.location.pathname + window.location.hash;
        found.first_seen = nowIso();
        sessionStorage.setItem(ATTR_KEY, JSON.stringify(found));
      } else if(!sessionStorage.getItem(ATTR_KEY) && document.referrer){
        sessionStorage.setItem(ATTR_KEY, JSON.stringify({
          referrer: document.referrer,
          landing_page: window.location.pathname + window.location.hash,
          first_seen: nowIso()
        }));
      }
    } catch(e){}
  }
  captureAttribution();

  /* ── Campañas: se recuerdan 30 días en este navegador para atribuir reservas que llegan días después ── */
  var CAMP_KEY = 'bloom_campana_v1';
  var CAMP_DIAS = 30;
  function esCampana(a){ return !!(a && (a.gclid || a.gbraid || a.wbraid || a.fbclid || a.utm_campaign || a.utm_source)); }
  function guardarCampana(){
    try {
      var a = JSON.parse(sessionStorage.getItem(ATTR_KEY) || '{}');
      if(esCampana(a) && a.landing_page !== undefined && new URLSearchParams(window.location.search).toString()){
        a.expira = Date.now() + CAMP_DIAS * 864e5;
        localStorage.setItem(CAMP_KEY, JSON.stringify(a));
      }
    } catch(e){}
  }
  guardarCampana();
  function campanaGuardada(){
    try {
      var c = JSON.parse(localStorage.getItem(CAMP_KEY) || 'null');
      if(c && c.expira > Date.now()) return c;
      if(c) localStorage.removeItem(CAMP_KEY);
    } catch(e){}
    return null;
  }

  function limpiar(t){ return String(t || '').toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 12); }
  function codigoCampana(a){
    if(!esCampana(a)) return '';
    var fuente = String(a.utm_source || '').toLowerCase();
    var medio = String(a.utm_medium || '').toLowerCase();
    var google = a.gclid || a.gbraid || a.wbraid || fuente.indexOf('google') > -1;
    var prefijo = google ? 'G' : (a.fbclid || fuente.indexOf('instagram') > -1 || fuente.indexOf('facebook') > -1 || fuente.indexOf('meta') > -1) ? 'M' : fuente.indexOf('tiktok') > -1 ? 'T' : (limpiar(fuente).slice(0, 3) || 'W');
    var nombre = limpiar(a.utm_campaign) || (google && (a.gclid || a.gbraid || a.wbraid || medio === 'cpc') ? 'ADS' : limpiar(medio) || 'WEB');
    return prefijo + '-' + nombre;
  }

  function getAttribution(){
    var a = {};
    try { a = JSON.parse(sessionStorage.getItem(ATTR_KEY) || '{}'); } catch(e){ a = {}; }
    if(!esCampana(a)){
      var c = campanaGuardada();
      if(c){ a = Object.assign({}, c); delete a.expira; a.attribution_window = 'returning_30d'; }
    }
    var ref = codigoCampana(a);
    if(ref) a.ref_code = ref;
    return a;
  }
  window.bloomGetAttribution = getAttribution;

  /* ── Campañas para turistas: el mensaje de WhatsApp se abre en inglés ── */
  var CAMPANAS_EN = ['searchen'];
  function enIngles(a){ return CAMPANAS_EN.indexOf(String(a.utm_campaign || '').toLowerCase()) > -1; }
  window.bloomEnIngles = function(){ try { return enIngles(getAttribution()); } catch(e){ return false; } };
  function mensajeIngles(el){
    if(el.getAttribute('data-msg-en')) return el.getAttribute('data-msg-en');
    var tarjeta = el.closest('.servicio-card');
    if(tarjeta){
      var nombre = tarjeta.querySelector('.servicio-name');
      if(nombre) return 'Hi Bloom! I would like to book a ' + nombre.textContent.trim() + ' appointment.';
    }
    if(el.id === 'visor-wa'){
      var t = document.getElementById('visor-titulo');
      if(t) return 'Hi Bloom! I saw the "' + t.textContent.trim() + '" design in your gallery and I would like to book it. When are you available?';
    }
    if(el.closest('.promo-card')) return 'Hi Bloom! I am interested in this package: ' + ((el.closest('.promo-card').querySelector('.promo-name') || {}).textContent || '').trim() + '.';
    return 'Hi Bloom! I would like to book an appointment.';
  }

  /* ── Código de campaña dentro del mensaje de WhatsApp: quien atiende ve de qué campaña viene la clienta ── */
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('a[href*="wa.me"]');
    if(!el) return;
    var attr = getAttribution();
    var ref = attr.ref_code;
    if(!ref) return;
    try {
      var url = new URL(el.href);
      var texto = url.searchParams.get('text') || 'Hola Bloom!';
      if(texto.indexOf('(ref:') > -1) return;
      if(enIngles(attr)){ texto = mensajeIngles(el); }
      el.href = url.origin + url.pathname + '?text=' + encodeURIComponent(texto + ' (ref: ' + ref + ')');
    } catch(err){}
  }, true);

  function bloomTrack(eventName, params){
    params = params || {};
    params.bloom_version = params.bloom_version || BLOOM_VERSION;
    params.page_location = params.page_location || window.location.href;
    params.page_path = params.page_path || (window.location.pathname + window.location.hash);
    params.page_title = params.page_title || document.title;
    params.event_time = params.event_time || nowIso();

    var attr = getAttribution();
    if(attr && Object.keys(attr).length){
      Object.keys(attr).forEach(function(k){ if(params[k] === undefined) params[k] = attr[k]; });
    }

    try { window.dataLayer.push(Object.assign({event: eventName}, params)); } catch(e) {}
    try { if (typeof gtag === 'function') gtag('event', eventName, params); } catch(e) {}
    try { if (typeof fbq === 'function') fbq('trackCustom', eventName, params); } catch(e) {}
    try { if (typeof clarity === 'function') clarity('event', eventName); } catch(e) {}
  }
  window.bloomTrack = bloomTrack;

  function labelFor(el){
    if(!el) return '';
    return cleanText(el.getAttribute('data-track-label') || el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || el.textContent || el.href || '');
  }

  function sectionFor(el){
    var section = el && el.closest ? el.closest('section[id], footer[id], header[id], nav[id], [data-section]') : null;
    return section ? cleanText(section.getAttribute('id') || section.getAttribute('data-section') || section.className || '') : '';
  }

  function contextFor(el){
    var ctx = {};
    if(!el || !el.closest) return ctx;

    var promoCard = el.closest('.promo-card');
    if(promoCard){
      var pn = promoCard.querySelector('.promo-name');
      var price = promoCard.querySelector('.promo-price-current');
      if(pn) ctx.promo_name = cleanText(pn.textContent);
      if(price) ctx.promo_price = cleanText(price.textContent);
    }

    var servicioCard = el.closest('.servicio-card');
    if(servicioCard){
      var sn = servicioCard.querySelector('.servicio-name');
      var code = servicioCard.querySelector('.servicio-code');
      if(sn) ctx.service_name = cleanText(sn.textContent);
      if(code) ctx.service_code = cleanText(code.textContent);
    }

    var testimonioCard = el.closest('.testimonio-card');
    if(testimonioCard){
      var tn = testimonioCard.querySelector('.testimonio-name');
      if(tn) ctx.testimonial_author = cleanText(tn.textContent);
    }

    return ctx;
  }

  function isWhatsApp(href, txt){ return href.indexOf('wa.me') > -1 || href.indexOf('whatsapp') > -1 || txt.indexOf('whatsapp') > -1; }
  function isReserve(href, txt){ return txt.indexOf('reserv') > -1 || href.indexOf('reserv') > -1; }
  function isMaps(href, txt){ return href.indexOf('google.com/maps') > -1 || href.indexOf('maps.app.goo.gl') > -1 || txt.indexOf('map') > -1 || txt.indexOf('cómo llegar') > -1 || txt.indexOf('como llegar') > -1 || txt.indexOf('ubicación') > -1 || txt.indexOf('ubicacion') > -1; }
  function isReview(href, txt){ return txt.indexOf('reseña') > -1 || txt.indexOf('resena') > -1 || txt.indexOf('review') > -1 || href.indexOf('/review') > -1 || href.indexOf('cid=') > -1; }

  document.addEventListener('click', function(e){
    if(document.body.classList.contains('editing')) return; // no contaminar datos con clics de administración del sitio

    var el = e.target.closest && e.target.closest('a, button, summary, [role="button"], input[type="submit"]');
    if(!el) return;

    var hrefRaw = el.getAttribute('href') || '';
    var href = hrefRaw.toLowerCase();
    var label = labelFor(el);
    var txt = label.toLowerCase();
    var section = sectionFor(el);
    var payload = Object.assign({ label: label, link_url: hrefRaw, section: section }, contextFor(el));

    if(isWhatsApp(href, txt)){
      bloomTrack('click_whatsapp', payload);
      bloomTrack('conversion_reserva_intent', Object.assign({}, payload, {conversion_type:'whatsapp'}));
    }
    if(isReserve(href, txt)){
      bloomTrack('click_reservar', payload);
    }
    if(href.indexOf('instagram.com') > -1 || txt.indexOf('instagram') > -1){ bloomTrack('click_instagram', payload); }
    if(href.indexOf('tiktok.com') > -1 || txt.indexOf('tiktok') > -1){ bloomTrack('click_tiktok', payload); }
    if(isMaps(href, txt)){ bloomTrack('click_maps', payload); }
    if(href.indexOf('tel:') === 0){ bloomTrack('click_phone', payload); }
    if(href.indexOf('mailto:') === 0){ bloomTrack('click_email', payload); }
    if(txt.indexOf('trabaja') > -1 || txt.indexOf('únete') > -1 || txt.indexOf('unete') > -1){ bloomTrack('click_trabaja_con_nosotros', payload); }
    if(section === 'contacto' || txt.indexOf('contacto') > -1){ bloomTrack('click_contacto', payload); }
    if(section.indexOf('promo') > -1 || txt.indexOf('promo') > -1 || txt.indexOf('oferta') > -1){ bloomTrack('click_promotion', payload); }
    if(section.indexOf('galeria') > -1 || txt.indexOf('galería') > -1 || txt.indexOf('galeria') > -1){ bloomTrack('click_gallery', payload); }
    if(isReview(href, txt)){ bloomTrack('click_review', payload); }
  }, {passive:true});


  /* Scroll depth: 25/50/75/90/100 */
  var scrollDepths = [25,50,75,90,100];
  var sentScroll = {};
  function checkScroll(){
    var doc = document.documentElement;
    var body = document.body;
    var scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0;
    var viewport = window.innerHeight || doc.clientHeight || 0;
    var height = Math.max(doc.scrollHeight, body.scrollHeight, doc.offsetHeight, body.offsetHeight, doc.clientHeight);
    var percent = Math.min(100, Math.round(((scrollTop + viewport) / Math.max(height,1)) * 100));
    scrollDepths.forEach(function(depth){
      if(!sentScroll[depth] && percent >= depth){
        sentScroll[depth] = true;
        bloomTrack('scroll_depth', {scroll_depth: depth});
      }
    });
  }
  window.addEventListener('scroll', checkScroll, {passive:true});
  window.addEventListener('load', checkScroll);

  /* Tiempo de permanencia: útil para dashboard */
  [30,60,120,180,300].forEach(function(seconds){
    setTimeout(function(){ bloomTrack('engaged_time', {engaged_seconds: seconds}); }, seconds * 1000);
  });

  /* Form tracking */
  var startedForms = {};
  document.addEventListener('focusin', function(e){
    var form = e.target.closest && e.target.closest('form');
    if(!form) return;
    var label = cleanText(form.getAttribute('id') || form.getAttribute('name') || 'form');
    if(startedForms[label]) return;
    startedForms[label] = true;
    bloomTrack('form_start', {form_label: label});
  });

  document.addEventListener('submit', function(e){
    var form = e.target;
    var label = cleanText(form.getAttribute('id') || form.getAttribute('name') || form.className || 'form');
    bloomTrack('form_submit', {form_label: label});
    if(label.toLowerCase().indexOf('trabaja') > -1 || label.toLowerCase().indexOf('unete') > -1 || label.toLowerCase().indexOf('únete') > -1){
      bloomTrack('submit_job_form', {form_label: label});
    } else {
      bloomTrack('submit_contact_form', {form_label: label});
    }
  }, true);

  /* Service tabs */
  function hookServiceTabs(){
    if(typeof window.bloomSwitchService !== 'function' || window.bloomSwitchService.__bloomHooked) return;
    var original = window.bloomSwitchService;
    var wrapped = function(tab){
      bloomTrack('select_service_tab', {service_tab: tab});
      return original(tab);
    };
    wrapped.__bloomHooked = true;
    window.bloomSwitchService = wrapped;
  }
  hookServiceTabs();
  window.addEventListener('load', hookServiceTabs);
  setTimeout(hookServiceTabs, 1500);

  /* Gallery lightbox */
  document.addEventListener('click', function(e){
    var card = e.target.closest && e.target.closest('.g-card');
    if(!card || document.body.classList.contains('editing')) return;
    var label = card.querySelector('strong');
    var cat = card.querySelector('.g-caption span');
    bloomTrack('gallery_open', {
      design: label ? cleanText(label.textContent) : '',
      category: cat ? cleanText(cat.textContent) : ''
    });
  }, {passive:true});

  /* Section views + card impressions */
  if('IntersectionObserver' in window){
    var seen = new WeakSet();
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        var el = entry.target;
        if(el.matches('section[id]')){
          bloomTrack('view_section', {section: el.getAttribute('id') || ''});
        } else if(el.classList.contains('promo-card')){
          var pn = el.querySelector('.promo-name');
          bloomTrack('view_promotion', {promo_name: pn ? cleanText(pn.textContent) : ''});
        } else if(el.classList.contains('servicio-card')){
          var sn = el.querySelector('.servicio-name');
          bloomTrack('view_service', {service_name: sn ? cleanText(sn.textContent) : ''});
        } else if(el.classList.contains('testimonio-card')){
          bloomTrack('view_testimonial', {});
        }
        io.unobserve(el);
      });
    }, {threshold: 0.55});
    window.addEventListener('load', function(){
      document.querySelectorAll('section[id], .promo-card, .servicio-card, .testimonio-card').forEach(function(el){ io.observe(el); });
    });
  }

  /* Video engagement */
  function hookVideos(){
    document.querySelectorAll('video').forEach(function(video){
      if(video.__bloomHooked || video.hasAttribute('data-no-track')) return;
      video.__bloomHooked = true;
      var firedStart = false, fired25 = false, fired50 = false, fired75 = false, firedEnd = false;
      video.addEventListener('play', function(){
        if(firedStart) return;
        firedStart = true;
        bloomTrack('video_start', {video_src: video.currentSrc || video.src || ''});
      });
      video.addEventListener('timeupdate', function(){
        if(!video.duration) return;
        var p = video.currentTime / video.duration;
        if(!fired25 && p >= 0.25){ fired25 = true; bloomTrack('video_progress', {video_percent:25, video_src: video.currentSrc || video.src || ''}); }
        if(!fired50 && p >= 0.50){ fired50 = true; bloomTrack('video_progress', {video_percent:50, video_src: video.currentSrc || video.src || ''}); }
        if(!fired75 && p >= 0.75){ fired75 = true; bloomTrack('video_progress', {video_percent:75, video_src: video.currentSrc || video.src || ''}); }
      });
      video.addEventListener('ended', function(){
        if(firedEnd) return;
        firedEnd = true;
        bloomTrack('video_complete', {video_src: video.currentSrc || video.src || ''});
      });
    });
  }
  window.addEventListener('load', hookVideos);
  setTimeout(hookVideos, 1500);
  document.addEventListener('play', function(){ hookVideos(); }, true);

  window.addEventListener('load', function(){
    bloomTrack('page_ready', {bloom_version:BLOOM_VERSION});
  });
})();
