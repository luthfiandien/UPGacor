import {
  BarChart3,
  Building2,
  CheckSquare,
  FileText,
  Home,
  LayoutGrid,
  ListChecks,
} from 'lucide-react';
import { PageId } from '../types/upg';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const navBtnClass = (isActive: boolean) =>
    `w-full px-[19px] py-[14px] max-md:w-auto max-md:min-w-max max-md:px-3 max-md:py-3 border-0 border-b border-white/15 max-md:border-b-0 max-md:border-r text-left font-semibold text-[14px] cursor-pointer flex items-center gap-[13px] transition-colors whitespace-nowrap shrink-0 ${
      isActive ? 'bg-[#104b91] text-white' : 'bg-transparent text-white hover:bg-[#104b91]'
    }`;

  return (
    <aside className="w-[258px] max-lg:w-[215px] max-md:w-full bg-[#1d5fb2] text-white shrink-0 flex flex-col">
      {/* Brand Block */}
      <div className="h-[112px] max-md:h-[75px] bg-white text-[#15569c] flex items-center px-[22px] max-md:px-4 gap-[12px] border-b border-[#d6e0eb]">
        <div
          className="text-[36px] font-black tracking-[-4px] text-[#1674bb] leading-none select-none pr-1"
          aria-hidden="true"
        >
          W
        </div>
        <div className="min-w-0">
          <div className="font-extrabold text-[15px] tracking-tight text-[#15569c] leading-tight">
            WASTITAMA
          </div>
          <small className="block text-[9px] font-bold leading-[1.3] text-[#333333] tracking-[0.3px] mt-0.5">
            BADAN PENGAWASAN
            <br />
            MAHKAMAH AGUNG REPUBLIK INDONESIA
          </small>
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-3 max-md:py-0 max-md:flex max-md:overflow-x-auto" aria-label="Menu utama">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={navBtnClass(activePage === 'dashboard')}
        >
          <LayoutGrid className="h-4 w-4 shrink-0 opacity-90" />
          <span>Dashboard</span>
        </button>

        <div className="max-md:hidden px-[18px] pt-[14px] pb-[5px] text-[10px] tracking-[1px] text-[#c8ddf5] uppercase font-semibold">
          Pengendalian Gratifikasi
        </div>

        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={navBtnClass(activePage === 'dashboard')}
        >
          <Home className="h-4 w-4 shrink-0 opacity-90" />
          <span>Dashboard UPG</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('mandiri')}
          className={navBtnClass(activePage === 'mandiri')}
        >
          <CheckSquare className="h-4 w-4 shrink-0 opacity-90" />
          <span>Penilaian Mandiri</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('monitoring')}
          className={navBtnClass(activePage === 'monitoring')}
        >
          <ListChecks className="h-4 w-4 shrink-0 opacity-90" />
          <span>Monitoring PPG</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('satker')}
          className={navBtnClass(activePage === 'satker')}
        >
          <Building2 className="h-4 w-4 shrink-0 opacity-90" />
          <span>Evaluasi Satker Tingkat III</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('rekap')}
          className={navBtnClass(activePage === 'rekap')}
        >
          <BarChart3 className="h-4 w-4 shrink-0 opacity-90" />
          <span>Rekapitulasi Hasil</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('laporan')}
          className={navBtnClass(activePage === 'laporan')}
        >
          <FileText className="h-4 w-4 shrink-0 opacity-90" />
          <span>Laporan PPG</span>
        </button>
      </nav>
    </aside>
  );
}
