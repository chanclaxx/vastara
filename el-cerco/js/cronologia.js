// ─────────────────────────────────────────────────────────────────────────────
// CRONOLOGÍA: la barra de épocas de abajo. Al elegir una, el mapa cambia.
// ─────────────────────────────────────────────────────────────────────────────

let barra = null;

export function montarCronologia(contenedor, epocas, alElegir) {
  barra = contenedor;
  const botones = epocas.map(epoca => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'epoca';
    boton.dataset.epoca = epoca.id;

    const anio = document.createElement('span');
    anio.className = 'anio';
    anio.textContent = epoca.anio;
    const titulo = document.createElement('span');
    titulo.className = 'titulo';
    titulo.textContent = epoca.titulo;
    boton.append(anio, titulo);

    boton.addEventListener('click', () => alElegir(epoca.id));
    const item = document.createElement('li');
    item.append(boton);
    return item;
  });
  barra.replaceChildren(...botones);
}

export function marcarEpoca(epocaId) {
  for (const boton of barra.querySelectorAll('.epoca')) {
    const actual = boton.dataset.epoca === epocaId;
    boton.classList.toggle('actual', actual);
    if (actual) boton.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }
}
