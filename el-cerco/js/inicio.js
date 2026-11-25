// ─────────────────────────────────────────────────────────────────────────────
// INICIO: el prólogo de la web (#/inicio, y la dirección vacía).
//   1. El frontispicio a pantalla completa, con el ojo de Vhar y la ley de los pliegos
//   2. Lo que está pasando ahora: la Segunda Vigilia
//   3. Las cuatro tierras y la falla
//   4. Tres caminos: el mapa, la crónica y los sellos
// Todo lo que cuenta sale del contenido (la época actual, los lemas, la capa visible de cada entrada).
// ─────────────────────────────────────────────────────────────────────────────

import { crear, ojoDeVhar } from './html.js';
import { crearIlustracion, crearLamina } from './lamina.js';
import { tituloDeSeccion, botonBajar, activarEscena } from './pagina.js';
import { tarjetasDeTierras } from './territorio.js';
import { extracto } from './lugares.js';
import { tarjetasDeRelatos } from './relatos.js';

export function pintarInicio(raiz, contenido, epocaActual) {
  const pagina = crear('div', 'inicio');
  const { heroe, imagen } = cabecera(contenido);
  pagina.append(heroe, ahora(contenido, epocaActual), tierras(contenido), relatos(contenido), caminos(contenido), pie());
  activarEscena(raiz, pagina, heroe, imagen, null, 0.5);
}

// ── 1. El frontispicio ──────────────────────────────────────────────────────

function cabecera(contenido) {
  const heroe = crear('header', 'heroe heroe-inicio');
  const imagen = crearIlustracion('heroe-imagen', { imagen: contenido.portada });
  const sello = crear('div', 'sello-inicio');
  sello.append(ojoDeVhar('#d9cbb2'));
  const centro = crear('div', 'heroe-contenido');
  centro.append(
    sello,
    crear('p', 'heroe-sobre', 'Archivo público · custodiado por el arciprestazgo de la Mirada Alta'),
    crear('h1', 'heroe-titulo heroe-titulo-inicio', 'Vástara'),
    crear('p', 'heroe-lema', 'Cuatro tierras alrededor de una falla. Doscientos catorce años de paz vigilada.'),
    crear('blockquote', 'ley', 'Lo escrito en un pliego abierto es ley que ni el rey puede desmentir.'),
  );
  heroe.append(imagen, crear('div', 'heroe-velo'), centro, botonBajar(heroe, 'Entrar', 0));
  return { heroe, imagen };
}

// ── 2. Lo que está pasando ──────────────────────────────────────────────────

function ahora(contenido, epocaActual) {
  const epoca = contenido.entradas.get(epocaActual);
  const seccion = crear('section', 'seccion-t ahora');
  const bloque = crear('div', 'ahora-bloque aparece');
  const texto = crear('div', 'ahora-texto');
  const leer = crear('a', 'boton-claro', 'Leer la crónica');
  leer.href = `#/historia/${epoca.id}`;
  const verMapa = crear('a', 'boton-mapa', 'Ver en el mapa');
  verMapa.href = `#/mapa/${epoca.id}`;
  const acciones = crear('div', 'ahora-acciones');
  acciones.append(leer, verMapa);
  texto.append(crear('p', 'ahora-anio', epoca.anio), crear('h3', null, epoca.titulo),
    crear('p', 'ahora-extracto', extracto(epoca)), acciones);
  bloque.append(crearIlustracion('ahora-imagen', epoca, 500, 350, 400), texto);
  seccion.append(tituloDeSeccion('Ahora mismo, en Vástara', 'El presente'), bloque);
  return seccion;
}

// ── 3. Las tierras ──────────────────────────────────────────────────────────

function tierras(contenido) {
  const seccion = crear('section', 'seccion-t');
  seccion.append(tituloDeSeccion('Lo que cada una cuenta de sí misma', 'Cuatro tierras y una falla'), tarjetasDeTierras(contenido));
  return seccion;
}

// ── Relatos ─────────────────────────────────────────────────────────────────

function relatos(contenido) {
  const seccion = crear('section', 'seccion-t');
  seccion.append(tituloDeSeccion('Lo que cuentan quienes estaban allí', 'Relatos'), tarjetasDeRelatos(contenido));
  return seccion;
}

// ── 4. Tres caminos ─────────────────────────────────────────────────────────

function caminos(contenido) {
  const seccion = crear('section', 'seccion-t');
  const fila = crear('div', 'caminos');

  const camino = (clase, href, imagen, sobre, titulo, texto, n) => {
    const tarjeta = crear('a', `camino ${clase} aparece`);
    tarjeta.href = href;
    tarjeta.style.setProperty('--retraso', `${n * 110}ms`);
    const pieCamino = crear('div', 'camino-texto');
    pieCamino.append(crear('p', 'camino-sobre', sobre), crear('h3', null, titulo), crear('p', null, texto));
    tarjeta.append(imagen, crear('div', 'tierra-velo'), pieCamino);
    return tarjeta;
  };

  const sello = crear('div', 'camino-imagen camino-lacre');
  const disco = crear('div', 'camino-disco');
  disco.append(ojoDeVhar('#c9b79a'));
  sello.append(disco);
  const romper = camino('camino-sello', '#/archivo', sello, 'Si mataste a un Testigo', 'Rompe un sello',
    'El juego te dio un código. Escríbelo aquí y lee lo que el archivo no quería que leyeras.', 2);
  romper.addEventListener('click', evento => {
    evento.preventDefault();
    document.getElementById('boton-sello').click();
  });

  fila.append(
    camino('', '#/mapa', crearLamina('camino-imagen', 400, 480, 380), 'El mapa', 'Explora Vástara',
      'Acércate a sus ciudades y aldeas. El mapa cambia con cada época de la crónica.', 0),
    camino('', '#/historia', crearIlustracion('camino-imagen', contenido.entradas.get('reparto')), 'La crónica',
      'Lee la historia', 'De la Vigilia de Ahar a la Segunda Vigilia, según el arciprestazgo.', 1),
    romper,
  );
  seccion.append(tituloDeSeccion('Por dónde empezar', 'Tres caminos'), fila);
  return seccion;
}

function pie() {
  const pieInicio = crear('footer', 'pie-inicio aparece');
  const sello = crear('div', 'pie-sello');
  sello.append(ojoDeVhar('#8a7e6e'));
  pieInicio.append(sello,
    crear('p', null, 'El Cerco · Archivo público de Vástara'),
    crear('p', 'pie-nota', 'Vástara: la Esclusa. Lo que aquí se cuenta es la versión oficial. Los pliegos dicen otra cosa.'));
  return pieInicio;
}
