// ─────────────────────────────────────────────────────────────────────────────
// HTML: tres ayudas pequeñas para crear elementos sin escribir HTML en cadenas
// (así ningún texto del contenido puede romper la página).
// ─────────────────────────────────────────────────────────────────────────────

/** crear('p', 'clase', 'texto') → <p class="clase">texto</p> */
export function crear(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto != null) elemento.textContent = texto;
  return elemento;
}

/** Enlace interno a una entrada: #/entrada/<id> */
export function enlaceA(entrada) {
  const enlace = crear('a', null, entrada.titulo);
  enlace.href = `#/entrada/${entrada.id}`;
  return enlace;
}

/**
 * Convierte un texto del contenido en párrafos: una línea en blanco separa párrafos y un salto
 * simple es un salto de línea. Cada párrafo lleva su texto dentro de un <span> (lo usa el tachado)
 * y la variable --i con su posición (la usan las animaciones para ir de uno en uno).
 */
export function parrafos(texto, clase) {
  const bloque = crear('div', clase);
  texto.split('\n\n').forEach((contenido, posicion) => {
    const parrafo = crear('p');
    parrafo.style.setProperty('--i', posicion);
    const linea = crear('span');
    contenido.split('\n').forEach((trozo, n) => {
      if (n > 0) linea.append(crear('br'));
      linea.append(trozo);
    });
    parrafo.append(linea);
    bloque.append(parrafo);
  });
  return bloque;
}

/** El ojo de Vhar, que va grabado en los sellos solarios. */
export function ojoDeVhar(color = '#7a5b46') {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 40 40');
  svg.setAttribute('aria-hidden', 'true');
  const parpado = document.createElementNS(ns, 'path');
  parpado.setAttribute('d', 'M4,20 C12,9 28,9 36,20 C28,31 12,31 4,20 Z');
  parpado.setAttribute('fill', 'none');
  parpado.setAttribute('stroke', color);
  parpado.setAttribute('stroke-width', '2.2');
  const pupila = document.createElementNS(ns, 'circle');
  pupila.setAttribute('cx', '20');
  pupila.setAttribute('cy', '20');
  pupila.setAttribute('r', '5');
  pupila.setAttribute('fill', color);
  svg.append(parpado, pupila);
  return svg;
}
