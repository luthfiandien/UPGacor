interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === '—') {
    return (
      <span className="inline-block px-2 py-1 text-[11px] font-bold whitespace-nowrap text-[#9aa6b2]">
        —
      </span>
    );
  }

  let colorClass = 'bg-[#edf1f5] text-[#64748b]';

  if (status === 'Selesai') {
    colorClass = 'bg-[#e3f5eb] text-[#137a45]';
  } else if (status === 'Dalam Proses' || status === 'Berkala') {
    colorClass = 'bg-[#fff2d8] text-[#9a6500]';
  } else if (status === 'Terkendala') {
    colorClass = 'bg-[#fde8e8] text-[#b4232c]';
  }

  return (
    <span
      className={`inline-block px-2 py-1 rounded-[20px] text-[11px] font-bold whitespace-nowrap ${colorClass}`}
    >
      {status}
    </span>
  );
}
