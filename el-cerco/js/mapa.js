// ─────────────────────────────────────────────────────────────────────────────
// MAPA: carga mapa/mapa.svg (relieve de Blender + capa interactiva), decide qué se ve según la
// época y los sellos, y deja acercarse y moverse por él.
//
// Reglas de visibilidad, como atributos del SVG (ver mapa_plantilla.svg):
//   data-desde · data-hasta · data-requiere · data-oculta-si · data-entrada
//
// La cámara es el viewBox del SVG: acercar = enseñar menos unidades. Con la rueda o el pellizco
// se acerca hacia el puntero; arrastrando se mueve. Al acercarse:
//   - se cambia el relieve por la versión de alta resolución (relieve_alta.webp);
//   - aparecen los rótulos de los lugares menores (clase "cerca" en el SVG);
//   - los rótulos y las líneas apenas crecen con el zoom (--k y vector-effect en mapa.css).
// ─────────────────────────────────────────────────────────────────────────────

import { selloAbierto } from './estado.js';

const CONDICIONES = '[data-desde], [data-hasta], [data-requiere], [data-oculta-si]';
const ANCHO = 1000, ALTO = 700;
const ZOOM_MAX = 7;
const ZOOM_CERCA = 1.8;           // desde aquí se ven los lugares menores
const ZOOM_ALTA = 1.5;            // desde aquí se carga el relieve de alta resolución
const RELIEVE_ALTA = 'mapa/relieve_alta.webp';

let svg = null;
const ordenDe = new Map();        // id de época → posición en la cronología
const camara = { x: ANCHO / 2, y: ALTO / 2, z: 1 };
let animacion = null;

export async function montarMapa(contenedor, epocas, alElegir) {
  const respuesta = await fetch('mapa/mapa.svg');
  contenedor.innerHTML = await respuesta.text();
  svg = contenedor.querySelector('svg');
  epocas.forEach((epoca, posicion) => ordenDe.set(epoca.id, posicion));

  // Todo lo que depende de algo empieza oculto, para que la primera pintura ya se dibuje con tinta.
  svg.querySelectorAll(CONDICIONES).forEach(elemento => elemento.classList.add('oculto'));

  let arrastrado = false;
  svg.addEventListener('pointerdown', () => { arrastrado = false; });
  svg.addEventListener('click', evento => {
    if (arrastrado) { arrastrado = false; return; }       // fue un arrastre, no un clic
    const elegido = evento.target.closest('[data-entrada]');
    if (elegido) alElegir(elegido.dataset.entrada);
  });
  activarZoom(() => { arrastrado = true; });
  aplicarCamara();
}

// ── Épocas y sellos ─────────────────────────────────────────────────────────

export function pintarMapa(epocaId) {
  const ahora = ordenDe.get(epocaId);
  for (const elemento of svg.querySelectorAll(CONDICIONES)) {
    const visible = estaVisible(elemento, ahora);
    const yaSeVeia = !elemento.classList.contains('oculto');
    elemento.classList.toggle('oculto', !visible);
    if (visible && !yaSeVeia) trazarConTinta(elemento);
  }
}

/** Subraya en el mapa lo que corresponde a la entrada abierta en el panel. */
export function resaltar(entradaId) {
  if (!svg) return;
  svg.querySelectorAll('.resaltado').forEach(elemento => elemento.classList.remove('resaltado'));
  if (!entradaId) return;
  svg.querySelectorAll(`[data-entrada="${entradaId}"]`).forEach(elemento => elemento.classList.add('resaltado'));
}

function estaVisible(elemento, ahora) {
  const { desde, hasta, requiere, ocultaSi } = elemento.dataset;
  if (desde && ahora < ordenDe.get(desde)) return false;
  if (hasta && ahora > ordenDe.get(hasta)) return false;
  if (requiere && !selloAbierto(requiere)) return false;
  if (ocultaSi && ocultaSi.split(' ').some(id => selloAbierto(id))) return false;
  return true;
}

/** Las líneas con class="trazo" se dibujan de punta a punta; las discontinuas, que no pueden, aparecen. */
function trazarConTinta(grupo) {
  const lineas = grupo.matches('.trazo') ? [grupo] : [...grupo.querySelectorAll('.trazo')];
  for (const linea of lineas) {
    const continua = getComputedStyle(linea).strokeDasharray === 'none';
    if (continua && typeof linea.getTotalLength === 'function') {
      const largo = linea.getTotalLength();
      linea.animate(
        [{ strokeDasharray: `${largo}`, strokeDashoffset: `${largo}` }, { strokeDasharray: `${largo}`, strokeDashoffset: '0' }],
        { duration: 1400, easing: 'ease-in-out' });
    } else {
      linea.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1200, easing: 'ease-out' });
    }
  }
}

// ── Cámara: acercar y mover ─────────────────────────────────────────────────

