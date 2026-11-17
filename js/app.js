// ============================================================
// MODULE: APP
// Entry point — inisialisasi & event bindings
// ============================================================

import { SAMPLE_COUNT, DEFAULT_PAGE_SIZE } from './config.js';
import { openDB, loadFromDB, saveToDB, clearDB } from './db.js';
import { generateSampleData } from './generator.js';
import { applyFilters } from './filters.js';
import { renderCharts } from './charts.js';
import { renderGrid, gridState } from './grid.js';
import { openDetailDrawer, bindDrawerEvents, closeDrawer } from './drawer.js';
import {
  showToast, extractBank, extractProvince, extractPlatform,
  getAge, downloadFile
} from './utils.js';

// ============================================================
// STATE
// ============================================================
const state = {
  allRecords: [],
  filteredRecords: []
};

// ============================================================
// RENDER PIPELINE
// ============================================================
function refresh() {
  renderMemory();
  renderKPIs(state.filteredRecords);
  renderCharts(state.filteredRecords);
  renderGrid(state.filteredRecords);
  populateFilterOptions();
}

function renderMemory() {
  document.getElementById('memorySize').textContent    = state.allRecords.length.toLocaleString();
  document.getElementById('datasetCount').textContent  = state.allRecords.length.toLocaleString();
  document.getElementById('filteredCount').textContent = state.filteredRecords.length.toLocaleString();
}

function renderKPIs(records) {
  document.getElementById('kpiTotal').textContent = records.length.toLocaleString();

  let sumAge = 0, countAge = 0;
  const bankCount = {}, provCount = {};

  records.forEach(r => {
    const age = getAge(r.tanggal_lahir);
    if (age > 0) { sumAge += age; countAge++; }
    const b = extractBank(r.rekening);
    const p = extractProvince(r.alamat);
    bankCount[b] = (bankCount[b] || 0) + 1;
    provCount[p] = (provCount[p] || 0) + 1;
  });

  document.getElementById('kpiAvgAge').textContent = countAge ? Math.round(sumAge / countAge) : 0;

  const top = obj => Object.entries(obj).reduce((a, b) => b[1] > a[1] ? b : a, ['—', 0])[0];
  document.getElementById('kpiTopBank').textContent = top(bankCount);
  document.getElementById('kpiTopProv').textContent = top(provCount);
}

function populateFilterOptions() {
  const banks = new Set(), provs = new Set(), sosmeds = new Set();
  state.allRecords.forEach(r => {
    banks.add(extractBank(r.rekening));
    provs.add(extractProvince(r.alamat));
    sosmeds.add(extractPlatform(r.sosmed));
  });

  const fill = (id, items, allLabel) => {
    const el = document.getElementById(id);
    const cur = el.value;
    el.innerHTML = `<option value="">${allLabel}</option>` +
      [...items].sort().map(v => `<option value="${v}">${v}</option>`).join('');
    el.value = cur;
  };
  fill('filterBank',   banks,   'All Bank');
  fill('filterProv',   provs,   'All Provinsi');
  fill('filterSosmed', sosmeds, 'All Sosmed');
}

// ============================================================
// FILTER TRIGGER
// ============================================================
function runFilters() {
  state.filteredRecords = applyFilters(state.allRecords, {
    bank:        document.getElementById('filterBank').value,
    prov:        document.getElementById('filterProv').value,
    sosmed:      document.getElementById('filterSosmed').value,
    ageMin:      parseInt(document.getElementById('ageMin').value) || 0,
    ageMax:      parseInt(document.getElementById('ageMax').value) || 200,
    terminalRaw: document.getElementById('terminalSearch').value
  });
  gridState.page = 1;
  refresh();
}

// ============================================================
// FILE INGESTION
// ============================================================
async function handleFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['csv', 'json'].includes(ext)) {
    showToast('Format tidak didukung. Gunakan CSV atau JSON.');
    return;
  }
  try {
    let records = [];
    if (ext === 'csv') {
      const text = await file.text();
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });
      records = result.data.map((row, idx) => ({
        id:            Number(row.id) || idx + 1,
        nama_lengkap:  row.nama_lengkap  || '',
        nomor_telepon: row.nomor_telepon || '',
        alamat:        row.alamat        || '',
        tanggal_lahir: row.tanggal_lahir || '',
        rekening:      row.rekening      || '',
        email:         row.email         || '',
        sosmed:        row.sosmed        || ''
      }));
    } else {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('JSON harus berupa array');
      records = parsed.map((r, idx) => ({
        id:            Number(r.id) || idx + 1,
        nama_lengkap:  r.nama_lengkap  || '',
        nomor_telepon: r.nomor_telepon || '',
        alamat:        r.alamat        || '',
        tanggal_lahir: r.tanggal_lahir || '',
        rekening:      r.rekening      || '',
        email:         r.email         || '',
        sosmed:        r.sosmed        || ''
      }));
    }
    if (records.length === 0) {
      showToast('File kosong atau format tidak sesuai.');
      return;
    }
    state.allRecords = records;
    await saveToDB(state.allRecords);
    runFilters();
    showToast(`✅ ${records.length.toLocaleString()} records dimuat.`);
  } catch (err) {
    console.error(err);
    showToast('Gagal memproses file: ' + err.message);
  }
}

