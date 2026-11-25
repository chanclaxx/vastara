// ─────────────────────────────────────────────────────────────────────────────
// PERSONAJE: la página de un personaje (#/personajes/<id>).
//   1. Cabecera: su retrato grande sobre su propio retrato difuminado, su tierra, su nombre y su frase
//   2. Su historia (la entrada, con la capa que toque: oficial, corregida o pliego)
//   3. Su red: con quién y con qué está atado, y cómo (campo "red" del JSON)
//   4. Lo que callan los pliegos sobre él
//   5. Otros de su misma tierra
// ─────────────────────────────────────────────────────────────────────────────

import { entradasDeTipo } from './contenido.js';
import { crear, ojoDeVhar } from './html.js';
import { crearIlustracion, crearLamina } from './lamina.js';
import { emblema } from './emblemas.js';
import { tituloDeSeccion, botonBajar, barraDeProgreso, retratoAlto, activarEscena } from './pagina.js';
import { seccionPliegos } from './pliegos.js';
import { hojaDeRelato, territorioDeFaccion } from './territorio.js';
import { TERRITORIOS } from './lugares.js';

export function pintarPersonaje(raiz, persona, contenido) {
  const tierra = territorioDeFaccion(persona.faccion);
  const faccion = contenido.entradas.get(persona.faccion);
  const pagina = crear('article', `personaje-pagina tierra-${tierra?.id ?? 'ninguna'}`);

  const paisanos = entradasDeTipo(contenido, 'personaje').filter(p => p.faccion === persona.faccion && p.id !== persona.id);
  const pliegos = seccionPliegos(contenido, new Set([persona.id]), persona.titulo);
  const secciones = [
    ['p-historia', 'Su historia', () => seccionHistoria(persona, contenido)],
    persona.red?.length && ['p-red', 'Su red', () => seccionRed(persona, contenido)],
    pliegos && ['p-pliegos', 'Los pliegos', () => pliegos],
    paisanos.length && ['p-paisanos', `De ${faccion.titulo}`, () => seccionPaisanos(paisanos, faccion)],
  ].filter(Boolean);

  const { heroe, imagen } = cabecera(persona, tierra, faccion);
  const barra = barraDeProgreso({ tierra: tierra?.id, nombre: persona.titulo, secciones, volver: ['#/personajes', 'Todos los personajes'] });
  pagina.append(heroe, barra);
  secciones.forEach(([id, , construir]) => {
    const seccion = construir();
    seccion.id = id;
    pagina.append(seccion);
  });
  activarEscena(raiz, pagina, heroe, imagen, barra, 0.3);
}

// ── Cabecera ────────────────────────────────────────────────────────────────

function cabecera(persona, tierra, faccion) {
  const heroe = crear('header', 'heroe heroe-personaje');
  // De fondo, su propio retrato muy ampliado y difuminado (o el paisaje de su tierra si no tiene retrato).
  const fondo = persona.imagen ? persona : faccion;
  const imagen = crearIlustracion('heroe-imagen heroe-difuso', fondo, ...(tierra?.lamina ?? [500, 350, 1000]));

  const retrato = persona.imagen
    ? crearIlustracion('personaje-retrato', persona)
    : crear('div', 'personaje-retrato sin-retrato', persona.titulo.split(' ').filter(p => p.length > 2).map(p => p[0]).slice(0, 2).join(''));

  const texto = crear('div', 'personaje-texto');
  const deTierra = crear('a', 'personaje-tierra');
  deTierra.href = tierra ? `#/lugares/${tierra.id}` : `#/entrada/${faccion.id}`;
  if (tierra) deTierra.append(emblema(tierra.id, 'emblema-tierra personaje-emblema'));
  deTierra.append(crear('span', null, faccion.titulo));
  texto.append(
    deTierra,
    crear('h1', 'personaje-nombre', persona.titulo),
    crear('p', 'personaje-cargo', persona.subtitulo),
  );
  if (persona.frase) texto.append(crear('blockquote', 'personaje-frase', `«${persona.frase}»`));

  const marco = crear('div', 'personaje-cabecera');
  marco.append(retrato, texto);
  heroe.append(imagen, crear('div', 'heroe-velo'), marco, botonBajar(heroe, 'Su historia'));
  return { heroe, imagen };
}

// ── Secciones ───────────────────────────────────────────────────────────────

function seccionHistoria(persona, contenido) {
  const seccion = crear('section', 'seccion-t seccion-relato');
  seccion.append(tituloDeSeccion('Lo que dice el archivo', 'Su historia'), hojaDeRelato(persona, contenido));
  return seccion;
}

function seccionRed(persona, contenido) {
  const seccion = crear('section', 'seccion-t');
  const fila = crear('div', 'red');
  persona.red.forEach(({ id, como }, n) => {
    const otra = contenido.entradas.get(id);
    if (!otra) return;
    const tarjeta = crear('a', 'nudo-red aparece');
    tarjeta.href = enlaceDe(otra);
    tarjeta.style.setProperty('--retraso', `${n * 80}ms`);
    const texto = crear('div', 'nudo-texto');
    texto.append(crear('p', 'nudo-como', como), crear('h3', null, otra.titulo));
    tarjeta.append(figuraDe(otra, contenido), texto);
    fila.append(tarjeta);
  });
  seccion.append(tituloDeSeccion('A quién debe, a quién vigila, quién lo nombra', 'Su red'), fila);
  return seccion;
}

function seccionPaisanos(paisanos, faccion) {
  const seccion = crear('section', 'seccion-t');
  const fila = crear('div', 'retratos');
  paisanos.forEach((persona, n) => fila.append(retratoAlto(persona, n)));
  seccion.append(tituloDeSeccion('De su misma tierra', faccion.titulo), fila);
  return seccion;
}

/** A dónde lleva una entrada de la red: personajes y tierras tienen página propia; lo demás, su ficha. */
function enlaceDe(entrada) {
  if (entrada.tipo === 'personaje') return `#/personajes/${entrada.id}`;
  const tierra = TERRITORIOS.find(t => t.entrada === entrada.id);      // una facción o la Cuenca
  if (tierra) return `#/lugares/${tierra.id}`;
  return `#/entrada/${entrada.id}`;
}

/** La imagen pequeña de una entrada de la red: su ilustración, su recorte del mapa o su sello. */
function figuraDe(entrada, contenido) {
  if (entrada.imagen) return crearIlustracion(`nudo-figura ${entrada.tipo === 'personaje' ? 'es-retrato' : ''}`, entrada);
  if (entrada.pos) return crearLamina('nudo-figura', entrada.pos[0], entrada.pos[1], entrada.menor ? 50 : 90);
  const tierra = TERRITORIOS.find(t => t.entrada === entrada.id);
  if (tierra) return crearIlustracion('nudo-figura', contenido.entradas.get(tierra.entrada), ...tierra.lamina);
  const sello = crear('div', 'nudo-figura nudo-lacre');     // documentos y lo que no tiene imagen
  sello.append(ojoDeVhar('#c9b79a'));
  return sello;
}
