import React from 'react';

interface StatsCardProps {
  title: string;
  count: number | string;
  icon: React.ReactNode;
  gradientClass?: string;
}

export default function StatsCard({ title, count, icon, gradientClass = 'stats-gradient-blue' }: StatsCardProps) {
  return (
    <div className="academic-card flex items-center gap-5 hover:shadow-card-hover transition-shadow duration-200">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${gradientClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium mb-0.5">{title}</p>
        <p className="text-3xl font-bold font-poppins text-foreground">{count}</p>
      </div>
    </div>
  );
}
