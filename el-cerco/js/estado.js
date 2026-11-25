// ─────────────────────────────────────────────────────────────────────────────
// ESTADO: qué sellos ha roto este visitante y qué capas ya vio aparecer.
// Se guarda en el navegador (localStorage). Si el navegador no deja guardar, la web funciona igual
// y simplemente olvida al cerrar.
//
// Modo desarrollo: abrir la web con ?todo (por ejemplo http://localhost:8000/?todo)
// para ver todos los sellos rotos y las tres capas de cada entrada.
// ─────────────────────────────────────────────────────────────────────────────

const CLAVE_SELLOS = 'el-cerco.sellos';
const CLAVE_VISTOS = 'el-cerco.vistos';

export const modoDesarrollo = new URLSearchParams(location.search).has('todo');

const sellos = leer(CLAVE_SELLOS);
const vistos = leer(CLAVE_VISTOS);

export function selloAbierto(documentoId) {
  return modoDesarrollo || sellos.has(documentoId);
}

export function abrirSello(documentoId) {
  sellos.add(documentoId);
  guardar(CLAVE_SELLOS, sellos);
}

export function documentoAbierto(documento) {
  return documento.acceso === 'publico' || selloAbierto(documento.id);
}

/**
 * Qué capa de una entrada se ve ahora.
 * Regla del mundo: lo escrito en un pliego abierto es ley que ni el rey puede desmentir.
 * Por eso la verdad gana a la exaltación, y la exaltación a la versión oficial.
 */
export function capaDe(entrada) {
  if (entrada.verdad && selloAbierto(entrada.verdad.por)) return 'verdad';
  if (entrada.exaltada && selloAbierto(entrada.exaltada.por)) return 'exaltada';
  return 'oficial';
}

/** Devuelve true solo la primera vez que se ve esa capa de esa entrada (para animarla una sola vez). */
export function primeraVez(entradaId, capa) {
  const clave = `${entradaId}:${capa}`;
  if (modoDesarrollo || vistos.has(clave)) return false;
  vistos.add(clave);
  guardar(CLAVE_VISTOS, vistos);
  return true;
}

/** Vuelve a lacrar todo. Sirve para probar los códigos otra vez. */
export function reiniciar() {
  sellos.clear();
  vistos.clear();
  guardar(CLAVE_SELLOS, sellos);
  guardar(CLAVE_VISTOS, vistos);
}

function leer(clave) {
  try {
    return new Set(JSON.parse(localStorage.getItem(clave) ?? '[]'));
  } catch {
    return new Set();
  }
}

function guardar(clave, conjunto) {
  try {
    localStorage.setItem(clave, JSON.stringify([...conjunto]));
  } catch {
    // Sin almacenamiento (modo privado, permisos): se pierde al cerrar, nada más.
  }
}
