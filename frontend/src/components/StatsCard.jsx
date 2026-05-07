const StatsCard = ({ icon: Icon, label, value, color = 'primary', trend }) => {
  const colorMap = {
    primary: 'from-primary-600 to-primary-400',
    emerald: 'from-emerald-600 to-emerald-400',
    amber: 'from-amber-600 to-amber-400',
    rose: 'from-rose-600 to-rose-400',
    cyan: 'from-cyan-600 to-cyan-400',
  };

  const bgMap = {
    primary: 'bg-primary-500/10',
    emerald: 'bg-emerald-500/10',
    amber: 'bg-amber-500/10',
    rose: 'bg-rose-500/10',
    cyan: 'bg-cyan-500/10',
  };

  return (
    <div className="glass-card p-6 hover:border-dark-600 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r bg-clip-text text-transparent" 
             style={{backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`}}
             className={`text-3xl font-bold mt-2 bg-gradient-to-r ${colorMap[color]} bg-clip-text text-transparent`}>
            {value}
          </p>
          {trend && <p className="text-xs text-dark-500 mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgMap[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} className={`bg-gradient-to-r ${colorMap[color]} bg-clip-text`} 
                style={{color: color === 'primary' ? '#818cf8' : color === 'emerald' ? '#34d399' : color === 'amber' ? '#fbbf24' : color === 'rose' ? '#fb7185' : '#22d3ee'}} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
