// ============================================================
// MODULE: GENERATOR
// Sample data generator (1.000 record dummy)
// ============================================================

import { SAMPLE_COUNT } from './config.js';

const FIRST_NAMES = ['Agus','Budi','Siti','Dewi','Rudi','Andi','Rina','Joko','Sri','Bambang',
                     'Eko','Maya','Dian','Ahmad','Nur','Fajar','Putri','Hendra','Ani','Taufik'];
const LAST_NAMES  = ['Ibrahim','Santoso','Wijaya','Pratama','Kusuma','Sari','Hidayat','Nugroho',
                     'Setiawan','Lestari','Rahayu','Firmansyah','Putra','Saputra','Hakim',
                     'Utami','Wulandari','Permana','Ramadhan','Maulana'];
const BANKS       = ['BCA','Mandiri','BRI','BNI','CIMB Niaga','Danamon','Permata','BTN','OCBC','Panin'];
const PLATFORMS   = ['TikTok','Instagram','Facebook','Twitter','YouTube','LinkedIn','Telegram'];
const PROVINCES   = ['DKI Jakarta','Jawa Barat','Jawa Tengah','Jawa Timur','Banten','Bali',
                     'Sumatera Utara','Sumatera Selatan','Kalimantan Timur','Sulawesi Selatan',
                     'DIY','NTB','Papua'];
const CITIES      = ['Jakarta','Bandung','Semarang','Surabaya','Serang','Denpasar','Medan',
                     'Palembang','Samarinda','Makassar','Yogyakarta','Mataram','Jayapura'];
const STREETS     = ['Jalan Merdeka','Jalan Sudirman','Jalan Thamrin','Jalan Gatot Subroto',
                     'Jalan Diponegoro','Jalan Ahmad Yani','Jalan Pahlawan','Jalan Melati',
                     'Jalan Kenanga','Jalan Mawar'];

const rand    = arr => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function generateSampleData(count = SAMPLE_COUNT) {
  const records = [];
  for (let i = 1; i <= count; i++) {
    const fn = rand(FIRST_NAMES), ln = rand(LAST_NAMES);
    const phone  = `08${randInt(1000000000, 9999999999)}`;
    const alamat = `${rand(STREETS)} No.${randInt(1,200)}, RT ${randInt(1,20)}/RW ${randInt(1,15)}, ` +
                   `${rand(CITIES)}, ${rand(PROVINCES)}, ${randInt(10000,99999)}`;
    const year  = randInt(1960, 2005);
    const month = String(randInt(1,12)).padStart(2,'0');
    const day   = String(randInt(1,28)).padStart(2,'0');
    const bank  = rand(BANKS);
    const norek = randInt(1000000000, 9999999999);
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${randInt(1,99)}@` +
                  `${rand(['gmail.com','yahoo.com','outlook.com','proton.me'])}`;
    const platform = rand(PLATFORMS);

    records.push({
      id: i,
      nama_lengkap:   `${fn} ${ln}`,
      nomor_telepon:  phone,
      alamat,
      tanggal_lahir:  `${year}-${month}-${day}`,
      rekening:       `${bank} - ${norek}`,
      email,
      sosmed:         `${platform}: @${fn.toLowerCase()}_${ln.toLowerCase()}${randInt(1,99)}`
    });
  }
  return records;
}