// ============================================================
// UI EVENT BINDINGS
// ============================================================
function bindUI() {
  // ---------- Drag & Drop ----------
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover',  (e) => { e.preventDefault(); dropZone.classList.add('border-cyan-500'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('border-cyan-500'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-cyan-500');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
    fileInput.value = '';
  });

  // ---------- Generate Sample ----------
  document.getElementById('generateBtn').addEventListener('click', async () => {
    state.allRecords = generateSampleData(SAMPLE_COUNT);
    await saveToDB(state.allRecords);
    runFilters();
    showToast('⚡ 1.000 dummy records baru di-generate.');
  });

  // ---------- Clear Database ----------
  document.getElementById('clearDbBtn').addEventListener('click', async () => {
    if (!confirm('Hapus semua data dari IndexedDB?')) return;
    await clearDB();
    state.allRecords = [];
    state.filteredRecords = [];
    refresh();
    showToast('🗑️ Database dibersihkan.');
  });

  // ---------- Privacy Toggle ----------
  document.getElementById('privacyToggle').addEventListener('click', () => {
    gridState.privacyMasked = !gridState.privacyMasked;
    document.getElementById('privacyLabel').textContent = gridState.privacyMasked ? 'Hide' : 'Show';
    const icon = document.querySelector('#privacyToggle i');
    icon.setAttribute('data-lucide', gridState.privacyMasked ? 'eye-off' : 'eye');
    lucide.createIcons();
    renderGrid(state.filteredRecords);
  });

  // ---------- Deduplication ----------
  document.getElementById('dedupBtn').addEventListener('click', async () => {
    if (state.allRecords.length === 0) return showToast('Tidak ada data.');
    const seenPhone = new Set(), seenEmail = new Set();
    const unique = state.allRecords.filter(r => {
      if (seenPhone.has(r.nomor_telepon) || seenEmail.has(r.email)) return false;
      seenPhone.add(r.nomor_telepon);
      seenEmail.add(r.email);
      return true;
    });
    const removed = state.allRecords.length - unique.length;
    if (removed === 0) return showToast('Tidak ditemukan duplikat.');
    state.allRecords = unique;
    await saveToDB(state.allRecords);
    runFilters();
    showToast(`🧹 ${removed.toLocaleString()} duplikat dihapus.`);
  });

  // ---------- Export CSV ----------
  document.getElementById('exportCsvBtn').addEventListener('click', () => {
    if (state.filteredRecords.length === 0) return showToast('Tidak ada data terfilter.');
    const csv = Papa.unparse(state.filteredRecords);
    downloadFile(csv, 'export.csv', 'text/csv');
  });

  // ---------- Export JSON ----------
  document.getElementById('exportJsonBtn').addEventListener('click', () => {
    if (state.filteredRecords.length === 0) return showToast('Tidak ada data terfilter.');
    const json = JSON.stringify(state.filteredRecords, null, 2);
    downloadFile(json, 'export.json', 'application/json');
  });

  // ---------- Terminal Search (debounce 200ms) ----------
  let debounceTimer;
  document.getElementById('terminalSearch').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runFilters, 200);
  });

  // ---------- Visual Filters ----------
  ['filterBank', 'filterProv', 'filterSosmed', 'ageMin', 'ageMax'].forEach(id => {
    document.getElementById(id).addEventListener('input', runFilters);
    document.getElementById(id).addEventListener('change', runFilters);
  });

  // ---------- Reset Filters ----------
  document.getElementById('resetFilters').addEventListener('click', () => {
    document.getElementById('filterBank').value = '';
    document.getElementById('filterProv').value = '';
    document.getElementById('filterSosmed').value = '';
    document.getElementById('ageMin').value = '';
    document.getElementById('ageMax').value = '';
    document.getElementById('terminalSearch').value = '';
    runFilters();
  });

  // ---------- Column Sorting ----------
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (gridState.sortField === field) {
        gridState.sortDirection = gridState.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        gridState.sortField = field;
        gridState.sortDirection = 'asc';
      }
      document.querySelectorAll('.sort-icon').forEach(el => el.textContent = '↕');
      th.querySelector('.sort-icon').textContent = gridState.sortDirection === 'asc' ? '↑' : '↓';
      renderGrid(state.filteredRecords);
    });
  });

  // ---------- Pagination ----------
  document.getElementById('pageSize').addEventListener('change', (e) => {
    gridState.pageSize = Number(e.target.value);
    gridState.page = 1;
    renderGrid(state.filteredRecords);
  });

  document.getElementById('prevPage').addEventListener('click', () => {
    if (gridState.page > 1) {
      gridState.page--;
      renderGrid(state.filteredRecords);
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(state.filteredRecords.length / gridState.pageSize) || 1;
    if (gridState.page < totalPages) {
      gridState.page++;
      renderGrid(state.filteredRecords);
    }
  });
}

// ============================================================
// BOOTSTRAP
// ============================================================
async function init() {
  lucide.createIcons();
  await openDB();

  const stored = await loadFromDB();
  if (stored.length > 0) {
    state.allRecords = stored;
    showToast(`📂 ${stored.length.toLocaleString()} records dari IndexedDB.`);
  } else {
    state.allRecords = generateSampleData(SAMPLE_COUNT);
    await saveToDB(state.allRecords);
    showToast('ℹ️ Dataset sampel 1.000 baris dimuat.');
  }

  gridState.pageSize = DEFAULT_PAGE_SIZE;
  gridState.onRowClick = (record) => openDetailDrawer(record, gridState.privacyMasked);

  runFilters();
  bindDrawerEvents();
  bindUI();
}

// ---- START APP ----
init().catch(err => {
  console.error('Fatal init error:', err);
  showToast('❌ Gagal inisialisasi aplikasi. Cek console.');
});