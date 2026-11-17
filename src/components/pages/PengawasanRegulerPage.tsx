import { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  ListChecks,
  Monitor,
  Printer,
  Search,
  Upload,
} from 'lucide-react';
import { PageId, PengawasanRegulerItem } from '../../types/upg';
import { Modal } from '../Modal';

interface PengawasanRegulerPageProps {
  items: PengawasanRegulerItem[];
  onUpdateItem: (item: PengawasanRegulerItem) => void;
  onNavigate: (page: PageId) => void;
}

type ActionModalType =
  | 'monitoringZI'
  | 'kendaliMutu'
  | 'tanggapanAuditee'
  | 'lhpBab2'
  | 'uploadLaporan'
  | 'previewLaporan';

const ACTION_TITLES: Record<ActionModalType, string> = {
  monitoringZI: 'Monitoring Zona Integritas (ZI)',
  kendaliMutu: 'Kendali Mutu Pengawasan Reguler',
  tanggapanAuditee: 'Tanggapan Auditee',
  lhpBab2: 'Cetak LHP BAB II',
  uploadLaporan: 'Unggah Dokumen Laporan PDF',
  previewLaporan: 'Pratinjau Dokumen Laporan',
};

export function PengawasanRegulerPage({
  items,
  onUpdateItem,
  onNavigate,
}: PengawasanRegulerPageProps) {
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [search, setSearch] = useState('');
  const [activeModal, setActiveModal] = useState<{
    item: PengawasanRegulerItem;
    type: ActionModalType;
  } | null>(null);
  const [textDraft, setTextDraft] = useState('');
  const [fileDraft, setFileDraft] = useState('');

  const q = search.trim().toLowerCase();
  const filtered = items.filter(
    (item) =>
      !q ||
      item.namaObrik.toLowerCase().includes(q) ||
      item.tanggalPelaksanaanST.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q)
  );
  const displayed = filtered.slice(0, entriesPerPage);

  const openActionModal = (
    item: PengawasanRegulerItem,
    type: ActionModalType
  ) => {
    setActiveModal({ item, type });
    if (type === 'monitoringZI') setTextDraft(item.monitoringZI);
    else if (type === 'kendaliMutu') setTextDraft(item.kendaliMutu);
    else if (type === 'tanggapanAuditee') setTextDraft(item.tanggapanAuditee);
    else if (type === 'lhpBab2') setTextDraft(item.lhpBab2);
    else if (type === 'uploadLaporan') setFileDraft(item.laporanPdf || '');
  };

  const handleSaveModal = () => {
    if (!activeModal) return;
    const { item, type } = activeModal;
    const updated = { ...item };
    if (type === 'monitoringZI') updated.monitoringZI = textDraft;
    else if (type === 'kendaliMutu') updated.kendaliMutu = textDraft;
    else if (type === 'tanggapanAuditee') updated.tanggapanAuditee = textDraft;
    else if (type === 'lhpBab2') updated.lhpBab2 = textDraft;
    else if (type === 'uploadLaporan') {
      updated.laporanPdf = fileDraft.trim() || `LHP_${item.namaObrik.replace(/\s+/g, '_')}.pdf`;
    }
    onUpdateItem(updated);
    setActiveModal(null);
  };

  const handleDeleteLaporan = (item: PengawasanRegulerItem) => {
    onUpdateItem({ ...item, laporanPdf: null });
  };

  return (
    <div className="overflow-hidden rounded-[6px] border border-[#dce3eb] bg-white shadow-[0_2px_6px_rgba(27,53,85,0.06)]">
      {/* Header Bar sesuai gambar */}
      <div className="flex items-center justify-between bg-[#07579f] px-5 py-3.5 text-white">
        <h2 className="m-0 text-[16px] font-semibold tracking-tight text-white">
          Daftar Obrik &gt; Pengawasan Reguler
        </h2>
        <button
          type="button"
          onClick={() => onNavigate('ppg-dashboard')}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-white/25 bg-white/10 px-3 py-1 text-[13px] font-semibold text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9eef4] px-5 py-3.5 text-[13px] text-[#52647a]">
        <div className="flex items-center gap-2">
          <span>Tampilkan</span>
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            className="border-0 border-b border-[#94a3b8] bg-transparent px-1 py-0.5 text-[13px] font-semibold text-[#243247] focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entri</span>
        </div>

        <label className="flex items-center gap-2 text-[13px] text-[#52647a]">
          <Search className="h-3.5 w-3.5 text-[#718096]" />
          <span>Cari :</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder=""
            className="w-[180px] border-0 border-b border-[#94a3b8] bg-transparent px-1 py-0.5 text-[13px] text-[#243247] focus:border-[#07579f] focus:outline-none"
          />
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-5 pb-5 pt-2">
        <table className="w-full min-w-[820px] border-collapse border border-[#e3e8ee]">
          <thead>
            <tr className="bg-[#f8fafc] text-[#243247]">
              <th className="w-[56px] border border-[#e3e8ee] px-3 py-2.5 text-center text-[13px] font-semibold">
                No
              </th>
              <th className="border border-[#e3e8ee] px-3 py-2.5 text-center text-[13px] font-semibold">
                Nama Obrik
              </th>
              <th className="border border-[#e3e8ee] px-3 py-2.5 text-center text-[13px] font-semibold">
                Tanggal Pelaksanaan ST
              </th>
              <th className="border border-[#e3e8ee] px-3 py-2.5 text-center text-[13px] font-semibold">
                Status
              </th>
              <th className="w-[130px] border border-[#e3e8ee] px-3 py-2.5 text-center text-[13px] font-semibold">
                Laporan
              </th>
              <th className="w-[190px] border border-[#e3e8ee] px-3 py-2.5 text-center text-[13px] font-semibold">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="border border-[#e3e8ee] px-4 py-8 text-center text-[13px] text-[#718096]"
                >
                  Tidak ada data obrik yang sesuai pencarian.
                </td>
              </tr>
            ) : (
              displayed.map((item, idx) => (
                <tr key={item.id} className="hover:bg-[#fafcff]">
                  <td className="border border-[#e3e8ee] px-3 py-4 text-center text-[13px] tabular-nums text-[#243247]">
                    {idx + 1}
                  </td>
                  <td className="border border-[#e3e8ee] px-4 py-4 text-[13px] font-bold text-[#143666]">
                    {item.namaObrik}
                  </td>
                  <td className="border border-[#e3e8ee] px-3 py-4 text-center text-[13px] text-[#243247]">
                    {item.tanggalPelaksanaanST}
                  </td>
                  <td className="border border-[#e3e8ee] px-3 py-4 text-center text-[13px] text-[#243247]">
                    {item.status}
                  </td>
                  <td className="border border-[#e3e8ee] px-3 py-4 text-center text-[12px]">
                    {item.laporanPdf ? (
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openActionModal(item, 'previewLaporan')}
                          className="inline-flex cursor-pointer flex-col items-center gap-0.5 text-[#198754] hover:opacity-80"
                          title={item.laporanPdf}
                        >
                          <div className="relative flex h-9 w-8 items-center justify-center rounded border border-[#198754] bg-[#edf8f2] text-[9px] font-extrabold text-[#198754]">
                            PDF
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLaporan(item)}
                          className="cursor-pointer border-0 bg-transparent p-0 text-[12px] text-[#243247] hover:text-[#dc3545] hover:underline"
                        >
                          [Hapus]
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openActionModal(item, 'uploadLaporan')}
                        className="inline-flex cursor-pointer items-center gap-1 rounded bg-[#0b69c7] px-3 py-2 text-[11px] font-bold uppercase text-white hover:bg-[#0853a0]"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>UNGGAH DOKUMEN</span>
                      </button>
                    )}
                  </td>
                  <td className="border border-[#e3e8ee] px-3 py-3">
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => openActionModal(item, 'monitoringZI')}
                        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[3px] border border-[#0b79d0] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#0b79d0] hover:bg-[#eef6fd]"
                      >
                        <Monitor className="h-3.5 w-3.5" />
                        <span>Monitoring ZI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openActionModal(item, 'kendaliMutu')}
                        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[3px] border border-[#8e24aa] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#8e24aa] hover:bg-[#f9effb]"
                      >
                        <ListChecks className="h-3.5 w-3.5" />
                        <span>Kendali Mutu</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openActionModal(item, 'tanggapanAuditee')}
                        className="flex w-full cursor-pointer items-center justify-center rounded-[3px] border border-[#2e9c40] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#2e9c40] hover:bg-[#effaf1]"
                      >
                        Tanggapan Auditee
                      </button>
                      <button
                        type="button"
                        onClick={() => openActionModal(item, 'lhpBab2')}
                        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[3px] border border-[#e53935] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#e53935] hover:bg-[#fdeeee]"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Cetak LHP BAB II</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Aksi Pengawasan Reguler */}
      <Modal
        open={activeModal !== null}
        title={
          activeModal
            ? `${ACTION_TITLES[activeModal.type]} — ${activeModal.item.namaObrik}`
            : ''
        }
        onClose={() => setActiveModal(null)}
        onSave={
          activeModal && activeModal.type !== 'previewLaporan'
            ? handleSaveModal
            : undefined
        }
        saveLabel={
          activeModal?.type === 'lhpBab2' ? 'Simpan & Cetak' : 'Simpan'
        }
        showFooter={activeModal?.type !== 'previewLaporan'}
      >
        {activeModal && activeModal.type === 'previewLaporan' && (
          <div className="space-y-3 text-[13px] text-[#243247]">
            <div className="flex items-center gap-3 rounded border border-[#dce3eb] bg-[#f7faff] p-3">
              <FileText className="h-6 w-6 text-[#198754]" />
              <div>
                <div className="font-bold">{activeModal.item.laporanPdf}</div>
                <div className="text-[11px] text-[#718096]">
                  Obrik: {activeModal.item.namaObrik} · Tanggal ST:{' '}
                  {activeModal.item.tanggalPelaksanaanST}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="cursor-pointer rounded border border-[#1762b5] bg-[#1762b5] px-4 py-1.5 text-[13px] font-semibold text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {activeModal && activeModal.type === 'uploadLaporan' && (
          <div className="space-y-3 text-[13px]">
            <label className="block text-[12px] font-bold text-[#536477]">
              Nama File / Tautan Dokumen Laporan PDF
            </label>
            <input
              type="text"
              value={fileDraft}
              onChange={(e) => setFileDraft(e.target.value)}
              placeholder="Contoh: LHP_Pengawasan_Reguler_2026.pdf"
              className="w-full rounded border border-[#cfd9e4] px-3 py-2 text-[13px]"
            />
          </div>
        )}

        {activeModal &&
          activeModal.type !== 'previewLaporan' &&
          activeModal.type !== 'uploadLaporan' && (
            <div className="space-y-3 text-[13px]">
              <div className="rounded bg-[#f4f7fa] px-3 py-2 text-[12px] text-[#52647a]">
                Tanggal Pelaksanaan ST:{' '}
                <b>{activeModal.item.tanggalPelaksanaanST}</b> · Status:{' '}
                <b>{activeModal.item.status}</b>
              </div>
              <label className="block text-[12px] font-bold text-[#536477]">
                Catatan / Isian {ACTION_TITLES[activeModal.type]}
              </label>
              <textarea
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value)}
                placeholder={`Masukkan catatan ${ACTION_TITLES[activeModal.type]}...`}
                className="min-h-[110px] w-full resize-y rounded border border-[#cfd9e4] p-2.5 text-[13px] text-[#243247]"
              />
              {activeModal.type === 'lhpBab2' && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#08a9c4] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0796b0] hover:bg-[#f0fbfd]"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Buka Dialog Cetak LHP BAB II</span>
                </button>
              )}
            </div>
          )}
      </Modal>
    </div>
  );
}
