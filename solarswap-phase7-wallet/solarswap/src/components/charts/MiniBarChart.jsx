// A tiny bar chart built with plain divs — no charting library needed.
// data: [{ label: "Mon", value: 6.2 }, ...]
export default function MiniBarChart({ data, unit = "", barClassName = "bg-eco-500" }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            {d.value}
            {unit}
          </span>
          <div className="w-full h-28 flex items-end bg-slate-50 rounded-lg overflow-hidden">
            <div
              className={`w-full rounded-t-lg ${barClassName} transition-all duration-500`}
              style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
