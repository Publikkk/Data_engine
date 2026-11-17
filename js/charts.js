// ============================================================
// MODULE: CHARTS
// Chart.js wrapper untuk visualisasi analytics
// ============================================================

import { extractBank, extractPlatform } from './utils.js';

let bankChart = null;
let sosmedChart = null;

export function renderCharts(records) {
  const bankCount = {};
  const sosmedCount = {};

  records.forEach(r => {
    const b = extractBank(r.rekening);
    const s = extractPlatform(r.sosmed);
    bankCount[b]  = (bankCount[b] || 0) + 1;
    sosmedCount[s] = (sosmedCount[s] || 0) + 1;
  });

  // --- Bank Bar Chart ---
  const bankCtx = document.getElementById('bankChart').getContext('2d');
  const bankLabels = Object.keys(bankCount).sort((a,b) => bankCount[b]-bankCount[a]).slice(0,8);
  const bankData   = bankLabels.map(k => bankCount[k]);

  if (bankChart) bankChart.destroy();
  bankChart = new Chart(bankCtx, {
    type: 'bar',
    data: {
      labels: bankLabels,
      datasets: [{
        label: 'Records',
        data: bankData,
        backgroundColor: '#06b6d4',
        borderRadius: 4,
        maxBarThickness: 28
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8', font: { size: 9 } } },
        x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { display: false } }
      }
    }
  });

  // --- Sosmed Doughnut ---
  const sosmedCtx = document.getElementById('sosmedChart').getContext('2d');
  const sLabels = Object.keys(sosmedCount).sort((a,b) => sosmedCount[b]-sosmedCount[a]);
  const sData   = sLabels.map(k => sosmedCount[k]);

  if (sosmedChart) sosmedChart.destroy();
  sosmedChart = new Chart(sosmedCtx, {
    type: 'doughnut',
    data: {
      labels: sLabels,
      datasets: [{
        data: sData,
        backgroundColor: ['#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#f97316'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 9 }, boxWidth: 10 } }
      },
      cutout: '65%'
    }
  });
}