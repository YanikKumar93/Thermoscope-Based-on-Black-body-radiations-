import {wien,stefan,fmt} from './physics.js';
import {makeCompareChart,replaceCompareChart} from './chart.js';

let chart;

function temps(){
  return ['compare-a','compare-b','compare-c'].map(id => {
    const input = document.getElementById(id);
    return Math.max(500, Math.min(10000, Number(input?.value) || 500));
  });
}

function render(){
  if (!chart) return;
  const ts = temps();
  replaceCompareChart(chart, ts);
  document.getElementById('comparison-summary').innerHTML = ts.map((t,i) =>
    `<div><small>SOURCE ${String.fromCharCode(65+i)} · ${t.toLocaleString()} K</small><b>λpeak ${fmt(wien(t)*1e9,2)} nm</b><b>${fmt(stefan(t),2)} W/m²</b></div>`
  ).join('');
  window.requestAnimationFrame(() => chart?.update());
}

export function initCompare(){
  const canvas = document.getElementById('compare-chart');
  const button = document.getElementById('compare-update');
  if (!canvas || !button) return;

  chart = makeCompareChart(canvas,[1500,3000,6000]);
  button.addEventListener('click', render);
  ['compare-a','compare-b','compare-c'].forEach(id => {
    const input = document.getElementById(id);
    input?.addEventListener('change', render);
  });
  render();
}
