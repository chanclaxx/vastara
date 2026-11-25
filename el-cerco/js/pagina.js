// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA: las piezas comunes de las páginas que se leen bajando (portada, tierras, personajes).
//   tituloDeSeccion   «sobre» pequeño, título grande y línea ornamental
//   botonBajar        la flecha que late al pie de la cabecera
//   barraDeProgreso   la barra fija con las secciones de la página
//   retratoAlto       la tarjeta alta de un personaje (retrato o monograma)
//   activarEscena     paralaje, barra que se fija, progreso y aparición al bajar
// ─────────────────────────────────────────────────────────────────────────────

import { crear } from './html.js';
import { crearIlustracion } from './lamina.js';
import { emblema, divisor } from './emblemas.js';
import { aparecerAlBajar, paralaje, seguirSecciones } from './escena.js';

export function tituloDeSeccion(sobre, titulo) {
  const cabeza = crear('header', 'seccion-cabeza aparece');
  cabeza.append(crear('p', 'seccion-sobre', sobre), crear('h2', 'seccion-titulo-t', titulo), divisor());
  return cabeza;
}

export function botonBajar(heroe, etiqueta, margen = 56) {
  const bajar = crear('button', 'heroe-bajar');
  bajar.type = 'button';
  bajar.setAttribute('aria-label', etiqueta);
  bajar.innerHTML = `<span>${etiqueta}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9 L12 16 L19 9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
  bajar.addEventListener('click', () => heroe.closest('.vista').scrollTo({ top: heroe.offsetHeight - margen, behavior: 'smooth' }));
  return bajar;
}

/**
 * La barra fija. 'secciones' es una lista de [id, etiqueta]; 'volver' es [href, título].
 * 'tierra' elige el emblema que la encabeza (o ninguno).
 */
export function barraDeProgreso({ tierra, nombre, secciones, volver }) {
  const barra = crear('nav', 'barra-progreso');
  barra.setAttribute('aria-label', `Secciones de ${nombre}`);
  const atras = crear('a', 'barra-volver', '←');
  [atras.href, atras.title] = volver;
  const titulo = crear('span', 'barra-titulo');
  if (tierra) titulo.append(emblema(tierra, 'emblema-tierra barra-emblema'));
  titulo.append(crear('span', null, nombre));
  const lista = crear('ol', 'barra-secciones');
  for (const [id, etiqueta] of secciones) {
    const item = crear('li');
    const boton = crear('button', null);
    boton.type = 'button';
    boton.dataset.seccion = id;
    boton.append(crear('span', 'barra-punto'), crear('span', 'barra-etiqueta', etiqueta));
    item.append(boton);
    lista.append(item);
  }
  barra.append(atras, titulo, lista);
  return barra;
}

export function retratoAlto(persona, n = 0) {
  const tarjeta = crear('a', 'retrato-alto aparece');
  tarjeta.href = `#/personajes/${persona.id}`;
  tarjeta.style.setProperty('--retraso', `${n * 90}ms`);
  const figura = persona.imagen
    ? crearIlustracion('retrato-alto-imagen', persona)
    : crear('div', 'retrato-alto-imagen sin-retrato', persona.titulo.split(' ').filter(p => p.length > 2).map(p => p[0]).slice(0, 2).join(''));
  const pie = crear('div', 'retrato-alto-pie');
  pie.append(crear('h3', null, persona.titulo), crear('p', null, persona.subtitulo));
  tarjeta.append(figura, pie);
  return tarjeta;
}

/** Pone la página en 'raiz' y enciende sus efectos. 'imagen' (paralaje) y 'barra' son opcionales. */
export function activarEscena(raiz, pagina, heroe, imagen, barra, factor = 0.45) {
  raiz.replaceChildren(pagina);
  raiz.scrollTop = 0;
  if (imagen) paralaje(pagina, imagen, factor, barra ? y => barra.classList.toggle('fija', y > heroe.offsetHeight - 90) : undefined);
  if (barra) seguirSecciones(pagina, barra);
  aparecerAlBajar(pagina);
}
