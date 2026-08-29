/**
 * Celebración discreta: confeti de papel y estrellas. Corto y sin estridencias.
 */

const COLORES = ['#d9634a', '#e9b23c', '#2e7d74', '#6fa8c7', '#9b8bc4', '#e79a94'];

let lienzo = null;
let ctx = null;
let particulas = [];
let animando = false;

function preparar() {
  if (lienzo) return;
  lienzo = document.createElement('canvas');
  lienzo.id = 'confeti';
  document.body.appendChild(lienzo);
  ctx = lienzo.getContext('2d');
  redimensionar();
  window.addEventListener('resize', redimensionar);
}

function redimensionar() {
  if (!lienzo) return;
  const r = Math.min(window.devicePixelRatio || 1, 2);
  lienzo.width = window.innerWidth * r;
  lienzo.height = window.innerHeight * r;
  lienzo.style.width = window.innerWidth + 'px';
  lienzo.style.height = window.innerHeight + 'px';
  ctx.setTransform(r, 0, 0, r, 0, 0);
}

function bucle() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);

  particulas = particulas.filter((p) => p.vida > 0);
  for (const p of particulas) {
    p.vida -= 1;
    p.vx *= 0.99;
    p.vy += 0.16;
    p.x += p.vx;
    p.y += p.vy;
    p.giro += p.vgiro;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.giro);
    ctx.globalAlpha = Math.min(1, p.vida / 30);
    ctx.fillStyle = p.color;
    if (p.tipo === 0) ctx.fillRect(-p.r, -p.r * 0.55, p.r * 2, p.r * 1.1);
    else {
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (particulas.length) requestAnimationFrame(bucle);
  else {
    animando = false;
    ctx.clearRect(0, 0, w, h);
  }
}

/**
 * Lanza confeti.
 * @param {number} cantidad
 * @param {{x:number,y:number}} origen  por defecto, la parte alta del centro
 */
export function confeti(cantidad = 70, origen = null) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  preparar();
  // por defecto estalla en la parte alta: cae sobre la pantalla sin tapar el texto
  const ox = origen?.x ?? window.innerWidth / 2;
  const oy = origen?.y ?? window.innerHeight * 0.14;

  for (let i = 0; i < cantidad; i++) {
    const ang = Math.random() * Math.PI * 2;
    const vel = 3 + Math.random() * 8;
    particulas.push({
      x: ox + (Math.random() - 0.5) * 60,
      y: oy + (Math.random() - 0.5) * 30,
      vx: Math.cos(ang) * vel,
      vy: Math.sin(ang) * vel - 4,
      r: 4 + Math.random() * 5,
      giro: Math.random() * Math.PI,
      vgiro: (Math.random() - 0.5) * 0.3,
      color: COLORES[(Math.random() * COLORES.length) | 0],
      tipo: Math.random() < 0.65 ? 0 : 1,
      vida: 90 + Math.random() * 60,
    });
  }

  if (!animando) {
    animando = true;
    requestAnimationFrame(bucle);
  }
}
