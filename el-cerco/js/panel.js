// ─────────────────────────────────────────────────────────────────────────────
// PANEL: la hoja que se abre a la derecha con una entrada, sobre cualquier sección.
// Una entrada se ve en una de tres capas (ver estado.js → capaDe):
//   oficial   lo que cuenta la civilización que la firma
//   exaltada  lo que el arciprestazgo reescribió tras un martirio (código de acta)
//   verdad    lo que anotó un Testigo (código de pliego); la oficial queda tachada encima
// El libro de la Historia usa la misma función (cuerpoDe) para sus páginas.
// ─────────────────────────────────────────────────────────────────────────────

import { crearIlustracion } from './lamina.js';
import { capaDe, primeraVez, documentoAbierto, modoDesarrollo } from './estado.js';
import { entradasQueCambia } from './contenido.js';
import { crear, enlaceA, parrafos, ojoDeVhar } from './html.js';

const panel = document.getElementById('panel');
let alCerrar = () => {};

export const VOCES = {
  solania: 'Según el arciprestazgo de la Mirada Alta',
  marjal: 'Según el consejo de casas del Marjal',
  estepa: 'Según la Lengua, por boca del Callado',
  forja: 'Según la Liga de gremios',
};

export const TIPOS = {
  faccion: 'Facción', lugar: 'Lugar', personaje: 'Personaje',
  costumbre: 'Costumbre', epoca: 'Época', documento: 'Documento', relato: 'Relato',
};

export function montarPanel(opciones) {
  alCerrar = opciones.alCerrar;
}

export function cerrarPanel() {
  panel.classList.remove('abierto');
  panel.replaceChildren();
}

export function mostrarEntrada(entrada, contenido) {
  const hoja = crear('article', 'ficha');
  hoja.append(botonCerrar(), ...cabecera(entrada));
  if (entrada.tipo === 'documento') hoja.append(...cuerpoDeDocumento(entrada, contenido));
  else hoja.append(...cuerpoDe(entrada, contenido));
  if (entrada.pos || entrada.tipo === 'epoca') hoja.append(botonMapa(entrada));
  if (entrada.tipo === 'personaje' || entrada.tipo === 'relato') hoja.append(botonPagina(entrada));
  const tierra = TIERRA_DE_ENTRADA[entrada.id];
  if (tierra) hoja.append(botonTierra(tierra, entrada));
  hoja.append(enlaces(entrada, contenido));
  panel.replaceChildren(hoja);
  panel.classList.add('abierto');
  panel.scrollTop = 0;
}

// Las entradas que tienen página de tierra (#/lugares/<tierra>).
const TIERRA_DE_ENTRADA = { solania: 'solania', 'la-forja': 'forja', 'el-marjal': 'marjal', 'estepa-de-kadem': 'estepa', 'cuenca-del-cerco': 'cuenca' };

function botonTierra(tierra, entrada) {
  const enlace = crear('a', 'boton-mapa', `Recorrer ${entrada.titulo}`);
  enlace.href = `#/lugares/${tierra}`;
  return enlace;
}

function botonPagina(entrada) {
  const relato = entrada.tipo === 'relato';
  const enlace = crear('a', 'boton-mapa', relato ? 'Leer el relato' : 'Ver su página');
  enlace.href = relato ? `#/relatos/${entrada.id}` : `#/personajes/${entrada.id}`;
  return enlace;
}

function cabecera(entrada) {
  const partes = [crear('p', 'ficha-tipo', TIPOS[entrada.tipo]), crear('h2', null, entrada.titulo)];
  if (entrada.imagen) partes.unshift(crearIlustracion(`ilustracion-panel ${entrada.tipo}`, entrada));
  const sub = entrada.anio ?? entrada.subtitulo;
  if (sub) partes.push(crear('p', 'ficha-sub', sub));
  return partes;
}

