import React from 'react';

const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  color = 'indigo',
  onClick
}) => {
  const colorMap = {
    sky: 'bg-sky-50/90 text-sky-700 border-sky-200',
    teal: 'bg-teal-50/90 text-teal-700 border-teal-200',
    emerald: 'bg-emerald-50/90 text-emerald-700 border-emerald-200',
    cyan: 'bg-cyan-50/90 text-cyan-700 border-cyan-200',
    indigo: 'bg-sky-50/90 text-sky-700 border-sky-200',
    violet: 'bg-teal-50/90 text-teal-700 border-teal-200',
    blue: 'bg-sky-50/90 text-sky-700 border-sky-200',
    amber: 'bg-amber-50/90 text-amber-700 border-amber-200',
    rose: 'bg-rose-50/90 text-rose-700 border-rose-200',
  };

  const badgeClass = colorMap[color] || colorMap.sky;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
          {title}
        </p>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${badgeClass}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          {value}
        </h3>
        {trend && (
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
              trendPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] font-medium text-slate-400 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default KPICard;
