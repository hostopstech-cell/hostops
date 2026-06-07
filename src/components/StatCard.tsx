interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  accent?: "orange" | "emerald" | "blue" | "slate";
}

const accentStyles = {
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  slate: "border-slate-200 bg-white text-slate-700",
};

export default function StatCard({
  label,
  value,
  subtext,
  accent = "slate",
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${accentStyles[accent]}`}
    >
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {subtext && (
        <p className="mt-1 text-xs opacity-70">{subtext}</p>
      )}
    </div>
  );
}
