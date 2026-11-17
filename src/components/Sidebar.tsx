import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  LayoutDashboard,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { PageId, UserRole } from '../types/upg';

interface SidebarProps {
  activePage: PageId;
  userRole: UserRole;
  onNavigate: (page: PageId) => void;
}

export function Sidebar({ activePage, userRole, onNavigate }: SidebarProps) {
  const [ppgOpen, setPpgOpen] = useState(true);
  const canAccessEvaluatorViews =
    userRole === 'UPG Tingkat 2' || userRole === 'UPG Pusat';

  const isPpgActive =
    activePage === 'ppg-risiko' ||
    activePage === 'ppg-dashboard' ||
    activePage === 'ppg-monev';

  const navBtnClass = (isActive: boolean) =>
    `w-full px-[19px] py-[14px] max-md:w-auto max-md:min-w-max max-md:px-3 max-md:py-3 border-0 border-b border-white/15 max-md:border-b-0 max-md:border-r text-left font-semibold text-[14px] cursor-pointer flex items-center gap-[13px] transition-colors whitespace-nowrap shrink-0 ${
      isActive
        ? 'bg-[#104b91] text-white'
        : 'bg-transparent text-white hover:bg-[#104b91]'
    }`;

  const subBtnClass = (isActive: boolean) =>
    `w-full pl-[42px] pr-[16px] py-[11px] max-md:w-auto max-md:min-w-max max-md:px-3 max-md:py-3 border-0 border-b border-white/10 max-md:border-b-0 max-md:border-r text-left text-[13px] cursor-pointer flex items-center gap-[10px] transition-colors whitespace-nowrap shrink-0 ${
      isActive
        ? 'bg-[#0b3e7b] text-white font-bold'
        : 'bg-[#17519c]/70 text-[#e4effc] font-medium hover:bg-[#104b91] hover:text-white'
    }`;

  return (
    <aside className="w-[258px] max-lg:w-[225px] max-md:w-full bg-[#1d5fb2] text-white shrink-0 flex flex-col">
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
      <nav
        className="py-2 max-md:py-0 max-md:flex max-md:overflow-x-auto"
        aria-label="Menu utama"
      >
        {/* 1. Pengawasan Reguler */}
        <button
          type="button"
          onClick={() => onNavigate('pengawasan-reguler')}
          className={navBtnClass(activePage === 'pengawasan-reguler')}
        >
          <FileSearch className="h-4 w-4 shrink-0 opacity-90" />
          <span>Pengawasan Reguler</span>
        </button>

        {/* 2. Audit Kinerja */}
        <button
          type="button"
          onClick={() => onNavigate('audit-kinerja')}
          className={navBtnClass(activePage === 'audit-kinerja')}
        >
          <ClipboardCheck className="h-4 w-4 shrink-0 opacity-90" />
          <span>Audit Kinerja</span>
        </button>

        {/* 3. PPG (Program Pengendalian Gratifikasi) */}
        <div className="max-md:flex max-md:items-center">
          <button
            type="button"
            onClick={() => setPpgOpen((prev) => !prev)}
            aria-expanded={ppgOpen}
            className={`${navBtnClass(isPpgActive)} justify-between`}
          >
            <span className="flex items-center gap-[13px] min-w-0">
              <ShieldCheck className="h-4 w-4 shrink-0 opacity-90" />
              <span className="truncate">PPG</span>
            </span>
            <span className="max-md:hidden opacity-85">
              {ppgOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          </button>

          {ppgOpen && (
            <div className="max-md:flex max-md:items-center">
              <div className="max-md:hidden px-[18px] py-1.5 text-[10px] tracking-[0.6px] text-[#c8ddf5] uppercase font-semibold bg-[#17519c]/50 border-b border-white/10">
                Program Pengendalian Gratifikasi
              </div>

              <button
                type="button"
                onClick={() => onNavigate('ppg-risiko')}
                className={subBtnClass(activePage === 'ppg-risiko')}
              >
                <ShieldAlert className="h-3.5 w-3.5 shrink-0 opacity-90" />
                <span>Penilaian Risiko Gratifikasi</span>
              </button>

              {canAccessEvaluatorViews && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate('ppg-dashboard')}
                    className={subBtnClass(activePage === 'ppg-dashboard')}
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 shrink-0 opacity-90" />
                    <span>Dashboard PPG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('ppg-monev')}
                    className={subBtnClass(activePage === 'ppg-monev')}
                  >
                    <ListChecks className="h-3.5 w-3.5 shrink-0 opacity-90" />
                    <span>Monev PPG</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
