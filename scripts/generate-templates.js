const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Create translator template
const translatorData = [
  {
    no_anggota: '25004',
    nama_penerjemah: 'Muhammad Arifin',
    no_sk_kemenkum: 'AHU-55 AH.03.07.2022',
    tgl_sk: '5 Oktober 2022',
    arah_bahasa: 'Indonesia - Inggris, Inggris - Indonesia, Indonesia - Belanda, Belanda - Indonesia',
    masa_aktif: 'Seumur Hidup',
    url_foto: '',
    sk_lengkap: 'AHU-55 AH.03.07.2022 Tanggal 5 Oktober 2022'
  }
];

const wsTrans = XLSX.utils.json_to_sheet(translatorData);
const wbTrans = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wbTrans, wsTrans, 'Sheet1');

const targetPath = path.join(__dirname, '../public/template-impor-penerjemah.xlsx');
XLSX.writeFile(wbTrans, targetPath);

console.log('Template generated successfully at:', targetPath);
