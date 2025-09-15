// // StatsPanel.jsx (Fixed for theme compatibility)
// import React from "react";
// import { FileText, Shield, AlertTriangle, Clock } from "lucide-react";

// export default function StatsPanel({ stats, theme }) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//       <div className="panel relative overflow-hidden">
//         {theme === "dark" && <div className="matrix-bg" style={{left: '10%'}}></div>}
//         <div className="flex items-center justify-between relative z-10">
//           <div>
//             <p className="text-secondary text-sm">Total Files</p>
//             <p className="text-2xl font-bold text-primary">{stats.totalFiles}</p>
//           </div>
//           <div className={`p-2 rounded ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
//             <FileText className="w-6 h-6" />
//           </div>
//         </div>
//       </div>
      
//       <div className="panel relative overflow-hidden">
//         {theme === "dark" && <div className="matrix-bg" style={{left: '40%'}}></div>}
//         <div className="flex items-center justify-between relative z-10">
//           <div>
//             <p className="text-secondary text-sm">Analyzed</p>
//             <p className="text-2xl font-bold text-primary">{stats.analyzedFiles}</p>
//           </div>
//           <div className={`p-2 rounded ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
//             <Shield className="w-6 h-6" />
//           </div>
//         </div>
//       </div>
      
//       <div className="panel relative overflow-hidden">
//         {theme === "dark" && <div className="matrix-bg" style={{left: '70%'}}></div>}
//         <div className="flex items-center justify-between relative z-10">
//           <div>
//             <p className="text-secondary text-sm">Threats Detected</p>
//             <p className="text-2xl font-bold text-primary">{stats.detectedThreats}</p>
//           </div>
//           <div className={`p-2 rounded ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
//             <AlertTriangle className="w-6 h-6" />
//           </div>
//         </div>
//       </div>
      
//       <div className="panel relative overflow-hidden">
//         {theme === "dark" && <div className="matrix-bg" style={{left: '90%'}}></div>}
//         <div className="flex items-center justify-between relative z-10">
//           <div>
//             <p className="text-secondary text-sm">Last Analysis</p>
//             <p className="text-lg font-bold text-primary">
//               {stats.lastAnalysis ? new Date(stats.lastAnalysis).toLocaleTimeString() : 'Never'}
//             </p>
//           </div>
//           <div className={`p-2 rounded ${theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
//             <Clock className="w-6 h-6" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// StatsPanel.jsx
// import React from "react";
// import { FileText, Shield, AlertTriangle, Clock } from "lucide-react";

// export default function StatsPanel({ stats, theme }) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//       <div className="panel relative overflow-hidden">
//         {theme === "dark" && <div className="matrix-bg" style={{left: '10%'}} />}
//         <div className="flex items-center justify-between relative z-10">
//           <div>
//             <p className="text-secondary text-sm font-mono">Total Files</p>
//             <p className="text-2xl font-bold text-primary font-mono">{stats.totalFiles}</p>
//           </div>
//           <div className={`p-2 rounded ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
//             <FileText className="w-6 h-6" />
//           </div>
//         </div>
//       </div>

//       <div className="panel relative overflow-hidden">
//         {theme === "dark" && <div className="matrix-bg" style={{left: '40%'}} />}
//         <div className="flex items-center justify-between relative z-10">
//           <div>
//             <p className="text-secondary text-sm font-mono">Analyzed</p>
//             <p className="text-2xl font-bold text-primary font-mono">{stats.analyzedFiles}</p>
//           </div>
//           <div className={`p-2 rounded ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
//             <Shield className="w-6 h-6" />
//           </div>
//         </div>
//       </div>

//       <div className="panel relative overflow-hidden">
//         {theme === "dark" && <div className="matrix-bg" style={{left: '70%'}} />}
//         <div className="flex items-center justify-between relative z-10">
//           <div>
//             <p className="text-secondary text-sm font-mono">Threats Detected</p>
//             <p className="text-2xl font-bold text-primary font-mono">{stats.detectedThreats}</p>
//           </div>
//           <div className={`p-2 rounded ${theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
//             <AlertTriangle className="w-6 h-6" />
//           </div>
//         </div>
//       </div>

