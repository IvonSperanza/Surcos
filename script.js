(function () {
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navegación mobile ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Reveal con entrada escalonada ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var ticking = false;

  function enPantalla(el) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.92 && r.bottom > 40;
  }

  function actualizarReveals() {
    reveals.forEach(function (el) {
      if (!el.classList.contains('in') && enPantalla(el)) el.classList.add('in');
    });
    ticking = false;
  }

  function pedirActualizar() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(actualizarReveals);
    }
  }

  if (reduce) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    reveals.forEach(function (el) {
      var hermanos = Array.prototype.slice.call(el.parentNode.children).filter(function (c) {
        return c.classList && c.classList.contains('reveal');
      });
      var i = hermanos.indexOf(el);
      el.style.transitionDelay = (i > 0 ? i * 80 : 0) + 'ms';
    });
    window.addEventListener('scroll', pedirActualizar, { passive: true });
    window.addEventListener('resize', pedirActualizar);
    window.addEventListener('load', actualizarReveals);
    actualizarReveals();
  }

  /* ---------- Animación de marca (banner) ---------- */
  var uvasG = document.getElementById('uvas');
  var botella = document.getElementById('botella');
  var charco = document.getElementById('charco');
  var satelite = document.getElementById('satelite');
  var orbita = document.getElementById('orbita');
  var haz = document.getElementById('escaneo');
  var brotes = document.querySelectorAll('.brote');
  var cover = document.getElementById('scene-card');

  if (!uvasG || !botella || !charco || !satelite || !orbita || !haz) return;

  var NS = 'http://www.w3.org/2000/svg';
  var PIVOT = { x: 840, y: 172 };
  var BOCA = { x: 654, y: 150 };
  var SUELO = 248;
  var finales = [678, 662, 641, 627, 610, 588, 569, 546, 521, 498, 463, 431, 392, 334, 268, 196, 112];

  var uvas = finales.map(function (fx, i) {
    var r = 9 + (i % 3) - 1;
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'uva');
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', r);
    c.setAttribute('class', 'malbec');
    var b = document.createElementNS(NS, 'circle');
    b.setAttribute('r', Math.max(2, r * 0.28));
    b.setAttribute('cx', -r * 0.35);
    b.setAttribute('cy', -r * 0.35);
    b.setAttribute('class', 'malbec-soft');
    b.setAttribute('opacity', '.7');
    g.appendChild(c);
    g.appendChild(b);
    uvasG.appendChild(g);
    return { el: g, fx: fx, r: r, i: i };
  });

  function t(x, y, rot) {
    return 'translate(' + x + 'px,' + y + 'px)' + (rot !== undefined ? ' rotate(' + rot + 'deg)' : '');
  }

  var anims = [];

  function play() {
    anims.forEach(function (a) { a.cancel(); });
    anims = [];

    anims.push(botella.animate([
      { transform: t(PIVOT.x, PIVOT.y, 0), easing: 'cubic-bezier(.55,0,1,.6)' },
      { transform: t(PIVOT.x, PIVOT.y, -97), offset: .72, easing: 'ease-out' },
      { transform: t(PIVOT.x, PIVOT.y, -87), offset: .86, easing: 'ease-in-out' },
      { transform: t(PIVOT.x, PIVOT.y, -90) }
    ], { duration: 1100, delay: 300, fill: 'both' }));

    anims.push(charco.animate([
      { transform: 'scaleX(0)', opacity: 0 },
      { transform: 'scaleX(.4)', opacity: .9, offset: .25 },
      { transform: 'scaleX(1)', opacity: .9 }
    ], { duration: 2200, delay: 1300, fill: 'both', easing: 'ease-out' }));

    uvas.forEach(function (u) {
      var gy = SUELO - u.r, k = u.i % 4;
      var x1 = Math.max(u.fx, BOCA.x - 12 - k * 6);
      var x2 = Math.max(u.fx, BOCA.x - 28 - k * 9);
      var x3 = Math.max(u.fx, BOCA.x - 42 - k * 12);
      var dist = BOCA.x - u.fx;
      var giro = -(dist / u.r) * 57.3;
      anims.push(u.el.animate([
        { transform: t(BOCA.x, BOCA.y, 0), opacity: 0, easing: 'cubic-bezier(.5,0,1,1)' },
        { transform: t(BOCA.x, BOCA.y, 0), opacity: 1, offset: .04, easing: 'cubic-bezier(.5,0,1,1)' },
        { transform: t(x1, gy, giro * .1), opacity: 1, offset: .3, easing: 'cubic-bezier(0,0,.4,1)' },
        { transform: t(x2, gy - 14 + (u.i % 3) * 4, giro * .25), offset: .42, easing: 'cubic-bezier(.6,0,1,1)' },
        { transform: t(x3, gy, giro * .4), offset: .54, easing: 'cubic-bezier(.15,.6,.3,1)' },
        { transform: t(u.fx, gy, giro), opacity: 1 }
      ], { duration: 1500 + dist * 3, delay: 1050 + u.i * 110, fill: 'both' }));
    });

    brotes.forEach(function (b, i) {
      anims.push(b.animate([
        { transform: 'scale(0)' },
        { transform: 'scale(1.08)', offset: .7 },
        { transform: 'scale(1)' }
      ], { duration: 700, delay: 3600 + i * 220, fill: 'both', easing: 'ease-out' }));
    });

    var largo = orbita.getTotalLength();
    var pasos = [], fin = null;
    for (var s = 0; s <= 20; s++) {
      var p = orbita.getPointAtLength(largo * (0.04 + 0.5 * s / 20));
      pasos.push({ transform: t(p.x, p.y) });
      fin = p;
    }
    anims.push(satelite.animate(pasos, { duration: 3600, delay: 200, fill: 'both', easing: 'cubic-bezier(.3,.1,.4,1)' }));

    haz.setAttribute('points', fin.x + ',' + (fin.y + 10) + ' ' + (fin.x - 150) + ',' + SUELO + ' ' + (fin.x + 40) + ',' + SUELO);
    anims.push(haz.animate([
      { opacity: 0 }, { opacity: .16, offset: .3 }, { opacity: .16, offset: .7 }, { opacity: 0 }
    ], { duration: 1400, delay: 4300, fill: 'both' }));

    if (reduce) anims.forEach(function (a) { a.finish(); });
  }

  if (cover) cover.addEventListener('click', play);
  play();
})();
