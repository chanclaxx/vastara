// ─────────────────────────────────────────────────────────────────────────────
// RELATOS: historias cortas contadas desde dentro de Vástara, cada una en la voz de su tierra.
//   #/relatos          las tarjetas de todos los relatos
//   #/relatos/<id>     un relato: cabecera con su ilustración, el texto en hoja de archivo con letra capital,
//                      lo que callan los pliegos sobre él y los demás relatos
// Un relato es una entrada más (tipo "relato", carpeta contenido/relatos/): si un pliego lo desmiente, sale tachado.
// ─────────────────────────────────────────────────────────────────────────────

import { entradasDeTipo } from './contenido.js';
import { capaDe } from './estado.js';
import { crear } from './html.js';
import { crearIlustracion } from './lamina.js';
import { tituloDeSeccion, botonBajar, activarEscena } from './pagina.js';
import { seccionPliegos } from './pliegos.js';
import { hojaDeRelato } from './territorio.js';
import { extracto } from './lugares.js';

/** El índice: una tarjeta alta por relato. */
export function pintarRelatos(raiz, contenido) {
  const pagina = crear('div', 'pagina-seccion pagina-relatos');
  pagina.append(
    crear('p', 'seccion-sobre', 'El Cerco'),
    crear('h1', 'seccion-titulo', 'Relatos'),
    crear('p', 'seccion-intro', 'Lo que cuentan quienes estaban allí. El archivo los guarda tal como se los dijeron.'),
    tarjetasDeRelatos(contenido),
  );
  raiz.replaceChildren(pagina);
  raiz.scrollTop = 0;
  activarEscena(raiz, pagina, null, null, null);
}

export function pintarRelato(raiz, relato, contenido) {
  const pagina = crear('article', 'relato-pagina');
  const heroe = crear('header', 'heroe heroe-relato');
  const imagen = crearIlustracion('heroe-imagen', relato);
  const centro = crear('div', 'heroe-contenido');
  centro.append(
    crear('p', 'heroe-sobre', 'Relato'),
    crear('h1', 'heroe-titulo', relato.titulo),
    crear('p', 'heroe-lema', relato.subtitulo),
  );
  heroe.append(imagen, crear('div', 'heroe-velo'), centro, botonBajar(heroe, 'Leer'));

  const texto = crear('section', 'seccion-t seccion-relato');
  const epoca = contenido.entradas.get(relato.epoca);
  const pie = epoca ? crear('a', 'boton-mapa', `${epoca.titulo}, en la crónica`) : null;
  if (pie) pie.href = `#/historia/${epoca.id}`;
  texto.append(hojaDeRelato(relato, contenido, pie));

  pagina.append(heroe, texto);
  const pliegos = seccionPliegos(contenido, new Set([relato.id]), `«${relato.titulo}»`);
  if (pliegos) pagina.append(pliegos);
  const mas = crear('section', 'seccion-t');
  mas.append(tituloDeSeccion('Lo que cuentan otros', 'Más relatos'), tarjetasDeRelatos(contenido, relato.id));
  pagina.append(mas);
  activarEscena(raiz, pagina, heroe, imagen, null);
}

/** Las tarjetas de los relatos (sin el que se indique). También las usa la portada. */
export function tarjetasDeRelatos(contenido, sinEste) {
  const fila = crear('div', 'caminos relatos');
  entradasDeTipo(contenido, 'relato').filter(r => r.id !== sinEste).forEach((relato, n) => {
    const tarjeta = crear('a', 'camino aparece');
    tarjeta.href = `#/relatos/${relato.id}`;
    tarjeta.style.setProperty('--retraso', `${n * 110}ms`);
    const texto = crear('div', 'camino-texto');
    const tachado = capaDe(relato) === 'verdad';
    texto.append(
      crear('p', 'camino-sobre', tachado ? 'Un pliego lo desmiente' : relato.subtitulo.split(',')[0]),
      crear('h3', null, relato.titulo),
      crear('p', null, extracto({ ...relato, verdad: undefined, exaltada: undefined })),   // el arranque, siempre el suyo
    );
    tarjeta.append(crearIlustracion('camino-imagen', relato), crear('div', 'tierra-velo'), texto);
    fila.append(tarjeta);
  });
  return fila;
}
