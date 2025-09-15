import React from "react";

export default function ThreatScoreCircle({ percent = 0, size = 48, threshold = 10 }) {
  const color = percent > threshold ? "#ef4444" : "#10b981";
  const bg = `conic-gradient(${color} 0% ${percent}%, #374151 ${percent}% 100%)`;
  
  // Enhanced styling with better proportions and effects
  const outerSize = size;
  const innerSize = size - 8;
  const fontSize = Math.max(10, Math.min(14, size * 0.25));
  
  return (
    <div 
      style={{ 
        width: outerSize, 
        height: outerSize, 
        borderRadius: '50%',
        position: 'relative',
        cursor: 'default'
      }} 
      title={`Threat Score: ${percent}%`}
    >
      {/* Outer ring with gradient */}
      <div style={{
        width: outerSize,
        height: outerSize,
        borderRadius: '50%',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        border: "2px solid rgba(255,255,255,0.1)",
        boxShadow: `
          0 0 20px rgba(${percent > threshold ? '239, 68, 68' : '16, 185, 129'}, 0.3),
          inset 0 1px 0 rgba(255,255,255,0.1),
          inset 0 -1px 0 rgba(0,0,0,0.2)
        `,
        position: 'relative',
        transition: 'all 0.3s ease'
      }}>
        {/* Inner circle */}
        <div style={{
          width: innerSize,
          height: innerSize,
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05), transparent 70%),
            linear-gradient(135deg, #1f2937 0%, #111827 100%)
          `,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
          position: 'relative'
        }}>
          {/* Percentage text */}
          <span style={{ 
            color: percent > threshold ? "#ff6b6b" : "#4ade80",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
            fontWeight: 600,
            fontSize: `${fontSize}px`,
            textShadow: `0 0 10px ${percent > threshold ? 'rgba(255, 107, 107, 0.5)' : 'rgba(74, 222, 128, 0.5)'}`,
            letterSpacing: '-0.5px',
            lineHeight: 1
          }}>
            {percent}%
          </span>
          
          {/* Subtle inner highlight */}
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '25%',
            width: '30%',
            height: '30%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
        </div>
        
        {/* Animated pulse effect for high threat */}
        {percent > threshold && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            animation: 'pulse 2s infinite ease-in-out'
          }} />
        )}
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
}

// Demo component to showcase different states
function ThreatScoreDemo() {
  return (
    <div style={{ 
      padding: '40px', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '40px'
    }}>
      <h1 style={{ 
        color: '#f1f5f9', 
        fontFamily: 'system-ui, sans-serif',
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 600
      }}>
        Enhanced Threat Score Circles
      </h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '30px',
        width: '100%',
        maxWidth: '800px'
      }}>
        {[
          { percent: 5, size: 60, label: 'Low Risk' },
          { percent: 15, size: 80, label: 'Medium Risk' },
          { percent: 45, size: 100, label: 'High Risk' },
          { percent: 85, size: 120, label: 'Critical Risk' },
          { percent: 2, size: 60, label: 'Safe' },
          { percent: 75, size: 80, label: 'Danger' }
        ].map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
          }}>
            <ThreatScoreCircle 
              percent={item.percent} 
              size={item.size} 
              threshold={10} 
            />
            <div style={{
              color: '#94a3b8',
              fontSize: '14px',
              fontFamily: 'system-ui, sans-serif',
              textAlign: 'center'
            }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ThreatScoreDemo };