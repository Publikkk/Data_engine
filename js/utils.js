// ============================================================
// MODULE: UTILS
// Helper functions untuk parsing & masking data
// ============================================================

/** Tampilkan toast notification */
export function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => t.classList.remove('show'), 2800);
}

/** Extract bank name dari "BCA - 3056413953" */
export function extractBank(rek) {
  if (!rek) return 'Unknown';
  return rek.split(' - ')[0].trim() || 'Unknown';
}

/** Extract province dari alamat (elemen kedua-dari-akhir) */
export function extractProvince(alamat) {
  if (!alamat) return 'Unknown';
  const parts = alamat.split(',').map(s => s.trim());
  if (parts.length >= 2) return parts[parts.length - 2] || 'Unknown';
  return parts[0] || 'Unknown';
}

/** Extract platform dari "TikTok: @agus_ibrahim98" */
export function extractPlatform(sosmed) {
  if (!sosmed) return 'Unknown';
  return sosmed.split(':')[0].trim() || 'Unknown';
}

/** Hitung usia dari tanggal_lahir (YYYY-MM-DD) */
export function getAge(tgl) {
  if (!tgl) return 0;
  const birth = new Date(tgl);
  if (isNaN(birth.getTime())) return 0;
  const diff = Date.now() - birth.getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}

/** Mask nomor telepon: 0812xxxxxx -> 08****xx */
export function maskPhone(phone) {
  if (!phone || phone.length <= 4) return '****';
  return phone.slice(0, 2) + '****' + phone.slice(-2);
}

/** Mask rekening: "BCA - 3056413953" -> "BCA - 305****953" */
export function maskRekening(rek) {
  if (!rek) return '';
  const parts = rek.split(' - ');
  if (parts.length < 2) return '****';
  const [bank, num] = parts;
  if (num.length <= 4) return `${bank} - ****`;
  return `${bank} - ${num.slice(0, 3)}****${num.slice(-3)}`;
}

/** Download blob sebagai file */
export function downloadFile(content, name, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}