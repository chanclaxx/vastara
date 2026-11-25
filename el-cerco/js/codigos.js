// ─────────────────────────────────────────────────────────────────────────────
// CÓDIGOS: el diálogo "Romper un sello".
//   - Matar al Testigo en el juego da un código de PLIEGO: revela la verdad.
//   - Ahorcar al oficial da un código de ACTA: el arciprestazgo distorsiona todavía más.
// Los códigos válidos están en contenido/codigos.json. Se comparan sin mayúsculas, espacios ni guiones.
// ─────────────────────────────────────────────────────────────────────────────

import { abrirSello, selloAbierto } from './estado.js';
import { entradasQueCambia } from './contenido.js';
import { crear, enlaceA, parrafos, ojoDeVhar } from './html.js';
import { desmentir } from './desmentido.js';

export function normalizar(texto) {
  return texto.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function buscarCodigo(texto, codigos) {
  const buscado = normalizar(texto);
  return codigos.find(codigo => normalizar(codigo.codigo) === buscado) ?? null;
}

/**
 * Prepara el diálogo. Al cerrarlo, llama a alCerrar(codigo) con el código recién abierto
 * (o null si no se abrió nada nuevo), para que el mapa se redibuje delante del visitante.
 */
export function montarSellos({ dialogo, boton, contenido, alCerrar }) {
  const formulario = dialogo.querySelector('#form-sello');
  const campo = dialogo.querySelector('#codigo');
  const aviso = dialogo.querySelector('#aviso-sello');
  const revelacion = dialogo.querySelector('#revelacion');
  let recienAbierto = null;

  // Cerrar avisa al mapa una sola vez, cierre como cierre: con un botón, un enlace o la tecla Escape.
  // (No se espera al evento 'close': es asíncrono y hay navegadores que lo despachan tarde.)
  function cerrar() {
    if (dialogo.open) dialogo.close();
    const codigo = recienAbierto;
    recienAbierto = null;
    alCerrar(codigo);
  }

  boton.addEventListener('click', () => {
    recienAbierto = null;
    formulario.hidden = false;
    revelacion.hidden = true;
    revelacion.replaceChildren();
    campo.value = '';
    aviso.textContent = '';
    dialogo.showModal();
    campo.focus();
  });

  dialogo.querySelectorAll('[data-cerrar]').forEach(cerrar =>
    cerrar.addEventListener('click', () => dialogo.close()));
  // ↑ Cancelar no abrió nada: basta con cerrar.

  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    const codigo = buscarCodigo(campo.value, contenido.codigos);
    if (!codigo) {
      aviso.textContent = 'Ese sello no consta en ningún registro.';
      return;
    }
    const documento = contenido.entradas.get(codigo.abre);
    const nuevo = !selloAbierto(documento.id);
    if (nuevo) {
      abrirSello(documento.id);
      recienAbierto = codigo;
    }
    formulario.hidden = true;
    // Un sello nuevo se rompe a pantalla completa (desmentido.js); después, la hoja del documento ya abierta.
    const conCine = nuevo && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (conCine) await desmentir(dialogo, documento, contenido, codigo);
    revelacion.replaceChildren(...piezasDeRevelacion(documento, contenido, nuevo, cerrar));
    revelacion.classList.toggle('rompiendo', nuevo);
    revelacion.classList.toggle('tras-cine', conCine);
    revelacion.hidden = false;
  });

  dialogo.addEventListener('close', () => { if (recienAbierto) cerrar(); });   // Escape
}

function piezasDeRevelacion(documento, contenido, nuevo, cerrar) {
  const lacre = crear('div', 'lacre');
  const ojo = crear('div', 'lacre-ojo');
  ojo.append(ojoDeVhar('#8a6a52'));
  lacre.append(crear('div', 'lacre-mitad izq'), crear('div', 'lacre-mitad der'), ojo);

  const hoja = crear('div', 'hoja-revelada');
  const tipo = documento.clase === 'acta' ? 'Acta del arciprestazgo' : 'Pliego de Testigo';
  hoja.append(crear('p', 'ficha-tipo', tipo), crear('h2', null, documento.titulo),
    crear('p', 'ficha-sub', documento.subtitulo));
  if (!nuevo) hoja.append(crear('p', 'ya-abierto', 'Este sello ya estaba roto.'));
  const texto = parrafos(documento.texto, 'texto');
  hoja.append(texto);

  const cambios = crear('section', 'cambios');
  cambios.style.setProperty('--n', texto.children.length);
  const lista = crear('ul');
  for (const entrada of entradasQueCambia(contenido, documento.id)) {
    const item = crear('li');
    const enlace = enlaceA(entrada);
    enlace.addEventListener('click', cerrar);
    item.append(enlace);
    lista.append(item);
  }
  const titulo = documento.clase === 'acta'
    ? 'El arciprestazgo ha corregido el archivo'
    : 'Lo que este pliego desmiente';
  // Si se rompió desde una página (main.js pone data-seguir), uno se queda en ella; si no, va al mapa.
  const seguir = crear('button', 'principal', document.getElementById('sello').dataset.seguir || 'Volver al mapa');
  seguir.type = 'button';
  seguir.addEventListener('click', cerrar);
  cambios.append(crear('h3', null, titulo), lista, seguir);
  hoja.append(cambios);

  return nuevo ? [lacre, hoja] : [hoja];
}
