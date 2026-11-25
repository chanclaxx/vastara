// ─────────────────────────────────────────────────────────────────────────────
// EMBLEMAS: el escudo de cada tierra, dibujado en SVG con un solo color (currentColor).
//   Solania   el ojo de Vhar, que vigila
//   La Forja  la montaña hueca y la placa de cuota
//   El Marjal el cordel de los nombres sobre el agua (los nudos, en índigo: la tinta de las cantoras)
//   La Estepa la piedra del Callado con la boca cosida
//   La Cuenca el pozo sellado sobre la falla
// Se usan en la portada, en las páginas de territorio y en el índice de Lugares.
// ─────────────────────────────────────────────────────────────────────────────

const TRAZO = 'fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';

const DIBUJOS = {
  solania: `
    <path ${TRAZO} d="M50 6 L57 18 L50 15 L43 18 Z"/>
    <path ${TRAZO} d="M50 24 V31 M33 28 L37 35 M67 28 L63 35"/>
    <path ${TRAZO} d="M12 54 C27 32 73 32 88 54 C73 76 27 76 12 54 Z"/>
    <circle cx="50" cy="54" r="12" fill="currentColor"/>
    <circle cx="50" cy="54" r="4.5" class="hueco"/>
    <path ${TRAZO} d="M38 79 L50 94 L62 79"/>`,
  forja: `
    <path ${TRAZO} d="M50 6 L86 46 H14 Z"/>
    <path ${TRAZO} d="M43 46 V35 H57 V46"/>
    <path ${TRAZO} d="M35 53 L43 46 M65 53 L57 46"/>
    <rect ${TRAZO} x="24" y="53" width="52" height="38" rx="2"/>
    <path ${TRAZO} d="M32 63 H68 M32 72 H68 M32 81 H54"/>`,
  marjal: `
    <path ${TRAZO} d="M50 6 C30 22 70 34 50 50 C30 66 70 78 50 94"/>
    <circle cx="50" cy="28" r="5" class="nudo"/>
    <circle cx="50" cy="50" r="5" class="nudo"/>
    <circle cx="50" cy="72" r="5" class="nudo"/>
    <path ${TRAZO} d="M10 56 Q18 50 26 56 T42 56 M58 56 Q66 50 74 56 T90 56"/>
    <path ${TRAZO} d="M16 66 Q22 61 28 66 T40 66 M60 66 Q66 61 72 66 T84 66"/>`,
  estepa: `
    <path ${TRAZO} d="M35 90 L31 32 Q33 9 50 7 Q67 9 69 32 L65 90"/>
    <path ${TRAZO} d="M39 52 Q50 45 61 52 Q50 59 39 52 Z"/>
    <path ${TRAZO} d="M44 46.5 V57.5 M50 45 V59 M56 46.5 V57.5"/>
    <path ${TRAZO} d="M6 38 H22 M10 46 H24 M78 38 H94 M76 46 H90"/>
    <path ${TRAZO} d="M18 92 H82"/>`,
  cuenca: `
    <path ${TRAZO} d="M4 52 L11 46 L16 55 L22 49 M78 49 L84 55 L89 46 L96 52"/>
    <circle ${TRAZO} cx="50" cy="50" r="28"/>
    <circle ${TRAZO} cx="50" cy="50" r="19"/>
    <path ${TRAZO} d="M31 50 H69 M50 31 V69"/>
    <path ${TRAZO} d="M50 8 V16 M50 84 V92"/>`,
};

/** Devuelve un <svg> con el emblema de la tierra (solania, forja, marjal, estepa, cuenca). */
export function emblema(tierra, clase = 'emblema-tierra') {
  const envoltorio = document.createElement('span');
  envoltorio.className = `${clase} emblema-${tierra}`;
  envoltorio.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${DIBUJOS[tierra] ?? ''}</svg>`;
  return envoltorio;
}

/** Línea ornamental con un rombo en medio, para separar secciones. */
export function divisor() {
  const div = document.createElement('div');
  div.className = 'divisor';
  div.innerHTML = '<svg viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">' +
    '<path d="M0 12 H180 M220 12 H400" stroke="currentColor" stroke-width="1"/>' +
    '<path d="M200 2 L210 12 L200 22 L190 12 Z" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
    '<path d="M200 8 L204 12 L200 16 L196 12 Z" fill="currentColor"/></svg>';
  return div;
}
