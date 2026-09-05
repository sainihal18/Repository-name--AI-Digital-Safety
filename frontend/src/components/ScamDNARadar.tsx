import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const defaultData = [
  { subject: 'Urgency', A: 85, fullMark: 100 },
  { subject: 'Fear', A: 90, fullMark: 100 },
  { subject: 'Financial Pressure', A: 70, fullMark: 100 },
  { subject: 'Reward Manipulation', A: 40, fullMark: 100 },
  { subject: 'Impersonation', A: 80, fullMark: 100 },
  { subject: 'Authority', A: 95, fullMark: 100 },
  { subject: 'Credentials', A: 90, fullMark: 100 },
  { subject: 'OTP', A: 30, fullMark: 100 },
  { subject: 'Social Engine', A: 60, fullMark: 100 },
  { subject: 'Ext. Links', A: 100, fullMark: 100 },
];

export default function ScamDNARadar({ dna }: { dna?: any }) {
  // If real DNA is provided map it, otherwise show demo SOC dashboard data
  const chartData = dna ? [
    { subject: 'Urgency', A: dna.urgency * 100, fullMark:100},
    { subject: 'Fear', A: dna.fear * 100, fullMark:100},
    { subject: 'Financial', A: dna.financial_pressure * 100, fullMark:100},
    { subject: 'Reward', A: dna.reward_manipulation * 100, fullMark:100},
    { subject: 'Impersonation', A: dna.impersonation * 100, fullMark:100},
    { subject: 'Authority', A: dna.authority_abuse * 100, fullMark:100},
  ] : defaultData;

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-4">
      <h3 className="text-[#FF0055] text-xs font-bold tracking-widest uppercase mb-1">SCAM DNA</h3>
      <h2 className="text-lg font-bold text-white mb-4">Behavioral Pattern Analysis</h2>
      
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#1E293B" strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0B132B', border: '1px solid #1E293B', borderRadius: '8px' }}
              itemStyle={{ color: '#FF0055' }}
            />
            <Radar
              name="Detected Scam Pattern"
              dataKey="A"
              stroke="#FF0055"
              fill="#FF0055"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-[#FF0055] shadow-[0_0_5px_#FF0055]" />
          <span className="text-slate-400">Detected Pattern</span>
        </div>
      </div>
    </div>
  );
}
