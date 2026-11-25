// ─────────────────────────────────────────────────────────────────────────────
// HISTORIA: la crónica del arciprestazgo, como un libro de dos páginas.
//   Pliego 0: portada e índice.   Pliegos 1..7: un capítulo por época.
//   Página izquierda: capítulo, año, título y lámina (un recorte del relieve).
//   Página derecha: el texto, en la capa que toque (los pliegos abiertos lo tachan).
// Se pasa de página con las flechas, el teclado (← →) o deslizando el dedo.
// ─────────────────────────────────────────────────────────────────────────────

import { cuerpoDe } from './panel.js';
import { crear, ojoDeVhar } from './html.js';
import { crearIlustracion } from './lamina.js';

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

let raiz, hoja, izquierda, derecha, indicador, contenido;
let actual = 0;

export function montarHistoria(contenedor, datos) {
  contenido = datos;
  raiz = crear('div', 'libro');
  const atras = crear('button', 'pasar atras', '‹');
  const adelante = crear('button', 'pasar adelante', '›');
  atras.setAttribute('aria-label', 'Página anterior');
  adelante.setAttribute('aria-label', 'Página siguiente');
  hoja = crear('div', 'pliego-libro');
  izquierda = crear('div', 'pagina izquierda');
  derecha = crear('div', 'pagina derecha');
  hoja.append(izquierda, derecha);
  indicador = crear('p', 'indicador');
  raiz.append(atras, hoja, adelante, indicador);
  contenedor.replaceChildren(raiz);

  atras.addEventListener('click', () => irA(actual - 1));
  adelante.addEventListener('click', () => irA(actual + 1));
  document.addEventListener('keydown', evento => {
    if (contenedor.hidden || document.querySelector('dialog[open]')) return;
    if (evento.key === 'ArrowRight') irA(actual + 1);
    if (evento.key === 'ArrowLeft') irA(actual - 1);
  });
  let inicioX = null;
  hoja.addEventListener('pointerdown', e => { inicioX = e.clientX; });
  hoja.addEventListener('pointerup', e => {
    if (inicioX !== null && Math.abs(e.clientX - inicioX) > 60) irA(actual + (e.clientX < inicioX ? 1 : -1));
    inicioX = null;
  });
}

/** Abre el libro en una época (o en la portada si no se indica). */
export function mostrarHistoria(epocaId) {
  const indice = epocaId ? contenido.epocas.findIndex(e => e.id === epocaId) + 1 : 0;
  pintar(Math.max(indice, 0), 0);
}

function irA(indice) {
  const total = contenido.epocas.length + 1;
  if (indice < 0 || indice >= total || indice === actual) return;
  const destino = indice === 0 ? '#/historia' : `#/historia/${contenido.epocas[indice - 1].id}`;
  history.replaceState(null, '', destino);
  pintar(indice, Math.sign(indice - actual));
}

// ── Pintar un pliego del libro, con la hoja pasando si hay dirección ────────

function pintar(indice, direccion) {
  const viejaIzquierda = izquierda.cloneNode(true);
  const viejaDerecha = derecha.cloneNode(true);
  actual = indice;

  if (indice === 0) pintarPortada();
  else pintarCapitulo(contenido.epocas[indice - 1], indice);

  const total = contenido.epocas.length;
  indicador.textContent = indice === 0
    ? 'Portada · pasa la página con las flechas'
    : `Capítulo ${ROMANOS[indice - 1]} de ${ROMANOS[total - 1]}`;
  raiz.querySelector('.atras').disabled = indice === 0;
  raiz.querySelector('.adelante').disabled = indice === total;

  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 820;
  if (direccion && !quieto) pasarHoja(direccion, viejaIzquierda, viejaDerecha);
}

/**
 * La hoja que pasa: una cara con la página que se va y otra con la que llega.
 * Hacia delante, la hoja derecha gira sobre el lomo y cae a la izquierda; hacia atrás, al revés.
 */
function pasarHoja(direccion, viejaIzquierda, viejaDerecha) {
  hoja.querySelectorAll('.hoja-que-pasa, .debajo').forEach(e => e.remove());
  const adelante = direccion > 0;
  const quieta = (adelante ? viejaIzquierda : viejaDerecha);     // la página vieja que tapa hasta que llega la hoja
  quieta.classList.add('debajo');
  const pasa = crear('div', `hoja-que-pasa ${adelante ? 'hacia-izquierda' : 'hacia-derecha'}`);
  const frente = adelante ? viejaDerecha : viejaIzquierda;
  const dorso = (adelante ? izquierda : derecha).cloneNode(true);
  frente.classList.add('cara', 'frente');
  dorso.classList.add('cara', 'dorso');
  pasa.append(frente, dorso);
  hoja.append(quieta, pasa);
  pasa.addEventListener('animationend', () => { pasa.remove(); quieta.remove(); });
}

function pintarPortada() {
  const sello = crear('div', 'sello-portada');
  sello.append(ojoDeVhar('#c9b79a'));
  izquierda.classList.toggle('portada-con-imagen', Boolean(contenido.portada));
  izquierda.replaceChildren(
    crear('p', 'portada-arriba', 'Archivo público de Vástara'),
    sello,
    crear('h2', 'portada-titulo', 'Crónica del Cerco'),
    crear('p', 'portada-sub', 'De la Vigilia de Ahar a la Segunda Vigilia, según el arciprestazgo de la Mirada Alta'),
    ...(contenido.portada ? [crearIlustracion('lamina-libro frontispicio', { imagen: contenido.portada })] : []),
    crear('p', 'portada-nota', 'Lo escrito en un pliego abierto es ley que ni el rey puede desmentir. Si alguna página de esta crónica aparece tachada, lo está por ley.'),
  );
  const lista = crear('ol', 'indice-libro');
  contenido.epocas.forEach((epoca, n) => {
    const item = crear('li');
    const enlace = crear('a');
    enlace.href = `#/historia/${epoca.id}`;
    enlace.append(crear('span', 'indice-num', ROMANOS[n]), crear('span', 'indice-titulo', epoca.titulo),
      crear('span', 'indice-anio', epoca.anio));
    item.append(enlace);
    lista.append(item);
  });
  derecha.replaceChildren(crear('h3', 'indice-cabecera', 'Índice'), lista, numeroDePagina(1));
}

function pintarCapitulo(epoca, indice) {
  izquierda.classList.remove('portada-con-imagen');
  const lam = epoca.lamina ?? { x: 500, y: 350, ancho: 1000, pie: '' };
  const lamina = crearIlustracion(`lamina-libro ${epoca.id === 'ahar' ? 'antigua' : ''}`, epoca, lam.x, lam.y, lam.ancho);
  izquierda.replaceChildren(
    crear('p', 'capitulo', `Capítulo ${ROMANOS[indice - 1]}`),
    crear('p', 'capitulo-anio', epoca.anio),
    crear('h2', 'capitulo-titulo', epoca.titulo),
    lamina,
    crear('p', 'pie-lamina', `Lámina ${ROMANOS[indice - 1]}. ${lam.pie}`),
    numeroDePagina(indice * 2),
  );
  const alMapa = crear('a', 'boton-mapa', 'Ver esta época en el mapa');
  alMapa.href = `#/mapa/${epoca.id}`;
  derecha.replaceChildren(...cuerpoDe(epoca, contenido), alMapa, numeroDePagina(indice * 2 + 1));
}

function numeroDePagina(n) {
  return crear('p', 'numero-pagina', String(n));
}
