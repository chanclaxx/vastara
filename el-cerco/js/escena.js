// ─────────────────────────────────────────────────────────────────────────────
// ESCENA: los efectos de scroll de las páginas narrativas (portada y territorios).
//   aparecerAlBajar(raiz)          lo marcado con .aparece se desvela al entrar en pantalla
//   paralaje(raiz, imagen, f)      la imagen de cabecera baja más despacio que el texto
//   seguirSecciones(raiz, barra)   la barra de progreso marca la sección que se está leyendo
// Con "reducir movimiento" activado no hay paralaje y todo aparece sin transición.
// ─────────────────────────────────────────────────────────────────────────────

const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function aparecerAlBajar(raiz) {
  const elementos = raiz.querySelectorAll('.aparece');
  if (quieto() || !('IntersectionObserver' in window)) {
    elementos.forEach(el => el.classList.add('visible'));
    return;
  }
  const observador = new IntersectionObserver(entradas => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      entrada.target.classList.add('visible');
      observador.unobserve(entrada.target);
    }
  }, { root: raiz.closest('.vista'), rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  elementos.forEach(el => observador.observe(el));
}

// Un solo oyente de scroll por vista: cada página nueva sustituye al de la anterior.
const oyentes = new WeakMap();
function alDesplazar(vista, funcion) {
  vista.removeEventListener('scroll', oyentes.get(vista));
  oyentes.set(vista, funcion);
  vista.addEventListener('scroll', funcion, { passive: true });
  funcion();
}

/** Mueve 'imagen' a 'factor' de la velocidad del scroll (0 = fija con la página, 1 = clavada a la pantalla). */
export function paralaje(raiz, imagen, factor = 0.45, alMover) {
  const vista = raiz.closest('.vista');
  let pendiente = false;
  alDesplazar(vista, () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      pendiente = false;
      const y = vista.scrollTop;
      if (!quieto() && y < vista.clientHeight * 1.5) imagen.style.transform = `translate3d(0, ${y * factor}px, 0) scale(1.06)`;
      alMover?.(y);
    });
  });
}

/** 'barra' tiene botones con data-seccion="<id>"; se marca el de la sección más visible. */
export function seguirSecciones(raiz, barra) {
  const vista = raiz.closest('.vista');
  const botones = [...barra.querySelectorAll('[data-seccion]')];
  for (const boton of botones) {
    boton.addEventListener('click', () => {
      const destino = raiz.querySelector(`#${boton.dataset.seccion}`);
      const alto = barra.getBoundingClientRect().height;
      vista.scrollTo({ top: destino.offsetTop - alto, behavior: quieto() ? 'auto' : 'smooth' });
    });
  }
  if (!('IntersectionObserver' in window)) return;
  const observador = new IntersectionObserver(entradas => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      const indice = botones.findIndex(b => b.dataset.seccion === entrada.target.id);
      botones.forEach((b, i) => {
        b.classList.toggle('actual', i === indice);
        b.classList.toggle('leida', i < indice);
      });
    }
  }, { root: vista, rootMargin: '-35% 0px -60% 0px' });
  botones.forEach(b => observador.observe(raiz.querySelector(`#${b.dataset.seccion}`)));
}
