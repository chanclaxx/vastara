// ─────────────────────────────────────────────────────────────────────────────
// DESMENTIDO: la secuencia a pantalla completa que se ve al romper un sello por primera vez.
//
//   Pliego (la verdad), en negro:
//     1. cae un sello de lacre enorme que late como una vela («Su Testigo ha muerto»)
//     2. se agrieta, la luz se cuela por las grietas, la pantalla tiembla y estalla en esquirlas y ceniza
//     3. la frase oficial aparece, una pincelada la tacha y sus palabras se deshacen en ceniza
//     4. la frase del Testigo se escribe letra a letra; la última, sola y más grande
//     5. «Lo escrito en un pliego abierto es ley»
//   Acta (la exaltación), sobre papel:
//     la frase oficial, un sello CORREGIDA que cae con manchas de tinta, el texto se emborrona
//     y el arciprestazgo escribe encima su versión.
//
// desmentir() devuelve una promesa que se cumple al pulsar «Seguir» o «Saltar» (o Escape).
// Las frases salen del contenido: la entrada que el documento cambia en su época (o la primera que cambie).
// ─────────────────────────────────────────────────────────────────────────────

import { entradasQueCambia } from './contenido.js';
import { crear, ojoDeVhar } from './html.js';

const ESQUIRLAS = 9;

export function desmentir(dialogo, documento, contenido, codigo) {
  const esActa = documento.clase === 'acta';
  const entrada = entradaDesmentida(documento, contenido, codigo);
  if (!entrada) return Promise.resolve();
  const capa = esActa ? 'exaltada' : 'verdad';
  const oficial = primeraFrase(entrada.oficial);
  const nueva = frasesNuevas(entrada[capa].texto);

  const cine = crear('div', `cine ${esActa ? 'cine-acta' : 'cine-pliego'}`);
  const ceniza = crear('canvas', 'cine-ceniza');
  const destello = crear('div', 'cine-destello');
  const saltar = crear('button', 'cine-saltar', 'Saltar ›');
  saltar.type = 'button';
  const escena = crear('div', 'cine-escena');
  cine.append(ceniza, destello, escena, saltar);

  dialogo.classList.add('en-cine');
  dialogo.append(cine);

  let terminado = false, alTerminar;
  const fin = new Promise(resolver => { alTerminar = resolver; });
  const acabar = () => {
    if (terminado) return;
    terminado = true;
    dialogo.removeEventListener('cancel', alEscape);
    cine.classList.add('saliendo');
    setTimeout(() => { cine.remove(); dialogo.classList.remove('en-cine'); alTerminar(); }, 450);
  };
  const alEscape = evento => { evento.preventDefault(); acabar(); };
  dialogo.addEventListener('cancel', alEscape);
  saltar.addEventListener('click', acabar);

  // Espera que se corta si se salta: así ningún paso sigue después de cerrar.
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const seguir = async ms => { await espera(ms); if (terminado) throw new Error('saltado'); };

  const guion = esActa
    ? secuenciaActa(escena, cine, documento, oficial, nueva, seguir, acabar)
    : secuenciaPliego(escena, cine, ceniza, destello, documento, oficial, nueva, seguir, acabar);
  guion.catch(() => {});                        // saltado: no pasa nada
  return fin;
}

// ── El pliego ───────────────────────────────────────────────────────────────

