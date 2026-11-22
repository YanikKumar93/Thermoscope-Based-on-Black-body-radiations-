import { spectrum, fmt } from './physics.js';

const GRID = '#26313c';
const TICK = '#81909e';

function makeCanvasChart(canvas, datasets, xTitle = 'Wavelength (nm)', yTitle = 'Spectral radiance (W sr⁻¹ m⁻³)') {
  const ctx = canvas.getContext('2d');
  let bounds = null;
  let hoverPoint = null;
  let resizeObserver = null;
  const redraw = () => requestAnimationFrame(draw);
  const chart = {
    canvas,
    ctx,
    data: { datasets },
    options: {},
    update: draw,
    destroy() {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', redraw);
      window.removeEventListener('thermoscope:pagechange', redraw);
      if (resizeObserver) resizeObserver.disconnect();
    }
  };

  function draw() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const parentRect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : rect;
    const width = Math.max(320, rect.width || parentRect.width || canvas.clientWidth || 640);
    const height = Math.max(240, rect.height || parentRect.height || canvas.clientHeight || 320);
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const pad = { left: 76, right: 18, top: 18, bottom: 54 };
    const plot = { x: pad.left, y: pad.top, w: width - pad.left - pad.right, h: height - pad.top - pad.bottom };
    const all = datasets.flatMap(ds => ds.data || []).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
    if (!all.length || plot.w <= 0 || plot.h <= 0) return;
    const minX = Math.min(...all.map(p => p.x));
    const maxX = Math.max(...all.map(p => p.x));
    const maxY = Math.max(...all.map(p => p.y));
    const xMin = Math.log10(minX), xMax = Math.log10(maxX);
    const yMax = maxY * 1.08 || 1;
    const xPos = x => plot.x + (Math.log10(x) - xMin) / (xMax - xMin) * plot.w;
    const yPos = y => plot.y + plot.h - (y / yMax) * plot.h;
    bounds = { plot, xPos, yPos, width, height, yMax, minX, maxX };

    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.lineWidth = 1;
    ctx.strokeStyle = GRID;
    ctx.fillStyle = TICK;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const y = plot.y + plot.h - plot.h * i / 4;
      ctx.beginPath(); ctx.moveTo(plot.x, y); ctx.lineTo(plot.x + plot.w, y); ctx.stroke();
      const value = yMax * i / 4;
      ctx.fillText(value.toExponential(1), plot.x - 10, y);
    }
    const xTicks = [100, 200, 300, 500, 750, 1000, 1500, 2000, 3000].filter(v => v >= minX && v <= maxX);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    xTicks.forEach(v => {
      const x = xPos(v);
      ctx.beginPath(); ctx.moveTo(x, plot.y); ctx.lineTo(x, plot.y + plot.h); ctx.stroke();
      ctx.fillText(`${v}`, x, plot.y + plot.h + 8);
    });
    ctx.fillStyle = '#aab7c3';
    ctx.textAlign = 'center';
    ctx.fillText(xTitle, plot.x + plot.w / 2, height - 20);
    ctx.save(); ctx.translate(18, plot.y + plot.h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(yTitle, 0, 0); ctx.restore();

    datasets.forEach(ds => {
      const points = (ds.data || []).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
      if (points.length < 2) return;
      ctx.beginPath();
      points.forEach((p, i) => i ? ctx.lineTo(xPos(p.x), yPos(p.y)) : ctx.moveTo(xPos(p.x), yPos(p.y)));
      ctx.strokeStyle = ds.borderColor || '#ff9b4b';
      ctx.lineWidth = ds.borderWidth || 2;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
      if (ds.fill) {
        ctx.lineTo(xPos(points[points.length - 1].x), plot.y + plot.h);
        ctx.lineTo(xPos(points[0].x), plot.y + plot.h);
        ctx.closePath();
        ctx.fillStyle = ds.backgroundColor || 'rgba(255,155,75,0.08)';
        ctx.fill();
      }
    });

    if (hoverPoint) {
      const { x, y, datasetIndex, point } = hoverPoint;
      ctx.strokeStyle = '#dbe4eb'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x, plot.y); ctx.lineTo(x, plot.y + plot.h); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = datasets[datasetIndex].borderColor || '#ff9b4b'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      const tip = `${point.x.toFixed(1)} nm · ${point.y.toExponential(3)}`;
      ctx.font = '12px system-ui'; const tw = ctx.measureText(tip).width + 18;
      const tx = Math.min(width - tw - 8, Math.max(8, x + 12)); const ty = Math.max(8, y - 34);
      ctx.fillStyle = '#10161d'; ctx.fillRect(tx, ty, tw, 26); ctx.strokeStyle = '#394653'; ctx.strokeRect(tx, ty, tw, 26); ctx.fillStyle = '#e8edf2'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(tip, tx + 9, ty + 13);
    }
  }

  function onMove(e) {
    if (!bounds) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    if (px < bounds.plot.x || px > bounds.plot.x + bounds.plot.w || py < bounds.plot.y || py > bounds.plot.y + bounds.plot.h) { hoverPoint = null; draw(); return; }
    let closest = null, distance = Infinity;
    datasets.forEach((ds, di) => (ds.data || []).forEach(point => {
      const dx = Math.abs(bounds.xPos(point.x) - px);
      if (dx < distance) { distance = dx; closest = { point, datasetIndex: di, x: bounds.xPos(point.x), y: bounds.yPos(point.y) }; }
    }));
    hoverPoint = closest; draw();
  }
  function onLeave() { hoverPoint = null; draw(); }
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  window.addEventListener('resize', redraw);
  window.addEventListener('thermoscope:pagechange', redraw);
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(redraw);
    resizeObserver.observe(canvas.parentElement || canvas);
  }
  draw();
  return chart;
}


export function makeSpectrumChart(canvas, T = 3000) {
  return makeCanvasChart(canvas, [{ label: 'Spectral radiance', data: spectrum(T), borderColor: '#ff9b4b', backgroundColor: 'rgba(255,155,75,0.08)', fill: true, borderWidth: 2 }]);
}
export function updateSpectrumChart(chart, T) {
  chart.data.datasets[0].data = spectrum(T);
  chart.update();
}
export function makeCompareChart(canvas, temps) {
  const colors = ['#ff9b4b', '#65d7e7', '#b79af2'];
  return makeCanvasChart(canvas, temps.map((T, i) => ({ label: `${T} K`, data: spectrum(T), borderColor: colors[i], fill: false, borderWidth: 2 }))); 
}
export function replaceCompareChart(chart, temps) {
  const colors = ['#ff9b4b', '#65d7e7', '#b79af2'];
  const datasets = temps.map((T, i) => ({ label: `${T} K`, data: spectrum(T), borderColor: colors[i], fill: false, borderWidth: 2 }));
  chart.data.datasets.splice(0, chart.data.datasets.length, ...datasets);
  chart.update();
}
