// ─────────────────────────────────────────────────────────────────────────────
// CONTENIDO: lee los JSON de /contenido. No sabe nada de cómo se muestran.
//
//   contenido.entradas  Map id → entrada (facciones, lugares, personajes, costumbres, épocas, documentos)
//   contenido.epocas    las épocas en orden, para la cronología y el mapa
//   contenido.codigos   los códigos que da el juego (contenido/codigos.json)
// ─────────────────────────────────────────────────────────────────────────────

export async function cargarContenido() {
  const indice = await leerJson('contenido/indice.json');
  const lista = await Promise.all(indice.entradas.map(ruta => leerJson(`contenido/${ruta}`)));
  const entradas = new Map(lista.map(entrada => [entrada.id, entrada]));
  const epocas = indice.epocas.map(id => entradas.get(id));
  const { codigos } = await leerJson('contenido/codigos.json');
  return { entradas, epocas, codigos, portada: indice.portada };
}

/** Las entradas de un tipo, en el orden del índice. */
export function entradasDeTipo(contenido, tipo) {
  return [...contenido.entradas.values()].filter(entrada => entrada.tipo === tipo);
}

/** Las entradas que un documento cambia (las que tienen una capa "por" ese documento). */
export function entradasQueCambia(contenido, documentoId) {
  return [...contenido.entradas.values()].filter(entrada =>
    entrada.verdad?.por === documentoId || entrada.exaltada?.por === documentoId);
}

async function leerJson(ruta) {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) throw new Error(`No se pudo leer ${ruta} (${respuesta.status})`);
  return respuesta.json();
}
