// ============================================================
// MODULE: FILTERS
// Query engine: visual filters + terminal syntax
// ============================================================

import { extractBank, extractProvince, extractPlatform, getAge } from './utils.js';

/**
 * Parse terminal query: "bank:BCA provinsi:Banten umur>25 keyword"
 * @returns { keyFilters, textQuery }
 */
export function parseTerminalQuery(raw) {
  const keyFilters = { bank: null, provinsi: null, sosmed: null, umur: null };
  let textQuery = '';
  if (!raw) return { keyFilters, textQuery };

  raw.trim().split(/\s+/).forEach(p => {
    if (p.includes(':')) {
      const [k, v] = p.split(':');
      if (k && v) keyFilters[k.toLowerCase()] = v;
    } else if (p.startsWith('umur>')) {
      keyFilters.umur = parseInt(p.replace('umur>', ''), 10);
    } else {
      textQuery += p + ' ';
    }
  });
  return { keyFilters, textQuery: textQuery.trim().toLowerCase() };
}

/**
 * Terapkan semua filter terhadap dataset
 * @param {Array} records - dataset penuh
 * @param {Object} opts - { bank, prov, sosmed, ageMin, ageMax, terminalRaw }
 * @returns {Array} records terfilter
 */
export function applyFilters(records, opts) {
  const { bank, prov, sosmed, ageMin, ageMax, terminalRaw } = opts;
  const { keyFilters, textQuery } = parseTerminalQuery(terminalRaw);

  return records.filter(r => {
    // Visual filters
    if (bank && extractBank(r.rekening) !== bank) return false;
    if (prov && extractProvince(r.alamat) !== prov) return false;
    if (sosmed && extractPlatform(r.sosmed) !== sosmed) return false;

    const age = getAge(r.tanggal_lahir);
    if (age < ageMin || age > ageMax) return false;

    // Terminal key filters
    if (keyFilters.bank &&
        extractBank(r.rekening).toLowerCase() !== keyFilters.bank.toLowerCase()) return false;
    if (keyFilters.provinsi &&
        extractProvince(r.alamat).toLowerCase() !== keyFilters.provinsi.toLowerCase()) return false;
    if (keyFilters.sosmed &&
        extractPlatform(r.sosmed).toLowerCase() !== keyFilters.sosmed.toLowerCase()) return false;
    if (keyFilters.umur !== null && age <= keyFilters.umur) return false;

    // Global text search
    if (textQuery) {
      const hay = `${r.nama_lengkap} ${r.nomor_telepon} ${r.alamat} ${r.email} ${r.rekening} ${r.sosmed}`.toLowerCase();
      if (!hay.includes(textQuery)) return false;
    }
    return true;
  });
}

/** Sort records by field & direction */
export function sortRecords(records, field, direction) {
  return [...records].sort((a, b) => {
    let va = a[field], vb = b[field];
    if (field === 'id') { va = Number(va); vb = Number(vb); }
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return direction === 'asc' ? -1 : 1;
    if (va > vb) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}