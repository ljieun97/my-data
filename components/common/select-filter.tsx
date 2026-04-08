"use client";

export default function SelectFilter(props: any) {
  const { items, type, value = "", onChangeSelect } = props;

  return (
    <label className="browse-chip-select flex w-auto min-w-[7.25rem] max-w-full flex-col gap-1">
      <span className="browse-select__label text-[10px] font-semibold uppercase tracking-[0.14em]">{type}</span>
      <select
        className="browse-select browse-select__value min-h-[2.55rem] rounded-full border px-3 pr-4 text-sm font-medium shadow-none transition"
        value={value}
        onChange={(e) => onChangeSelect(e, type)}
      >
        <option value="">All</option>
        {items.map((item: any) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
