// ─────────────────────────────────────────────────────────────────────────────
// GALERÍAS: las secciones de Personajes, Costumbres y Archivo.
//   Personajes  una ficha por actor, con el sello de su casa y su tierra
//   Costumbres  las cuatro tradiciones escritas el año 0, cada una con su emblema
//   Archivo     los pliegos y actas: abiertos, lacrados o aún no emitidos
// ─────────────────────────────────────────────────────────────────────────────

import { documentoAbierto, reiniciar } from './estado.js';
import { entradasDeTipo } from './contenido.js';
import { crear, ojoDeVhar } from './html.js';
import { extracto } from './lugares.js';
import { crearIlustracion } from './lamina.js';

const TIERRA_DE_VOZ = { solania: 'solania', marjal: 'el-marjal', estepa: 'estepa-de-kadem', forja: 'la-forja' };

let contenido;
export function montarGalerias(datos) {
  contenido = datos;
}

function cabecera(sobre, titulo, intro) {
  return [crear('p', 'seccion-sobre', sobre), crear('h1', 'seccion-titulo', titulo), crear('p', 'seccion-intro', intro)];
}

function tarjeta(entrada, clase, adorno, etiqueta) {
  const enlace = crear('a', `tarjeta ${clase}`);
  enlace.href = `#/entrada/${entrada.id}`;
  const texto = crear('div', 'tarjeta-texto');
  if (etiqueta) texto.append(crear('p', 'tarjeta-etiqueta', etiqueta));
  texto.append(crear('h3', null, entrada.titulo), crear('p', 'ficha-sub', entrada.subtitulo ?? ''),
    crear('p', 'ficha-extracto', extracto(entrada)));
  enlace.append(adorno, texto);
  return enlace;
}

// ── Personajes ──────────────────────────────────────────────────────────────

export function mostrarPersonajes(contenedor) {
  const pagina = crear('div', 'pagina-seccion');
  pagina.append(...cabecera('El Cerco', 'Personajes',
    'Quién es quién en la Segunda Vigilia, contado por la casa o la tierra a la que pertenece.'));
  const rejilla = crear('div', 'tarjetas');
  for (const persona of entradasDeTipo(contenido, 'personaje')) {
    const iniciales = persona.titulo.split(' ').filter(p => p.length > 2).map(p => p[0]).slice(0, 2).join('');
    const sello = persona.imagen
      ? crearIlustracion('retrato', persona)                    // retrato pintado, si ya existe
      : crear('div', `sello-persona tierra-${persona.faccion}`, iniciales);
    const tierra = contenido.entradas.get(persona.faccion)?.titulo;
    const enlace = tarjeta(persona, 'tarjeta-persona', sello, tierra);
    enlace.href = `#/personajes/${persona.id}`;                 // los personajes tienen página propia
    rejilla.append(enlace);
  }
  pagina.append(rejilla);
  contenedor.replaceChildren(pagina);
}

// ── Costumbres ──────────────────────────────────────────────────────────────

const EMBLEMAS = {
  'cuenta-de-la-mirada': '<path d="M6,30 C16,14 44,14 54,30 C44,46 16,46 6,30 Z" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="30" cy="30" r="7" fill="currentColor"/>',
  'deuda-de-nombres': '<path d="M6,30 C14,22 22,38 30,30 C38,22 46,38 54,30" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="16" cy="29" r="3.4" fill="currentColor"/><circle cx="30" cy="30" r="3.4" fill="currentColor"/><circle cx="44" cy="31" r="3.4" fill="currentColor"/>',
  'boca-cerrada': '<path d="M12,30 C20,22 40,22 48,30 C40,38 20,38 12,30 Z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12,30 H48" stroke="currentColor" stroke-width="1.6"/><path d="M20,24 V36 M27,22.5 V37.5 M34,22.5 V37.5 M41,24 V36" stroke="currentColor" stroke-width="1.6"/>',   // labios cosidos
  'registro-de-costo': '<rect x="12" y="10" width="36" height="40" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M19,22 H41 M19,30 H41 M19,38 H33" stroke="currentColor" stroke-width="2"/>',
};

export function mostrarCostumbres(contenedor) {
  const pagina = crear('div', 'pagina-seccion');
  pagina.append(...cabecera('El Cerco', 'Costumbres',
    'Cuatro tradiciones escritas el mismo día del año 0. Cada una reparte quién calcula, quién registra y quién cobra.'));
  const rejilla = crear('div', 'tarjetas tarjetas-grandes');
  for (const costumbre of entradasDeTipo(contenido, 'costumbre')) {
    const emblema = crear('div', 'emblema');
    emblema.innerHTML = `<svg viewBox="0 0 60 60" aria-hidden="true">${EMBLEMAS[costumbre.id] ?? ''}</svg>`;
    const tierra = contenido.entradas.get(TIERRA_DE_VOZ[costumbre.voz])?.titulo;
    const tarjetaCostumbre = tarjeta(costumbre, 'tarjeta-costumbre', emblema, tierra);
    if (costumbre.imagen) tarjetaCostumbre.prepend(crearIlustracion('cabecera-costumbre', costumbre));
    rejilla.append(tarjetaCostumbre);
  }
  pagina.append(rejilla);
  contenedor.replaceChildren(pagina);
}

// ── Archivo ─────────────────────────────────────────────────────────────────

export function mostrarArchivo(contenedor) {
  const pagina = crear('div', 'pagina-seccion');
  pagina.append(...cabecera('El Cerco', 'Archivo de pliegos',
    'Un pliego solo se abre cuando muere su Testigo. Lo que dice se vuelve ley, aunque desmienta todo lo demás.'));
  const romper = crear('button', 'boton-claro', 'Romper un sello');
  romper.type = 'button';
  romper.addEventListener('click', () => document.getElementById('boton-sello').click());
  pagina.append(romper);

  const rejilla = crear('div', 'documentos');
  for (const documento of entradasDeTipo(contenido, 'documento')) {
    const abierto = documentoAbierto(documento);
    if (documento.acceso === 'acta' && !abierto) continue;
    const enlace = crear('a', `documento-tarjeta ${abierto ? 'abierto' : 'lacrado'} ${documento.clase}`);
    enlace.href = `#/entrada/${documento.id}`;
    const sello = crear('div', `sello ${abierto ? 'roto' : ''}`);
    if (!abierto) sello.append(ojoDeVhar());
    enlace.append(sello,
      crear('p', 'tarjeta-etiqueta', documento.clase === 'acta' ? 'Acta del arciprestazgo' : 'Pliego de Testigo'),
      crear('h3', null, documento.titulo),
      crear('p', 'ficha-sub', documento.subtitulo),
      crear('p', 'estado-documento', abierto ? 'Abierto' : 'Sello intacto. El Testigo vive.'));
    rejilla.append(enlace);
  }
  pagina.append(rejilla);

  const reinicio = crear('button', 'reiniciar', 'Volver a lacrar todos los sellos (para pruebas)');
  reinicio.type = 'button';
  reinicio.addEventListener('click', () => { reiniciar(); location.reload(); });
  pagina.append(reinicio);
  contenedor.replaceChildren(pagina);
}
