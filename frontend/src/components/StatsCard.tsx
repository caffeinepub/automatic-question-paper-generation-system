interface StatsCardProps {
  title: string;
  count: number;
  icon: string;
  gradient: string;
}

export default function StatsCard({ title, count, icon, gradient }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
        <img src={icon} alt={title} className="w-8 h-8 object-contain" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold text-navy-900 font-poppins">{count}</p>
      </div>
    </div>
  );
}
