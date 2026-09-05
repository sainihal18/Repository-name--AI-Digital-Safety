import { motion } from 'framer-motion';

interface CircularRiskScoreProps {
  score: number;
  label?: string;
  size?: number;
}

export default function CircularRiskScore({ score, label = "RISK SCORE", size = 200 }: CircularRiskScoreProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#00FF9D'; // Safe
  let text = 'LOW RISK';
  if (score > 30) { color = '#FBBF24'; text = 'SUSPICIOUS'; }
  if (score > 70) { color = '#FF0055'; text = 'HIGH RISK'; }

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <div className="absolute top-0 w-full text-center text-xs font-bold tracking-widest uppercase text-slate-400 mb-2">
        {label}
      </div>
      
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1E293B"
          strokeWidth={strokeWidth}
          className="opacity-50"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold tracking-tighter text-white">{score}</span>
          <span className="text-sm font-semibold text-slate-500">/100</span>
        </div>
        <div className="text-xs font-bold tracking-widest mt-1" style={{ color }}>
          {text}
        </div>
      </div>
    </div>
  );
}
