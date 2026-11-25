// ─────────────────────────────────────────────────────────────────────────────
// TERRITORIO: la página de una tierra, que se lee bajando como un capítulo.
//   1. Cabecera a pantalla completa: su ilustración, su emblema, su nombre y su lema
//   2. Barra fija con las secciones y el progreso de lectura
//   3. El relato (su entrada, en su propia voz y con la capa que toque: oficial, corregida o pliego)
//   4. Su gente, sus lugares, su tradición, lo que callan los pliegos y las tierras vecinas
// Las secciones sin contenido (la Estepa no tiene personajes todavía; la Cuenca, ni gente ni tradición)
// no se pintan.
// ─────────────────────────────────────────────────────────────────────────────

import { entradasDeTipo } from './contenido.js';
import { crear } from './html.js';
import { cuerpoDe } from './panel.js';
import { crearIlustracion } from './lamina.js';
import { emblema } from './emblemas.js';
import { tituloDeSeccion, botonBajar, barraDeProgreso, retratoAlto, activarEscena } from './pagina.js';
import { seccionPliegos } from './pliegos.js';
import { TERRITORIOS, lugaresDe, fichaDeLugar, extracto } from './lugares.js';

/** La tierra (de TERRITORIOS) a la que pertenece una entrada de facción, o undefined. */
export function territorioDeFaccion(faccionId) {
  return TERRITORIOS.find(t => t.entrada === faccionId);
}

/** Construye la página de 'territorio' (uno de TERRITORIOS) y la pone en 'raiz'. */
export function pintarTerritorio(raiz, territorio, contenido) {
  const entrada = contenido.entradas.get(territorio.entrada);
  const nombre = territorio.titulo ?? entrada.titulo;
  const pagina = crear('article', `territorio tierra-${territorio.id}`);

  // ── Qué secciones tiene esta tierra ──
  const gente = entradasDeTipo(contenido, 'personaje').filter(p => p.faccion === territorio.entrada);
  const tradicion = entradasDeTipo(contenido, 'costumbre').find(c => c.voz === territorio.id);
  const lugares = lugaresDe(territorio.id);
  const deEstaTierra = new Set([entrada.id, ...gente.map(p => p.id), ...lugares.map(l => l.id), tradicion?.id]);
  const pliegos = seccionPliegos(contenido, deEstaTierra, nombre);
  const secciones = [
    ['t-relato', 'El relato', () => seccionRelato(entrada, nombre, contenido)],
    gente.length && ['t-gente', 'Su gente', () => seccionGente(gente, nombre)],
    ['t-lugares', 'Lugares', () => seccionLugares(lugares, nombre)],
    tradicion && ['t-tradicion', 'Tradición', () => seccionTradicion(tradicion)],
    pliegos && ['t-pliegos', 'Los pliegos', () => pliegos],
    ['t-vecinas', 'Tierras vecinas', () => seccionVecinas(territorio, contenido)],
  ].filter(Boolean);

  const { heroe, imagen } = cabecera(territorio, entrada, nombre);
  const barra = barraDeProgreso({ tierra: territorio.id, nombre, secciones, volver: ['#/lugares', 'Todos los territorios'] });
  pagina.append(heroe, barra);
  secciones.forEach(([id, , construir], n) => {
    const seccion = construir();
    seccion.id = id;
    pagina.append(seccion);
    if (n === 0) pagina.append(separador(territorio.id));
  });
  activarEscena(raiz, pagina, heroe, imagen, barra);
}

// ── Cabecera ────────────────────────────────────────────────────────────────

function cabecera(territorio, entrada, nombre) {
  const heroe = crear('header', 'heroe');
  const [x, y, ancho] = territorio.lamina;
  const imagen = crearIlustracion('heroe-imagen', entrada, x, y, ancho);
  const contenidoHeroe = crear('div', 'heroe-contenido');
  contenidoHeroe.append(
    emblema(territorio.id, 'emblema-tierra heroe-emblema'),
    crear('p', 'heroe-sobre', territorio.id === 'cuenca' ? 'Tierra de nadie' : 'Tierra de Vástara'),
    crear('h1', 'heroe-titulo', nombre),
    crear('p', 'heroe-lema', `«${entrada.lema}»`),
    crear('p', 'heroe-sub', territorio.subtitulo ?? entrada.subtitulo),
  );
  heroe.append(imagen, crear('div', 'heroe-velo'), contenidoHeroe, botonBajar(heroe, 'Leer'));
  return { heroe, imagen };
}

