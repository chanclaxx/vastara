// ─────────────────────────────────────────────────────────────────────────────
// LUGARES: el índice de las tierras (y la Cuenca, que no es de nadie) y las fichas de lugar.
//   #/lugares            las cinco tierras, cada una con su emblema sobre su paisaje
//   #/lugares/<id>       la página de esa tierra (territorio.js): solania, forja, marjal, estepa, cuenca
// ─────────────────────────────────────────────────────────────────────────────

import { capaDe } from './estado.js';
import { entradasDeTipo } from './contenido.js';
import { crear } from './html.js';
import { crearIlustracion } from './lamina.js';
import { pintarTerritorio, tarjetasDeTierras } from './territorio.js';
import { aparecerAlBajar } from './escena.js';

export const TERRITORIOS = [
  { id: 'solania', entrada: 'solania', lamina: [240, 165, 520] },
  { id: 'forja', entrada: 'la-forja', lamina: [750, 160, 520] },
  { id: 'marjal', entrada: 'el-marjal', lamina: [250, 560, 520] },
  { id: 'estepa', entrada: 'estepa-de-kadem', lamina: [760, 560, 520] },
  { id: 'cuenca', entrada: 'cuenca-del-cerco', lamina: [500, 372, 1000], ancha: true,
    titulo: 'La Cuenca del Cerco', subtitulo: 'La falla que tocan los cuatro y no es de nadie' },
];

let raiz, contenido;

export function montarLugares(contenedor, datos) {
  raiz = contenedor;
  contenido = datos;
}

export function mostrarLugares(territorioId) {
  const territorio = TERRITORIOS.find(t => t.id === territorioId);
  if (territorio) {
    pintarTerritorio(raiz, territorio, contenido);
    return;
  }
  raiz.replaceChildren(vistaIndice());
  raiz.scrollTop = 0;
  aparecerAlBajar(raiz);
}

export function lugaresDe(territorioId) {
  return entradasDeTipo(contenido, 'lugar')
    .filter(l => l.territorio === territorioId)
    .sort((a, b) => Number(a.menor) - Number(b.menor));
}

/** El índice: las cinco tierras como estandartes (emblema sobre su paisaje). */
function vistaIndice() {
  const pagina = crear('div', 'pagina-seccion');
  pagina.append(
    crear('p', 'seccion-sobre', 'El Cerco'),
    crear('h1', 'seccion-titulo', 'Lugares de Vástara'),
    crear('p', 'seccion-intro', 'Cuatro tierras alrededor de una falla. Cada una cuenta sus lugares a su manera; los pliegos, a la suya.'),
    tarjetasDeTierras(contenido),
  );
  return pagina;
}

export function fichaDeLugar(lugar) {
  const ficha = crear('article', `ficha-lugar ${lugar.menor ? 'menor' : 'mayor'}`);
  const [x, y] = lugar.pos;
  ficha.append(crearIlustracion('ficha-lamina', lugar, x, y, lugar.menor ? 60 : 110));
  const cuerpo = crear('div', 'ficha-cuerpo');
  const capa = capaDe(lugar);
  if (capa !== 'oficial') cuerpo.append(crear('span', `marca-capa ${capa}`, capa === 'verdad' ? 'pliego abierto' : 'corregida'));
  cuerpo.append(crear('h3', null, lugar.titulo), crear('p', 'ficha-sub', lugar.subtitulo), crear('p', 'ficha-extracto', extracto(lugar)));
  const acciones = crear('div', 'ficha-acciones');
  const leer = crear('a', null, 'Leer');
  leer.href = `#/entrada/${lugar.id}`;
  const mapa = crear('a', null, 'En el mapa');
  mapa.href = `#/mapa/${lugar.id}`;
  acciones.append(leer, mapa);
  cuerpo.append(acciones);
  ficha.append(cuerpo);
  return ficha;
}

/** Las primeras frases del texto que se ve ahora (oficial, corregido o el del pliego), unas 60–200 letras. */
export function extracto(entrada) {
  const capa = capaDe(entrada);
  const texto = capa === 'oficial' ? entrada.oficial : entrada[capa].texto;
  const frases = texto.replace(/[«»“”]/g, '').split('\n')[0].match(/[^.:;]+[.:;]?/g) ?? [];
  let resultado = '';
  for (const frase of frases) {
    if (resultado.length >= 60 || resultado.length + frase.length > 200) break;
    resultado += frase;
  }
  return resultado.trim() || texto.slice(0, 170).replace(/\s\S*$/, '') + '…';
}
