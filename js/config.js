// ============================================================
// MODULE: CONFIG
// Konstanta global & konfigurasi aplikasi
// ============================================================

export const DB_NAME = 'DataNexusDB';
export const DB_VERSION = 1;
export const STORE_NAME = 'records';
export const SAMPLE_COUNT = 1000;

export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_SORT_FIELD = 'id';
export const DEFAULT_SORT_DIRECTION = 'asc';

export const AGE_MIN = 0;
export const AGE_MAX = 120;

// Daftar provinsi & bank untuk validasi
export const KNOWN_BANKS = [
  'BCA', 'Mandiri', 'BRI', 'BNI', 'CIMB Niaga',
  'Danamon', 'Permata', 'BTN', 'OCBC', 'Panin'
];