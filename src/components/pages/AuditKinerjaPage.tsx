import { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  ListChecks,
  Search,
  Upload,
} from 'lucide-react';
import { AuditKinerjaItem, PageId } from '../../types/upg';
import { Modal } from '../Modal';

interface AuditKinerjaPageProps {
  items: AuditKinerjaItem[];
  onUpdateItem: (item: AuditKinerjaItem) => void;
  onNavigate: (page: PageId) => void;
}

type AuditModalType =
  | 'kinerja'
  | 'kendaliMutu'
  | 'monitoringZI'
  | 'hasil'
  | 'notisi'
  | 'laporan'
  | 'uploadLhe'
  | 'previewLhe';

const AUDIT_MODAL_TITLES: Record<AuditModalType, string> = {
  kinerja: 'Evaluasi Kinerja',
  kendaliMutu: 'Kendali Mutu Audit Kinerja',
  monitoringZI: 'Monitoring Zona Integritas (ZI)',
  hasil: 'Hasil Audit Kinerja',
  notisi: 'Notisi Pemeriksaan',
  laporan: 'Laporan Audit Kinerja',
  uploadLhe: 'Unggah Dokumen LHE',
  previewLhe: 'Pratinjau Dokumen LHE',
};

export function AuditKinerjaPage({
  items,
  onUpdateItem,
  onNavigate,
}: AuditKinerjaPageProps) {
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [search, setSearch] = useState('');
  const [activeModal, setActiveModal] = useState<{
    item: AuditKinerjaItem;
    type: AuditModalType;
  } | null>(null);
  const [textDraft, setTextDraft] = useState('');
  const [fileDraft, setFileDraft] = useState('');

  const q = search.trim().toLowerCase();
  const filtered = items.filter(
    (item) =>
      !q ||
      item.idTeam.toLowerCase().includes(q) ||
      item.namaObrik.toLowerCase().includes(q) ||
      item.tanggalPelaksanaan.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q)
  );
  const displayed = filtered.slice(0, entriesPerPage);

  const openModal = (item: AuditKinerjaItem, type: AuditModalType) => {
    setActiveModal({ item, type });
    if (type === 'kinerja') setTextDraft(item.kinerja);
    else if (type === 'kendaliMutu') setTextDraft(item.kendaliMutu);
    else if (type === 'monitoringZI') setTextDraft(item.monitoringZI);
    else if (type === 'hasil') setTextDraft(item.hasil);
    else if (type === 'notisi') setTextDraft(item.notisi);
    else if (type === 'laporan') setTextDraft(item.laporan);
    else if (type === 'uploadLhe') setFileDraft(item.lhePdf || '');
  };

  const handleSave = () => {
    if (!activeModal) return;
    const { item, type } = activeModal;
    const updated = { ...item };
    if (type === 'kinerja') updated.kinerja = textDraft;
    else if (type === 'kendaliMutu') updated.kendaliMutu = textDraft;
    else if (type === 'monitoringZI') updated.monitoringZI = textDraft;
    else if (type === 'hasil') updated.hasil = textDraft;
    else if (type === 'notisi') updated.notisi = textDraft;
    else if (type === 'laporan') updated.laporan = textDraft;
    else if (type === 'uploadLhe') {
      updated.lhePdf =
        fileDraft.trim() || `LHE_${item.namaObrik.replace(/\s+/g, '_')}_${item.idTeam}.pdf`;
    }
    onUpdateItem(updated);
    setActiveModal(null);
  };

  const handleDeleteLhe = (item: AuditKinerjaItem) => {
    onUpdateItem({ ...item, lhePdf: null });
  };

  return (
    <div className="overflow-hidden rounded-[6px] border border-[#dce3eb] bg-white shadow-[0_2px_6px_rgba(27,53,85,0.06)]">
      {/* Header Bar sesuai gambar */}
      <div className="flex items-center justify-between bg-[#07579f] px-5 py-3.5 text-white">
        <h2 className="m-0 text-[16px] font-semibold uppercase tracking-tight text-white">
          AUDIT KINERJA / DAFTAR OBRIK
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
            className="w-[180px] border-0 border-b border-[#94a3b8] bg-transparent px-1 py-0.5 text-[13px] text-[#243247] focus:border-[#07579f] focus:outline-none"
          />
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-5 pb-5 pt-2">
        <table className="w-full min-w-[920px] border-collapse border border-[#e3e8ee]">
          <thead>
            <tr className="bg-[#f8fafc] text-[#243247]">
              <th className="w-[52px] border border-[#e3e8ee] px-3 py-2.5 text-center text-[13px] font-semibold">
                No
              </th>
              <th className="w-[84px] border border-[#e3e8ee] px-3 py-2.5 text-center text-[13px] font-semibold">
                Id.Team
              </th>
              <th className="border border-[#e3e8ee] px-3 py-2.5 text-center text-[13px] font-semibold">
                Nama Obrik
              </th>
              <th className="border border-[#e3e8ee] px-3 py-2.5 text-center text-[13px] font-semibold">
                Tanggal Pelaksanaan
              </th>
              <th className="w-[125px] border border-[#e3e8ee] px-3 py-2.5 text-center text-[13px] font-semibold">
                Status
              </th>
              <th className="w-[130px] border border-[#e3e8ee] px-3 py-2.5 text-center text-[13px] font-semibold">
                LHE
              </th>
              <th className="w-[260px] border border-[#e3e8ee] px-3 py-2.5 text-center text-[13px] font-semibold">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="border border-[#e3e8ee] px-4 py-8 text-center text-[13px] text-[#718096]"
                >
                  Tidak ada data obrik yang sesuai pencarian.
                </td>
              </tr>
            ) : (
              displayed.map((item, idx) => (
                <tr key={item.id} className="hover:bg-[#fafcff]">
                  <td className="border border-[#e3e8ee] px-3 py-4 text-center text-[13px] tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="border border-[#e3e8ee] px-3 py-4 text-center text-[13px] tabular-nums">
                    {item.idTeam}
                  </td>
                  <td className="border border-[#e3e8ee] px-4 py-4 text-[13px] font-bold text-[#143666]">
                    {item.namaObrik}
                  </td>
                  <td className="border border-[#e3e8ee] px-3 py-4 text-center text-[13px] text-[#243247]">
                    {item.tanggalPelaksanaan}
                  </td>
                  <td className="border border-[#e3e8ee] px-3 py-4 text-center text-[13px] text-[#243247]">
                    {item.status}
                  </td>
                  <td className="border border-[#e3e8ee] px-3 py-4 text-center text-[12px]">
                    {item.lhePdf ? (
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openModal(item, 'previewLhe')}
                          className="inline-flex cursor-pointer flex-col items-center hover:opacity-80"
                          title={item.lhePdf}
                        >
                          <div className="flex h-9 w-8 items-center justify-center rounded border border-[#198754] bg-[#edf8f2] text-[9px] font-extrabold text-[#198754]">
                            PDF
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLhe(item)}
                          className="cursor-pointer border-0 bg-transparent p-0 text-[12px] text-[#243247] hover:text-[#dc3545] hover:underline"
                        >
                          [Hapus]
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openModal(item, 'uploadLhe')}
                        className="inline-flex cursor-pointer items-center justify-center gap-1 rounded bg-[#0b69c7] px-2.5 py-2 text-[11px] font-bold uppercase leading-tight text-white hover:bg-[#0853a0]"
                      >
                        <Upload className="h-3.5 w-3.5 shrink-0" />
                        <span>UNGGAH DOKUMEN</span>
                      </button>
                    )}
                  </td>
                  <td className="border border-[#e3e8ee] px-2.5 py-2.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => openModal(item, 'kinerja')}
                        className="flex cursor-pointer items-center justify-center gap-1 rounded-[3px] border border-[#2e9c40] bg-white px-2 py-1.5 text-[12px] font-semibold text-[#2e9c40] hover:bg-[#effaf1]"
                      >
                        <ListChecks className="h-3.5 w-3.5 shrink-0" />
                        <span>Kinerja</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openModal(item, 'kendaliMutu')}
                        className="flex cursor-pointer items-center justify-center gap-1 rounded-[3px] border border-[#8e24aa] bg-white px-2 py-1.5 text-[12px] font-semibold text-[#8e24aa] hover:bg-[#f9effb]"
                      >
                        <ListChecks className="h-3.5 w-3.5 shrink-0" />
                        <span>Kendali Mutu</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openModal(item, 'monitoringZI')}
                        className="flex cursor-pointer items-center justify-center gap-1 rounded-[3px] border border-[#d6b000] bg-white px-2 py-1.5 text-[12px] font-semibold text-[#b29000] hover:bg-[#fefbea]"
                      >
                        <ListChecks className="h-3.5 w-3.5 shrink-0" />
                        <span>Monitoring ZI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openModal(item, 'hasil')}
                        className="flex cursor-pointer items-center justify-center gap-1 rounded-[3px] border border-[#08a9c4] bg-white px-2 py-1.5 text-[12px] font-semibold text-[#08a9c4] hover:bg-[#f0fbfd]"
                      >
                        <ListChecks className="h-3.5 w-3.5 shrink-0" />
                        <span>Hasil</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openModal(item, 'notisi')}
                        className="flex cursor-pointer items-center justify-center gap-1 rounded-[3px] border border-[#d99116] bg-white px-2 py-1.5 text-[12px] font-semibold text-[#c27d08] hover:bg-[#fff8eb]"
                      >
                        <ListChecks className="h-3.5 w-3.5 shrink-0" />
                        <span>Notisi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openModal(item, 'laporan')}
                        className="flex cursor-pointer items-center justify-center gap-1 rounded-[3px] border border-[#e53935] bg-white px-2 py-1.5 text-[12px] font-semibold text-[#e53935] hover:bg-[#fdeeee]"
                      >
                        <ListChecks className="h-3.5 w-3.5 shrink-0" />
                        <span>Laporan</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Aksi Audit Kinerja */}
      <Modal
        open={activeModal !== null}
        title={
          activeModal
            ? `${AUDIT_MODAL_TITLES[activeModal.type]} — ${activeModal.item.namaObrik}`
            : ''
        }
        onClose={() => setActiveModal(null)}
        onSave={
          activeModal && activeModal.type !== 'previewLhe'
            ? handleSave
            : undefined
        }
        showFooter={activeModal?.type !== 'previewLhe'}
      >
        {activeModal && activeModal.type === 'previewLhe' && (
          <div className="space-y-3 text-[13px] text-[#243247]">
            <div className="flex items-center gap-3 rounded border border-[#dce3eb] bg-[#f7faff] p-3">
              <FileText className="h-6 w-6 text-[#198754]" />
              <div>
                <div className="font-bold">{activeModal.item.lhePdf}</div>
                <div className="text-[11px] text-[#718096]">
                  Id.Team: {activeModal.item.idTeam} · Obrik:{' '}
                  {activeModal.item.namaObrik}
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

        {activeModal && activeModal.type === 'uploadLhe' && (
          <div className="space-y-3 text-[13px]">
            <label className="block text-[12px] font-bold text-[#536477]">
              Nama File / Tautan Dokumen LHE PDF
            </label>
            <input
              type="text"
              value={fileDraft}
              onChange={(e) => setFileDraft(e.target.value)}
              placeholder="Contoh: LHE_PN_Tobelo_931.pdf"
              className="w-full rounded border border-[#cfd9e4] px-3 py-2 text-[13px]"
            />
          </div>
        )}

        {activeModal &&
          activeModal.type !== 'previewLhe' &&
          activeModal.type !== 'uploadLhe' && (
            <div className="space-y-3 text-[13px]">
              <div className="rounded bg-[#f4f7fa] px-3 py-2 text-[12px] text-[#52647a]">
                Id.Team: <b>{activeModal.item.idTeam}</b> · Tanggal Pelaksanaan:{' '}
                <b>{activeModal.item.tanggalPelaksanaan}</b>
              </div>
              <label className="block text-[12px] font-bold text-[#536477]">
                Catatan / Isian {AUDIT_MODAL_TITLES[activeModal.type]}
              </label>
              <textarea
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value)}
                placeholder={`Masukkan catatan ${AUDIT_MODAL_TITLES[activeModal.type]}...`}
                className="min-h-[110px] w-full resize-y rounded border border-[#cfd9e4] p-2.5 text-[13px] text-[#243247]"
              />
            </div>
          )}
      </Modal>
    </div>
  );
}
