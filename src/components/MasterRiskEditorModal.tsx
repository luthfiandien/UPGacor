import { useEffect, useState } from 'react';
import { AlertCircle, BookOpen, Lock, Plus, Trash2, X } from 'lucide-react';
import { RiskLibraryItem } from '../types/upg';

interface MasterRiskEditorModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  initialItem: RiskLibraryItem | null;
  generatedCode: string;
  onClose: () => void;
  onSave: (item: RiskLibraryItem, isNew: boolean) => void;
}

export function MasterRiskEditorModal({
  open,
  mode,
  initialItem,
  generatedCode,
  onClose,
  onSave,
}: MasterRiskEditorModalProps) {
  const [kodeRisiko, setKodeRisiko] = useState('');
  const [prosesBisnis, setProsesBisnis] = useState('');
  const [peristiwaRisiko, setPeristiwaRisiko] = useState('');
  const [penyebabList, setPenyebabList] = useState<string[]>(['']);
  const [dampakList, setDampakList] = useState<string[]>(['']);
  const [mandatoryList, setMandatoryList] = useState<string[]>(['']);
  const [nonMandatoryList, setNonMandatoryList] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setErrors([]);
    if (mode === 'edit' && initialItem) {
      setKodeRisiko(initialItem.kodeRisiko);
      setProsesBisnis(initialItem.prosesSubproses);
      setPeristiwaRisiko(initialItem.pernyataanRisiko);
      setPenyebabList(
        initialItem.penyebabRisiko.length > 0
          ? [...initialItem.penyebabRisiko]
          : ['']
      );
      setDampakList(
        initialItem.dampakRisiko.length > 0
          ? [...initialItem.dampakRisiko]
          : ['']
      );
      setMandatoryList(
        initialItem.mandatoryControls.length > 0
          ? [...initialItem.mandatoryControls]
          : ['']
      );
      setNonMandatoryList([...initialItem.nonMandatoryControls]);
    } else {
      setKodeRisiko(generatedCode);
      setProsesBisnis('');
      setPeristiwaRisiko('');
      setPenyebabList(['']);
      setDampakList(['']);
      setMandatoryList(['']);
      setNonMandatoryList([]);
    }
  }, [open, mode, initialItem, generatedCode]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const updateListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const addListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => [...prev, '']);
  };

  const removeListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    minCount: number
  ) => {
    setter((prev) => {
      if (prev.length <= minCount) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];

    const cleanProses = prosesBisnis.trim();
    const cleanPeristiwa = peristiwaRisiko.trim();
    const cleanPenyebab = penyebabList.map((s) => s.trim()).filter(Boolean);
    const cleanDampak = dampakList.map((s) => s.trim()).filter(Boolean);
    const cleanMandatory = mandatoryList.map((s) => s.trim()).filter(Boolean);
    const cleanNonMandatory = nonMandatoryList
      .map((s) => s.trim())
      .filter(Boolean);

    if (!cleanProses) {
      validationErrors.push('Proses Bisnis wajib diisi.');
    }
    if (!cleanPeristiwa) {
      validationErrors.push('Peristiwa Risiko wajib diisi.');
    }
    if (cleanPenyebab.length === 0) {
      validationErrors.push('Minimal 1 Penyebab Risiko wajib diisi.');
    }
    if (cleanDampak.length === 0) {
      validationErrors.push('Minimal 1 Dampak Risiko wajib diisi.');
    }
    if (cleanMandatory.length === 0) {
      validationErrors.push('Minimal 1 Mandatory Control wajib diisi.');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const nextItem: RiskLibraryItem = {
      kodeRisiko: kodeRisiko.trim(),
      prosesSubproses: cleanProses,
      pernyataanRisiko: cleanPeristiwa,
      klasifikasiRisiko:
        initialItem?.klasifikasiRisiko ?? 'Sektor Pengawasan & Pemeriksaan',
      faktorPenyebab:
        initialItem?.faktorPenyebab ?? 'Sistem & Pengawasan Internal',
      penyebabRisiko: cleanPenyebab,
      dampakRisiko: cleanDampak,
      mandatoryControls: cleanMandatory,
      nonMandatoryControls: cleanNonMandatory,
    };

    onSave(nextItem, mode === 'add');
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0d1f36]/60 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="master-risk-editor-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#cfd9e4] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#0c4476] bg-[#0F4C81] px-5 py-3.5 text-white">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-[#cce5ff]" />
            <div>
              <h2
                id="master-risk-editor-title"
                className="m-0 text-[15px] font-bold"
              >
                {mode === 'add'
                  ? 'Tambah Master Pustaka Risiko'
                  : 'Edit Master Pustaka Risiko'}
              </h2>
              <p className="m-0 text-[11.5px] text-[#dcecff]">
                Perubahan langsung disinkronkan ke katalog referensi dan daftar
                penilaian aktif
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form master pustaka risiko"
            className="cursor-pointer rounded p-1 text-white/80 hover:bg-white/15 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="master-risk-editor-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto space-y-4 bg-[#fbfcfe] p-5 text-[13px]"
        >
          {errors.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-800">
              <div className="mb-1 flex items-center gap-1.5 font-bold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Mohon lengkapi isian wajib berikut:</span>
              </div>
              <ul className="m-0 list-disc space-y-0.5 pl-5">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Row 1: Kode Risiko (Locked) & Proses Bisnis */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-4 flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#45566c]">
                Kode Risiko{' '}
                <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500">
                  <Lock className="h-3 w-3" />
                  {mode === 'edit' ? '(Terkunci)' : '(Otomatis)'}
                </span>
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={kodeRisiko}
                className="font-mono-num rounded-md border border-[#dce3eb] bg-slate-100 px-3 py-2 text-[13px] font-bold text-[#0F4C81]"
              />
            </div>

            <div className="sm:col-span-8 flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#45566c]">
                Proses Bisnis <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={prosesBisnis}
                onChange={(e) => setProsesBisnis(e.target.value)}
                placeholder="Mis. Pengawasan Reguler & Pemeriksaan"
                className="rounded-md border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Peristiwa Risiko */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#45566c]">
              Peristiwa Risiko <span className="text-red-600">*</span>
            </label>
            <textarea
              value={peristiwaRisiko}
              onChange={(e) => setPeristiwaRisiko(e.target.value)}
              placeholder="Uraikan peristiwa risiko gratifikasi secara jelas dan spesifik..."
              className="min-h-[72px] resize-y rounded-md border border-[#cfd9e4] bg-white px-3 py-2 text-[13px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
            />
          </div>

          {/* Penyebab & Dampak */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-[#dce3eb] bg-white p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-[#1d3554]">
                  Penyebab Risiko <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => addListItem(setPenyebabList)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#cfd9e4] bg-slate-50 px-2 py-1 text-[11px] font-semibold text-[#0F4C81] hover:bg-slate-100"
                >
                  <Plus className="h-3 w-3" />
                  <span>Tambah</span>
                </button>
              </div>
              <div className="space-y-2">
                {penyebabList.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) =>
                        updateListItem(setPenyebabList, idx, e.target.value)
                      }
                      placeholder={`Penyebab #${idx + 1}`}
                      className="flex-1 rounded-md border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[12.5px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
                    />
                    {penyebabList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListItem(setPenyebabList, idx, 1)}
                        aria-label="Hapus penyebab"
                        className="cursor-pointer rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-[#dce3eb] bg-white p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-[#1d3554]">
                  Dampak Risiko <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => addListItem(setDampakList)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#cfd9e4] bg-slate-50 px-2 py-1 text-[11px] font-semibold text-[#0F4C81] hover:bg-slate-100"
                >
                  <Plus className="h-3 w-3" />
                  <span>Tambah</span>
                </button>
              </div>
              <div className="space-y-2">
                {dampakList.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) =>
                        updateListItem(setDampakList, idx, e.target.value)
                      }
                      placeholder={`Dampak #${idx + 1}`}
                      className="flex-1 rounded-md border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[12.5px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
                    />
                    {dampakList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListItem(setDampakList, idx, 1)}
                        aria-label="Hapus dampak"
                        className="cursor-pointer rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mandatory & Non-Mandatory Controls */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/30 p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-emerald-900">
                  Mandatory Control (Wajib){' '}
                  <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => addListItem(setMandatoryList)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded border border-emerald-300 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50"
                >
                  <Plus className="h-3 w-3" />
                  <span>Tambah</span>
                </button>
              </div>
              <div className="space-y-2">
                {mandatoryList.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) =>
                        updateListItem(setMandatoryList, idx, e.target.value)
                      }
                      placeholder={`Kontrol Wajib #${idx + 1}`}
                      className="flex-1 rounded-md border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[12.5px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
                    />
                    {mandatoryList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListItem(setMandatoryList, idx, 1)}
                        aria-label="Hapus kontrol wajib"
                        className="cursor-pointer rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-slate-700">
                  Non-Mandatory Control (Opsional)
                </label>
                <button
                  type="button"
                  onClick={() => addListItem(setNonMandatoryList)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Plus className="h-3 w-3" />
                  <span>Tambah</span>
                </button>
              </div>
              {nonMandatoryList.length === 0 ? (
                <p className="m-0 py-2 text-[12px] text-slate-500">
                  Belum ada kontrol opsional. Klik &ldquo;Tambah&rdquo; bila
                  diperlukan.
                </p>
              ) : (
                <div className="space-y-2">
                  {nonMandatoryList.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={val}
                        onChange={(e) =>
                          updateListItem(
                            setNonMandatoryList,
                            idx,
                            e.target.value
                          )
                        }
                        placeholder={`Kontrol Pelengkap #${idx + 1}`}
                        className="flex-1 rounded-md border border-[#cfd9e4] bg-white px-2.5 py-1.5 text-[12.5px] text-[#243247] focus:border-[#0F4C81] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeListItem(setNonMandatoryList, idx, 0)
                        }
                        aria-label="Hapus kontrol pelengkap"
                        className="cursor-pointer rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#e9eef4] bg-white px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-[#cfd9e4] bg-white px-4 py-2 text-[13px] font-semibold text-[#536477] hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="submit"
            form="master-risk-editor-form"
            className="cursor-pointer rounded-md bg-[#0F4C81] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#0b3b66]"
          >
            {mode === 'add' ? 'Simpan Risiko Baru' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}
