// ─────────────────────────────────────────────────────────────────────────────
// LO QUE CALLAN LOS PLIEGOS: el bloque que cada tierra y cada personaje tiene al final de su página.
// Enseña los pliegos y actas que hablan de lo que hay en esa página:
//   - pliego con sello intacto   «Su Testigo sigue vivo» + botón para romperlo ahí mismo
//   - pliego lacrado (sin código) «Nadie lo ha abierto todavía»
//   - pliego o acta abiertos      qué ha cambiado aquí, con enlace a cada entrada
//   - acta sin abrir              no aparece: el arciprestazgo no avisa de lo que va a corregir
// Un documento "habla de" una página si cambia alguna de sus entradas o la nombra en sus enlaces.
// ─────────────────────────────────────────────────────────────────────────────

import { documentoAbierto } from './estado.js';
import { entradasDeTipo, entradasQueCambia } from './contenido.js';
import { crear, enlaceA, ojoDeVhar } from './html.js';
import { divisor } from './emblemas.js';

/** Los documentos que tocan alguna de las entradas 'ids' (un Set), en el orden del índice. */
export function documentosSobre(contenido, ids) {
  return entradasDeTipo(contenido, 'documento').filter(documento => {
    if (documento.acceso === 'acta' && !documentoAbierto(documento)) return false;
    const cambia = entradasQueCambia(contenido, documento.id).some(entrada => ids.has(entrada.id));
    return cambia || (documento.enlaces ?? []).some(id => ids.has(id));
  });
}

/** La sección completa, o null si ningún documento habla de esta página. */
export function seccionPliegos(contenido, ids, nombre) {
  const documentos = documentosSobre(contenido, ids);
  if (!documentos.length) return null;

  const seccion = crear('section', 'seccion-t seccion-pliegos');
  const cabeza = crear('header', 'seccion-cabeza aparece');
  const cerrados = documentos.filter(d => !documentoAbierto(d)).length;
  const soloActas = documentos.every(d => d.clase === 'acta');
  let resumen;
  if (cerrados) resumen = `${cerrados === 1 ? 'Hay un pliego sellado' : `Hay ${cerrados} pliegos sellados`} que ${cerrados === 1 ? 'habla' : 'hablan'} de ${nombre}. Mientras su Testigo viva, nadie puede leerlo.`;
  else if (soloActas) resumen = `El arciprestazgo ha corregido lo que se contaba de ${nombre}. Ningún pliego lo desmiente todavía.`;
  else resumen = `Todo lo que se escribió sobre ${nombre} ya está abierto. Lo escrito en un pliego abierto es ley.`;
  cabeza.append(crear('p', 'seccion-sobre', 'Lo que callan los pliegos'), crear('h2', 'seccion-titulo-t', 'Los pliegos'),
    divisor(), crear('p', 'pliegos-resumen', resumen));

  const fila = crear('div', 'pliegos');
  documentos.forEach((documento, n) => {
    const tarjeta = tarjetaDePliego(documento, contenido, ids);
    tarjeta.style.setProperty('--retraso', `${n * 110}ms`);
    fila.append(tarjeta);
  });
  seccion.append(cabeza, fila);
  return seccion;
}

function tarjetaDePliego(documento, contenido, ids) {
  const abierto = documentoAbierto(documento);
  const tarjeta = crear('article', `pliego-bloque aparece ${abierto ? 'abierto' : 'cerrado'} ${documento.clase}`);
  const sello = crear('div', `sello-grande ${abierto ? 'roto' : ''}`);
  sello.append(ojoDeVhar(abierto ? '#8a7e6e' : '#c9b79a'));

  const texto = crear('div', 'pliego-bloque-texto');
  texto.append(
    crear('p', 'tarjeta-etiqueta', documento.clase === 'acta' ? 'Acta del arciprestazgo' : 'Pliego de Testigo'),
    crear('h3', null, documento.titulo),
    crear('p', 'ficha-sub', documento.subtitulo),
  );

  if (!abierto) {
    const puedeAbrirse = documento.acceso === 'sello';
    texto.append(crear('p', 'pliego-estado', puedeAbrirse
      ? 'Sello intacto. Su Testigo sigue vivo.'
      : 'Sello intacto. Nadie lo ha abierto todavía.'));
    if (puedeAbrirse) {
      const romper = crear('button', 'boton-romper', 'Romper el sello');
      romper.type = 'button';
      // main.js escucha este aviso: abre el cuadro del código y, al cerrarlo, vuelve a pintar esta página.
      romper.addEventListener('click', () => document.dispatchEvent(new CustomEvent('romper-aqui')));
      texto.append(romper);
    }
  } else {
    const cambiadas = entradasQueCambia(contenido, documento.id).filter(e => ids.has(e.id));
    texto.append(crear('p', 'pliego-estado', documento.clase === 'acta'
      ? 'Abierta. El arciprestazgo ha corregido la crónica.'
      : 'Abierto. Lo escrito es ley.'));
    if (cambiadas.length) {
      const lista = crear('p', 'pliego-cambia');
      lista.append(documento.clase === 'acta' ? 'Corrige: ' : 'Desmiente: ');
      cambiadas.forEach((entrada, n) => {
        if (n) lista.append(', ');
        lista.append(enlaceA(entrada));
      });
      texto.append(lista);
    }
    const leer = crear('a', 'boton-mapa', documento.clase === 'acta' ? 'Leer el acta' : 'Leer el pliego');
    leer.href = `#/entrada/${documento.id}`;
    texto.append(leer);
  }
  tarjeta.append(sello, texto);
  return tarjeta;
}