async function secuenciaPliego(escena, cine, lienzo, destello, documento, oficial, nueva, seguir, acabar) {
  // 1. El sello
  const rotulo = crear('div', 'cine-rotulo');
  rotulo.append(crear('p', 'cine-sobre', 'Pliego de Testigo'), crear('h2', null, documento.titulo));
  const sello = selloQueSeRompe();
  const pie = crear('p', 'cine-pie', 'Su Testigo ha muerto. Ya nadie puede impedir que se lea.');
  const primerActo = crear('div', 'cine-acto');
  primerActo.append(rotulo, sello, pie);
  escena.append(primerActo);
  await seguir(1500);

  // 2. Grietas, temblor y estallido
  sello.classList.add('agrietado');
  await seguir(1100);
  cine.classList.add('temblor');
  sello.classList.add('roto');
  destello.classList.add('encendido');
  soltarCeniza(lienzo, sello);
  await seguir(900);
  primerActo.classList.add('fuera');
  await seguir(700);
  primerActo.remove();
  cine.classList.remove('temblor');

  // 3. La frase oficial, tachada y hecha ceniza
  const segundoActo = crear('div', 'cine-acto cine-textos');
  const etiquetaOficial = crear('p', 'cine-etiqueta', 'Lo que decía el archivo');
  const frase = fraseEnPalabras(oficial, 'cine-oficial');
  segundoActo.append(etiquetaOficial, frase);
  escena.append(segundoActo);
  await seguir(1600);
  frase.classList.add('tachada');
  await seguir(1100);
  frase.classList.add('ceniza');
  etiquetaOficial.classList.add('apagada');
  await seguir(1500);
  frase.remove();
  etiquetaOficial.remove();

  // 4. Lo que vio el Testigo, letra a letra
  segundoActo.append(crear('p', 'cine-etiqueta cine-fuente', `Según ${documento.cita}`));
  const cuerpo = crear('p', 'cine-verdad');
  segundoActo.append(cuerpo);
  await seguir(500);
  await escribir(cuerpo, nueva.cuerpo, seguir);
  if (nueva.remate) {
    await seguir(600);
    const remate = crear('p', 'cine-remate', nueva.remate);
    segundoActo.append(remate);
    await seguir(1400);
  }

  // 5. La ley
  const ley = crear('div', 'cine-ley');
  ley.append(crear('span', null, 'Lo escrito en un pliego abierto es ley'));
  segundoActo.append(ley);
  cine.classList.add('temblor-suave');
  await seguir(1300);
  segundoActo.append(botonSeguir('Leer el pliego entero', acabar));
}

function selloQueSeRompe() {
  const sello = crear('div', 'cine-sello');
  const disco = crear('div', 'cine-disco');
  const ojo = crear('div', 'cine-ojo');
  ojo.append(ojoDeVhar('#c9b79a'));
  disco.append(ojo);

  // Las grietas y las esquirlas siguen los mismos radios: el sello se parte por donde se agrietó.
  const angulos = Array.from({ length: ESQUIRLAS }, (_, i) => (i / ESQUIRLAS) * Math.PI * 2 + (Math.random() - 0.5) * 0.35);
  // Cada grieta nace cerca del centro (no en él), quiebra tres veces y acaba en el borde donde se separan dos
  // esquirlas; la mitad echa una rama corta. Así parece lacre roto y no los radios de una rueda.
  const grietas = angulos.map((a, i) => {
    const p = (r, d) => `${(50 + r * 50 * Math.cos(a + d)).toFixed(1)},${(50 + r * 50 * Math.sin(a + d)).toFixed(1)}`;
    const quiebro = () => (Math.random() - 0.5) * 0.45;
    const r1 = 0.08 + Math.random() * 0.1, r2 = 0.32 + Math.random() * 0.12, r3 = 0.62 + Math.random() * 0.12;
    const d2 = quiebro(), d3 = quiebro();
    let trazo = `<polyline points="${p(r1, quiebro() * 2)} ${p(r2, d2)} ${p(r3, d3)} ${p(1.06, 0)}"/>`;
    if (i % 2 === 0) trazo += `<polyline class="rama" points="${p(r2, d2)} ${p(r2 + 0.22, d2 + (Math.random() < 0.5 ? -0.5 : 0.5))}"/>`;
    return trazo;
  }).join('');
  disco.insertAdjacentHTML('beforeend', `<svg class="cine-grietas" viewBox="0 0 100 100" aria-hidden="true">${grietas}</svg>`);

  const esquirlas = crear('div', 'cine-esquirlas');
  angulos.forEach((a, i) => {
    const b = angulos[(i + 1) % ESQUIRLAS] + (i === ESQUIRLAS - 1 ? Math.PI * 2 : 0);
    const punto = ang => `${(50 + 75 * Math.cos(ang)).toFixed(1)}% ${(50 + 75 * Math.sin(ang)).toFixed(1)}%`;
    const esquirla = crear('div', 'cine-esquirla');
    esquirla.style.clipPath = `polygon(50% 50%, ${punto(a)}, ${punto((a + b) / 2)}, ${punto(b)})`;
    const centro = (a + b) / 2, lejos = 380 + Math.random() * 320;
    esquirla.style.setProperty('--dx', `${Math.cos(centro) * lejos}px`);
    esquirla.style.setProperty('--dy', `${Math.sin(centro) * lejos + 120}px`);
    esquirla.style.setProperty('--giro', `${(Math.random() - 0.5) * 540}deg`);
    esquirlas.append(esquirla);
  });
  sello.append(disco, esquirlas);
  return sello;
}