/** Lleva la cámara a (x, y) con el zoom z, con un viaje suave (o de golpe si se pide). */
export function enfocar(x, y, z = 3, suave = true) {
  const destino = limitar({ x, y, z });
  if (!suave || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Object.assign(camara, destino);
    aplicarCamara();
    return;
  }
  const origen = { ...camara };
  const inicio = performance.now();
  const duracion = 900;
  cancelAnimationFrame(animacion);
  const paso = ahora => {
    const t = Math.min((ahora - inicio) / duracion, 1);
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    camara.z = origen.z * (destino.z / origen.z) ** e;          // el zoom avanza en escala logarítmica
    camara.x = origen.x + (destino.x - origen.x) * e;
    camara.y = origen.y + (destino.y - origen.y) * e;
    aplicarCamara();
    if (t < 1) animacion = requestAnimationFrame(paso);
  };
  animacion = requestAnimationFrame(paso);
}

export function verTodo() {
  enfocar(ANCHO / 2, ALTO / 2, 1);
}

export function acercar(factor) {
  enfocar(camara.x, camara.y, camara.z * factor);
}

function limitar({ x, y, z }) {
  z = Math.min(Math.max(z, 1), ZOOM_MAX);
  const medioAncho = ANCHO / z / 2, medioAlto = ALTO / z / 2;
  return {
    z,
    x: Math.min(Math.max(x, medioAncho), ANCHO - medioAncho),
    y: Math.min(Math.max(y, medioAlto), ALTO - medioAlto),
  };
}

let altaPedida = false;
function aplicarCamara() {
  Object.assign(camara, limitar(camara));
  const ancho = ANCHO / camara.z, alto = ALTO / camara.z;
  svg.setAttribute('viewBox', `${camara.x - ancho / 2} ${camara.y - alto / 2} ${ancho} ${alto}`);
  svg.style.setProperty('--k', (camara.z ** -0.9).toFixed(3));     // rótulos casi del mismo tamaño en pantalla
  svg.classList.toggle('cerca', camara.z >= ZOOM_CERCA);
  svg.classList.toggle('lejos', camara.z < 1.2);

  if (!altaPedida && camara.z >= ZOOM_ALTA) {
    altaPedida = true;
    const imagen = new Image();
    imagen.onload = () => svg.querySelector('.relieve-3d').setAttribute('href', RELIEVE_ALTA);
    imagen.src = RELIEVE_ALTA;
  }
}

/** Convierte un punto de la pantalla en coordenadas del mapa. */
function aMapa(clienteX, clienteY) {
  const punto = new DOMPoint(clienteX, clienteY).matrixTransform(svg.getScreenCTM().inverse());
  return { x: punto.x, y: punto.y };
}

function zoomHacia(clienteX, clienteY, factor) {
  cancelAnimationFrame(animacion);
  const antes = aMapa(clienteX, clienteY);
  camara.z = Math.min(Math.max(camara.z * factor, 1), ZOOM_MAX);
  aplicarCamara();
  const despues = aMapa(clienteX, clienteY);
  camara.x += antes.x - despues.x;
  camara.y += antes.y - despues.y;
  aplicarCamara();
}

function activarZoom(marcarArrastre) {
  svg.addEventListener('wheel', evento => {
    evento.preventDefault();
    zoomHacia(evento.clientX, evento.clientY, Math.exp(-evento.deltaY * 0.0016));
  }, { passive: false });

  const punteros = new Map();
  let distanciaInicial = 0, zoomInicial = 1, recorrido = 0;

  svg.addEventListener('pointerdown', evento => {
    punteros.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
    recorrido = 0;
    if (punteros.size === 2) {
      const [a, b] = [...punteros.values()];
      distanciaInicial = Math.hypot(a.x - b.x, a.y - b.y);
      zoomInicial = camara.z;
    }
  });

  svg.addEventListener('pointermove', evento => {
    if (!punteros.has(evento.pointerId)) return;
    const anterior = punteros.get(evento.pointerId);
    punteros.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });

    if (punteros.size === 1) {                               // arrastrar
      const dx = evento.clientX - anterior.x, dy = evento.clientY - anterior.y;
      recorrido += Math.abs(dx) + Math.abs(dy);
      if (recorrido > 5) {
        svg.setPointerCapture(evento.pointerId);
        svg.classList.add('arrastrando');
        cancelAnimationFrame(animacion);
        const escala = (ANCHO / camara.z) / svg.getBoundingClientRect().width;
        camara.x -= dx * escala;
        camara.y -= dy * escala;
        aplicarCamara();
      }
    } else if (punteros.size === 2) {                        // pellizcar
      const [a, b] = [...punteros.values()];
      const distancia = Math.hypot(a.x - b.x, a.y - b.y);
      recorrido += 10;
      if (distanciaInicial > 0) {
        zoomHacia((a.x + b.x) / 2, (a.y + b.y) / 2, (zoomInicial * distancia / distanciaInicial) / camara.z);
      }
    }
  });

  const soltar = evento => {
    punteros.delete(evento.pointerId);
    if (recorrido > 5) marcarArrastre();
    if (!punteros.size) svg.classList.remove('arrastrando');
  };
  svg.addEventListener('pointerup', soltar);
  svg.addEventListener('pointercancel', soltar);
}
