// ============================================================
// MODULE: DRAWER
// Detail modal per record
// ============================================================

import { getAge, maskPhone, maskRekening, showToast } from './utils.js';

let currentRecord = null;

export function openDetailDrawer(record, privacyMasked = false) {
  currentRecord = record;
  const drawer  = document.getElementById('detailDrawer');
  const content = document.getElementById('drawerContent');

  const phone = privacyMasked ? maskPhone(record.nomor_telepon) : record.nomor_telepon;
  const rek   = privacyMasked ? maskRekening(record.rekening) : record.rekening;
  const age   = getAge(record.tanggal_lahir);

  content.innerHTML = `
    ${row('ID',        `<span class="text-cyan-400">${record.id}</span>`)}
    ${row('Nama',      `<span class="text-slate-200">${record.nama_lengkap}</span>`)}
    ${row('Telepon',   `<span class="mono text-emerald-400">${phone}</span>`)}
    ${row('Alamat',    `<span class="text-xs">${record.alamat}</span>`)}
    ${row('Tgl Lahir', `<span class="mono">${record.tanggal_lahir} <span class="text-slate-500">(${age} th)</span></span>`)}
    ${row('Rekening',  `<span class="mono text-cyan-300">${rek}</span>`)}
    ${row('Email',     `<span class="text-xs">${record.email}</span>`)}
    ${row('Sosmed',    `<span class="text-emerald-300 text-xs">${record.sosmed}</span>`, true)}
  `;

  drawer.classList.remove('hidden');
  drawer.classList.add('flex');
}

function row(label, value, last = false) {
  return `<div class="grid grid-cols-3 gap-2 ${last ? '' : 'border-b border-slate-700 pb-2'}">
    <span class="text-slate-500 col-span-1">${label}</span>
    <span class="col-span-2">${value}</span>
  </div>`;
}

export function closeDrawer() {
  const drawer = document.getElementById('detailDrawer');
  drawer.classList.add('hidden');
  drawer.classList.remove('flex');
  currentRecord = null;
}

export function bindDrawerEvents() {
  document.getElementById('closeDrawer').addEventListener('click', closeDrawer);
  document.getElementById('detailDrawer').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDrawer();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  document.getElementById('copyJsonBtn').addEventListener('click', () => {
    if (!currentRecord) return;
    navigator.clipboard.writeText(JSON.stringify(currentRecord, null, 2));
    showToast('📋 JSON disalin.');
  });

  document.getElementById('copyTextBtn').addEventListener('click', () => {
    if (!currentRecord) return;
    const r = currentRecord;
    const text = `ID: ${r.id}\nNama: ${r.nama_lengkap}\nTelepon: ${r.nomor_telepon}\n` +
                 `Alamat: ${r.alamat}\nTgl Lahir: ${r.tanggal_lahir}\nRekening: ${r.rekening}\n` +
                 `Email: ${r.email}\nSosmed: ${r.sosmed}`;
    navigator.clipboard.writeText(text);
    showToast('📋 Teks disalin.');
  });
}