// ── El acta ─────────────────────────────────────────────────────────────────

async function secuenciaActa(escena, cine, documento, oficial, nueva, seguir, acabar) {
  const acto = crear('div', 'cine-acto cine-textos');
  const rotulo = crear('div', 'cine-rotulo');
  rotulo.append(crear('p', 'cine-sobre', 'Acta del arciprestazgo'), crear('h2', null, documento.titulo));
  const etiqueta = crear('p', 'cine-etiqueta', 'Lo que decía el archivo');
  const frase = fraseEnPalabras(oficial, 'cine-oficial');
  const marco = crear('div', 'cine-corregir');
  marco.append(frase);
  acto.append(rotulo, etiqueta, marco);
  escena.append(acto);
  await seguir(1900);

  // El sello CORREGIDA cae con sus manchas de tinta
  const estampa = crear('div', 'cine-estampa', 'Corregida');
  marco.append(estampa, manchasDeTinta());
  marco.classList.add('estampado');
  cine.classList.add('temblor');
  await seguir(700);
  cine.classList.remove('temblor');
  frase.classList.add('emborronada');
  etiqueta.classList.add('apagada');
  await seguir(1300);

  acto.append(crear('p', 'cine-etiqueta cine-fuente', 'Lo que dice ahora el arciprestazgo'));
  const cuerpo = crear('p', 'cine-verdad');
  acto.append(cuerpo);
  await escribir(cuerpo, [nueva.cuerpo, nueva.remate].filter(Boolean).join(' '), seguir);
  await seguir(900);
  const ley = crear('div', 'cine-ley');
  ley.append(crear('span', null, 'Dada por el arciprestazgo de la Mirada Alta'));
  acto.append(ley);
  await seguir(1100);
  acto.append(botonSeguir('Leer el acta', acabar));
}

/** Gotas de tinta salpicadas alrededor del sello: redondas, de varios tamaños, más juntas cerca del centro. */
function manchasDeTinta() {
  const envoltorio = crear('div', 'cine-manchas');
  for (let i = 0; i < 18; i++) {
    const gota = crear('span', 'gota');
    const a = Math.random() * Math.PI * 2, lejos = Math.pow(Math.random(), 0.7);
    gota.style.left = `${50 + Math.cos(a) * lejos * 52}%`;
    gota.style.top = `${50 + Math.sin(a) * lejos * 60}%`;
    gota.style.setProperty('--t', `${3 + Math.random() * (lejos < 0.4 ? 16 : 8)}px`);
    gota.style.setProperty('--d', `${150 + Math.random() * 250}ms`);
    envoltorio.append(gota);
  }
  return envoltorio;
}

// ── Piezas comunes ──────────────────────────────────────────────────────────

/** La frase en palabras sueltas: cada una sabe hacia dónde volar cuando se haga ceniza. */
function fraseEnPalabras(texto, clase) {
  const p = crear('p', clase);
  texto.split(' ').forEach((palabra, i) => {
    const span = crear('span', 'palabra', palabra);
    span.style.setProperty('--tx', `${(Math.random() - 0.5) * 120}px`);
    span.style.setProperty('--ty', `${-60 - Math.random() * 160}px`);
    span.style.setProperty('--giro', `${(Math.random() - 0.5) * 50}deg`);
    span.style.setProperty('--d', `${i * 45 + Math.random() * 120}ms`);
    p.append(span, ' ');
  });
  return p;
}