// ── Secciones ───────────────────────────────────────────────────────────────

/** El relato en una hoja de archivo, con letra capital. También lo usa la página de personaje. */
export function hojaDeRelato(entrada, contenido, pie) {
  const cuerpo = crear('div', 'relato aparece');
  cuerpo.append(...cuerpoDe(entrada, contenido));
  if (pie) cuerpo.append(pie);
  return cuerpo;
}

function seccionRelato(entrada, nombre, contenido) {
  const seccion = crear('section', 'seccion-t seccion-relato');
  const verMapa = crear('a', 'boton-mapa', `Ver ${nombre} en el mapa`);
  verMapa.href = `#/mapa/${entrada.id}`;
  seccion.append(tituloDeSeccion('Lo que cuenta de sí misma', nombre), hojaDeRelato(entrada, contenido, verMapa));
  return seccion;
}

function separador(tierra) {
  const sep = crear('div', 'separador-emblema aparece');
  sep.append(emblema(tierra, 'emblema-tierra emblema-fantasma'));
  return sep;
}

function seccionGente(gente, nombre) {
  const seccion = crear('section', 'seccion-t');
  const fila = crear('div', 'retratos');
  gente.forEach((persona, n) => fila.append(retratoAlto(persona, n)));
  seccion.append(tituloDeSeccion(`Quién es quién en ${nombre}`, 'Su gente'), fila);
  return seccion;
}

function seccionLugares(lugares, nombre) {
  const seccion = crear('section', 'seccion-t');
  const rejilla = crear('div', 'fichas');
  lugares.forEach((lugar, n) => {
    const ficha = fichaDeLugar(lugar);
    ficha.classList.add('aparece');
    ficha.style.setProperty('--retraso', `${(n % 4) * 80}ms`);
    rejilla.append(ficha);
  });
  seccion.append(tituloDeSeccion(`${lugares.length} lugares`, `Lugares de ${nombre}`), rejilla);
  return seccion;
}

function seccionTradicion(costumbre) {
  const seccion = crear('section', 'seccion-t');
  const bloque = crear('div', 'tradicion aparece');
  const texto = crear('div', 'tradicion-texto');
  const leer = crear('a', 'boton-claro', 'Leer la tradición');
  leer.href = `#/entrada/${costumbre.id}`;
  texto.append(crear('h3', null, costumbre.titulo), crear('p', 'tradicion-extracto', extracto(costumbre)), leer);
  bloque.append(crearIlustracion('tradicion-imagen', costumbre), texto);
  seccion.append(tituloDeSeccion('Escrita el año 0', 'Su tradición'), bloque);
  return seccion;
}

function seccionVecinas(territorio, contenido) {
  const seccion = crear('section', 'seccion-t');
  seccion.append(tituloDeSeccion('Alrededor de la falla', 'Tierras vecinas'), tarjetasDeTierras(contenido, territorio.id));
  return seccion;
}

/** Las tarjetas de tierra (emblema sobre su paisaje), sin la que se indique. También las usa la portada. */
export function tarjetasDeTierras(contenido, sinEsta) {
  const fila = crear('div', 'tierras');
  TERRITORIOS.filter(t => t.id !== sinEsta).forEach((t, n) => {
    const entrada = contenido.entradas.get(t.entrada);
    const tarjeta = crear('a', 'tierra aparece');
    tarjeta.href = `#/lugares/${t.id}`;
    tarjeta.style.setProperty('--retraso', `${n * 90}ms`);
    const [x, y, ancho] = t.lamina;
    const nombre = crear('div', 'tierra-nombre');
    nombre.append(crear('h3', null, t.titulo ?? entrada.titulo), crear('p', null, entrada.lema));
    tarjeta.append(crearIlustracion('tierra-imagen', entrada, x, y, ancho), crear('div', 'tierra-velo'),
      emblema(t.id, 'emblema-tierra tierra-emblema'), nombre);
    fila.append(tarjeta);
  });
  return fila;
}
