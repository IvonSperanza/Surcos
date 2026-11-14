(function () {
  'use strict';

  var STORE_KEY = 'surco-productor-v1';

  var LOTES = {
    'SC-2026-0417': { nombre: 'La Arboleda', cobertura: 87 },
    'SC-2026-0418': { nombre: 'La Cañada', cobertura: 78 },
    'SC-2026-0419': { nombre: 'El Sauce', cobertura: 92 }
  };

  var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  var PARCELAS = [
    {
      id: 'p1', nombre: 'Parcela 1', ha: '1,2 ha', cultivo: 'Tomate', cobertura: '84%',
      desnudo: '26 días', humedad: 'Media-baja (0,24)', ndvi: '0,64 · HLS 12 oct',
      tono: 'atencion', anterior: 'Tomate', sugerido: 'Vicia + avena',
      motivo: 'La leguminosa fija nitrógeno y la avena cubre el suelo en invierno, cuando más erosión hay.',
      ventana: '15 abr – 30 may 2027',
      cambios: ['Sembrar cobertura invernal antes del 15 may.', 'Evitar labranza profunda tras la cosecha.', 'Dejar rastrojo en superficie hasta la siembra.']
    },
    {
      id: 'p2', nombre: 'Parcela 2', ha: '0,8 ha', cultivo: 'Lechuga', cobertura: '89%',
      desnudo: '14 días', humedad: 'Media (0,27)', ndvi: '0,71 · HLS 12 oct',
      tono: 'bien', anterior: 'Lechuga', sugerido: 'Maíz dulce',
      motivo: 'Rompe el ciclo de plagas de la lechuga y tiene demanda de mercados B2B en primavera.',
      ventana: '10 sep – 20 oct 2027',
      cambios: ['Mantener el rastrojo actual.', 'Rotar con maíz dulce en la próxima campaña.']
    },
    {
      id: 'p3', nombre: 'Parcela 3', ha: '1,0 ha', cultivo: 'Acelga', cobertura: '76%',
      desnudo: '34 días', humedad: 'Baja (0,21)', ndvi: '0,58 · HLS 12 oct',
      tono: 'mejorar', anterior: 'Acelga', sugerido: 'Descanso con trébol + siembra directa',
      motivo: 'Recupera materia orgánica y evita la erosión en una parcela con cobertura baja.',
      ventana: '1 may – 15 jul 2027',
      cambios: ['Pasar a siembra directa, sin labranza.', 'Sembrar trébol como cobertura.', 'Corregir pH de 6,8 a 6,2 con azufre.']
    },
    {
      id: 'p4', nombre: 'Parcela 4', ha: '0,6 ha', cultivo: 'Frutilla', cobertura: '92%',
      desnudo: '9 días', humedad: 'Alta (0,31)', ndvi: '0,75 · HLS 12 oct',
      tono: 'bien', anterior: 'Frutilla', sugerido: 'Trigo de cobertura',
      motivo: 'El trigo deja rastrojo, reduce la erosión y aporta materia orgánica antes del próximo ciclo.',
      ventana: '20 jun – 10 ago 2027',
      cambios: ['Dejar el rastrojo de trigo tras la cosecha.', 'Evitar el tránsito pesado sobre suelo húmedo.']
    },
    {
      id: 'p5', nombre: 'Parcela 5', ha: '1,0 ha', cultivo: 'Vid', cobertura: '98%',
      desnudo: '3 días', humedad: 'Media (0,26)', ndvi: '0,78 · HLS 12 oct',
      tono: 'bien', anterior: 'Vid', sugerido: 'Mantener cobertura entre filas',
      motivo: 'La vid es perenne: no rota, pero la cobertura entre filas protege el suelo todo el año.',
      ventana: 'Todo el año',
      cambios: ['Mantener la cobertura entre filas durante el invierno.', 'Controlar la maleza sin labranza profunda.']
    }
  ];

  var CHECKS = [
    'Sembrar cobertura invernal en P1 y P2 antes del 15 may.',
    'Pasar la P3 a siembra directa, sin labranza.',
    'Corregir el pH de la P3 (6,8 → 6,2) con azufre.',
    'Mantener cobertura entre filas de vid todo el invierno.',
    'Dejar el rastrojo de trigo en P4 después de la cosecha.'
  ];

  var ORDER_STATES = {
    pendiente: { label: 'Pendiente', cls: 'state-pendiente', icon: 'clock' },
    confirmado: { label: 'Confirmado', cls: 'state-confirmado', icon: 'check' },
    preparando: { label: 'En preparación', cls: 'state-preparando', icon: 'box' },
    entregado: { label: 'Entregado', cls: 'state-entregado', icon: 'truck' },
    pagado: { label: 'Pagado', cls: 'state-pagado', icon: 'money' },
    cancelado: { label: 'Cancelado', cls: 'state-cancelado', icon: 'x' }
  };

  var ORDER_ACTIONS = {
    pendiente: { label: 'Confirmar pedido', next: 'confirmado' },
    confirmado: { label: 'Marcar en preparación', next: 'preparando' },
    preparando: { label: 'Marcar entregado', next: 'entregado' },
    entregado: { label: 'Registrar pago', next: 'pagado' }
  };

  var BUYER_CHIP = {
    'Mercado': 'chip-carrot',
    'PyME': 'chip-oliva',
    'Súper': 'chip-sky',
    'Consumidor final': 'chip-corn'
  };

  var TYPE_CHIP = {
    'Hortalizas': 'chip-oliva',
    'Frutas': 'chip-carrot',
    'Vinos': 'chip-eggplant',
    'Granos': 'chip-corn'
  };

  var ICON = {
    check: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    box: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8l9-5 9 5-9 5z"/><path d="M3 8v8l9 5 9-5V8"/></svg>',
    truck: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 4h14v11H1z"/><path d="M15 8h4l3 3v4h-7"/><circle cx="5" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
    money: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  function seedState() {
    return {
      version: 1,
      nextProduct: 5,
      nextOrder: 1043,
      nextPayment: 90,
      reservaAceptada: false,
      parcelaActiva: 'p1',
      maduracion: {
        rubro: 'frutas',
        brix: '23.5',
        firmeza: 'Media · 22 mm',
        humedad: '13.8',
        ventana: '15–30 abr 2027',
        actualizado: '14 nov 2026'
      },
      checks: {},
      products: [
        { n: 1, tipo: 'Hortalizas', cultivo: 'Bolsón de estación', lote: 'SC-2026-0417', plantacion: '2026-08-12', cosecha: '2026-10-12', reparto: '2026-10-13', quimicos: 'Ninguno', destino: 'Consumidor final', precio: 4800, unidad: 'bolsón' },
        { n: 2, tipo: 'Frutas', cultivo: 'Cajón de frutillas', lote: 'SC-2026-0417', plantacion: '2026-07-20', cosecha: '2026-10-10', reparto: '2026-10-11', quimicos: 'Cobre (1 aplicación)', destino: 'Súper', precio: 6200, unidad: 'cajón' },
        { n: 3, tipo: 'Vinos', cultivo: 'Malbec de La Arboleda', lote: 'SC-2026-0419', plantacion: '2019-09-15', cosecha: '2026-03-22', reparto: '2026-04-05', quimicos: 'Azufre y cobre', destino: 'Mercado', precio: 9500, unidad: 'botella' },
        { n: 4, tipo: 'Hortalizas', cultivo: 'Acelga de la quinta', lote: 'SC-2026-0418', plantacion: '2026-09-05', cosecha: '2026-11-08', reparto: '2026-11-09', quimicos: 'Ninguno', destino: 'PyME', precio: 2100, unidad: 'atado' }
      ],
      orders: [
        { id: 'PED-1042', comprador: 'Mercado del Puerto', tipo: 'Mercado', detalle: '40 bolsones + 10 cajones', fecha: '2026-10-14', total: 254000, estado: 'pendiente' },
        { id: 'PED-1041', comprador: 'Verde Cerca', tipo: 'PyME', detalle: '24 botellas de Malbec', fecha: '2026-10-12', total: 228000, estado: 'confirmado' },
        { id: 'PED-1040', comprador: 'La Huerta', tipo: 'Súper', detalle: '18 cajones de frutillas', fecha: '2026-10-10', total: 111600, estado: 'preparando' },
        { id: 'PED-1039', comprador: 'Grupo de vecinos', tipo: 'Consumidor final', detalle: '12 bolsones de estación', fecha: '2026-10-07', total: 57600, estado: 'entregado' },
        { id: 'PED-1038', comprador: 'Mercado Central', tipo: 'Mercado', detalle: '30 kg de acelga', fecha: '2026-10-02', total: 45000, estado: 'pagado' },
        { id: 'PED-1037', comprador: 'Bodega Sur', tipo: 'PyME', detalle: '12 botellas de Malbec', fecha: '2026-09-28', total: 114000, estado: 'pagado' }
      ],
      payments: [
        { id: 'PAG-089', fecha: '2026-10-11', concepto: 'Pedido PED-1040 · al entregar', pedido: 'PED-1040', medio: 'Transferencia', monto: 111600, estado: 'pendiente' },
        { id: 'PAG-088', fecha: '2026-10-09', concepto: 'Pedido PED-1038 · acelga', pedido: 'PED-1038', medio: 'Transferencia', monto: 45000, estado: 'acreditado' },
        { id: 'PAG-087', fecha: '2026-10-03', concepto: 'Pedido PED-1037 · Malbec', pedido: 'PED-1037', medio: 'Transferencia', monto: 114000, estado: 'acreditado' },
        { id: 'PAG-086', fecha: '2026-09-28', concepto: 'Seña reserva Malbec', pedido: '', medio: 'Mercado Pago', monto: 57000, estado: 'acreditado' }
      ]
    };
  }

  var state = loadState() || seedState();
  var currentFilter = 'todos';
  var lastFocus = null;
  var toastTimer = null;

  function loadState() {
    var raw;
    try { raw = window.localStorage.getItem(STORE_KEY); } catch (e) { return null; }
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      return parsed && parsed.version === 1 ? parsed : null;
    } catch (e) { return null; }
  }

  function save() {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* demo sin persistencia */ }
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function pad(num, size) {
    var s = String(num);
    while (s.length < size) s = '0' + s;
    return s;
  }

  function pasaporte(n) { return 'SUR-2026-' + pad(n, 4); }

  function money(n) {
    return '$ ' + Math.round(Number(n) || 0).toLocaleString('es-AR');
  }

  function hoyISO() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2);
  }

  function fmtDate(iso) {
    if (!iso) return '';
    var parts = String(iso).split('-');
    if (parts.length !== 3) return iso;
    var m = parseInt(parts[1], 10) - 1;
    if (m < 0 || m > 11) return iso;
    return parseInt(parts[2], 10) + ' ' + MESES[m] + ' ' + parts[0];
  }

  function qrState(product) {
    var lote = LOTES[product.lote];
    return lote && lote.cobertura >= 85 ? 'verificado' : 'pendiente';
  }

  function chipState(def) {
    var node = el('span', 'state ' + def.cls);
    node.innerHTML = ICON[def.icon] + '<span>' + def.label + '</span>';
    return node;
  }

  function orderStateEl(kind) { return chipState(ORDER_STATES[kind]); }

  function qrStateEl(kind) {
    var def = kind === 'verificado'
      ? { label: 'Verificado', cls: 'state-verificado', icon: 'check' }
      : { label: 'QR pendiente', cls: 'state-revision', icon: 'clock' };
    return chipState(def);
  }

  function payStateEl(estado) {
    var def = estado === 'acreditado'
      ? { label: 'Acreditado', cls: 'state-pagado', icon: 'money' }
      : { label: 'Pendiente', cls: 'state-pendiente', icon: 'clock' };
    return chipState(def);
  }

  /* ---------- Navegación ---------- */
  function showView(name) {
    var views = document.querySelectorAll('.view');
    for (var i = 0; i < views.length; i++) {
      views[i].classList.toggle('is-active', views[i].getAttribute('data-view') === name);
    }
    var navs = document.querySelectorAll('.nav-item');
    for (var j = 0; j < navs.length; j++) {
      navs[j].classList.toggle('is-active', navs[j].getAttribute('data-view') === name);
    }
    window.history.replaceState(null, '', '#' + name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (name === 'productos') showProductTab('lista');
  }

  function showProductTab(tab) {
    var tabs = document.querySelectorAll('[data-prod-tab]');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].hidden = tabs[i].getAttribute('data-prod-tab') !== tab;
    }
    document.getElementById('new-product-btn').hidden = tab !== 'lista';
    document.getElementById('back-products-btn').hidden = tab !== 'nuevo';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tab === 'nuevo') {
      document.getElementById('p-cultivo').focus({ preventScroll: true });
    }
  }

  /* ---------- KPIs ---------- */
  function renderKpis() {
    var pendientes = state.orders.filter(function (o) { return o.estado === 'pendiente'; }).length;
    document.getElementById('kpi-pendientes').textContent = pendientes;
    document.getElementById('kpi-pendientes-foot').textContent = pendientes === 1 ? 'Esperando confirmación' : (pendientes === 0 ? 'Sin pedidos nuevos' : 'Esperando confirmación');

    var badge = document.getElementById('nav-pedidos-badge');
    badge.textContent = pendientes;
    badge.hidden = pendientes === 0;

    var cobrado = state.payments.reduce(function (acc, p) { return p.estado === 'acreditado' ? acc + p.monto : acc; }, 0);
    var aCobrar = state.payments.reduce(function (acc, p) { return p.estado === 'pendiente' ? acc + p.monto : acc; }, 0);
    document.getElementById('kpi-cobrado').textContent = money(cobrado);
    document.getElementById('kpi-acobrar').textContent = 'A cobrar ' + money(aCobrar);
    document.getElementById('w-cobrado').textContent = money(cobrado);
    document.getElementById('w-acobrar').textContent = money(aCobrar);
  }

  function renderResumenPedidos() {
    var box = document.getElementById('resumen-pedidos');
    box.innerHTML = '';
    var abiertos = state.orders.filter(function (o) {
      return o.estado === 'pendiente' || o.estado === 'confirmado' || o.estado === 'preparando';
    }).slice(0, 3);

    if (!abiertos.length) {
      box.appendChild(el('p', 'mini-order-empty', 'No hay pedidos abiertos. Todo entregado y cobrado.'));
      return;
    }

    abiertos.forEach(function (o) {
      var row = el('div', 'mini-order');
      var info = el('div');
      info.appendChild(el('p', 'mini-order-buyer', o.comprador));
      info.appendChild(el('p', 'mini-order-detail', o.id + ' · ' + o.detalle + ' · ' + fmtDate(o.fecha)));
      row.appendChild(info);
      row.appendChild(el('span', 'mini-order-total', money(o.total)));
      row.appendChild(orderStateEl(o.estado));
      box.appendChild(row);
    });
  }

  /* ---------- Productos ---------- */
  function renderProducts() {
    var list = document.getElementById('products-list');
    list.innerHTML = '';
    var count = state.products.length;
    document.getElementById('productos-count').textContent = count + (count === 1 ? ' producto' : ' productos');

    state.products.forEach(function (p) {
      var card = el('article', 'prod-item');
      card.setAttribute('data-n', p.n);

      var top = el('div', 'prod-item-top');
      var left = el('div');
      var chipCls = TYPE_CHIP[p.tipo] || 'chip-oliva';
      left.appendChild(el('span', 'chip ' + chipCls, p.tipo));
      left.appendChild(el('span', 'prod-id', pasaporte(p.n)));
      top.appendChild(left);
      top.appendChild(qrStateEl(qrState(p)));
      card.appendChild(top);

      card.appendChild(el('h3', null, p.cultivo));

      var params = el('dl', 'prod-params');
      addParam(params, 'Plantación', fmtDate(p.plantacion));
      addParam(params, 'Químicos', p.quimicos);
      addParam(params, 'Cosecha', fmtDate(p.cosecha));
      addParam(params, 'Reparto', fmtDate(p.reparto) + ' · ' + p.destino);
      card.appendChild(params);

      var foot = el('div', 'prod-foot');
      if (p.precio) {
        var tag = el('span', 'price-tag price-tag-inline', money(p.precio));
        if (p.unidad) tag.appendChild(el('em', null, ' / ' + p.unidad));
        foot.appendChild(tag);
      } else {
        foot.appendChild(el('span', 'small', 'Precio a definir'));
      }

      var btn = el('button', 'btn btn-cream btn-sm', 'Ver QR');
      btn.type = 'button';
      btn.setAttribute('data-qr', p.n);
      foot.appendChild(btn);
      card.appendChild(foot);
      list.appendChild(card);
    });
  }

  function addParam(dl, label, value) {
    var wrap = el('div');
    wrap.appendChild(el('dt', null, label));
    wrap.appendChild(el('dd', null, value));
    dl.appendChild(wrap);
  }

  function findProduct(n) {
    for (var i = 0; i < state.products.length; i++) {
      if (String(state.products[i].n) === String(n)) return state.products[i];
    }
    return null;
  }

  /* ---------- Pedidos ---------- */
  function renderOrders() {
    var list = document.getElementById('orders-list');
    list.innerHTML = '';

    var counts = { todos: state.orders.length, pendiente: 0, confirmado: 0, preparando: 0, entregado: 0, pagado: 0 };
    state.orders.forEach(function (o) { counts[o.estado] = (counts[o.estado] || 0) + 1; });
    var countNodes = document.querySelectorAll('[data-count]');
    for (var i = 0; i < countNodes.length; i++) {
      countNodes[i].textContent = counts[countNodes[i].getAttribute('data-count')] || 0;
    }

    var demo = document.querySelector('[data-view="pedidos"] .demo-inline');
    if (demo) demo.textContent = 'Datos de demostración · ' + state.orders.length + ' pedidos';

    var filtered = currentFilter === 'todos' ? state.orders : state.orders.filter(function (o) { return o.estado === currentFilter; });

    if (!filtered.length) {
      list.appendChild(el('p', 'order-empty', 'No hay pedidos en este estado.'));
      return;
    }

    filtered.forEach(function (o) {
      var card = el('article', 'order-card');

      var top = el('div', 'order-top');
      top.appendChild(el('span', 'order-id', o.id));
      top.appendChild(orderStateEl(o.estado));
      card.appendChild(top);

      var info = el('div');
      info.appendChild(el('p', 'order-buyer', o.comprador));
      info.appendChild(el('p', 'order-items', o.detalle));
      card.appendChild(info);
      card.appendChild(el('p', 'order-total', money(o.total)));

      var meta = el('div', 'order-meta');
      meta.appendChild(el('span', null, fmtDate(o.fecha)));
      meta.appendChild(el('span', 'chip ' + (BUYER_CHIP[o.tipo] || 'chip-oliva'), o.tipo));
      if (o.tipo === 'Mercado') meta.appendChild(el('span', null, '· transporte propio'));
      card.appendChild(meta);

      var actions = el('div', 'order-actions');
      var action = ORDER_ACTIONS[o.estado];
      if (action) {
        var btn = el('button', 'btn btn-sm ' + (o.estado === 'pendiente' ? 'btn-primary' : 'btn-cream'), action.label);
        btn.type = 'button';
        btn.setAttribute('data-advance', o.id);
        actions.appendChild(btn);
      } else if (o.estado === 'pagado') {
        actions.appendChild(el('span', 'small', 'Cobrado y cerrado'));
      }
      card.appendChild(actions);
      list.appendChild(card);
    });
  }

  function advanceOrder(id) {
    var order = null;
    for (var i = 0; i < state.orders.length; i++) {
      if (state.orders[i].id === id) { order = state.orders[i]; break; }
    }
    if (!order) return;
    var action = ORDER_ACTIONS[order.estado];
    if (!action) return;

    if (action.next === 'pagado') registerPayment(order);
    order.estado = action.next;
    save();
    renderKpis();
    renderResumenPedidos();
    renderOrders();
    renderPayments();
    toast('Pedido ' + order.id + ' → ' + ORDER_STATES[order.estado].label);
  }

  function registerPayment(order) {
    var existing = null;
    for (var i = 0; i < state.payments.length; i++) {
      if (state.payments[i].pedido === order.id && state.payments[i].estado === 'pendiente') {
        existing = state.payments[i];
        break;
      }
    }
    if (existing) {
      existing.estado = 'acreditado';
      existing.fecha = hoyISO();
      existing.concepto = 'Pedido ' + order.id + ' · cobro al entregar';
      return;
    }
    state.payments.unshift({
      id: 'PAG-' + pad(state.nextPayment++, 3),
      fecha: hoyISO(),
      concepto: 'Pedido ' + order.id + ' · cobro al entregar',
      pedido: order.id,
      medio: 'Transferencia',
      monto: order.total,
      estado: 'acreditado'
    });
  }

  /* ---------- Pagos ---------- */
  function renderPayments() {
    var body = document.getElementById('pagos-body');
    body.innerHTML = '';

    var acreditados = state.payments.filter(function (p) { return p.estado === 'acreditado'; });
    var cobrado = acreditados.reduce(function (acc, p) { return acc + p.monto; }, 0);
    var pendiente = state.payments.filter(function (p) { return p.estado === 'pendiente'; })
      .reduce(function (acc, p) { return acc + p.monto; }, 0);
    var avg = acreditados.length ? Math.round(cobrado / acreditados.length) : 0;

    document.getElementById('pay-total').textContent = money(cobrado);
    document.getElementById('pay-pending').textContent = money(pendiente);
    document.getElementById('pay-avg').textContent = money(avg);
    document.getElementById('pay-count').textContent = acreditados.length + (acreditados.length === 1 ? ' acreditado' : ' acreditados');

    state.payments.forEach(function (p) {
      var tr = document.createElement('tr');
      tr.appendChild(el('td', 'dato', p.id));
      tr.appendChild(el('td', null, fmtDate(p.fecha)));
      tr.appendChild(el('td', null, p.concepto));
      tr.appendChild(el('td', null, p.medio));
      tr.appendChild(el('td', 'pay-row-monto', money(p.monto)));
      var td = document.createElement('td');
      td.appendChild(payStateEl(p.estado));
      tr.appendChild(td);
      body.appendChild(tr);
    });
  }

  /* ---------- Mi lote ---------- */
  function renderParcelas() {
    var active = state.parcelaActiva || 'p1';
    var nodes = document.querySelectorAll('.parcel');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].classList.toggle('is-active', nodes[i].getAttribute('data-parcela') === active);
    }
    renderParcelaDetalle(active);
    renderRotPlan();
  }

  function renderParcelaDetalle(id) {
    var container = document.getElementById('parcela-detalle');
    var p = null;
    for (var i = 0; i < PARCELAS.length; i++) {
      if (PARCELAS[i].id === id) { p = PARCELAS[i]; break; }
    }
    if (!p) return;
    container.innerHTML = '';

    container.appendChild(el('p', 'parcela-kicker', p.nombre + ' · ' + p.ha));
    container.appendChild(el('h2', 'parcela-title', p.cultivo));

    var toneLabel = p.tono === 'bien' ? 'Bien' : (p.tono === 'atencion' ? 'Atención' : 'A mejorar');
    var toneChip = p.tono === 'bien' ? 'chip-oliva' : (p.tono === 'atencion' ? 'chip-corn' : 'chip-carrot');
    container.appendChild(el('span', 'chip ' + toneChip, toneLabel + ': ' + p.cobertura + ' cobertura'));

    var stats = el('dl', 'parcela-stats');
    addParam(stats, 'Suelo desnudo', p.desnudo);
    addParam(stats, 'Humedad', p.humedad);
    addParam(stats, 'Último NDVI', p.ndvi);
    addParam(stats, 'Cultivo anterior', p.anterior);
    container.appendChild(stats);

    var reco = el('div', 'reco');
    reco.appendChild(el('p', 'reco-label', 'Sugerencia de rotación'));
    reco.appendChild(el('p', 'reco-title', p.sugerido));
    reco.appendChild(el('p', null, p.motivo));
    reco.appendChild(el('p', 'small', 'Ventana: ' + p.ventana));
    container.appendChild(reco);

    var checks = el('ul', 'mini-checks');
    p.cambios.forEach(function (c) { checks.appendChild(el('li', null, c)); });
    container.appendChild(checks);

    var btn = el('button', 'btn btn-lime btn-sm btn-block parcela-cta', 'Programar esta rotación');
    btn.type = 'button';
    btn.addEventListener('click', function () {
      toast('Rotación de ' + p.nombre + ' programada para la campaña 2027.');
    });
    container.appendChild(btn);
  }

  function renderRotPlan() {
    var tbody = document.getElementById('rot-plan');
    tbody.innerHTML = '';
    PARCELAS.forEach(function (p) {
      var tr = document.createElement('tr');
      tr.appendChild(el('td', 'dato', p.nombre));
      tr.appendChild(el('td', null, p.anterior));
      tr.appendChild(el('td', null, p.sugerido));
      tr.appendChild(el('td', null, p.ventana));
      tbody.appendChild(tr);
    });
  }

  function renderChecks() {
    var list = document.getElementById('check-list');
    list.innerHTML = '';
    var done = 0;
    CHECKS.forEach(function (texto, i) {
      var id = 'c' + i;
      var label = el('label');
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('data-check', id);
      input.checked = !!state.checks[id];
      if (input.checked) done++;
      label.appendChild(input);
      label.appendChild(el('span', null, texto));
      list.appendChild(label);
    });
    document.getElementById('checks-count').textContent = done + ' de ' + CHECKS.length;
  }

  /* ---------- Maduración ---------- */
  function renderMaduracion() {
    var m = state.maduracion;
    document.getElementById('mad-rubro').value = m.rubro;
    document.getElementById('mad-brix').value = m.brix;
    document.getElementById('mad-firmeza').value = m.firmeza;
    document.getElementById('mad-humedad').value = m.humedad;
    document.getElementById('mad-ventana').value = m.ventana;
    document.getElementById('mad-updated').textContent = 'Medición en campo · ' + m.actualizado;
    applyRubro(m.rubro);
  }

  function applyRubro(rubro) {
    var groups = document.querySelectorAll('.mad-group');
    for (var i = 0; i < groups.length; i++) {
      var rubros = groups[i].getAttribute('data-rubros').split(' ');
      groups[i].hidden = rubros.indexOf(rubro) === -1;
    }
  }

  function saveMaduracion() {
    state.maduracion = {
      rubro: document.getElementById('mad-rubro').value,
      brix: document.getElementById('mad-brix').value,
      firmeza: document.getElementById('mad-firmeza').value,
      humedad: document.getElementById('mad-humedad').value,
      ventana: document.getElementById('mad-ventana').value,
      actualizado: fmtDate(hoyISO())
    };
    save();
    renderMaduracion();
    toast('Parámetros de maduración actualizados.');
  }

  /* ---------- Reserva anticipada ---------- */
  function updateReserva() {
    var btn = document.getElementById('accept-reserva');
    var note = document.getElementById('reserva-note');
    if (state.reservaAceptada) {
      btn.textContent = 'Reserva aceptada';
      btn.disabled = true;
      btn.classList.remove('btn-lime');
      btn.classList.add('btn-cream');
      note.textContent = 'Reserva de 200 kg de tomate confirmada. Seña del 30% a cobrar.';
    } else {
      btn.textContent = 'Aceptar reserva anticipada';
      btn.disabled = false;
      btn.classList.add('btn-lime');
      btn.classList.remove('btn-cream');
      note.textContent = 'Reserva de 200 kg de tomate. Sin datos personales.';
    }
  }

  function acceptReserva() {
    if (state.reservaAceptada) return;
    state.reservaAceptada = true;
    var order = {
      id: 'PED-' + state.nextOrder++,
      comprador: 'Mercado del Puerto',
      tipo: 'Mercado',
      detalle: 'Reserva anticipada · 200 kg de tomate',
      fecha: hoyISO(),
      total: 240000,
      estado: 'confirmado'
    };
    state.orders.unshift(order);
    state.payments.unshift({
      id: 'PAG-' + pad(state.nextPayment++, 3),
      fecha: hoyISO(),
      concepto: 'Seña 30% reserva anticipada',
      pedido: order.id,
      medio: 'Mercado Pago',
      monto: 72000,
      estado: 'pendiente'
    });
    save();
    updateReserva();
    renderKpis();
    renderResumenPedidos();
    renderOrders();
    renderPayments();
    toast('Reserva aceptada. Se creó el pedido ' + order.id + '.');
  }

  /* ---------- QR ---------- */
  function renderQr(container, text, size) {
    container.innerHTML = '';
    if (window.QRCode) {
      new window.QRCode(container, {
        text: text,
        width: size,
        height: size,
        colorDark: '#1f2a1c',
        colorLight: '#fdfaf0',
        correctLevel: window.QRCode.CorrectLevel.M
      });
      return;
    }
    container.appendChild(fallbackQr(text, size));
  }

  function fallbackQr(text, size) {
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    var modules = 29;
    var cell = size / modules;
    var seed = 7;
    for (var i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) % 9973;

    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }

    ctx.fillStyle = '#fdfaf0';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#1f2a1c';

    for (var y = 0; y < modules; y++) {
      for (var x = 0; x < modules; x++) {
        if (inFinder(x, y, modules)) continue;
        if (rnd() > 0.55) ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    drawFinder(ctx, cell, 2, 2);
    drawFinder(ctx, cell, modules - 9, 2);
    drawFinder(ctx, cell, 2, modules - 9);
    return canvas;
  }

  function inFinder(x, y, modules) {
    return (x < 9 && y < 9) || (x > modules - 10 && y < 9) || (x < 9 && y > modules - 10);
  }

  function drawFinder(ctx, cell, ox, oy) {
    ctx.fillStyle = '#1f2a1c';
    ctx.fillRect(ox * cell, oy * cell, 7 * cell, 7 * cell);
    ctx.fillStyle = '#fdfaf0';
    ctx.fillRect((ox + 1) * cell, (oy + 1) * cell, 5 * cell, 5 * cell);
    ctx.fillStyle = '#1f2a1c';
    ctx.fillRect((ox + 2) * cell, (oy + 2) * cell, 3 * cell, 3 * cell);
  }

  function openQr(product) {
    if (!product) return;
    var modal = document.getElementById('qr-modal');
    var id = pasaporte(product.n);
    document.getElementById('qr-title').textContent = product.cultivo;
    document.getElementById('qr-id').textContent = id;
    document.getElementById('qr-url').textContent = 'surco.app/p/' + id;

    var stateBox = document.getElementById('qr-state');
    stateBox.innerHTML = '';
    stateBox.appendChild(qrStateEl(qrState(product)));

    renderQr(document.getElementById('qr-box'), 'https://surco.app/p/' + id, 168);
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('qr-close').focus();
  }

  function closeQr() {
    var modal = document.getElementById('qr-modal');
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    document.getElementById('qr-box').innerHTML = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function downloadQr() {
    var box = document.getElementById('qr-box');
    var canvas = box.querySelector('canvas');
    var img = box.querySelector('img');
    var url = canvas ? canvas.toDataURL('image/png') : (img && img.src);
    if (!url) return;
    var id = document.getElementById('qr-id').textContent;
    var a = document.createElement('a');
    a.href = url;
    a.download = id + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* ---------- Alta de producto ---------- */
  function formValue(id) {
    var node = document.getElementById(id);
    return node ? node.value.trim() : '';
  }

  function showFormError(message) {
    var box = document.getElementById('form-error');
    box.textContent = message;
    box.hidden = false;
  }

  function hideFormError() {
    var box = document.getElementById('form-error');
    box.hidden = true;
    box.textContent = '';
  }

  function validateProduct(data) {
    if (!data.cultivo) return 'Completá el nombre del cultivo o producto.';
    if (!data.quimicos) return 'Indicá qué químicos se aplicaron. Si no hubo, escribí "Ninguno".';
    if (!data.plantacion || !data.cosecha || !data.reparto) return 'Completá las tres fechas: plantación, cosecha y reparto.';
    if (data.cosecha < data.plantacion) return 'La cosecha no puede ser anterior a la plantación.';
    if (data.reparto < data.cosecha) return 'El reparto no puede ser anterior a la cosecha.';
    return '';
  }

  function onProductSubmit(e) {
    e.preventDefault();
    hideFormError();

    var data = {
      tipo: formValue('p-tipo'),
      cultivo: formValue('p-cultivo'),
      lote: formValue('p-lote'),
      plantacion: formValue('p-plantacion'),
      cosecha: formValue('p-cosecha'),
      quimicos: formValue('p-quimicos'),
      reparto: formValue('p-reparto'),
      destino: formValue('p-destino'),
      precio: Number(formValue('p-precio')) || 0,
      unidad: formValue('p-unidad')
    };

    var error = validateProduct(data);
    if (error) { showFormError(error); return; }

    var n = state.nextProduct++;
    var product = {
      n: n, tipo: data.tipo, cultivo: data.cultivo, lote: data.lote,
      plantacion: data.plantacion, cosecha: data.cosecha, reparto: data.reparto,
      quimicos: data.quimicos, destino: data.destino, precio: data.precio, unidad: data.unidad
    };
    state.products.unshift(product);
    save();

    e.target.reset();
    document.getElementById('p-tipo').value = 'Hortalizas';
    document.getElementById('p-lote').value = 'SC-2026-0417';
    document.getElementById('p-destino').value = 'Consumidor final';

    renderProducts();
    renderKpis();
    showProductTab('lista');

    var card = document.querySelector('.prod-item[data-n="' + n + '"]');
    if (card) {
      card.classList.add('is-new');
      window.setTimeout(function () { card.classList.remove('is-new'); }, 1600);
    }

    var qr = qrState(product);
    toast('Producto agregado a la lista. QR ' + (qr === 'verificado' ? 'emitido' : 'en revisión') + '.');
  }

  /* ---------- Toast ---------- */
  function toast(message) {
    var node = document.getElementById('toast');
    node.textContent = message;
    node.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { node.classList.remove('show'); }, 3400);
  }

  /* ---------- Render general ---------- */
  function renderAll() {
    renderKpis();
    renderResumenPedidos();
    renderProducts();
    renderOrders();
    renderPayments();
    renderChecks();
    renderParcelas();
    renderMaduracion();
    updateReserva();
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', function (e) {
    var backBtn = e.target.closest('[data-prod-back]');
    if (backBtn) { showProductTab('lista'); return; }

    var viewBtn = e.target.closest('button[data-view]');
    if (viewBtn) { showView(viewBtn.getAttribute('data-view')); return; }

    var qrBtn = e.target.closest('[data-qr]');
    if (qrBtn) { openQr(findProduct(qrBtn.getAttribute('data-qr'))); return; }

    var advanceBtn = e.target.closest('[data-advance]');
    if (advanceBtn) { advanceOrder(advanceBtn.getAttribute('data-advance')); return; }
  });

  document.getElementById('order-filters').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-filter]');
    if (!btn) return;
    currentFilter = btn.getAttribute('data-filter');
    var filters = this.querySelectorAll('.filter');
    for (var i = 0; i < filters.length; i++) filters[i].classList.toggle('is-active', filters[i] === btn);
    renderOrders();
  });

  document.getElementById('check-list').addEventListener('change', function (e) {
    var input = e.target.closest('[data-check]');
    if (!input) return;
    state.checks[input.getAttribute('data-check')] = input.checked;
    save();
    var done = Object.keys(state.checks).filter(function (k) { return state.checks[k]; }).length;
    document.getElementById('checks-count').textContent = done + ' de ' + CHECKS.length;
  });

  var parcelNodes = document.querySelectorAll('.parcel');
  for (var i = 0; i < parcelNodes.length; i++) {
    parcelNodes[i].addEventListener('click', onParcelSelect);
    parcelNodes[i].addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onParcelSelect.call(this); }
    });
  }

  function onParcelSelect() {
    state.parcelaActiva = this.getAttribute('data-parcela');
    save();
    renderParcelas();
  }

  document.getElementById('mad-rubro').addEventListener('change', function () {
    applyRubro(this.value);
  });

  document.getElementById('mad-save').addEventListener('click', saveMaduracion);
  document.getElementById('accept-reserva').addEventListener('click', acceptReserva);
  document.getElementById('producto-form').addEventListener('submit', onProductSubmit);
  document.getElementById('new-product-btn').addEventListener('click', function () { showProductTab('nuevo'); });

  document.getElementById('reset-demo').addEventListener('click', function () {
    if (!window.confirm('¿Reiniciar la demo con los datos iniciales?')) return;
    state = seedState();
    save();
    currentFilter = 'todos';
    var filters = document.querySelectorAll('.filter');
    for (var f = 0; f < filters.length; f++) {
      filters[f].classList.toggle('is-active', filters[f].getAttribute('data-filter') === 'todos');
    }
    showView('resumen');
    renderAll();
    toast('Demo reiniciada.');
  });

  document.getElementById('qr-close').addEventListener('click', closeQr);
  document.getElementById('qr-done').addEventListener('click', closeQr);
  document.getElementById('qr-download').addEventListener('click', downloadQr);
  document.getElementById('qr-modal').addEventListener('click', function (e) {
    if (e.target === this) closeQr();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeQr();
  });

  var initial = (window.location.hash || '').replace('#', '');
  if (initial && document.querySelector('.view[data-view="' + initial + '"]')) showView(initial);

  renderAll();
})();
