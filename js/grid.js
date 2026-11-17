// ============================================================
// MODULE: GRID
// Tabel data, pagination, sorting, dan rendering baris
// ============================================================

import { extractBank, extractPlatform, maskPhone, maskRekening } from './utils.js';
import { sortRecords } from './filters.js';

export const gridState = {
  page: 1,
  pageSize: 50,
  sortField: 'id',
  sortDirection: 'asc',
  privacyMasked: false,
  onRowClick: null  // callback: (record) => {}
};

export function renderGrid(records) {
  const sorted = sortRecords(records, gridState.sortField, gridState.sortDirection);
  const totalPages = Math.ceil(sorted.length / gridState.pageSize) || 1;

  if (gridState.page > totalPages) gridState.page = totalPages;
  const start = (gridState.page - 1) * gridState.pageSize;
  const pageData = sorted.slice(start, start + gridState.pageSize);

  const tbody = document.getElementById('dataGridBody');
  tbody.innerHTML = pageData.map(r => {
    const phone = gridState.privacyMasked ? maskPhone(r.nomor_telepon) : r.nomor_telepon;
    const rek   = gridState.privacyMasked ? maskRekening(r.rekening) : r.rekening;
    const platform = extractPlatform(r.sosmed);

    return `<tr class="data-row border-b border-slate-700/50" data-id="${r.id}">
      <td class="p-2 mono text-cyan-400">${r.id}</td>
      <td class="p-2 text-slate-200">${r.nama_lengkap}</td>
      <td class="p-2 mono">${phone}</td>
      <td class="p-2 text-slate-400 text-xs min-w-[220px] max-w-[220px] truncate">${r.alamat}</td>
      <td class="p-2 mono">${r.tanggal_lahir}</td>
      <td class="p-2"><span class="badge-bank px-1.5 py-0.5 rounded text-[10px] mono">${rek}</span></td>
      <td class="p-2 text-slate-400 text-xs min-w-[160px]">${r.email}</td>
      <td class="p-2 hide-mobile"><span class="badge-sosmed px-1.5 py-0.5 rounded text-[10px] mono">${platform}</span></td>
    </tr>`;
  }).join('');

  document.querySelectorAll('.data-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = Number(row.dataset.id);
      const record = records.find(r => r.id === id);
      if (record && gridState.onRowClick) gridState.onRowClick(record);
    });
  });

  document.getElementById('pageInfo').textContent = `Page ${gridState.page} of ${totalPages}`;
  document.getElementById('prevPage').disabled = gridState.page <= 1;
  document.getElementById('nextPage').disabled = gridState.page >= totalPages;
}

// // yang benar (tanpa hide-mobile):
// <td class="p-2 mono">${phone}</td>
// <td class="p-2 mono">${r.tanggal_lahir}</td>

// // bukan:
// <td class="p-2 mono hide-mobile">${phone}</td>



