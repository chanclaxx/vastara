// ─────────────────────────────────────────────────────────────────────────────
// LÁMINA: un recorte del relieve de Blender usado como ilustración (libro, fichas, portadas).
// Si la entrada tiene su propia ilustración (campo "imagen"), se usa esa; si no, la lámina es la misma
// imagen del mapa, encuadrada con CSS.
//   lamina(elemento, x, y, ancho)  centra el punto (x, y) del mapa y enseña 'ancho' unidades del SVG
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'mapa/relieve.webp';
const ALTA = 'mapa/relieve_alta.webp';
let imagen = BASE;
const esperando = new Set();

// En cuanto la versión de alta resolución está cargada, todas las láminas pasan a usarla.
const precarga = new Image();
precarga.onload = () => {
  imagen = ALTA;
  esperando.forEach(el => { el.style.backgroundImage = `url("${ALTA}")`; });
  esperando.clear();
};
let pedida = false;
function pedirAlta() {
  if (!pedida) { pedida = true; precarga.src = ALTA; }
}

export function lamina(elemento, x, y, ancho) {
  pedirAlta();
  const caja = elemento.getBoundingClientRect();
  const proporcion = caja.width ? caja.height / caja.width : 0.7;
  const a = Math.min(ancho, 1000);
  const b = Math.min(a * proporcion, 700);
  const x0 = Math.min(Math.max(x - a / 2, 0), 1000 - a);
  const y0 = Math.min(Math.max(y - b / 2, 0), 700 - b);
  elemento.style.backgroundImage = `url("${imagen}")`;
  elemento.style.backgroundSize = `${(1000 / a) * 100}% auto`;
  elemento.style.backgroundPosition =
    `${a >= 1000 ? 0 : (x0 / (1000 - a)) * 100}% ${b >= 700 ? 0 : (y0 / (700 - b)) * 100}%`;
  if (imagen === BASE) esperando.add(elemento);
}

/**
 * Crea una ilustración: la imagen propia de la entrada si tiene campo "imagen" (ver imagenes/PROMPTS.md);
 * si no, el recorte del relieve centrado en (x, y).
 */
export function crearIlustracion(clase, entrada, x = 500, y = 350, ancho = 1000) {
  if (!entrada?.imagen) return crearLamina(clase, x, y, ancho);
  const el = document.createElement('div');
  el.className = `${clase} con-imagen`;
  el.style.backgroundImage = `url("${entrada.imagen}")`;
  return el;
}

/** Crea un elemento lámina (con la clase dada) y lo encuadra cuando ya está en la página. */
export function crearLamina(clase, x, y, ancho) {
  const el = document.createElement('div');
  el.className = clase;
  requestAnimationFrame(() => lamina(el, x, y, ancho));
  return el;
}