async function escribir(elemento, texto, seguir) {
  const pluma = crear('span', 'cine-pluma');
  const escrito = document.createTextNode('');
  elemento.append(escrito, pluma);
  for (let i = 0; i < texto.length; i++) {
    escrito.data += texto[i];
    const pausa = /[.,:;]/.test(texto[i]) ? 220 : 24;   // la pluma se detiene en cada signo
    await seguir(pausa);
  }
  pluma.remove();
}

function botonSeguir(texto, acabar) {
  const boton = crear('button', 'cine-seguir', texto);
  boton.type = 'button';
  boton.addEventListener('click', acabar);
  requestAnimationFrame(() => boton.focus());
  return boton;
}

/** Partículas de ceniza (y alguna brasa) que salen del sello al romperse y suben despacio. */
function soltarCeniza(lienzo, sello) {
  const ctx = lienzo.getContext('2d');
  const escala = devicePixelRatio || 1;
  lienzo.width = lienzo.clientWidth * escala;
  lienzo.height = lienzo.clientHeight * escala;
  ctx.scale(escala, escala);
  const caja = sello.getBoundingClientRect(), marco = lienzo.getBoundingClientRect();
  const cx = caja.left - marco.left + caja.width / 2, cy = caja.top - marco.top + caja.height / 2;
  const particulas = Array.from({ length: 170 }, () => {
    const a = Math.random() * Math.PI * 2, v = 1 + Math.random() * 6.5;
    return {
      x: cx + Math.cos(a) * 30, y: cy + Math.sin(a) * 30, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5,
      r: 0.8 + Math.random() * 2.4, vida: 1, gasto: 0.004 + Math.random() * 0.008,
      brasa: Math.random() < 0.22,
    };
  });
  const paso = () => {
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    let vivas = 0;
    for (const p of particulas) {
      if (p.vida <= 0) continue;
      vivas++;
      p.vx *= 0.97; p.vy = p.vy * 0.97 - 0.03;            // frena y sube con el aire caliente
      p.x += p.vx + Math.sin(p.y / 40) * 0.3; p.y += p.vy;
      p.vida -= p.gasto;
      ctx.globalAlpha = Math.max(p.vida, 0) * (p.brasa ? 0.95 : 0.6);
      ctx.fillStyle = p.brasa ? '#e0a45a' : '#cfc3ae';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    if (vivas && lienzo.isConnected) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

// ── Qué se desmiente ────────────────────────────────────────────────────────

/** La entrada que el documento cambia en su época; si no, otra época, un personaje o la primera. */
function entradaDesmentida(documento, contenido, codigo) {
  const capa = documento.clase === 'acta' ? 'exaltada' : 'verdad';
  const cambiadas = entradasQueCambia(contenido, documento.id).filter(e => e[capa]?.por === documento.id);
  return cambiadas.find(e => e.id === codigo?.epoca) ?? cambiadas.find(e => e.tipo === 'epoca')
    ?? cambiadas.find(e => e.tipo === 'personaje') ?? cambiadas[0];
}

const limpiar = texto => texto.replace(/[«»“”]/g, '').split('\n')[0].trim();

function primeraFrase(texto) {
  const limpio = limpiar(texto);
  return limpio.match(/^[^.]+\./)?.[0] ?? limpio;
}

/** El primer párrafo de la capa nueva; si acaba en una frase corta, esa frase va aparte (el remate). */
function frasesNuevas(texto) {
  const frases = limpiar(texto).match(/[^.]+\.?/g)?.map(f => f.trim()).filter(Boolean) ?? [];
  const ultima = frases.at(-1) ?? '';
  if (frases.length > 1 && ultima.length <= 42) return { cuerpo: frases.slice(0, -1).join(' '), remate: ultima };
  return { cuerpo: frases.join(' '), remate: null };
}