/** El texto de una entrada en la capa que toca (y animada la primera vez que se ve esa capa). */
export function cuerpoDe(entrada, contenido) {
  if (modoDesarrollo) return todasLasCapas(entrada, contenido);
  const capa = capaDe(entrada);
  const animar = capa !== 'oficial' && primeraVez(entrada.id, capa);

  if (capa === 'verdad') {
    const pliego = contenido.entradas.get(entrada.verdad.por);
    const oficial = parrafos(entrada.oficial, 'texto texto-tachado');
    const verdad = crear('section', 'capa-verdad');
    verdad.append(crear('p', 'fuente', `Según ${pliego.cita}`), parrafos(entrada.verdad.texto, 'texto'));
    if (animar) {
      oficial.classList.add('tachando');
      verdad.classList.add('apareciendo');
    }
    return [voz(entrada), oficial, verdad];
  }

  if (capa === 'exaltada') {
    const acta = contenido.entradas.get(entrada.exaltada.por);
    const sello = crear('p', 'correccion', 'Corregida por el arciprestazgo');
    const texto = parrafos(entrada.exaltada.texto, 'texto texto-exaltado');
    if (animar) {
      sello.classList.add('sellando');
      texto.classList.add('reescribiendo');
    }
    return [sello, texto, crear('p', 'fuente', `Según ${acta.cita}`)];
  }

  return [voz(entrada), parrafos(entrada.oficial, 'texto')];
}

function voz(entrada) {
  return crear('p', 'voz', VOCES[entrada.voz] ?? '');
}

/** Modo desarrollo (?todo): las tres capas, una debajo de otra, para revisar el contenido. */
function todasLasCapas(entrada, contenido) {
  const bloques = [voz(entrada), parrafos(entrada.oficial, 'texto')];
  for (const capa of ['exaltada', 'verdad']) {
    if (!entrada[capa]) continue;
    const seccion = crear('section', 'capa-desarrollo');
    const documento = contenido.entradas.get(entrada[capa].por);
    seccion.append(crear('h3', null, `${capa.toUpperCase()} · ${documento.titulo}`),
      parrafos(entrada[capa].texto, capa === 'exaltada' ? 'texto texto-exaltado' : 'texto'));
    bloques.push(seccion);
  }
  return bloques;
}

function cuerpoDeDocumento(documento, contenido) {
  if (!documentoAbierto(documento)) {
    if (documento.acceso === 'acta') return [crear('p', 'estado-sello', 'Este documento no consta en el archivo.')];
    const sello = crear('div', 'sello');
    sello.append(ojoDeVhar());
    return [sello, crear('p', 'estado-sello', 'Sello intacto. El Testigo vive.')];
  }
  const bloques = [crear('div', 'sello roto'), parrafos(documento.texto, 'texto texto-documento')];
  const cambiadas = entradasQueCambia(contenido, documento.id);
  if (cambiadas.length) {
    const seccion = crear('section', 'enlaces');
    const lista = crear('ul');
    cambiadas.forEach(entrada => { const item = crear('li'); item.append(enlaceA(entrada)); lista.append(item); });
    seccion.append(crear('h3', null, documento.clase === 'acta' ? 'El arciprestazgo corrigió' : 'Este pliego desmiente'), lista);
    bloques.push(seccion);
  }
  return bloques;
}

function botonMapa(entrada) {
  const enlace = crear('a', 'boton-mapa', entrada.tipo === 'epoca' ? 'Ver esta época en el mapa' : 'Ver en el mapa');
  enlace.href = `#/mapa/${entrada.id}`;
  return enlace;
}

function enlaces(entrada, contenido) {
  const seccion = crear('section', 'enlaces');
  const lista = crear('ul');
  for (const id of entrada.enlaces ?? []) {
    const destino = contenido.entradas.get(id);
    if (!destino) continue;
    if (destino.tipo === 'documento' && destino.acceso === 'acta' && !documentoAbierto(destino)) continue;
    const item = crear('li');
    item.append(enlaceA(destino));
    lista.append(item);
  }
  if (!lista.children.length) return crear('span');
  seccion.append(crear('h3', null, 'Véase también'), lista);
  return seccion;
}

function botonCerrar() {
  const boton = crear('button', 'cerrar', '×');
  boton.type = 'button';
  boton.setAttribute('aria-label', 'Cerrar');
  boton.addEventListener('click', () => alCerrar());
  return boton;
}
