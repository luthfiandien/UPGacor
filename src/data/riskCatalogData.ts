import { RiskLibraryItem } from '../types/upg';

export const RISK_CONTROL_LIBRARY: RiskLibraryItem[] = [
  {
    kodeRisiko: 'PPG.RK.01',
    prosesSubproses: 'Pelayanan Terpadu Satu Pintu (PTSP)',
    pernyataanRisiko:
      'Petugas layanan menerima uang terima kasih atau fasilitas dari pengguna layanan untuk mempercepat proses administrasi.',
    klasifikasiRisiko: 'Sektor Layanan Publik',
    faktorPenyebab: 'Sistem & Pengawasan Internal',
    penyebabRisiko: [
      'Informasi tarif resmi PNBP dan estimasi waktu layanan PTSP belum sepenuhnya dipahami pengguna layanan.',
      'Adanya interaksi informal di luar loket resmi yang tidak terpantau CCTV atau sistem antrean.',
    ],
    dampakRisiko: [
      'Menurunnya objektivitas, kesetaraan layanan, dan integritas aparatur.',
      'Terganggunya kepercayaan publik terhadap transparansi layanan peradilan.',
    ],
    mandatoryControls: [
      'Pembentukan Tim UPG dan Penetapan Petugas Pengendali Gratifikasi',
      'Pemasangan Maklumat Pelayanan, Tarif PNBP, dan Pakta Integritas PTSP',
    ],
    nonMandatoryControls: [
      'Briefing Integritas Harian Petugas PTSP sebelum Jam Layanan',
      'Survei Persepsi Anti-Gratifikasi Pengguna Layanan Berbasis QR Code',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.02',
    prosesSubproses: 'Penanganan Perkara',
    pernyataanRisiko:
      'Pihak berperkara menitipkan bingkisan hari raya atau cenderamata kepada hakim atau aparatur yang menangani perkara.',
    klasifikasiRisiko: 'Sektor Penanganan Perkara',
    faktorPenyebab: 'Individu & Budaya Kerja',
    penyebabRisiko: [
      'Adanya hubungan sosial atau kedekatan personal antara pihak berperkara dengan aparatur.',
      'Kurangnya pemahaman mengenai batasan gratifikasi yang wajib ditolak dan dilaporkan.',
      'Belum optimalnya pengawasan penerimaan paket/titipan melalui pos atau resepsionis kantor.',
    ],
    dampakRisiko: [
      'Independensi dan imparsialitas penanganan perkara berpotensi diragukan.',
      'Menimbulkan konflik kepentingan serta menurunkan marwah lembaga peradilan.',
    ],
    mandatoryControls: [
      'Pembentukan Tim UPG',
      'Penyusunan Pedoman Internal dan SOP Penolakan serta Pelaporan Gratifikasi',
    ],
    nonMandatoryControls: [
      'Surat Edaran Pengingat Larangan Penerimaan Bingkisan Menjelang Hari Raya',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.03',
    prosesSubproses: 'Pengawasan Reguler & Pemeriksaan',
    pernyataanRisiko:
      'Tim pemeriksa menerima fasilitas akomodasi, transportasi, atau jamuan khusus dari satuan kerja obrik saat pengawasan reguler.',
    klasifikasiRisiko: 'Sektor Pengawasan & Pemeriksaan',
    faktorPenyebab: 'Hubungan Obrik & Auditor',
    penyebabRisiko: [
      'Satker obrik menyediakan fasilitas penjemputan atau penginapan di luar standar perjalanan dinas tim pemeriksa.',
      'Kurangnya ketegasan tim pemeriksa dalam menolak layanan keramahtamahan berlebih di daerah.',
    ],
    dampakRisiko: [
      'Objektivitas dan independensi hasil pemeriksaan pengawasan reguler terganggu.',
      'Temuan pengawasan berpotensi tidak diungkapkan secara akuntabel.',
    ],
    mandatoryControls: [
      'Penandatanganan Pakta Integritas Tim Pemeriksa Sebelum Penerbitan Surat Tugas',
      'Penerapan SOP Pembiayaan Mandiri Perjalanan Dinas dan Larangan Fasilitasi Obrik',
    ],
    nonMandatoryControls: [
      'Kuesioner Evaluasi Integritas Tim Pemeriksa Pasca Pengawasan oleh Obrik',
      'Publikasi Kontak Pengaduan SIWAS di Ruang Entry/Exit Meeting',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.04',
    prosesSubproses: 'Pengawasan Reguler & Pemeriksaan',
    pernyataanRisiko:
      'Pihak obrik menawarkan oleh-oleh khas daerah atau suvenir bernilai ekonomis kepada tim pemeriksa saat penutupan pemeriksaan.',
    klasifikasiRisiko: 'Sektor Pengawasan & Pemeriksaan',
    faktorPenyebab: 'Budaya Keramahtamahan Daerah',
    penyebabRisiko: [
      'Anggapan keliru bahwa pemberian oleh-oleh daerah merupakan bentuk penghormatan wajar kepada tamu.',
      'Belum adanya mekanisme pencatatan serah terima penolakan oleh-oleh di lokasi pemeriksaan.',
    ],
    dampakRisiko: [
      'Terjadinya pelanggaran kode etik auditor dan aparat pengawasan internal pemerintah.',
      'Menurunkan kredibilitas Badan Pengawasan sebagai pembina integritas peradilan.',
    ],
    mandatoryControls: [
      'Sosialisasi Kode Etik Pemeriksa dan Aturan Penolakan Cenderamata',
      'Pelaporan Penerimaan/Penolakan Gratifikasi Melalui Aplikasi GOL KPK / UPG Pusat',
    ],
    nonMandatoryControls: [
      'Pencantuman Klausul Anti-Gratifikasi pada Surat Pemberitahuan Pemeriksaan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.05',
    prosesSubproses: 'Audit Kinerja',
    pernyataanRisiko:
      'Auditor menerima pemberian atau janji imbalan untuk mengubah bobot penilaian atau menghilangkan catatan ketidaksesuaian pada LHE.',
    klasifikasiRisiko: 'Sektor Pengawasan & Pemeriksaan',
    faktorPenyebab: 'Konflik Kepentingan & Tekanan Hasil',
    penyebabRisiko: [
      'Kepentingan satker obrik untuk memperoleh predikat kinerja atau Zona Integritas tertentu.',
      'Lemahnya reviu berjenjang terhadap kertas kerja audit dan bukti dukung LHE.',
    ],
    dampakRisiko: [
      'Hasil audit kinerja menjadi bias dan tidak mencerminkan kondisi riil satker.',
      'Berpotensi menimbulkan tindak pidana korupsi/suap dan sanksi disiplin berat.',
    ],
    mandatoryControls: [
      'Reviu Berjenjang Kertas Kerja Audit oleh Pengendali Mutu dan Penanggung Jawab',
      'Audit Trail Perubahan Draf LHE pada Sistem Informasi Pengawasan',
    ],
    nonMandatoryControls: [
      'Rotasi Penugasan Tim Audit Kinerja Antar Wilayah Secara Berkala',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.06',
    prosesSubproses: 'Audit Kinerja',
    pernyataanRisiko:
      'Auditee memfasilitasi kegiatan rekreasi atau jamuan makan malam di luar jam dinas untuk membangun kedekatan dengan tim audit.',
    klasifikasiRisiko: 'Sektor Pengawasan & Pemeriksaan',
    faktorPenyebab: 'Relasi Interpersonal & Etika Profesi',
    penyebabRisiko: [
      'Belum tegasnya batasan interaksi sosial antara tim audit dan manajemen auditee selama penugasan.',
      'Tidak adanya pelaporan agenda kegiatan tim selama berada di wilayah tugas.',
    ],
    dampakRisiko: [
      'Munculnya persepsi keberpihakan dan melemahkan ketegasan rekomendasi audit.',
      'Melanggar prinsip independensi pengawasan internal.',
    ],
    mandatoryControls: [
      'Pedoman Perilaku Auditor Badan Pengawasan di Luar Jam Pemeriksaan',
      'Monitoring Kepatuhan Pengendalian Mutu oleh Inspektur Wilayah',
    ],
    nonMandatoryControls: [
      'Deklarasi Bebas Konflik Kepentingan Harian Tim Pemeriksa',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.07',
    prosesSubproses: 'Evaluasi Zona Integritas (WBK/WBBM)',
    pernyataanRisiko:
      'Satker pengusul WBK/WBBM memberikan hadiah atau kompensasi kepada tim penilai internal agar lolos verifikasi lapangan.',
    klasifikasiRisiko: 'Sektor Pengawasan & Pemeriksaan',
    faktorPenyebab: 'Target Kinerja Institusional',
    penyebabRisiko: [
      'Tingginya ekspektasi pimpinan satker untuk meraih predikat WBK/WBBM.',
      'Kurangnya transparansi parameter penilaian verifikasi lapangan.',
    ],
    dampakRisiko: [
      'Merusak integritas program pembangunan Zona Integritas di lingkungan Mahkamah Agung.',
      'Predikat WBK/WBBM diberikan kepada satker yang tidak memenuhi standar integritas.',
    ],
    mandatoryControls: [
      'Transparansi Rubrik Penilaian ZI dan Penilaian Panel Berbasis Bukti Elektronik',
      'Pakta Integritas Tim Penilai Internal Zona Integritas',
    ],
    nonMandatoryControls: [
      'Pendampingan Daring Terbuka Tanpa Tatap Muka Khusus di Luar Jadwal Resmi',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.08',
    prosesSubproses: 'Monitoring Tindak Lanjut Hasil Pengawasan',
    pernyataanRisiko:
      'Petugas pemantau menerima pemberian dari satker agar status temuan pemeriksaan segera dinyatakan tuntas tanpa verifikasi memadai.',
    klasifikasiRisiko: 'Sektor Pengawasan & Pemeriksaan',
    faktorPenyebab: 'Pengendalian Verifikasi Dokumen',
    penyebabRisiko: [
      'Verifikasi dokumen tindak lanjut hanya dilakukan secara administratif tanpa uji petik.',
      'Tidak ada mekanisme verifikasi silang antar-inspektorat wilayah.',
    ],
    dampakRisiko: [
      'Temuan berulang tidak pernah terselesaikan secara substantif.',
      'Kerugian negara atau kelemahan tata kelola terus berlanjut.',
    ],
    mandatoryControls: [
      'Validasi Berlapis Penutupan Temuan dengan Wajib Unggah Bukti Sah',
      'Log Persetujuan Elektronik Penuntasan Tindak Lanjut oleh Inspektur Wilayah',
    ],
    nonMandatoryControls: [
      'Uji Petik Acak terhadap Status Tindak Lanjut yang Telah Ditutup',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.09',
    prosesSubproses: 'Penanganan Pengaduan Masyarakat (SIWAS)',
    pernyataanRisiko:
      'Aparatur yang diadukan memberikan imbalan kepada petugas verifikator pengaduan agar laporan masyarakat tidak ditindaklanjuti.',
    klasifikasiRisiko: 'Sektor Pengawasan & Pemeriksaan',
    faktorPenyebab: 'Kerahasiaan & Integritas Verifikator',
    penyebabRisiko: [
      'Akses terhadap identitas pelapor atau substansi pengaduan tidak dibatasi secara ketat.',
      'Belum adanya pemantauan SLA penanganan pengaduan secara otomatis.',
    ],
    dampakRisiko: [
      'Pelapor kehilangan kepercayaan terhadap sistem whistleblowing Mahkamah Agung.',
      'Pelanggaran etik atau disiplin terlapor luput dari pemeriksaan.',
    ],
    mandatoryControls: [
      'Pembatasan Hak Akses SIWAS Berbasis Peran dan Enkripsi Identitas Pelapor',
      'Audit Berkala Log Penghentian/Pengarsipan Pengaduan pada SIWAS',
    ],
    nonMandatoryControls: [
      'Rotasi Penugasan Petugas Telaah Awal Pengaduan Masyarakat',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.10',
    prosesSubproses: 'Penanganan Pengaduan Masyarakat (SIWAS)',
    pernyataanRisiko:
      'Petugas pemeriksa pengaduan membocorkan informasi pemeriksaan kepada pihak terlapor dengan imbalan uang atau fasilitas.',
    klasifikasiRisiko: 'Sektor Pengawasan & Pemeriksaan',
    faktorPenyebab: 'Kebocoran Informasi Rahasia',
    penyebabRisiko: [
      'Dokumen telaah pengaduan dibagikan melalui kanal pesan pribadi yang tidak aman.',
      'Sanksi internal atas kebocoran rahasia pemeriksaan belum diterapkan secara konsisten.',
    ],
    dampakRisiko: [
      'Terlapor dapat menghilangkan barang bukti atau mengintimidasi saksi dan pelapor.',
      'Proses klarifikasi dan pemeriksaan khusus menjadi gagal.',
    ],
    mandatoryControls: [
      'Surat Pernyataan Kerahasiaan (NDA) Tim Pemeriksa Pengaduan',
      'Penggunaan Saluran Komunikasi Resmi Tertutup untuk Dokumen Pemeriksaan',
    ],
    nonMandatoryControls: [
      'Edukasi Berkala Perlindungan Saksi dan Pelapor (Whistleblower Protection)',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.11',
    prosesSubproses: 'Pemeriksaan Khusus & Klarifikasi',
    pernyataanRisiko:
      'Pihak terlapor atau kuasanya menawarkan uang damai kepada tim pemeriksa khusus untuk meringankan rekomendasi sanksi disiplin.',
    klasifikasiRisiko: 'Sektor Pengawasan & Pemeriksaan',
    faktorPenyebab: 'Tekanan & Kepentingan Pribadi Terlapor',
    penyebabRisiko: [
      'Pertemuan klarifikasi dilakukan di lokasi non-kantor tanpa pendampingan anggota tim lain.',
      'Tidak adanya rekaman berita acara pemeriksaan secara utuh.',
    ],
    dampakRisiko: [
      'Penjatuhan hukuman disiplin menjadi tidak adil dan mencederai rasa keadilan.',
      'Mencemari nama baik Badan Pengawasan.',
    ],
    mandatoryControls: [
      'Wajib Pelaksanaan Klarifikasi di Ruang Resmi Kantor dengan Minimal Dua Pemeriksa',
      'Perekaman Audio/Video dan Penandatanganan Berita Acara Pemeriksaan Secara Kolektif',
    ],
    nonMandatoryControls: [
      'Pelaporan Cepat Percobaan Penyuapan kepada Tim UPG dan Pimpinan Bawas',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.12',
    prosesSubproses: 'Pemeriksaan Khusus & Klarifikasi',
    pernyataanRisiko:
      'Saksi atau pelapor memberikan imbalan kepada petugas agar mempercepat proses klarifikasi di luar antrean prioritas.',
    klasifikasiRisiko: 'Sektor Pengawasan & Pemeriksaan',
    faktorPenyebab: 'Ketidakpastian Jadwal Pemeriksaan',
    penyebabRisiko: [
      'Pelapor tidak memperoleh informasi perkembangan penanganan pengaduan secara transparan.',
      'Belum adanya standar waktu tahapan klarifikasi yang dipublikasikan.',
    ],
    dampakRisiko: [
      'Terjadinya praktik percaloan penanganan pengaduan.',
      'Penanganan perkara pengaduan menjadi diskriminatif.',
    ],
    mandatoryControls: [
      'Notifikasi Otomatis Status Penanganan Pengaduan pada Aplikasi SIWAS',
      'Penetapan Standar Operasional Prosedur dan SLA Tahapan Klarifikasi',
    ],
    nonMandatoryControls: [
      'Publikasi Statistik Penyelesaian Pengaduan Secara Periodik di Portal Resmi',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.13',
    prosesSubproses: 'Pengendalian Gratifikasi & LHKPN',
    pernyataanRisiko:
      'Petugas verifikator LHKPN/LHKASN menerima pemberian agar meloloskan kelengkapan atau menunda pencatatan ketidakpatuhan pelaporan.',
    klasifikasiRisiko: 'Sektor Pengawasan & Pemeriksaan',
    faktorPenyebab: 'Lemahnya Rekonsiliasi Data',
    penyebabRisiko: [
      'Data kepatuhan pelaporan kekayaan tidak direkonsiliasi secara otomatis dengan sistem kepegawaian.',
      'Kurangnya pengawasan atasan langsung terhadap daftar wajib lapor.',
    ],
    dampakRisiko: [
      'Data tingkat kepatuhan LHKPN/LHKASN satker menjadi tidak akurat.',
      'Menghambat deteksi dini potensi kepemilikan harta tidak wajar.',
    ],
    mandatoryControls: [
      'Rekonsiliasi Berkala Daftar Wajib Lapor LHKPN dengan Data Kepegawaian (SIKEP)',
      'Validasi Pelaporan Berjenjang oleh Koordinator UPG dan Inspektur',
    ],
    nonMandatoryControls: [
      'Pengingat Otomatis Kepatuhan LHKPN Sebelum Batas Waktu Tahunan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.14',
    prosesSubproses: 'Pengendalian Gratifikasi & LHKPN',
    pernyataanRisiko:
      'Aparatur tidak melaporkan penerimaan gratifikasi yang berhubungan dengan jabatan karena dijanjikan perlindungan oleh oknum internal.',
    klasifikasiRisiko: 'Sektor Pengawasan & Pemeriksaan',
    faktorPenyebab: 'Ketidakpahaman & Budaya Permisif',
    penyebabRisiko: [
      'Ketakutan aparatur akan proses pelaporan yang dianggap rumit atau berdampak negatif pada karier.',
      'Kurangnya sosialisasi perlindungan hukum bagi pelapor gratifikasi.',
    ],
    dampakRisiko: [
      'Penerimaan gratifikasi melebihi batas waktu 30 hari kerja berpotensi menjadi tindak pidana.',
      'Budaya pengendalian gratifikasi di lingkungan kerja melemah.',
    ],
    mandatoryControls: [
      'Sosialisasi Mekanisme Pelaporan Gratifikasi Maksimal 30 Hari Kerja melalui GOL KPK',
      'Jaminan Kerahasiaan dan Pendampingan Pelapor oleh Tim UPG',
    ],
    nonMandatoryControls: [
      'Kampanye Internal "Lapor Gratifikasi itu Keren dan Aman" Secara Berkala',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.15',
    prosesSubproses: 'Penanganan Perkara',
    pernyataanRisiko:
      'Pihak berperkara atau penasihat hukum memberikan hadiah atau uang kepada panitera pengganti untuk memperoleh bocoran jadwal atau informasi internal perkara.',
    klasifikasiRisiko: 'Sektor Penanganan Perkara',
    faktorPenyebab: 'Akses Informasi Terbatas',
    penyebabRisiko: [
      'Komunikasi informal antara pihak berperkara dan panitera pengganti di luar ruang sidang/PTSP.',
      'Belum optimalnya pemanfaatan Sistem Informasi Penelusuran Perkara (SIPP) dan e-Court.',
    ],
    dampakRisiko: [
      'Pelanggaran kode etik panitera dan kebocoran informasi proses peradilan.',
      'Merusak asas transparansi dan keadilan bagi seluruh pihak berperkara.',
    ],
    mandatoryControls: [
      'Larangan Pertemuan di Luar Kedinasan antara Aparatur Pengadilan dan Pihak Berperkara',
      'Kewajiban Penggunaan Kanal Resmi SIPP dan e-Court untuk Informasi Perkara',
    ],
    nonMandatoryControls: [
      'Pemasangan Stiker Peringatan Anti-Gratifikasi di Ruang Kerja Kepaniteraan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.16',
    prosesSubproses: 'Penanganan Perkara',
    pernyataanRisiko:
      'Jurusita menerima uang lelah atau tips tambahan di luar panjar biaya perkara dari pemohon saat melaksanakan pemanggilan atau pemberitahuan.',
    klasifikasiRisiko: 'Sektor Penanganan Perkara',
    faktorPenyebab: 'Interaksi Lapangan Tanpa Pengawasan',
    penyebabRisiko: [
      'Pemohon tidak mengetahui rincian resmi radius dan tarif panggilan yang telah dibayar melalui panjar.',
      'Jurusita bertemu langsung dengan pihak tanpa bukti tanda terima resmi.',
    ],
    dampakRisiko: [
      'Pungutan liar terselubung dan penyalahgunaan kewenangan tugas jurusita.',
      'Masyarakat terbebani biaya tidak resmi di luar ketentuan PNBP.',
    ],
    mandatoryControls: [
      'Transparansi Rincian Biaya Panjar dan Radius Panggilan melalui Portal Resmi Pengadilan',
      'Kewajiban Surat Tugas dan Verifikasi Relaas Panggilan Secara Terpusat',
    ],
    nonMandatoryControls: [
      'Konfirmasi Acak via Telepon/Pesan Resmi kepada Pihak Mengenai Beban Biaya Panggilan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.17',
    prosesSubproses: 'Eksekusi Putusan Pengadilan',
    pernyataanRisiko:
      'Pemohon eksekusi menjanjikan komisi atau bonus keberhasilan kepada petugas eksekusi agar pelaksanaan eksekusi riil dipercepat.',
    klasifikasiRisiko: 'Sektor Penanganan Perkara',
    faktorPenyebab: 'Kompleksitas Proses Eksekusi',
    penyebabRisiko: [
      'Durasi proses aanmaning hingga eksekusi riil sering dianggap lama oleh pemohon.',
      'Kurangnya pengawasan terhadap kesepakatan biaya pengamanan dan operasional eksekusi.',
    ],
    dampakRisiko: [
      'Proses eksekusi rentan terhadap keberpihakan dan sengketa hukum baru.',
      'Citra peradilan tercoreng akibat komersialisasi pelaksanaan putusan.',
    ],
    mandatoryControls: [
      'Penetapan Rincian Biaya Eksekusi Secara Resmi Melalui SK Ketua Pengadilan',
      'Pengawasan Melekat oleh Panitera dan Ketua Pengadilan pada Setiap Tahap Eksekusi',
    ],
    nonMandatoryControls: [
      'Monitoring Jadwal dan Progres Permohonan Eksekusi pada Dashboard Perkara',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.18',
    prosesSubproses: 'Penanganan Perkara',
    pernyataanRisiko:
      'Pemberian fasilitas penginapan atau jamuan oleh pihak berperkara saat majelis hakim melaksanakan Pemeriksaan Setempat (Descente).',
    klasifikasiRisiko: 'Sektor Penanganan Perkara',
    faktorPenyebab: 'Pelaksanaan Tugas di Luar Gedung Pengadilan',
    penyebabRisiko: [
      'Lokasi objek sengketa berada di daerah terpencil dengan keterbatasan fasilitas umum.',
      'Belum tegasnya larangan menerima jamuan/akomodasi dari salah satu pihak saat descente.',
    ],
    dampakRisiko: [
      'Menimbulkan konflik kepentingan dan kecurigaan pihak lawan terhadap netralitas majelis.',
      'Putusan berpotensi digugat atau diajukan pengaduan etik.',
    ],
    mandatoryControls: [
      'SOP Pemeriksaan Setempat Wajib Menggunakan Fasilitas Mandiri dari Anggaran Panjar Resmi',
      'Pakta Integritas Petugas Lapangan Saat Melaksanakan Pemeriksaan Setempat',
    ],
    nonMandatoryControls: [
      'Pemberitahuan Tertulis kepada Kedua Belah Pihak Mengenai Larangan Pemberian Jamuan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.19',
    prosesSubproses: 'Mediasi Perkara',
    pernyataanRisiko:
      'Mediator menerima hadiah atau uang ucapan terima kasih dari salah satu pihak setelah tercapainya akta perdamaian.',
    klasifikasiRisiko: 'Sektor Penanganan Perkara',
    faktorPenyebab: 'Apresiasi Pasca Layanan',
    penyebabRisiko: [
      'Pihak merasa terbantu oleh tercapainya perdamaian sehingga memberikan imbalan sukarela.',
      'Mediator tidak memahami bahwa ucapan terima kasih bernilai uang tetap termasuk gratifikasi.',
    ],
    dampakRisiko: [
      'Mengganggu netralitas mediator dalam proses mediasi perkara lainnya.',
      'Melanggar ketentuan larangan penerimaan gratifikasi bagi hakim/aparatur mediator.',
    ],
    mandatoryControls: [
      'Pencantuman Pemberitahuan Layanan Mediasi Gratis di Ruang Mediasi',
      'Sosialisasi Larangan Gratifikasi Pasca-Layanan kepada Seluruh Mediator',
    ],
    nonMandatoryControls: [
      'Penyediaan Formulir Ucapan Terima Kasih Non-Materi / Kotak Saran Layanan Mediasi',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.20',
    prosesSubproses: 'Pengelolaan Biaya Perkara & Konsinyasi',
    pernyataanRisiko:
      'Petugas pengelola keuangan perkara menerima imbalan saat proses pencairan sisa panjar atau uang konsinyasi.',
    klasifikasiRisiko: 'Sektor Penanganan Perkara',
    faktorPenyebab: 'Transaksi Keuangan Non-Elektronik',
    penyebabRisiko: [
      'Pengambilan sisa panjar masih dilakukan secara tunai di kantor.',
      'Pihak penerima tidak mengetahui prosedur pengembalian sisa panjar tanpa biaya tambahan.',
    ],
    dampakRisiko: [
      'Terjadinya pemotongan tidak sah atas hak keuangan para pihak.',
      'Potensi temuan penyimpangan pengelolaan dana pihak ketiga.',
    ],
    mandatoryControls: [
      'Pengembalian Sisa Panjar Wajib Melalui Transfer Bank Resmi (Cashless)',
      'Notifikasi Otomatis Hak Pengembalian Sisa Panjar kepada Pihak Berperkara',
    ],
    nonMandatoryControls: [
      'Rekonsiliasi Bulanan Rekening Dana Pihak Ketiga oleh Panitera dan Bendahara',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.21',
    prosesSubproses: 'Penerbitan Salinan Putusan & Akta',
    pernyataanRisiko:
      'Petugas kepaniteraan menerima uang pelicin untuk mempercepat penyerahan salinan putusan atau akta cerai di luar antrean resmi.',
    klasifikasiRisiko: 'Sektor Layanan Publik',
    faktorPenyebab: 'Ketidakjelasan Estimasi Penyelesaian',
    penyebabRisiko: [
      'Antrean pencetakan dan minutasi putusan tidak terpantau oleh pemohon.',
      'Adanya permintaan mendesak dari pihak atau kuasa hukum.',
    ],
    dampakRisiko: [
      'Diskriminasi layanan terhadap pencari keadilan yang taat prosedur.',
      'Meningkatnya persepsi buruk terhadap birokrasi kepaniteraan.',
    ],
    mandatoryControls: [
      'Integrasi Antrean Penerbitan Salinan Putusan dan Akta Melalui Sistem Elektronik',
      'Standar Pelayanan Publik yang Mengikat Waktu Penyerahan Produk Pengadilan',
    ],
    nonMandatoryControls: [
      'Layanan Notifikasi WhatsApp/SMS Resmi Ketika Produk Pengadilan Siap Diambil',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.22',
    prosesSubproses: 'Layanan Upaya Hukum (Banding, Kasasi, PK)',
    pernyataanRisiko:
      'Oknum petugas menerima imbalan untuk memprioritaskan pengiriman berkas bundel A dan bundel B ke pengadilan tingkat banding atau Mahkamah Agung.',
    klasifikasiRisiko: 'Sektor Penanganan Perkara',
    faktorPenyebab: 'Pengawasan Pengiriman Berkas',
    penyebabRisiko: [
      'Proses pemberkasan fisik memakan waktu sehingga pihak mencoba mempercepat melalui petugas.',
      'Kurangnya pelacakan real-time status minutasi dan pengiriman berkas upaya hukum.',
    ],
    dampakRisiko: [
      'Ketidakadilan antrean pengiriman berkas upaya hukum.',
      'Risiko keterlambatan pengiriman berkas bagi pihak yang tidak memberi imbalan.',
    ],
    mandatoryControls: [
      'Penggunaan Pengiriman Berkas Elektronik (e-Bundel) Sesuai Peraturan MA',
      'Monitoring SLA Pemberkasan dan Pengiriman Upaya Hukum oleh Panitera Muda',
    ],
    nonMandatoryControls: [
      'Laporan Mingguan Kepatuhan Waktu Pengiriman Berkas Upaya Hukum',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.23',
    prosesSubproses: 'Pelayanan Terpadu Satu Pintu (PTSP)',
    pernyataanRisiko:
      'Petugas meja informasi menerima bingkisan makanan atau voucher belanja dari advokat atau pengguna layanan tetap.',
    klasifikasiRisiko: 'Sektor Layanan Publik',
    faktorPenyebab: 'Frekuensi Interaksi Tinggi',
    penyebabRisiko: [
      'Interaksi berulang antara petugas meja informasi dan advokat yang sering beracara.',
      'Dianggap sebagai bentuk keakraban biasa antar-rekan.',
    ],
    dampakRisiko: [
      'Terbangunnya perlakuan istimewa terhadap advokat atau pihak tertentu.',
      'Melemahkan ketegasan budaya anti-gratifikasi di area layanan publik.',
    ],
    mandatoryControls: [
      'Pengawasan Area PTSP dengan CCTV Aktif yang Dipantau Pimpinan Secara Berkala',
      'Penerapan Aturan Penolakan Segala Bentuk Pemberian di Area PTSP',
    ],
    nonMandatoryControls: [
      'Rotasi Penempatan Petugas Meja Layanan PTSP Setiap Semester',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.24',
    prosesSubproses: 'Pelayanan Surat Keterangan (Eraterang)',
    pernyataanRisiko:
      'Pemohon surat keterangan tidak pernah dipidana memberikan imbalan kepada petugas agar permohonan disetujui di luar jam kerja.',
    klasifikasiRisiko: 'Sektor Layanan Publik',
    faktorPenyebab: 'Kebutuhan Mendesak Pemohon',
    penyebabRisiko: [
      'Pemohon mengejar tenggat pendaftaran jabatan publik atau seleksi pekerjaan.',
      'Petugas mengolah permohonan secara manual di luar sistem antrean.',
    ],
    dampakRisiko: [
      'Pelayanan menjadi transaksional dan rawan pungutan tidak resmi.',
      'Validasi data pidana berisiko kurang cermat akibat proses terburu-buru.',
    ],
    mandatoryControls: [
      'Pemrosesan Penuh Melalui Aplikasi Eraterang dengan Pembayaran PNBP Virtual Account',
      'Publikasi Jam Operasional dan SLA Penerbitan Surat Keterangan Secara Jelas',
    ],
    nonMandatoryControls: [
      'Survei Kepuasan Masyarakat Digital Wajib Sebelum Unduh Dokumen Elektronik',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.25',
    prosesSubproses: 'Pelayanan Legalisasi & Waarmerking',
    pernyataanRisiko:
      'Notaris atau pengguna layanan memberikan uang tambahan saat mengurus legalisasi dokumen atau akta di bawah tangan dalam jumlah banyak.',
    klasifikasiRisiko: 'Sektor Layanan Publik',
    faktorPenyebab: 'Volume Permohonan Tinggi',
    penyebabRisiko: [
      'Pengguna layanan ingin dokumen dalam jumlah massal selesai lebih cepat dari jadwal standar.',
      'Pembayaran PNBP dan bukti serah terima belum terintegrasi penuh secara digital.',
    ],
    dampakRisiko: [
      'Timbulnya praktik gratifikasi percepatan layanan.',
      'Potensi selisih pencatatan PNBP dengan jumlah dokumen terlegalisasi.',
    ],
    mandatoryControls: [
      'Pencatatan Nomor Register Otomatis dan Bukti Bayar PNBP Resmi untuk Setiap Dokumen',
      'Standarisasi Waktu Penyelesaian Berdasarkan Jumlah Dokumen yang Diajukan',
    ],
    nonMandatoryControls: [
      'Penempatan Banner "Semua Layanan Sesuai Tarif PNBP Resmi, Tanpa Biaya Tambahan"',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.26',
    prosesSubproses: 'Layanan Penyuluhan & Posbakum',
    pernyataanRisiko:
      'Petugas pengadilan menerima komisi atau fee rujukan dari penyedia jasa bantuan hukum atau advokat swasta yang beroperasi di sekitar kantor.',
    klasifikasiRisiko: 'Sektor Layanan Publik',
    faktorPenyebab: 'Praktik Perantara / Calo',
    penyebabRisiko: [
      'Pencari keadilan yang awam hukum diarahkan oleh oknum petugas ke advokat tertentu.',
      'Kurangnya pengawasan terhadap area tunggu pengunjung dan akses masuk pihak ketiga.',
    ],
    dampakRisiko: [
      'Tercorengnya netralitas pengadilan dan maraknya praktik makelar kasus.',
      'Masyarakat tidak mendapatkan layanan Posbakum gratis yang semestinya tersedia.',
    ],
    mandatoryControls: [
      'Larangan Keras Petugas Merekomendasikan Advokat Tertentu kepada Pengguna Layanan',
      'Penertiban Akses Pengunjung dan Pengawasan Area Posbakum oleh Petugas Keamanan',
    ],
    nonMandatoryControls: [
      'Publikasi Informasi Layanan Posbakum Gratis di Media Sosial dan Papan Informasi',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.27',
    prosesSubproses: 'Layanan Penyitaan & Penitipan Barang Bukti',
    pernyataanRisiko:
      'Petugas penitipan barang bukti atau sitaan menerima hadiah dari pemilik barang agar kondisi barang dijaga secara khusus atau proses pengambilan dipermudah.',
    klasifikasiRisiko: 'Sektor Layanan Publik',
    faktorPenyebab: 'Pengelolaan Barang Sitaan',
    penyebabRisiko: [
      'Prosedur pengembalian barang bukti setelah putusan inkrah tidak diinformasikan secara proaktif.',
      'Akses gudang penyimpanan barang bukti tidak tercatat secara elektronik.',
    ],
    dampakRisiko: [
      'Penyalahgunaan wewenang dalam pengelolaan barang bukti.',
      'Menimbulkan komplain dan keraguan integritas penanganan barang sitaan.',
    ],
    mandatoryControls: [
      'SOP Pengelolaan dan Pengembalian Barang Bukti Tanpa Biaya dengan Berita Acara Resmi',
      'Buku Register Elektronik Pergerakan Barang di Gudang Penyimpanan',
    ],
    nonMandatoryControls: [
      'Pemeriksaan Fisik Berkala Gudang Barang Bukti oleh Tim Pengawas Internal',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.28',
    prosesSubproses: 'Layanan Informasi Publik (PPID)',
    pernyataanRisiko:
      'Pemohon informasi publik memberikan bingkisan atau honorarium kepada petugas PPID untuk memperoleh dokumen di luar ketentuan jadwal atau kategori informasi dikecualikan.',
    klasifikasiRisiko: 'Sektor Layanan Publik',
    faktorPenyebab: 'Permintaan Informasi Sensitif',
    penyebabRisiko: [
      'Klasifikasi Daftar Informasi Publik (DIP) dan Informasi Dikecualikan belum tersosialisasi baik.',
      'Permohonan informasi disampaikan langsung secara informal kepada staf.',
    ],
    dampakRisiko: [
      'Kebocoran informasi yang dikecualikan atau data pribadi pihak.',
      'Pelanggaran keterbukaan informasi publik dan kode etik aparatur.',
    ],
    mandatoryControls: [
      'Wajib Pengajuan Melalui Portal e-PPID dan Verifikasi Atasan PPID',
      'Penetapan SK Daftar Informasi Publik dan Uji Konsekuensi Informasi Dikecualikan',
    ],
    nonMandatoryControls: [
      'Pelatihan Klasifikasi Informasi Publik Bagi Seluruh Petugas Meja Layanan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.29',
    prosesSubproses: 'Pengadaan Barang dan Jasa (PBJ)',
    pernyataanRisiko:
      'Pejabat Pembuat Komitmen (PPK) atau Pokja Pemilihan menerima komisi (kickback), hadiah, atau fasilitas dari penyedia barang/jasa sebelum atau sesudah penetapan pemenang.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Diskresi & Kolusi Pengadaan',
    penyebabRisiko: [
      'Pertemuan informal antara PPK/Pokja dengan calon penyedia di luar tahapan penjelasan resmi LPSE.',
      'Penyusunan spesifikasi teknis yang mengarah pada produk atau vendor tertentu.',
    ],
    dampakRisiko: [
      'Kualitas barang/jasa tidak optimal dan harga pengadaan tidak kompetitif.',
      'Risiko hukum tindak pidana korupsi dan temuan audit BPK/BPKP.',
    ],
    mandatoryControls: [
      'Pelaksanaan Pengadaan Sepenuhnya Melalui SPSE/e-Katalog Tanpa Pertemuan Tatap Muka Informal',
      'Pakta Integritas dan Pernyataan Bebas Konflik Kepentingan PPK, Pokja, dan Penyedia',
    ],
    nonMandatoryControls: [
      'Reviu Probity Audit oleh Aparat Pengawasan Internal pada Pengadaan Bernilai Strategis',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.30',
    prosesSubproses: 'Pengadaan Barang dan Jasa (PBJ)',
    pernyataanRisiko:
      'Penyedia jasa konstruksi atau renovasi gedung memberikan bingkisan hari raya atau fasilitas pribadi kepada panitia pemeriksa hasil pekerjaan agar BAST segera ditandatangani.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Pemeriksaan Hasil Pekerjaan',
    penyebabRisiko: [
      'Tekanan pencairan anggaran akhir tahun sehingga pemeriksaan fisik pekerjaan kurang teliti.',
      'Kurangnya dokumentasi uji teknis dan foto kemajuan fisik sebelum penerbitan BAST.',
    ],
    dampakRisiko: [
      'Pekerjaan dengan volume atau mutu kurang tetap dibayarkan 100%.',
      'Menimbulkan kerugian keuangan negara dan potensi kegagalan bangunan.',
    ],
    mandatoryControls: [
      'Verifikasi Fisik Bersama dengan Checklist Teknis dan Dokumentasi Foto Ber-Geotag',
      'Pemisahan Tugas Antara Perencana, Pelaksana Kontrak (PPK), dan Pemeriksa Hasil',
    ],
    nonMandatoryControls: [
      'Pendampingan Tim Teknis Independen untuk Pemeriksaan Pekerjaan Konstruksi',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.31',
    prosesSubproses: 'Pengadaan Langsung & Belanja Operasional',
    pernyataanRisiko:
      'Pejabat Pengadaan menerima potongan harga pribadi, cashback, atau barang bonus dari rekanan pengadaan langsung ATK, percetakan, atau konsumsi rapat.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Penunjukan Rekanan Berulang',
    penyebabRisiko: [
      'Pengadaan langsung menggunakan vendor langganan yang sama tanpa survei pembanding pasar.',
      'Barang bonus dari pembelian jumlah besar tidak dicatat sebagai aset/persediaan kantor.',
    ],
    dampakRisiko: [
      'Harga pengadaan lebih tinggi dari harga pasar wajar.',
      'Potensi gratifikasi terselubung dalam bentuk barang bonus atau diskon pribadi.',
    ],
    mandatoryControls: [
      'Wajib Pembanding Harga Minimal dari Dua Sumber pada Pengadaan Langsung',
      'Pencatatan Seluruh Bonus/Diskon Pembelian ke dalam Aplikasi Persediaan Kantor',
    ],
    nonMandatoryControls: [
      'Rotasi Berkala Daftar Penyedia Terverifikasi untuk Belanja Operasional Rutin',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.32',
    prosesSubproses: 'Pengadaan Jasa Konsultansi & TI',
    pernyataanRisiko:
      'Vendor pengembangan aplikasi atau konsultan TI memberikan perangkat elektronik atau fasilitas perjalanan kepada tim teknis pengelola sistem informasi.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Ketergantungan Teknis pada Vendor',
    penyebabRisiko: [
      'Tim teknis memiliki akses penuh menentukan kebutuhan pemeliharaan dan lisensi perangkat lunak.',
      'Hadiah perangkat uji coba (demo unit) dari vendor tidak dikembalikan setelah masa uji berakhir.',
    ],
    dampakRisiko: [
      'Ketergantungan jangka panjang pada vendor tertentu (vendor lock-in) yang merugikan anggaran.',
      'Terjadinya konflik kepentingan dalam evaluasi kinerja sistem.',
    ],
    mandatoryControls: [
      'Kewajiban Pengembalian Perangkat Uji Coba Vendor dengan Berita Acara Resmi',
      'Evaluasi Kebutuhan TI Secara Kolektif oleh Tim Pengelola Layanan Elektronik',
    ],
    nonMandatoryControls: [
      'Kebijakan Keterbukaan Lisensi dan Serah Terima Source Code pada Kontrak Pengembangan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.33',
    prosesSubproses: 'Pengelolaan Kontrak & Adendum Pekerjaan',
    pernyataanRisiko:
      'Kontraktor menawarkan imbalan kepada PPK untuk menyetujui perpanjangan waktu tanpa denda keterlambatan atau adendum tambah biaya.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Lemahnya Justifikasi Teknis Adendum',
    penyebabRisiko: [
      'Pengajuan alasan keadaan kahar atau perubahan lingkup kerja tidak diuji secara objektif.',
      'Tidak adanya mekanisme reviu hukum/pengawasan sebelum persetujuan adendum.',
    ],
    dampakRisiko: [
      'Negara kehilangan hak atas denda keterlambatan yang seharusnya diterima.',
      'Membuka celah rekayasa nilai kontrak.',
    ],
    mandatoryControls: [
      'Wajib Reviu Teknis dan Pertimbangan Pengawas Internal untuk Setiap Adendum Waktu/Nilai',
      'Perhitungan Otomatis Denda Keterlambatan Sesuai Klausul Kontrak',
    ],
    nonMandatoryControls: [
      'Laporan Pemantauan Mingguan Kurva-S Pelaksanaan Kontrak kepada KPA',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.34',
    prosesSubproses: 'Pengelolaan Layanan Sewa & Pemeliharaan Gedung',
    pernyataanRisiko:
      'Penyedia jasa kebersihan, keamanan, atau pemeliharaan AC memberikan setoran rutin kepada pengelola rumah tangga kantor agar kontrak diperpanjang.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Evaluasi Kinerja Subjektif',
    penyebabRisiko: [
      'Evaluasi kualitas layanan outsourcing tidak menggunakan indikator kinerja terukur.',
      'Penilaian perpanjangan kontrak didominasi satu pihak pengelola rumah tangga.',
    ],
    dampakRisiko: [
      'Kualitas kebersihan dan keamanan gedung menurun karena biaya operasional vendor terpotong.',
      'Menimbulkan praktik suap berkelanjutan di lingkungan kesekretariatan.',
    ],
    mandatoryControls: [
      'Penilaian Kinerja Vendor Outsourcing Berdasarkan Checklist SLA Bulanan dan Survei Pegawai',
      'Kompetisi Terbuka Melalui e-Katalog pada Setiap Periode Perpanjangan Kontrak',
    ],
    nonMandatoryControls: [
      'Kotak Masukan Pegawai Terkait Kebersihan, Keamanan, dan Sarana Kerja Gedung',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.35',
    prosesSubproses: 'Pemilihan Bank Mitra & Layanan Perbankan',
    pernyataanRisiko:
      'Pihak perbankan mitra memberikan hadiah undian khusus, fasilitas kartu kredit VIP, atau sponsor acara kantor di luar perjanjian kerja sama resmi.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Kompetisi Antar-Bank Penyalur Dana',
    penyebabRisiko: [
      'Bank mitra menawarkan program loyalitas atau sponsor kegiatan HUT/olahraga satker secara informal.',
      'Belum adanya pemisahan tegas antara fasilitas kedinasan sesuai MoU dan pemberian personal.',
    ],
    dampakRisiko: [
      'Keputusan penempatan rekening operasional atau layanan payroll menjadi tidak objektif.',
      'Pemberian kepada pejabat pengelola rekening dikategorikan sebagai gratifikasi jabatan.',
    ],
    mandatoryControls: [
      'Seluruh Kerja Sama dan Dukungan Mitra Perbankan Wajib Tertuang dalam MoU/PKS Resmi',
      'Pelaporan Segala Bentuk Hadiah atau Fasilitas Perbankan di Luar Kontrak ke UPG',
    ],
    nonMandatoryControls: [
      'Sosialisasi Aturan Gratifikasi Perbankan kepada Bendahara dan Pengelola Keuangan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.36',
    prosesSubproses: 'Manajemen SDM (Mutasi & Promosi)',
    pernyataanRisiko:
      'Pegawai atau hakim yang mengajukan mutasi atau promosi memberikan bingkisan atau uang terima kasih kepada tim pengelola kepegawaian atau anggota Baperjakat.',
    klasifikasiRisiko: 'Sektor SDM & Kelembagaan',
    faktorPenyebab: 'Proses Penilaian & Penempatan',
    penyebabRisiko: [
      'Pemohon menginginkan penempatan pada wilayah kerja atau jabatan tertentu.',
      'Kurangnya transparansi progres pengajuan usulan mutasi di sistem kepegawaian.',
    ],
    dampakRisiko: [
      'Sistem merit dan objektivitas penempatan SDM terganggu.',
      'Menurunkan moral dan kepercayaan aparatur terhadap keadilan karier.',
    ],
    mandatoryControls: [
      'Pemrosesan Usulan Mutasi/Promosi Sepenuhnya Melalui Sistem SIKEP dengan Pelacakan Status',
      'Pakta Integritas Tim Penilai Kinerja dan Pengelola Kepegawaian',
    ],
    nonMandatoryControls: [
      'Publikasi Kriteria dan Mekanisme Seleksi Terbuka Jabatan Secara Transparan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.37',
    prosesSubproses: 'Rekrutmen CPNS, PPPK & Tenaga Kontrak',
    pernyataanRisiko:
      'Keluarga pelamar menawarkan uang atau barang kepada panitia seleksi daerah agar peserta diluluskan dalam tahapan seleksi administrasi atau wawancara.',
    klasifikasiRisiko: 'Sektor SDM & Kelembagaan',
    faktorPenyebab: 'Tingginya Minat Seleksi Aparatur',
    penyebabRisiko: [
      'Kepercayaan masyarakat terhadap pihak yang mengaku dapat membantu kelulusan.',
      'Tahapan wawancara atau verifikasi berkas tidak terdokumentasi secara terbuka.',
    ],
    dampakRisiko: [
      'Kualitas SDM yang direkrut tidak memenuhi standar kompetensi.',
      'Mencemari reputasi Mahkamah Agung dalam pelaksanaan rekrutmen bersih.',
    ],
    mandatoryControls: [
      'Penggunaan Sistem CAT Nasional dan Penilaian Panel Wawancara Terdokumentasi',
      'Pengumuman Resmi Larangan Pungutan dan Penolakan Segala Bentuk Titipan Pelamar',
    ],
    nonMandatoryControls: [
      'Layanan Informasi Seleksi Terpusat dengan Kanal Pengaduan Kecurangan Rekrutmen',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.38',
    prosesSubproses: 'Penilaian Kinerja & Pemberian Penghargaan',
    pernyataanRisiko:
      'Pegawai memberikan hadiah kepada atasan penilai kinerja untuk mendapatkan predikat nilai SKP sangat baik atau rekomendasi pegawai teladan.',
    klasifikasiRisiko: 'Sektor SDM & Kelembagaan',
    faktorPenyebab: 'Subjektivitas Penilaian Atasan',
    penyebabRisiko: [
      'Penilaian perilaku kerja belum sepenuhnya mengacu pada bukti pencapaian kinerja harian.',
      'Tidak ada mekanisme umpan balik 360 derajat atau verifikasi tim penilai.',
    ],
    dampakRisiko: [
      'Ketidakadilan dalam pemberian tunjangan kinerja atau penghargaan pegawai.',
      'Melemahkan etos kerja dan kompetisi sehat di lingkungan unit kerja.',
    ],
    mandatoryControls: [
      'Evaluasi Kinerja Berbasis Bukti Output pada Aplikasi Kinerja (e-Kinerja)',
      'Kalibrasi Nilai Prestasi Kerja Secara Kolektif oleh Pimpinan Unit',
    ],
    nonMandatoryControls: [
      'Mekanisme Keberatan Penilaian Kinerja Secara Terbuka dan Terdokumentasi',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.39',
    prosesSubproses: 'Pengelolaan Cuti, Izin & Tugas Belajar',
    pernyataanRisiko:
      'Pegawai memberikan oleh-oleh atau kompensasi kepada petugas kepegawaian agar pengajuan cuti luar negeri, izin, atau rekomendasi tugas belajar diproses instan.',
    klasifikasiRisiko: 'Sektor SDM & Kelembagaan',
    faktorPenyebab: 'Pengurusan Administrasi Kepegawaian',
    penyebabRisiko: [
      'Pengajuan izin mendadak mendekati jadwal keberangkatan atau batas pendaftaran beasiswa.',
      'Belum optimalnya alur persetujuan digital sehingga masih bergantung pada pengurusan fisik.',
    ],
    dampakRisiko: [
      'Pelayanan kepegawaian internal menjadi tidak setara.',
      'Kebiasaan pemberian imbalan kecil dianggap lumrah di internal kantor.',
    ],
    mandatoryControls: [
      'Digitalisasi Pengajuan Cuti dan Tugas Belajar dengan SLA Persetujuan yang Jelas',
      'Sosialisasi Larangan Gratifikasi Antar-Pegawai dalam Pelayanan Internal',
    ],
    nonMandatoryControls: [
      'Checklist Persyaratan Digital agar Pemohon Melengkapi Berkas Sebelum Batas Waktu',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.40',
    prosesSubproses: 'Penjatuhan Hukuman Disiplin & Pembinaan',
    pernyataanRisiko:
      'Pegawai yang sedang diproses pelanggaran disiplin memberikan uang atau barang kepada tim pemeriksa kepegawaian agar sanksi diturunkan.',
    klasifikasiRisiko: 'Sektor SDM & Kelembagaan',
    faktorPenyebab: 'Penghindaran Sanksi Kepegawaian',
    penyebabRisiko: [
      'Dampak finansial hukuman disiplin terhadap tunjangan kinerja dan pangkat sangat besar.',
      'Proses pemeriksaan tidak melibatkan unit pengawasan internal secara memadai.',
    ],
    dampakRisiko: [
      'Penegakan disiplin pegawai menjadi tumpul dan tidak memberi efek jera.',
      'Pelanggaran disiplin berulang terjadi di satuan kerja.',
    ],
    mandatoryControls: [
      'Pemeriksaan Disiplin Dilakukan oleh Majelis/Tim Pemeriksa Lintas Unit dengan Berita Acara Resmi',
      'Reviu Kesesuaian Tingkat Hukuman Disiplin Berdasarkan PP Nomor 94 Tahun 2021',
    ],
    nonMandatoryControls: [
      'Pelaporan Berkala Status Penyelesaian Kasus Disiplin ke Badan Pengawasan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.41',
    prosesSubproses: 'Pengelolaan Presensi & Tunjangan Kinerja',
    pernyataanRisiko:
      'Petugas pengelola absensi menerima pemberian agar memanipulasi rekapitulasi ketidakhadiran atau keterlambatan pegawai.',
    klasifikasiRisiko: 'Sektor SDM & Kelembagaan',
    faktorPenyebab: 'Akses Admin Sistem Presensi',
    penyebabRisiko: [
      'Kewenangan koreksi absensi di aplikasi dipegang oleh satu admin tanpa persetujuan atasan.',
      'Rekapitulasi tunjangan kinerja tidak dicocokkan dengan surat izin/tugas resmi.',
    ],
    dampakRisiko: [
      'Pembayaran tunjangan kinerja tidak sesuai ketentuan dan menimbulkan kerugian negara.',
      'Menurunkan disiplin kerja aparatur secara keseluruhan.',
    ],
    mandatoryControls: [
      'Koreksi Presensi Wajib Melampirkan Surat Tugas/Izin Resmi dan Otorisasi Atasan Langsung',
      'Audit Log Perubahan Data Presensi pada Aplikasi Kepegawaian Setiap Bulan',
    ],
    nonMandatoryControls: [
      'Publikasi Rekap Tingkat Kedisiplinan Unit Kerja Secara Periodik',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.42',
    prosesSubproses: 'Pengelolaan Keuangan & Perjalanan Dinas',
    pernyataanRisiko:
      'Pelaksana perjalanan dinas menerima fasilitas penginapan atau tiket gratis dari pihak ketiga/satker daerah namun tetap mengajukan klaim biaya riil penuh.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Verifikasi Pertanggungjawaban SPJ',
    penyebabRisiko: [
      'Kuitansi hotel atau transportasi tidak diverifikasi keabsahannya kepada penerbit resmi.',
      'Penerimaan fasilitas dari tuan rumah tidak dilaporkan sehingga terjadi klaim ganda.',
    ],
    dampakRisiko: [
      'Pemborosan dan penyalahgunaan anggaran perjalanan dinas.',
      'Temuan audit berulang terkait perjalanan dinas fiktif atau mark-up biaya.',
    ],
    mandatoryControls: [
      'Verifikasi Keabsahan Bukti Tiket dan Tagihan Hotel oleh Pejabat Pembuat Komitmen & Bendahara',
      'Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) atas Kebenaran Biaya Riil Perjalanan Dinas',
    ],
    nonMandatoryControls: [
      'Penerapan Pembayaran Langsung / Kartu Kredit Pemerintah untuk Akomodasi Dinas',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.43',
    prosesSubproses: 'Pengelolaan Keuangan & Pencairan Anggaran',
    pernyataanRisiko:
      'Pihak ketiga atau pelaksana kegiatan memberikan uang terima kasih kepada staf verifikator keuangan dan bendahara agar pengajuan SPM/SP2D dipercepat.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Proses Verifikasi Berkas Pencairan',
    penyebabRisiko: [
      'Antrean verifikasi tagihan di bagian keuangan tidak memiliki pelacakan status terbuka.',
      'Adanya anggapan keliru bahwa uang lelah mempercepat pencairan adalah hal wajar.',
    ],
    dampakRisiko: [
      'Berkas tagihan yang belum lengkap berpotensi diloloskan karena imbalan.',
      'Menumbuhkan budaya pungli di internal pengelola keuangan.',
    ],
    mandatoryControls: [
      'Antrean Pengajuan Tagihan Berbasis Sistem FIFO dengan Checklist Kelengkapan Baku',
      'Pembayaran Non-Tunai Langsung ke Rekening Penyedia / Penerima Hak',
    ],
    nonMandatoryControls: [
      'Publikasi Standar Waktu Proses Pencairan SPM/SP2D di Ruang Keuangan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.44',
    prosesSubproses: 'Pengelolaan Honorarium & Narasumber',
    pernyataanRisiko:
      'Panitia penyelenggara kegiatan meminta potongan atau pengembalian sebagian honorarium narasumber maupun peserta kegiatan.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Pengelolaan Uang Muka Kegiatan',
    penyebabRisiko: [
      'Pembayaran honorarium masih dilakukan secara tunai oleh panitia pelaksana.',
      'Narasumber atau peserta tidak memperoleh rincian bukti potong pajak dan nilai bersih.',
    ],
    dampakRisiko: [
      'Penyimpangan anggaran negara dan pelanggaran integritas pengelolaan kegiatan.',
      'Menimbulkan pengaduan dari pihak eksternal maupun internal.',
    ],
    mandatoryControls: [
      'Wajib Transfer Langsung Honorarium Narasumber/Peserta dari Rekening Bendahara',
      'Penyampaian Slip Pembayaran dan Bukti Potong Pajak PPh Secara Transparan',
    ],
    nonMandatoryControls: [
      'Konfirmasi Penerimaan Honorarium Secara Elektronik Melalui Formulir Evaluasi Kegiatan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.45',
    prosesSubproses: 'Penyusunan & Revisi Anggaran',
    pernyataanRisiko:
      'Unit pengusul anggaran memberikan hadiah atau fasilitas kepada petugas penyusun RKAKL agar usulan anggaran non-prioritas diakomodasi.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Negosiasi Alokasi Pagu Anggaran',
    penyebabRisiko: [
      'Proses penelaahan usulan anggaran tidak sepenuhnya mengikuti standar biaya dan prioritas kinerja.',
      'Kurangnya keterbukaan kriteria penentuan pagu indikatif antar-unit.',
    ],
    dampakRisiko: [
      'Alokasi anggaran menjadi tidak efektif dan tidak mendukung pencapaian IKU organisasi.',
      'Pemborosan belanja barang modal dan operasional yang tidak mendesak.',
    ],
    mandatoryControls: [
      'Penelaahan Usulan Anggaran Secara Panel Bersama Tim Perencanaan dan Pengawas Internal',
      'Kesesuaian Usulan dengan Standar Biaya Masukan (SBM) dan Rencana Strategis',
    ],
    nonMandatoryControls: [
      'Dokumentasi Notula Penelaahan Anggaran yang Dapat Diakses Pimpinan Unit',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.46',
    prosesSubproses: 'Pengelolaan PNBP & Setoran Kas Negara',
    pernyataanRisiko:
      'Petugas penerima PNBP menunda penyetoran ke kas negara atau menerima selisih pembayaran tunai dari wajib bayar.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Penerimaan Tunai Manual',
    penyebabRisiko: [
      'Masih adanya transaksi pembayaran layanan secara tunai melalui petugas.',
      'Rekonsiliasi harian antara bukti billing SIMPONI dan laporan pelayanan belum rutin.',
    ],
    dampakRisiko: [
      'Potensi kehilangan atau pengendapan penerimaan negara bukan pajak.',
      'Temuan pemeriksaan kas oleh tim audit internal maupun eksternal.',
    ],
    mandatoryControls: [
      'Wajib Pembayaran PNBP Menggunakan Kode Billing SIMPONI / EDC / QRIS Resmi',
      'Rekonsiliasi Harian Penerimaan PNBP antara Kepaniteraan/Layanan dan Bendahara Penerima',
    ],
    nonMandatoryControls: [
      'Pemeriksaan Kas Mendadak (Cash Opname) Minimal Satu Kali Setiap Triwulan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.47',
    prosesSubproses: 'Pengelolaan Hibah & Bantuan Pihak Ketiga',
    pernyataanRisiko:
      'Pengelola kegiatan menerima sumbangan dana atau barang dari mitra/pemda secara langsung tanpa registrasi mekanisme hibah resmi negara.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Ketidakpahaman Regulasi Hibah',
    penyebabRisiko: [
      'Pemda atau lembaga mitra menawarkan bantuan sarana gedung/kendaraan secara langsung.',
      'Pengelola tidak memahami prosedur pengesahan hibah melalui Kementerian Keuangan dan MA.',
    ],
    dampakRisiko: [
      'Aset atau dana tidak tercatat pada LKPP/BMN sehingga berisiko dianggap gratifikasi kelembagaan.',
      'Menimbulkan konflik kepentingan dengan pemberi hibah di wilayah setempat.',
    ],
    mandatoryControls: [
      'SOP Penerimaan Hibah Wajib Mendapat Persetujuan Sekjen MA dan Pengesahan DJKN/Kemenkeu',
      'Pelaporan Setiap Tawaran Bantuan Pihak Ketiga kepada Tim UPG Sebelum Diterima',
    ],
    nonMandatoryControls: [
      'Sosialisasi Perbedaan Hibah Institusional yang Sah dan Gratifikasi kepada Pimpinan Satker',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.48',
    prosesSubproses: 'Pengelolaan Barang Milik Negara (BMN)',
    pernyataanRisiko:
      'Pengurus BMN menerima imbalan dari calon peserta lelang atau pembeli dalam proses penghapusan dan penjualan aset kendaraan/peralatan kantor.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Penilaian Harga Limit & Lelang',
    penyebabRisiko: [
      'Informasi kondisi fisik aset dan jadwal peninjauan hanya diberikan kepada pihak tertentu.',
      'Proses lelang tidak sepenuhnya diarahkan melalui mekanisme terbuka KPKNL.',
    ],
    dampakRisiko: [
      'Nilai perolehan hasil lelang BMN tidak optimal bagi kas negara.',
      'Terjadinya praktik persekongkolan dalam penghapusan aset negara.',
    ],
    mandatoryControls: [
      'Penjualan Aset BMN Wajib Melalui Lelang Terbuka KPKNL dengan Penilaian Nilai Wajar',
      'Publikasi Terbuka Pengumuman Lelang dan Kesempatan Peninjauan Aset yang Sama',
    ],
    nonMandatoryControls: [
      'Pengawasan Proses Inventarisasi dan Penghapusan BMN oleh Inspektorat Wilayah',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.49',
    prosesSubproses: 'Pengelolaan Kendaraan Dinas & BBM',
    pernyataanRisiko:
      'Pengelola kendaraan dinas atau sopir menerima komisi dari bengkel rekanan atau penyedia BBM agar menyetujui nota perbaikan fiktif atau penggantian suku cadang tidak perlu.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Pemeliharaan Aset Bergerak',
    penyebabRisiko: [
      'Penunjukan bengkel pemeliharaan dilakukan langsung tanpa pemeriksaan fisik suku cadang bekas.',
      'Kartu kendali pemeliharaan dan odometer kendaraan tidak dicatat rutin.',
    ],
    dampakRisiko: [
      'Pembengkakan biaya pemeliharaan kendaraan operasional.',
      'Kondisi kendaraan dinas tidak terawat meskipun anggaran telah terserap.',
    ],
    mandatoryControls: [
      'Wajib Penyerahan Suku Cadang Bekas dan Foto Perbaikan sebagai Syarat Pembayaran Bengkel',
      'Pencatatan Buku Kendali Odometer, BBM, dan Riwayat Servis per Kendaraan',
    ],
    nonMandatoryControls: [
      'Kerja Sama Resmi dengan Bengkel Terstandar Agen Pemegang Merek (APM)',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.50',
    prosesSubproses: 'Pengelolaan Rumah Dinas & Fasilitas Kantor',
    pernyataanRisiko:
      'Petugas pengelola rumah negara menerima uang terima kasih dari pegawai yang menempati rumah dinas kategori strategis atau baru direnovasi.',
    klasifikasiRisiko: 'Sektor SDM & Kelembagaan',
    faktorPenyebab: 'Keterbatasan Unit Rumah Dinas',
    penyebabRisiko: [
      'Jumlah pemohon rumah dinas lebih banyak dibandingkan ketersediaan unit layak huni.',
      'Kriteria prioritas penghunian rumah dinas belum sepenuhnya transparan.',
    ],
    dampakRisiko: [
      'Penunjukan penghuni rumah dinas tidak adil dan berpotensi kolutif.',
      'Timbulnya kecemburuan sosial antar-aparatur di satuan kerja.',
    ],
    mandatoryControls: [
      'Penetapan Daftar Tunggu dan Kriteria Prioritas Penghunian Rumah Dinas Melalui SK Pimpinan',
      'Penerbitan Surat Izin Penghunian (SIP) Secara Terbuka oleh Tim Pengelola BMN',
    ],
    nonMandatoryControls: [
      'Inspeksi Kondisi Berkala dan Pemutakhiran Data Penghuni Rumah Negara',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.51',
    prosesSubproses: 'Pemanfaatan Ruangan & Aset Kantor',
    pernyataanRisiko:
      'Pengelola gedung menerima sewa informal atau komisi dari pengelola kantin, koperasi, atau penyedia jasa fotokopi di lingkungan kantor.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Pemanfaatan BMN Tanpa Kontrak Sewa Sah',
    penyebabRisiko: [
      'Penggunaan ruang usaha di area gedung tidak melalui mekanisme persetujuan sewa BMN dari DJKN.',
      'Setoran pemanfaatan ruang tidak masuk ke kas negara sebagai PNBP.',
    ],
    dampakRisiko: [
      'Pelanggaran ketentuan pengelolaan BMN dan hilangnya potensi PNBP negara.',
      'Rawan pungutan liar rutin terhadap pelaku usaha kecil di lingkungan kantor.',
    ],
    mandatoryControls: [
      'Seluruh Pemanfaatan Ruang Usaha Wajib Memiliki Izin Sewa BMN Resmi dan Setor PNBP',
      'Larangan Keras Pungutan di Luar Kontrak Sewa Resmi oleh Pengelola Gedung',
    ],
    nonMandatoryControls: [
      'Audit Kepatuhan Pemanfaatan Ruang dan Kantin Kantor Setiap Semester',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.52',
    prosesSubproses: 'Pengelolaan Persediaan & Distribusi ATK',
    pernyataanRisiko:
      'Petugas gudang persediaan menerima hadiah atau imbalan untuk mengutamakan distribusi perlengkapan kerja baru kepada bagian tertentu.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Distribusi Barang Persediaan',
    penyebabRisiko: [
      'Permintaan barang persediaan dari tiap bagian tidak menggunakan sistem permohonan terpusat.',
      'Stok persediaan tidak terbuka untuk dipantau kebutuhannya antar-unit.',
    ],
    dampakRisiko: [
      'Penumpukan ATK atau perangkat kerja di unit tertentu sementara unit lain kekurangan.',
      'Ketidakefisienan belanja persediaan kantor.',
    ],
    mandatoryControls: [
      'Permohonan dan Pengeluaran Persediaan Wajib Menggunakan Sistem Persediaan Terintegrasi',
      'Stock Opname Fisik Berkala oleh Tim Pengelola BMN dan Pengawas Internal',
    ],
    nonMandatoryControls: [
      'Standarisasi Kuota Kebutuhan ATK per Unit Kerja Setiap Triwulan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.53',
    prosesSubproses: 'Pendidikan, Pelatihan & Bimbingan Teknis',
    pernyataanRisiko:
      'Panitia penyelenggara diklat/bimtek menerima hadiah, voucher menginap, atau komisi dari pihak hotel tempat penyelenggaraan kegiatan.',
    klasifikasiRisiko: 'Sektor SDM & Kelembagaan',
    faktorPenyebab: 'Pemilihan Lokasi Pelatihan Fullboard',
    penyebabRisiko: [
      'Penunjukan hotel penyelenggara kegiatan didasarkan pada keuntungan komisi atau fasilitas gratis panitia.',
      'Belum optimalnya pemanfaatan fasilitas Pusdiklat atau pemilihan melalui e-Katalog.',
    ],
    dampakRisiko: [
      'Biaya paket meeting fullboard menjadi tidak efisien.',
      'Kualitas ruang belajar dan akomodasi peserta tidak sesuai standar.',
    ],
    mandatoryControls: [
      'Prioritas Penggunaan Fasilitas Pusdiklat atau Pengadaan Paket Meeting via e-Katalog',
      'Larangan Penerimaan Complimentary Room atau Komisi Hotel untuk Kepentingan Pribadi',
    ],
    nonMandatoryControls: [
      'Survei Evaluasi Kualitas Sarana Akomodasi dan Konsumsi oleh Peserta Pelatihan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.54',
    prosesSubproses: 'Pendidikan, Pelatihan & Sertifikasi',
    pernyataanRisiko:
      'Peserta pelatihan atau sertifikasi memberikan cenderamata atau uang kepada widyaiswara/penguji agar diluluskan dalam ujian kompetensi.',
    klasifikasiRisiko: 'Sektor SDM & Kelembagaan',
    faktorPenyebab: 'Tuntutan Kelulusan Sertifikasi Jabatan',
    penyebabRisiko: [
      'Sertifikat kompetensi menjadi syarat mutlak pengangkatan jabatan fungsional atau hakim.',
      'Interaksi intensif peserta dengan penguji selama masa pelatihan.',
    ],
    dampakRisiko: [
      'Standar kompetensi aparatur lulusan diklat menjadi menurun.',
      'Merusak integritas proses sertifikasi SDM peradilan.',
    ],
    mandatoryControls: [
      'Penilaian Ujian Kompetensi Berbasis Komputer dan Penilaian Ganda Secara Anonim',
      'Kode Etik Penguji dan Widyaiswara Melarang Segala Pemberian dari Peserta',
    ],
    nonMandatoryControls: [
      'Imbauan Tertulis Anti-Gratifikasi pada Buku Panduan Peserta Pelatihan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.55',
    prosesSubproses: 'Bimbingan Teknis & Sosialisasi Daerah',
    pernyataanRisiko:
      'Satker daerah tuan rumah kegiatan sosialisasi memberikan uang saku tambahan atau oleh-oleh kepada narasumber dari kantor pusat/Badan Pengawasan.',
    klasifikasiRisiko: 'Sektor Pengawasan & Pemeriksaan',
    faktorPenyebab: 'Tumpang Tindih Pembiayaan Kegiatan',
    penyebabRisiko: [
      'Kurangnya koordinasi sumber anggaran SPPD antara unit pengundang dan satker tuan rumah.',
      'Budaya penghormatan kepada pejabat pusat melalui pemberian cinderamata/uang transport lokal.',
    ],
    dampakRisiko: [
      'Terjadinya penerimaan ganda biaya perjalanan dinas dan pelanggaran gratifikasi.',
      'Membebani anggaran operasional satker daerah secara tidak semestinya.',
    ],
    mandatoryControls: [
      'Penegasan Pembiayaan Narasumber Tunggal dari Unit Penyelenggara pada Surat Tugas',
      'Kewajiban Pelaporan ke UPG Apabila Menerima Pemberian yang Tidak Dapat Ditolak di Tempat',
    ],
    nonMandatoryControls: [
      'Template Pemberitahuan Resmi "Tanpa Penjemputan Khusus & Tanpa Pemberian Cenderamata"',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.56',
    prosesSubproses: 'Studi Banding & Kunjungan Kerja',
    pernyataanRisiko:
      'Peserta studi banding menerima bingkisan atau jamuan mewah yang dibiayai dari iuran tidak resmi satker yang dikunjungi.',
    klasifikasiRisiko: 'Sektor SDM & Kelembagaan',
    faktorPenyebab: 'Kunjungan Kerja Antar-Satuan Kerja',
    penyebabRisiko: [
      'Tuan rumah merasa perlu menjamu tamu secara berlebihan demi citra satuan kerja.',
      'Tidak adanya pedoman batasan penerimaan jamuan antar-instansi/satker.',
    ],
    dampakRisiko: [
      'Pemborosan sumber daya dan munculnya budaya saling membalas pemberian.',
      'Mengaburkan tujuan substansial pembelajaran dan pertukaran praktik baik.',
    ],
    mandatoryControls: [
      'Pedoman Penerimaan Tamu Kedinasan yang Sederhana dan Sesuai Standar Biaya',
      'Pelaporan Penerimaan Cenderamata Institusional Sesuai Peraturan KPK Nomor 2 Tahun 2019',
    ],
    nonMandatoryControls: [
      'Pertukaran Plakat atau Cenderamata Non-Ekonomis Tercatat sebagai Inventaris Kantor',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.57',
    prosesSubproses: 'Kerja Sama Kelembagaan & Hubungan Eksternal',
    pernyataanRisiko:
      'Mitra kerja sama (perguruan tinggi, lembaga internasional, atau asosiasi profesi) memberikan tiket konferensi berbayar atau fasilitas perjalanan kepada pejabat pengelola kerja sama.',
    klasifikasiRisiko: 'Sektor SDM & Kelembagaan',
    faktorPenyebab: 'Fasilitas Perjalanan dari Mitra',
    penyebabRisiko: [
      'Undangan seminar atau forum eksternal disertai tawaran akomodasi kelas bisnis atau uang harian.',
      'Ketidakjelasan batas antara sponsor resmi kedinasan dan gratifikasi personal.',
    ],
    dampakRisiko: [
      'Memengaruhi objektivitas dalam penyusunan perjanjian kerja sama kelembagaan.',
      'Risiko pelanggaran aturan pelaporan fasilitas perjalanan dinas dari pihak ketiga.',
    ],
    mandatoryControls: [
      'Verifikasi Surat Undangan Resmi dan Persetujuan Pimpinan Sebelum Menghadiri Forum Eksternal',
      'Pelaporan Seluruh Fasilitas Akomodasi/Transportasi dari Pihak Ketiga Melalui UPG/GOL KPK',
    ],
    nonMandatoryControls: [
      'Kebijakan Prioritas Pembiayaan Perjalanan Dinas dari Anggaran DIPA Sendiri',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.58',
    prosesSubproses: 'Pengelolaan Teknologi Informasi & Keamanan Data',
    pernyataanRisiko:
      'Administrator basis data menerima imbalan dari pihak eksternal untuk mengekstrak atau membocorkan data perkara, statistik, atau data pribadi aparatur.',
    klasifikasiRisiko: 'Sektor Layanan Publik',
    faktorPenyebab: 'Hak Akses Superadmin Basis Data',
    penyebabRisiko: [
      'Aktivitas ekspor data sensitif oleh admin TI belum dipantau secara real-time.',
      'Kurangnya kesadaran akan regulasi perlindungan data pribadi dan keamanan informasi.',
    ],
    dampakRisiko: [
      'Kebocoran data rahasia instansi dan pelanggaran UU Perlindungan Data Pribadi.',
      'Kerugian reputasi dan tuntutan hukum terhadap lembaga.',
    ],
    mandatoryControls: [
      'Penerapan Principle of Least Privilege dan Audit Log Ekspor Basis Data',
      'Perjanjian Kerahasiaan Informasi Khusus Bagi Seluruh Administrator Sistem TI',
    ],
    nonMandatoryControls: [
      'Pelatihan Keamanan Siber dan Etika Pengelolaan Data Secara Berkala',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.59',
    prosesSubproses: 'Kehumasan, Publikasi & Protokoler',
    pernyataanRisiko:
      'Petugas kehumasan menerima bingkisan atau komisi dari media massa/percetakan mitra dalam penempatan iklan pengumuman atau liputan khusus.',
    klasifikasiRisiko: 'Sektor Pengadaan & Keuangan',
    faktorPenyebab: 'Pemilihan Mitra Publikasi Media',
    penyebabRisiko: [
      'Penentuan media penayangan pengumuman resmi tidak menggunakan daftar mitra terstandar.',
      'Hubungan kedekatan personal dengan perwakilan media.',
    ],
    dampakRisiko: [
      'Publikasi informasi lembaga tidak menjangkau target audiens secara efektif.',
      'Munculnya keberpihakan dalam belanja publikasi kehumasan.',
    ],
    mandatoryControls: [
      'Penetapan Kriteria Objektif Pemilihan Media Mitra dan Pengadaan Melalui e-Katalog/SPSE',
      'Larangan Penerimaan Komisi Agen atau Bingkisan dari Rekanan Media',
    ],
    nonMandatoryControls: [
      'Evaluasi Jangkauan dan Efektivitas Publikasi Media Secara Triwulanan',
    ],
  },
  {
    kodeRisiko: 'PPG.RK.60',
    prosesSubproses: 'Tata Kelola UPG & Pelaporan Berkala',
    pernyataanRisiko:
      'Anggota Tim UPG menerima gratifikasi berupa barang atau fasilitas dalam rangka mempercepat penerbitan surat keterangan bebas temuan atau penilaian pengendalian gratifikasi satker.',
    klasifikasiRisiko: 'Sektor Pengawasan & Pemeriksaan',
    faktorPenyebab: 'Integritas Internal Pengendali Gratifikasi',
    penyebabRisiko: [
      'Kurangnya pengawasan silang terhadap proses verifikasi bukti dukung penilaian risiko dan monev PPG.',
      'Tuntutan satker untuk segera memperoleh rekomendasi hasil evaluasi PPG.',
    ],
    dampakRisiko: [
      'Runtuhnya kredibilitas Unit Pengendalian Gratifikasi sebagai garda terdepan pencegahan korupsi.',
      'Penilaian maturitas pengendalian gratifikasi menjadi tidak valid.',
    ],
    mandatoryControls: [
      'Kode Etik Khusus Tim UPG Pusat dan Verifikasi Kolektif Hasil Penilaian PPG',
      'Audit Internal Tahunan atas Tata Kelola dan Kepatuhan Tim UPG',
    ],
    nonMandatoryControls: [
      'Deklarasi Integritas Tahunan Seluruh Anggota Tim UPG Badan Pengawasan',
      'Publikasi Laporan Kinerja Pengendalian Gratifikasi Secara Terbuka di Portal Wastitama',
    ],
  },
];
