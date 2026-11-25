// ─────────────────────────────────────────────────────────────────────────────
// MAIN: arranca la web y decide qué sección se ve. Todo va en la dirección (el "hash"),
// así cualquier página tiene un enlace propio que se puede compartir:
//   #/inicio (o nada)      el prólogo: portada, el presente, las tierras y por dónde empezar
//   #/mapa                 el mapa                 #/mapa/<id>        el mapa, centrado en esa entrada
//   #/historia             el libro (portada)      #/historia/<época> el libro abierto en esa época
//   #/lugares              las cinco tierras       #/lugares/<terr.>  la página de esa tierra
//   #/personajes           la galería              #/personajes/<id>  la página de ese personaje
//   #/relatos              los relatos             #/relatos/<id>     uno de ellos
//   #/costumbres · #/archivo
//   #/entrada/<id>         abre la ficha encima de la sección en la que se está
// ─────────────────────────────────────────────────────────────────────────────

import { cargarContenido } from './contenido.js';
import { montarMapa, pintarMapa, resaltar, enfocar, verTodo, acercar } from './mapa.js';
import { montarCronologia, marcarEpoca } from './cronologia.js';
import { montarPanel, mostrarEntrada, cerrarPanel } from './panel.js';
import { montarSellos } from './codigos.js';
import { montarHistoria, mostrarHistoria } from './historia.js';
import { montarLugares, mostrarLugares } from './lugares.js';
import { montarGalerias, mostrarPersonajes, mostrarCostumbres, mostrarArchivo } from './galerias.js';
import { pintarInicio } from './inicio.js';
import { pintarPersonaje } from './personaje.js';
import { pintarRelatos, pintarRelato } from './relatos.js';
import { montarCartela } from './cartela.js';

const EPOCA_INICIAL = 'vigilia';   // el presente: el asedio de Vedre
const VISTAS = ['inicio', 'mapa', 'historia', 'relatos', 'lugares', 'personajes', 'costumbres', 'archivo'];

const contenido = await cargarContenido();
let rutaDeSeccion = '#/inicio';     // a dónde vuelve uno al cerrar una ficha
let epocaActual = EPOCA_INICIAL;

function vista(nombre) {
  return document.getElementById(`vista-${nombre}`);
}

function irAEpoca(epocaId) {
  epocaActual = epocaId;
  pintarMapa(epocaId);
  marcarEpoca(epocaId);
}

function mostrarVista(nombre) {
  for (const otra of VISTAS) vista(otra).hidden = otra !== nombre;
  document.querySelectorAll('.secciones a').forEach(enlace =>
    enlace.classList.toggle('activa', enlace.dataset.vista === nombre));
  document.body.dataset.vista = nombre;
}

function abrirFicha(id) {
  const entrada = contenido.entradas.get(id);
  if (!entrada) return;
  mostrarEntrada(entrada, contenido);
  resaltar(id);
}

function navegar() {
  const [, seccion = 'inicio', id] = location.hash.split('/');

  if (seccion === 'entrada') {                       // una ficha encima de la sección actual
    if (!document.body.dataset.vista) mostrarVista('mapa');
    abrirFicha(id);
    return;
  }

  rutaDeSeccion = location.hash || '#/inicio';
  cerrarPanel();
  resaltar(null);
  switch (VISTAS.includes(seccion) ? seccion : 'inicio') {
    case 'inicio': mostrarVista('inicio'); pintarInicio(vista('inicio'), contenido, epocaActual); break;
    case 'mapa': {
      mostrarVista('mapa');
      const entrada = contenido.entradas.get(id);
      if (!entrada) break;
      if (entrada.tipo === 'epoca') { irAEpoca(id); verTodo(); }
      else if (entrada.pos) enfocar(entrada.pos[0], entrada.pos[1], entrada.menor ? 4 : 3);
      abrirFicha(id);
      break;
    }
    case 'historia': mostrarVista('historia'); mostrarHistoria(id); break;
    case 'relatos': {
      mostrarVista('relatos');
      const relato = contenido.entradas.get(id);
      if (relato?.tipo === 'relato') pintarRelato(vista('relatos'), relato, contenido);
      else pintarRelatos(vista('relatos'), contenido);
      break;
    }
    case 'lugares': mostrarVista('lugares'); mostrarLugares(id); break;
    case 'personajes': {
      mostrarVista('personajes');
      const persona = contenido.entradas.get(id);
      if (persona?.tipo === 'personaje') pintarPersonaje(vista('personajes'), persona, contenido);
      else mostrarPersonajes(vista('personajes'));
      break;
    }
    case 'costumbres': mostrarVista('costumbres'); mostrarCostumbres(vista('costumbres')); break;
    case 'archivo': mostrarVista('archivo'); mostrarArchivo(vista('archivo')); break;
  }
}

// ── Montaje ─────────────────────────────────────────────────────────────────

await montarMapa(document.getElementById('mapa'), contenido.epocas, id => { location.hash = `#/entrada/${id}`; });
montarCartela(document.getElementById('mapa'), contenido);
montarCronologia(document.getElementById('cronologia'), contenido.epocas, id => { location.hash = `#/mapa/${id}`; });
document.getElementById('acercar').addEventListener('click', () => acercar(1.7));
document.getElementById('alejar').addEventListener('click', () => acercar(1 / 1.7));
document.getElementById('ver-todo').addEventListener('click', verTodo);

montarPanel({ alCerrar: () => { location.hash = rutaDeSeccion; } });
montarHistoria(vista('historia'), contenido);
montarLugares(vista('lugares'), contenido);
montarGalerias(contenido);

montarSellos({
  dialogo: document.getElementById('sello'),
  boton: document.getElementById('boton-sello'),
  contenido,
  alCerrar: codigo => {
    if (romperAqui) {                     // se rompió desde el bloque de pliegos de una página: se queda en ella
      romperAqui = false;
      delete document.getElementById('sello').dataset.seguir;
      if (!codigo) return;
      navegar();
      // Se baja hasta el relato para ver el tachado aparecer delante.
      vista(document.body.dataset.vista).querySelector('.seccion-relato')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!codigo) return;
    // Lo recién abierto se ve en el mapa: salta a la época del documento y se redibuja delante.
    location.hash = `#/mapa/${codigo.epoca}`;
    irAEpoca(codigo.epoca);
  },
});

// El bloque «Lo que callan los pliegos» pide romper un sello sin salir de la página (ver pliegos.js).
let romperAqui = false;
document.addEventListener('romper-aqui', () => {
  romperAqui = true;
  document.getElementById('sello').dataset.seguir = 'Seguir leyendo';
  document.getElementById('boton-sello').click();
});

irAEpoca(EPOCA_INICIAL);
window.addEventListener('hashchange', navegar);
navegar();
document.body.dataset.lista = '1';   // la web terminó de montarse (lo esperan las pruebas)