//       <div className="panel relative overflow-hidden">
//         {theme === "dark" && <div className="matrix-bg" style={{left: '90%'}} />}
//         <div className="flex items-center justify-between relative z-10">
//           <div>
//             <p className="text-secondary text-sm font-mono">Last Analysis</p>
//             <p className="text-lg font-bold text-primary font-mono">
//               {stats.lastAnalysis ? new Date(stats.lastAnalysis).toLocaleString() : 'Never'}
//             </p>
//           </div>
//           <div className={`p-2 rounded ${theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
//             <Clock className="w-6 h-6" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




import React from "react";
import { FileText, Shield, AlertTriangle, Clock, TrendingUp } from "lucide-react";

export default function StatsPanel({ stats, theme }) {
  const statCards = [
    {
      label: "Total Files",
      value: stats.totalFiles,
      icon: FileText,
      color: theme === 'dark' 
        ? { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-blue-500/20' }
        : { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', glow: 'shadow-blue-200/50' },
      trend: "+12%",
      gradient: "from-blue-500/20 to-transparent"
    },
    {
      label: "Analyzed",
      value: stats.analyzedFiles,
      icon: Shield,
      color: theme === 'dark' 
        ? { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', glow: 'shadow-green-500/20' }
        : { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', glow: 'shadow-green-200/50' },
      trend: "+8%",
      gradient: "from-green-500/20 to-transparent"
    },
    {
      label: "Threats Detected",
      value: stats.detectedThreats,
      icon: AlertTriangle,
      color: theme === 'dark' 
        ? { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', glow: 'shadow-red-500/20' }
        : { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', glow: 'shadow-red-200/50' },
      trend: stats.detectedThreats > 0 ? "Alert" : "Safe",
      gradient: "from-red-500/20 to-transparent"
    },
    {
      label: "Last Analysis",
      value: stats.lastAnalysis ? new Date(stats.lastAnalysis).toLocaleString() : 'Never',
      icon: Clock,
      color: theme === 'dark' 
        ? { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'shadow-purple-500/20' }
        : { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', glow: 'shadow-purple-200/50' },
      trend: "Live",
      gradient: "from-purple-500/20 to-transparent",
      isTime: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        const matrixLeft = `${10 + index * 30}%`;
        
        return (
          <div 
            key={card.label}
            className={`panel relative overflow-hidden group hover:scale-105 transition-all duration-300 border ${card.color.border} ${card.color.glow} hover:shadow-lg backdrop-blur-sm`}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'slideInUp 0.6s ease-out forwards'
            }}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-30`} />
            
            {/* Matrix effect for dark theme */}
            {theme === "dark" && (
              <div 
                className="matrix-bg opacity-20 group-hover:opacity-40 transition-opacity duration-300" 
                style={{ left: matrixLeft }} 
              />
            )}
            
            {/* Main content */}
            <div className="flex items-start justify-between relative z-10 p-1">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className={`text-secondary text-xs uppercase tracking-wider font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {card.label}
                  </p>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${card.color.bg} ${card.color.text} border ${card.color.border}`}>
                    {card.trend}
                  </div>
                </div>
                
                <div className="mb-2">
                  {card.isTime ? (
                    <p className={`text-sm font-bold ${card.color.text} font-mono leading-tight`}>
                      {card.value}
                    </p>
                  ) : (
                    <p className={`text-3xl font-bold ${card.color.text} font-mono group-hover:scale-110 transition-transform duration-300`}>
                      {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                    </p>
                  )}
                </div>
                
                {/* Progress bar for numeric values */}
                {typeof card.value === 'number' && (
                  <div className={`w-full h-1 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                    <div 
                      className={`h-full rounded-full ${card.color.text.replace('text-', 'bg-')} transition-all duration-1000`}
                      style={{ 
                        width: `${Math.min(card.value / Math.max(stats.totalFiles, 100) * 100, 100)}%`,
                        animation: 'progressFill 1.5s ease-out forwards'
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* Icon */}
              <div className={`p-3 rounded-xl ${card.color.bg} ${card.color.text} border ${card.color.border} group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-sm`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            
            {/* Subtle pulse animation for threats */}
            {card.label === "Threats Detected" && stats.detectedThreats > 0 && (
              <div className="absolute inset-0 rounded-lg animate-pulse bg-red-500/5" />
            )}
          </div>
        );
      })}
      
      {/* Custom styles */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes progressFill {
          from {
            width: 0%;
          }
          to {
            width: var(--final-width);
          }
        }
        
        .panel {
          opacity: 0;
          animation: slideInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}