import React from 'react';
import { BodyRecord } from '../types';
import { Ruler, Activity, ArrowDown, ArrowUp, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface BodyCompositionVisualizerProps {
  gender: 'male' | 'female';
  currentRecord: BodyRecord;
  baselineRecord?: BodyRecord;
}

export default function BodyCompositionVisualizer({
  gender,
  currentRecord,
  baselineRecord,
}: BodyCompositionVisualizerProps) {
  // Get values
  const arm = currentRecord.armCircumference;
  const waist = currentRecord.waistCircumference;
  const thigh = currentRecord.thighCircumference;
  const fat = currentRecord.bodyFatPercent;
  const muscle = currentRecord.musclePercent;
  const weight = currentRecord.weight;

  // Determine BMI and weight category classification
  const heightInMeters = currentRecord.height ? currentRecord.height / 100 : 1.7;
  const bmi = heightInMeters > 0 ? (weight / (heightInMeters * heightInMeters)) : 22;

  let bodyCategory: 'underweight' | 'normal' | 'overweight' = 'normal';
  let bodyCategoryLabel = 'พอดีเกณฑ์ (คนหุ่นดี)';
  let bodyCategoryColorClass = 'text-emerald-700 border-emerald-200 bg-emerald-50';

  if (bmi < 18.5) {
    bodyCategory = 'underweight';
    bodyCategoryLabel = 'ต่ำกว่าเกณฑ์ (คนผอม)';
    bodyCategoryColorClass = 'text-cyan-700 border-cyan-200 bg-cyan-50';
  } else if (bmi >= 24.9) {
    bodyCategory = 'overweight';
    bodyCategoryLabel = 'เกินเกณฑ์ (คนอ้วน)';
    bodyCategoryColorClass = 'text-rose-700 border-rose-200 bg-rose-50';
  }

  // Get baseline values
  const baseArm = baselineRecord?.armCircumference;
  const baseWaist = baselineRecord?.waistCircumference;
  const baseThigh = baselineRecord?.thighCircumference;
  const baseFat = baselineRecord?.bodyFatPercent;
  const baseMuscle = baselineRecord?.musclePercent;
  const baseWeight = baselineRecord?.weight;

  // Helper helper to render pointer anchors for body metrics points
  const renderAnchors = (modelGender: 'male' | 'female', currentArm?: number, currentWaist?: number, currentThigh?: number) => {
    const armX = modelGender === 'male' ? 65 : 70;
    const armY = modelGender === 'male' ? 88 : 84;
    
    const waistX = 100;
    const waistY = modelGender === 'male' ? 120 : 110;
    
    const thighX = modelGender === 'male' ? 116 : 117;
    const thighY = modelGender === 'male' ? 168 : 162;

    return (
      <g>
        {currentArm !== undefined && (
          <g>
            <line x1={armX} y1={armY} x2="33" y2={armY} stroke="#f472b6" strokeWidth="1" strokeDasharray="3,1" />
            <circle cx={armX} cy={armY} r="3" fill="#f472b6" className="animate-ping" style={{ transformOrigin: `${armX}px ${armY}px` }} />
            <circle cx={armX} cy={armY} r="1.5" fill="#f472b6" />
          </g>
        )}
        {currentWaist !== undefined && (
          <g>
            <line x1={waistX} y1={waistY} x2="165" y2={waistY} stroke="#22d3ee" strokeWidth="1" strokeDasharray="3,1" />
            <circle cx={waistX} cy={waistY} r="3" fill="#22d3ee" className="animate-ping" style={{ transformOrigin: `${waistX}px ${waistY}px` }} />
            <circle cx={waistX} cy={waistY} r="1.5" fill="#22d3ee" />
          </g>
        )}
        {currentThigh !== undefined && (
          <g>
            <line x1={thighX} y1={thighY} x2="33" y2={thighY} stroke="#fb923c" strokeWidth="1" strokeDasharray="3,1" />
            <circle cx={thighX} cy={thighY} r="3" fill="#fb923c" className="animate-ping" style={{ transformOrigin: `${thighX}px ${thighY}px` }} />
            <circle cx={thighX} cy={thighY} r="1.5" fill="#fb923c" />
          </g>
        )}
      </g>
    );
  };

  // Helper to render difference badge
  const renderDiff = (current?: number, baseline?: number, type: 'decrease-good' | 'increase-good' | 'neutral' = 'decrease-good', unit: string = '') => {
    if (current === undefined || baseline === undefined) return null;
    const diff = current - baseline;
    if (diff === 0) return <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-md px-1 py-0.5 ml-1.5 font-mono">คงที่</span>;

    const isGood = 
      (type === 'decrease-good' && diff < 0) || 
      (type === 'increase-good' && diff > 0) ||
      (type === 'neutral');

    const formattedDiff = diff > 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`;
    const colorClass = isGood 
      ? 'bg-rose-50 text-emerald-600 border-emerald-100' 
      : 'bg-amber-50 text-amber-600 border-amber-100';

    return (
      <span className={`text-[10px] font-bold border rounded-md px-1.5 py-0.5 ml-1.5 inline-flex items-center gap-0.5 font-mono ${colorClass}`}>
        {diff < 0 ? <ArrowDown size={8} /> : <ArrowUp size={8} />}
        {formattedDiff}
        {unit}
      </span>
    );
  };

  // Modern abstract SVG body shapes designed in-house to look like premium trainer dashboards (Vibrant branding accents)
  return (
    <div id="body-visualizer-card" className="bg-gradient-to-br from-slate-50 via-white to-rose-50/20 text-slate-800 rounded-3xl p-6 shadow-xl shadow-rose-950/5 border border-slate-100 relative overflow-hidden">
      
      {/* Blueprint grid background */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
        backgroundImage: `radial-gradient(#f43f5e 1.2px, transparent 1.2px), radial-gradient(#f43f5e 1.2px, transparent 1.2px)`,
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px'
      }} />

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
        
        {/* Left Side: Silhouette Display */}
        <div className="w-full md:w-1/2 flex justify-center relative aspect-[3/4] max-w-[260px] md:max-w-xs select-none">
          
          {/* Body classification status badge overlay */}
          <div className="absolute top-2 left-2 z-20 pointer-events-auto">
            <span className={`px-2 py-0.5 rounded-full border text-[9px] uppercase font-bold tracking-wider shadow-sm backdrop-blur-md ${bodyCategoryColorClass}`}>
              ประเมินสรีระ: {bodyCategoryLabel}
            </span>
          </div>
          
          {/* Pulsing scanner overlay */}
          <div className="absolute inset-x-4 top-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e] animate-pulse pointer-events-none" style={{
            animation: 'scan 4s ease-in-out infinite'
          }} />

          {/* Body SVG */}
          {gender === 'male' ? (
            bodyCategory === 'underweight' ? (
              // Male Underweight SVG Shape (Slim)
              <svg viewBox="0 0 200 280" className="w-full h-full text-cyan-500/50 drop-shadow-[0_2px_8px_rgba(6,182,212,0.15)]">
                {/* Head */}
                <circle cx="100" cy="32" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Neck */}
                <line x1="100" y1="44" x2="100" y2="52" stroke="currentColor" strokeWidth="2" />
                {/* Shoulders */}
                <path d="M 76 56 Q 100 52 124 56" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                {/* Spine/Torso */}
                <path d="M 100 52 L 100 135" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" className="opacity-40" />
                {/* Chest/Ribs outline (slim) */}
                <path d="M 76 56 L 79 110 L 121 110 L 124 56 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Pelvis/Waist (slim) */}
                <path d="M 79 110 L 121 110 L 116 135 L 84 135 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                {/* Arms (slim) */}
                <path d="M 76 56 L 68 105 L 65 145" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 124 56 L 132 105 L 135 145" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                {/* Legs (slim) */}
                <path d="M 88 135 L 84 200 L 82 260" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 112 135 L 116 200 L 118 260" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                {/* Accent thin grid ribs lines */}
                <path d="M 82 68 L 118 68" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" className="opacity-50" />
                <path d="M 84 84 L 116 84" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" className="opacity-50" />
                {renderAnchors('male', arm, waist, thigh)}
              </svg>
            ) : bodyCategory === 'overweight' ? (
              // Male Overweight SVG Shape (Chubby with anatomical overlays mimicking reference image!)
              <svg viewBox="0 0 200 280" className="w-full h-full text-pink-500/40 drop-shadow-[0_2px_8px_rgba(244,63,94,0.15)]">
                {/* Head */}
                <circle cx="100" cy="32" r="16.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Thicker Neck */}
                <line x1="98" y1="48" x2="98" y2="52" stroke="currentColor" strokeWidth="1.8" />
                <line x1="102" y1="48" x2="102" y2="52" stroke="currentColor" strokeWidth="1.8" />
                {/* Shoulders (Broad/Thicker) */}
                <path d="M 64 56 Q 100 50 136 56" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                {/* Chubby Torso outline */}
                <path d="M 64 56 C 74 85 70 108 66 112 C 58 130 63 148 76 150 C 90 152 110 152 124 150 C 137 148 142 130 134 112 C 130 108 126 85 136 56 Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                {/* Chubby Arms */}
                <path d="M 64 56 C 54 90 50 110 46 145" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 136 56 C 146 90 150 110 154 145" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                {/* Chubby Legs */}
                <path d="M 80 148 C 73 195 72 215 70 260" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M 120 148 C 127 195 128 215 130 260" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                
                {/* Red Muscle Fiber outlines underneath fat (mimicking anatomical right side in reference image) */}
                <path d="M 72 70 C 85 75, 95 75, 100 80" stroke="rgba(239, 68, 68, 0.45)" strokeWidth="1.5" fill="none" />
                <path d="M 128 70 C 115 75, 105 75, 100 80" stroke="rgba(239, 68, 68, 0.45)" strokeWidth="1.5" fill="none" />
                <line x1="88" y1="88" x2="88" y2="114" stroke="rgba(239, 68, 68, 0.45)" strokeWidth="1.2" />
                <line x1="100" y1="88" x2="100" y2="114" stroke="rgba(239, 68, 68, 0.45)" strokeWidth="1.2" />
                <line x1="112" y1="88" x2="112" y2="114" stroke="rgba(239, 68, 68, 0.45)" strokeWidth="1.2" />

                {/* Subcutaneous Abdominal Fat yellow overlay belt (Subcutaneous stomach fat layer) */}
                <path 
                  d="M 66 112 C 54 128 58 144 76 150 C 90 151 110 151 124 150 C 142 144 146 128 134 112 C 124 125 112 128 100 128 C 88 128 76 125 66 112 Z" 
                  fill="rgba(234, 179, 8, 0.16)" 
                  stroke="#eab308" 
                  strokeWidth="1.5" 
                  strokeDasharray="3,1"
                  className="animate-pulse"
                />
                {renderAnchors('male', arm, waist, thigh)}
              </svg>
            ) : (
              // Male Normal SVG Shape (Athletic Fit)
              <svg viewBox="0 0 200 280" className="w-full h-full text-emerald-500/50 drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
                {/* Head */}
                <circle cx="100" cy="32" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Neck */}
                <line x1="100" y1="46" x2="100" y2="52" stroke="currentColor" strokeWidth="2.5" />
                {/* Shoulders */}
                <path d="M 72 56 Q 100 50 128 56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                {/* Spine/Torso */}
                <path d="M 100 52 L 100 135" stroke="currentColor" strokeWidth="2" strokeDasharray="2,2" className="opacity-30" />
                {/* Chest/Ribs outline */}
                <path d="M 72 56 L 76 110 L 124 110 L 128 56 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Pelvis/Tapered waist */}
                <path d="M 76 110 L 124 110 L 120 135 L 80 135 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                {/* Arms */}
                <path d="M 72 56 L 62 105 L 58 145" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 128 56 L 138 105 L 142 145" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                {/* Legs */}
                <path d="M 86 135 L 80 200 L 76 260" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M 114 135 L 120 200 L 124 260" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                
                {/* Muscle visual tones */}
                <path d="M 76 76 Q 100 80 124 76" stroke="currentColor" strokeWidth="1" className="opacity-40" />
                <path d="M 78 88 Q 100 92 122 88" stroke="currentColor" strokeWidth="1" className="opacity-40" />
                <line x1="90" y1="98" x2="110" y2="98" stroke="currentColor" strokeWidth="1" className="opacity-40" />
                <line x1="90" y1="108" x2="110" y2="108" stroke="currentColor" strokeWidth="1" className="opacity-40" />
                {renderAnchors('male', arm, waist, thigh)}
              </svg>
            )
          ) : (
            bodyCategory === 'underweight' ? (
              // Female Underweight SVG Shape (Slim Hourglass)
              <svg viewBox="0 0 200 280" className="w-full h-full text-cyan-500/50 drop-shadow-[0_2px_8px_rgba(6,182,212,0.15)]">
                {/* Head */}
                <circle cx="100" cy="30" r="11.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Neck */}
                <line x1="100" y1="41.5" x2="100" y2="48" stroke="currentColor" strokeWidth="1.8" />
                {/* Shoulders */}
                <path d="M 78 52 Q 100 48 122 52" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                {/* Spine */}
                <path d="M 100 48 L 100 135" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" className="opacity-40" />
                {/* Very slim hourglass contour */}
                <path d="M 78 52 Q 86 92 84 104 Q 78 126 122 126 Q 114 104 112 92 Q 122 52 122 52 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Arms */}
                <path d="M 78 52 L 71 96 L 68 136" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 122 52 L 129 96 L 132 136" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                {/* Legs */}
                <path d="M 87 126 Q 80 190 77 252" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 113 126 Q 120 190 123 252" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                {renderAnchors('female', arm, waist, thigh)}
              </svg>
            ) : bodyCategory === 'overweight' ? (
              // Female Overweight SVG Shape (Chubby Hourglass with anatomical overlays)
              <svg viewBox="0 0 200 280" className="w-full h-full text-pink-500/40 drop-shadow-[0_2px_8px_rgba(244,63,94,0.15)]">
                {/* Head */}
                <circle cx="100" cy="30" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Thicker Neck */}
                <line x1="99" y1="44.5" x2="99" y2="49" stroke="currentColor" strokeWidth="1.8" />
                <line x1="101" y1="44.5" x2="101" y2="49" stroke="currentColor" strokeWidth="1.8" />
                {/* Shoulders */}
                <path d="M 70 52 Q 100 48 130 52" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                {/* Full/Chubby Hourglass Torso */}
                <path d="M 70 52 C 84 88 80 106 74 112 C 63 128 66 144 80 146 C 92 147 108 147 120 146 C 134 144 137 128 126 112 C 120 106 116 88 130 52 Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                {/* Chubby Arms */}
                <path d="M 70 52 C 60 96 56 116 52 143" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 130 52 C 140 96 144 116 148 143" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                {/* Chubby Legs */}
                <path d="M 80 146 C 73 192 72 212 70 260" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M 120 146 C 127 192 128 212 130 260" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                
                {/* Muscle Fiber lines under skin representing underlying tissue */}
                <path d="M 78 76 C 85 82, 95 82, 100 86" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1.2" fill="none" />
                <path d="M 122 76 C 115 82, 105 82, 100 86" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1.2" fill="none" />
                <path d="M 82 100 Q 100 104 118 100" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1.2" fill="none" />

                {/* Subcutaneous hip/waist/core fat yellow belt (Subcutaneous stomach fat layer overlay) */}
                <path 
                  d="M 74 112 C 63 128 66 144 80 146 C 92 147 108 147 120 146 C 134 144 137 128 126 112 C 114 125 106 128 100 128 C 94 128 86 125 74 112 Z" 
                  fill="rgba(234, 179, 8, 0.16)" 
                  stroke="#eab308" 
                  strokeWidth="1.5" 
                  strokeDasharray="3,1"
                  className="animate-pulse"
                />
                {renderAnchors('female', arm, waist, thigh)}
              </svg>
            ) : (
              // Female Normal SVG Shape (Athletic Hourglass Blueprint)
              <svg viewBox="0 0 200 280" className="w-full h-full text-emerald-500/50 drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
                {/* Head */}
                <circle cx="100" cy="30" r="13" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Neck */}
                <line x1="100" y1="43" x2="100" y2="48" stroke="currentColor" strokeWidth="2.2" />
                {/* Shoulders */}
                <path d="M 75 52 Q 100 47 125 52" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                {/* Spine/Torso */}
                <path d="M 100 48 L 100 135" stroke="currentColor" strokeWidth="2" strokeDasharray="2,2" className="opacity-30" />
                {/* Hourglass Chest/Ribs/Waist contour */}
                <path d="M 75 52 Q 86 92 82 110 Q 74 135 126 135 Q 114 110 118 92 Q 125 52 125 52 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {/* Arms */}
                <path d="M 75 52 L 67 98 L 63 140" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 125 52 L 133 98 L 137 140" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                {/* Legs */}
                <path d="M 85 135 Q 75 195 72 260" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M 115 135 Q 125 195 128 260" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                
                {/* Healthy indicators */}
                <path d="M 80 80 Q 100 84 120 80" stroke="currentColor" strokeWidth="1" className="opacity-45" />
                <path d="M 82 92 Q 100 96 118 92" stroke="currentColor" strokeWidth="1" className="opacity-45" />
                <path d="M 86 110 Q 100 113 114 110" stroke="currentColor" strokeWidth="1" className="opacity-45" />
                {renderAnchors('female', arm, waist, thigh)}
              </svg>
            )
          )}

          {/* SVG floating values placed exact right adjacent of silhouette */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-left select-none text-[10px] sm:text-xs">
            {/* Upper Arm Box LEFT */}
            {arm && (
              <div className="absolute left-0" style={{ top: gender === 'male' ? '28%' : '26%' }}>
                <div className="bg-white/95 border border-pink-200/80 rounded-lg px-2 py-1 text-slate-800 shadow-md shadow-pink-500/5 flex flex-col backdrop-blur-sm">
                  <span className="text-[9px] text-pink-600 font-bold font-sans">รอบแขน</span>
                  <span className="font-mono font-bold text-slate-800">{arm} ซม.</span>
                  {baseArm && <span className="text-[8px] text-slate-400 mt-0.5">เดิม: {baseArm} ซม.</span>}
                </div>
              </div>
            )}

            {/* Thigh Box LEFT */}
            {thigh && (
              <div className="absolute left-0" style={{ top: gender === 'male' ? '57%' : '54%' }}>
                <div className="bg-white/95 border border-orange-200/80 rounded-lg px-2 py-1 text-slate-800 shadow-md shadow-orange-500/5 flex flex-col backdrop-blur-sm">
                  <span className="text-[9px] text-orange-600 font-bold font-sans">รอบต้นขา</span>
                  <span className="font-mono font-bold text-slate-800">{thigh} นิ้ว</span>
                  {baseThigh && <span className="text-[8px] text-slate-400 mt-0.5">เดิม: {baseThigh} นิ้ว</span>}
                </div>
              </div>
            )}

            {/* Waist Box RIGHT */}
            {waist && (
              <div className="absolute right-0" style={{ top: gender === 'male' ? '39%' : '35%' }}>
                <div className="bg-white/95 border border-cyan-200/80 rounded-lg px-2 py-1 text-slate-800 shadow-md shadow-cyan-500/5 flex flex-col backdrop-blur-sm">
                  <span className="text-[9px] text-cyan-600 font-bold font-sans">รอบเอว</span>
                  <span className="font-mono font-bold text-slate-800">{waist} นิ้ว</span>
                  {baseWaist && <span className="text-[8px] text-slate-400 mt-0.5">เดิม: {baseWaist} นิ้ว</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Key composition comparison logs & stats card */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-2">
            <Ruler size={16} className="text-[#f43f5e] animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">สัดส่วนสรีระและการพัฒนา</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Waist metric check */}
            <div className="bg-slate-100/50 group border border-slate-200/50 p-3.5 rounded-2xl flex flex-col justify-between hover:bg-white hover:border-cyan-200 hover:shadow-md hover:shadow-cyan-500/5 transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">รอบเอว (Waist)</span>
                <span className="px-1.5 py-0.5 rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-600 text-[10px]">พุง/รอบท้อง</span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-800 font-mono">{waist ? `${waist}` : '--'}</span>
                <span className="text-xs text-slate-400">นิ้ว</span>
                {renderDiff(waist, baseWaist, 'decrease-good', ' นิ้ว')}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">จุดดัชนีสำคัญลดไขมันสะสม</p>
            </div>

            {/* Arm metric check */}
            <div className="bg-slate-100/50 group border border-slate-200/50 p-3.5 rounded-2xl flex flex-col justify-between hover:bg-white hover:border-pink-200 hover:shadow-md hover:shadow-pink-500/5 transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">รอบต้นแขน (Arm)</span>
                <span className="px-1.5 py-0.5 rounded-lg bg-pink-50 border border-pink-100 text-pink-600 text-[10px]">ต้นแขนขวา/ซ้าย</span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-800 font-mono">{arm ? `${arm}` : '--'}</span>
                <span className="text-xs text-slate-400">ซม.</span>
                 {renderDiff(arm, baseArm, 'neutral', ' ซม.')}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">เกณฑ์ลีนเนื้อกระชับหรือปั๊มกล้ามเนื้อ</p>
            </div>

            {/* Thigh metric check */}
            <div className="bg-slate-100/50 group border border-slate-200/50 p-3.5 rounded-2xl flex flex-col justify-between hover:bg-white hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">รอบต้นขา (Thigh)</span>
                <span className="px-1.5 py-0.5 rounded-lg bg-orange-50 border border-orange-100 text-orange-600 text-[10px]">ความกว้างต้นขา</span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-800 font-mono">{thigh ? `${thigh}` : '--'}</span>
                <span className="text-xs text-slate-400">นิ้ว</span>
                {renderDiff(thigh, baseThigh, 'decrease-good', ' นิ้ว')}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">สะท้อนพัฒนาการสัดส่วนท่อนล่าง</p>
            </div>

            {/* General fitness check */}
            <div className="bg-slate-100/50 group border border-slate-200/50 p-3.5 rounded-2xl flex flex-col justify-between hover:bg-white hover:border-rose-200 hover:shadow-md hover:shadow-rose-500/5 transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">ไขมันร่างกาย (Fat %)</span>
                <span className="px-1.5 py-0.5 rounded-lg bg-rose-50 border border-rose-100 text-[#f43f5e] text-[10px]">เปอร์เซ็นต์ไขมัน</span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-800 font-mono">{fat ? `${fat}` : '--'}</span>
                <span className="text-xs text-slate-400">%</span>
                {renderDiff(fat, baseFat, 'decrease-good', '%')}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">ผลลัพธ์มวลพลังงานสะสม</p>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-rose-50/70 border border-rose-100 p-3.5 rounded-2xl flex gap-3 text-slate-600">
            <Zap size={18} className="text-[#f43f5e] shrink-0 mt-0.5 animate-pulse" />
            <div className="text-[11px] leading-relaxed">
              <p className="font-bold text-rose-950 mb-0.5 font-sans">วิเคราะห์สัดส่วนอัตโนมัติ</p>
              {waist && baseWaist ? (
                waist < baseWaist ? (
                  <span>ยอดเยี่ยมมาก! รอบเอวของลูกเทรนลดลงอย่างเหนียวแน่น บ่งบอกถึงการลดลงของไขมันสะสมช่องท้องและหน้าท้อง</span>
                ) : waist > baseWaist ? (
                  <span>รอบเอวเพิ่มขึ้นเล็กน้อย ควรควบคุมคาร์บเชิงเดียวและเพิ่มการคาร์ดิโอโซน 2 เพื่อเร่งเบิร์นไขมัน</span>
                ) : (
                  <span>รอบเอวอยู่ในระยะกระชับและคงรักษาทรง ทรัพยากรกล้ามเนื้อปลอดภัยดี</span>
                )
              ) : (
                <span>เพิ่มประวัติสถิติมากกว่า 1 รายการเพื่อคำนวณเปรียบเทียบการเปลี่ยนแปลงอย่างละเอียดเชิงลึก</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Styled animation scan lines helper */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0.1; }
          50% { top: 100%; opacity: 0.7; }
          100% { top: 0%; opacity: 0.1; }
        }
      `}</style>

    </div>
  );
}
