// ─────────────────────────────────────────────────────────────────────────────
// CARTELA: al pasar el ratón por una tierra del mapa, su emblema, su nombre y su lema aparecen en una
// cartela en la esquina del mapa. Con el ratón fuera, se desvanece. No cambia el clic (que abre la ficha).
// ─────────────────────────────────────────────────────────────────────────────

import { crear } from './html.js';
import { emblema } from './emblemas.js';
import { TERRITORIOS } from './lugares.js';

export function montarCartela(contenedorMapa, contenido) {
  const svg = contenedorMapa.querySelector('svg');
  const cartela = crear('div', 'cartela-tierra');
  cartela.setAttribute('aria-hidden', 'true');
  contenedorMapa.parentElement.append(cartela);
  let actual = null;

  const mostrar = territorio => {
    if (territorio === actual) return;
    actual = territorio;
    if (!territorio) { cartela.classList.remove('visible'); return; }
    const entrada = contenido.entradas.get(territorio.entrada);
    const texto = crear('div', 'cartela-texto');
    texto.append(crear('p', 'cartela-nombre', territorio.titulo ?? entrada.titulo), crear('p', 'cartela-lema', `«${entrada.lema}»`),
      crear('p', 'cartela-pista', 'Clic para leer su ficha'));
    cartela.replaceChildren(emblema(territorio.id, 'emblema-tierra cartela-emblema'), texto);
    cartela.classList.add('visible');
  };

  // Se mira la forma de cada tierra bajo el puntero, aunque encima haya un rótulo o un lugar: así la cartela no
  // parpadea al cruzar marcadores. Las formas son los <path> de las tierras (#t-…) y el de la Cuenca.
  const formas = [
    ['cuenca', svg.querySelector('.zona-area[data-entrada="cuenca-del-cerco"]')],
    ['solania', svg.querySelector('#t-solania')], ['forja', svg.querySelector('#t-forja')],
    ['marjal', svg.querySelector('#t-marjal')], ['estepa', svg.querySelector('#t-estepa')],
  ].filter(([, forma]) => forma && typeof forma.isPointInFill === 'function');

  let pendiente = null;
  svg.addEventListener('pointermove', evento => {
    if (evento.pointerType === 'touch' || evento.buttons) return;          // no al arrastrar el mapa
    pendiente = evento;
    requestAnimationFrame(() => {
      if (!pendiente) return;
      const p = new DOMPoint(pendiente.clientX, pendiente.clientY).matrixTransform(svg.getScreenCTM().inverse());
      pendiente = null;
      const [id] = formas.find(([, forma]) => forma.isPointInFill(p)) ?? [];
      mostrar(TERRITORIOS.find(t => t.id === id) ?? null);
    });
  });
  svg.addEventListener('pointerleave', () => { pendiente = null; mostrar(null); });
}
