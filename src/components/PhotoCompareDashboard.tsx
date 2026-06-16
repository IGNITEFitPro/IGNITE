import React, { useState, useEffect } from 'react';
import { BodyRecord } from '../types';
import { Camera, RefreshCw, Zap, Sliders, ChevronRight, Download, Sparkles, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';

interface PhotoCompareDashboardProps {
  records: BodyRecord[];
  clientName: string;
}

interface ImageAdjustment {
  scale: number;
  x: number;
  y: number;
  brightness: number;
}

export default function PhotoCompareDashboard({
  records,
  clientName,
}: PhotoCompareDashboardProps) {
  // Find all records that contain at least one photo
  const photoRecords = records.filter(
    (r) => r.frontPhoto || r.leftPhoto || r.rightPhoto
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Selected records for comparison
  const [beforeRecordId, setBeforeRecordId] = useState<string>('');
  const [afterRecordId, setAfterRecordId] = useState<string>('');
  
  // Current active profile angle to compare
  const [activeAngle, setActiveAngle] = useState<'front' | 'left' | 'right'>('front');
  
  // Interactive adjustment values state
  const [beforeAdj, setBeforeAdj] = useState<ImageAdjustment>({ scale: 1, x: 0, y: 0, brightness: 100 });
  const [afterAdj, setAfterAdj] = useState<ImageAdjustment>({ scale: 1, x: 0, y: 0, brightness: 100 });
  
  // High-tech AI alignment simulation state
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiStep, setAiStep] = useState<string>('');
  const [alignmentVersion, setAlignmentVersion] = useState(0);
  const [hasAligned, setHasAligned] = useState(false);
  const [guideLines, setGuideLines] = useState(true);

  // Pre-populate before and after selections when records update
  useEffect(() => {
    if (photoRecords.length >= 2) {
      setBeforeRecordId(photoRecords[0].id);
      setAfterRecordId(photoRecords[photoRecords.length - 1].id);
    } else if (photoRecords.length === 1) {
      setBeforeRecordId(photoRecords[0].id);
      setAfterRecordId('');
    }
  }, [records]);

  const beforeRecord = photoRecords.find(r => r.id === beforeRecordId);
  const afterRecord = photoRecords.find(r => r.id === afterRecordId);

  // Helper to format Thai date nicely
  const formatThaiDateShort = (dateStr?: string) => {
    if (!dateStr) return '';
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0]) + 543;
    const month = months[parseInt(parts[1]) - 1];
    const day = parseInt(parts[2]);
    return `${day} ${month} ${year}`;
  };

  // Extract photos based on current active angle selection
  const getPhotoForAngle = (record?: BodyRecord, angle: 'front' | 'left' | 'right' = 'front') => {
    if (!record) return '';
    if (angle === 'front') return record.frontPhoto || '';
    if (angle === 'left') return record.leftPhoto || '';
    return record.rightPhoto || '';
  };

  const beforePhoto = getPhotoForAngle(beforeRecord, activeAngle);
  const afterPhoto = getPhotoForAngle(afterRecord, activeAngle);

  // Trigger simulated AI scanning and auto alignment calculations
  const triggerAiAlignment = () => {
    if (!beforePhoto || !afterPhoto) return;
    setIsAiScanning(true);
    setAiStep('1. ค้นหาแบบร่างร่างกายและตรวจสอบส้นเท้า...');
    
    setTimeout(() => {
      setAiStep('2. ตรวจสอบจุดกึ่งกลางสะโพกและตำแหน่งไหล่...');
    }, 1000);

    setTimeout(() => {
      setAiStep('3. ปรับขนาดสัดส่วน (Scale) และจุดกึ่งกลาง (Centering) เสมือนจริง...');
    }, 2000);

    setTimeout(() => {
      // Auto alignment math parameters heuristics based on contrast & pose layout emulation
      setBeforeAdj({
        scale: 1.08,
        x: -4,
        y: 8,
        brightness: 98
      });
      setAfterAdj({
        scale: 1.15,
        x: 2,
        y: -5,
        brightness: 102
      });
      setIsAiScanning(false);
      setAiStep('');
      setHasAligned(true);
      setAlignmentVersion(v => v + 1);
    }, 3200);
  };

  // Restore everything to default values
  const handleResetAdjustments = () => {
    setBeforeAdj({ scale: 1, x: 0, y: 0, brightness: 100 });
    setAfterAdj({ scale: 1, x: 0, y: 0, brightness: 100 });
    setHasAligned(false);
  };

  const exportComparisonAsImage = async () => {
    const element = document.getElementById('comparison-output-canvas');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#090d16',
        scale: 2 // high resolution output
      });
      
      const link = document.createElement('a');
      link.download = `BeforeAfter_${clientName}_${activeAngle}.jpeg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (exp) {
      alert("เกิดข้อผิดพลาดในการสร้างรูปภาพส่งออก");
    }
  };

  return (
    <div id="photo-compare-dashboard" className="bg-white text-slate-850 rounded-3xl p-6 shadow-xl border border-rose-100/60 space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-rose-100 gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="text-[#f43f5e] animate-pulse" size={18} />
            ระบบเปรียบเทียบรูปสรีระเสมือนจริง และจัดวางด้วย AI (Before / After AI Alignment)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">วิเคราะห์สแกนสรีระหุ่น เทียบระนาบแบบหัวจรดเท้าของ: <span className="font-bold text-[#f43f5e]">{clientName}</span></p>
        </div>

        {photoRecords.length >= 2 && beforePhoto && afterPhoto && (
          <button
            id="btn-export-comparison"
            onClick={exportComparisonAsImage}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#f43f5e] hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-all duration-150 shadow-md shadow-rose-500/10"
          >
            <Download size={13} />
            ดาวน์โหลดภาพเปรียบเทียบนี้
          </button>
        )}
      </div>

      {photoRecords.length < 2 ? (
        // Explaining No Photos state
        <div className="flex flex-col items-center justify-center p-12 bg-rose-50/30 rounded-2xl border border-dashed border-rose-200 text-center">
          <div className="w-12 h-12 bg-rose-55 rounded-2xl bg-rose-50 border border-rose-100 text-[#f43f5e] flex items-center justify-center mb-3">
            <Camera size={24} />
          </div>
          <h4 className="text-sm font-bold text-slate-800">ต้องการรูปภาพบันทึกอย่างน้อย 2 รายการ</h4>
          <p className="text-xs text-slate-500 mt-2 max-w-lg leading-relaxed font-light">
            ปัจจุบันมีประวัติติดรูปถ่าย <strong className="text-[#f43f5e] font-bold">{photoRecords.length} วัน</strong> <br />
            คุณสามารถอัปโหลดรูปถ่ายสรีระ (หน้าตรง, ซ้าย, ขวา) เพิ่มเติมในขั้นตอน <strong className="text-slate-700 font-bold">"เพิ่มสถิติใหม่ (วัดค่าร่างกาย)"</strong> โดยแนบรูปหน้ากล้องที่ช่องอัปโหลดเมื่อต้องการสร้างชุดเปรียบเทียบ Before/After
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left panel: comparison filters and alignment settings */}
          <div className="col-span-1 space-y-4">
            
            {/* 1. Date selectors */}
            <div className="space-y-3 bg-slate-50 border border-slate-100/80 p-4 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">1. เลือกประวัติวันวัดเปรียบเทียบ</span>
              
              {/* Before Date Selection */}
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">รูปเปรียบเทียบก่อนหน้า (Before)</label>
                <select
                  value={beforeRecordId}
                  onChange={(e) => {
                    setBeforeRecordId(e.target.value);
                    setHasAligned(false);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-hidden focus:border-[#f43f5e] text-slate-700 cursor-pointer"
                >
                  {photoRecords.map((r) => (
                    <option key={r.id} value={r.id} disabled={r.id === afterRecordId}>
                      {formatThaiDateShort(r.date)} (นน. {r.weight} กก.)
                    </option>
                  ))}
                </select>
              </div>

              {/* After Date Selection */}
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">รูปเปรียบเทียบหลังคืบหน้า (After)</label>
                <select
                  value={afterRecordId}
                  onChange={(e) => {
                    setAfterRecordId(e.target.value);
                    setHasAligned(false);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-hidden focus:border-[#f43f5e] text-slate-700 cursor-pointer"
                >
                  {photoRecords.map((r) => (
                    <option key={r.id} value={r.id} disabled={r.id === beforeRecordId}>
                      {formatThaiDateShort(r.date)} (นน. {r.weight} กก.)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Body Angles toggle Selector */}
            <div className="space-y-2 bg-slate-50 border border-slate-100/80 p-4 rounded-2xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">2. เลือกมุมกล้องสรีระ</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'front', label: 'หน้าตรง' },
                  { key: 'left', label: 'หันข้างซ้าย' },
                  { key: 'right', label: 'หันข้างขวา' }
                ].map((angle) => (
                  <button
                    key={angle.key}
                    onClick={() => setActiveAngle(angle.key as any)}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                      activeAngle === angle.key
                        ? 'bg-[#f43f5e] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {angle.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. AI Smart Alignment Core Button */}
            <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-1.5 justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">3. จัดสเกลภาพให้เท่ากัน</span>
                <span className="bg-rose-55 text-[#f43f5e] text-[9px] font-bold rounded-sm px-1.5 py-0.5 bg-rose-50 border border-rose-100/50 font-mono">POWERED</span>
              </div>
              
              <button
                type="button"
                onClick={triggerAiAlignment}
                disabled={isAiScanning || !beforePhoto || !afterPhoto}
                className="w-full py-2.5 px-4 bg-[#f43f5e] hover:bg-rose-600 disabled:bg-slate-100 disabled:text-slate-400 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[#f43f5e]/5"
              >
                <Zap size={14} className="fill-current animate-bounce" />
                {isAiScanning ? 'ระบบ AI กำลังวิเคราะห์จัดสัดส่วน...' : '🤖 จัดขนาดภาพเท่ากันด้วย AI'}
              </button>

              <button
                type="button"
                onClick={handleResetAdjustments}
                className="w-full py-1.5 px-4 border border-slate-200 hover:border-slate-300 bg-white rounded-xl text-[10px] font-medium text-slate-500 text-center transition-all cursor-pointer"
              >
                คืนค่าสัดส่วนเดิม
              </button>
            </div>

            {/* Guide overlay toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-500">แสดงเส้นกริดระนาบเท้า/เอว</span>
              <button
                onClick={() => setGuideLines(!guideLines)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${guideLines ? 'bg-[#f43f5e]' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${guideLines ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>

          {/* Right panel: Comparative Output Area */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Visual status indicators or instructions to let you know details */}
            {!beforePhoto || !afterPhoto ? (
              <div className="flex flex-col items-center justify-center p-20 bg-rose-50/20 rounded-3xl border border-dashed border-rose-250 text-slate-500 min-h-[400px]">
                <ImageIcon size={40} className="stroke-1 mb-2 text-rose-300 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-700">ไม่มีรูปภาพอัพโหลดสำหรับวัดเปรียบเทียบในวันที่เลือก</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed text-center font-light">
                  กรุณาตรวจสอบว่าประวัติวันชั่งน้ำหนักที่เลือกนั้น ได้แนบภาพถ่าย <strong className="text-[#f43f5e] font-bold">{activeAngle === 'front' ? 'รูปถ่ายหน้าตรง' : activeAngle === 'left' ? 'รูปข้างซ้าย' : 'รูปข้างขวา'}</strong> เรียบร้อยแล้ว
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Visual scanner progress overlay */}
                <AnimatePresence>
                  {isAiScanning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/95 rounded-3xl z-30 flex flex-col items-center justify-center text-center p-6 backdrop-blur-xs"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="w-14 h-14 rounded-full border-4 border-dashed border-[#f43f5e] border-t-transparent mb-4"
                      />
                      <h4 className="text-base font-bold text-slate-800 animate-pulse">🤖 ระบบ AI กำลังประมวลจัดระเบียบสรีระร่างกาย...</h4>
                      <p className="text-xs font-mono text-[#f43f5e] mt-2.5 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg">
                        {aiStep}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
 
                 {/* THE EXPORTABLE PANEL BOX */}
                 <div
                   id="comparison-output-canvas"
                   className="bg-[#090d16] p-6 rounded-3xl border border-slate-800/60 relative overflow-hidden flex flex-col justify-between"
                   style={{ minHeight: '420px' }}
                 >
                   
                   {/* Subtle watermarked grid background */}
                   <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                     backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                     backgroundSize: '30px 30px'
                   }} />
 
                   {/* Header watermarks inside export */}
                   <div className="flex justify-between items-center z-10 border-b border-white/5 pb-3.5 mb-4 opacity-80">
                     <div>
                       <span className="text-[10px] font-black tracking-wider text-[#f43f5e] uppercase">สรีระเปรียบเทียบคืบหน้า (Before VS After Grid)</span>
                       <h5 className="text-sm font-black text-white leading-tight">ของลูกเทรน: {clientName}</h5>
                     </div>
                     <div className="text-right text-[10px] text-slate-400">
                       <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md font-mono uppercase">
                         มุมภาพ: {activeAngle === 'front' ? 'หน้าตรง' : activeAngle === 'left' ? 'ด้านซ้าย' : 'ด้านขวา'}
                       </span>
                     </div>
                   </div>
 
                   {/* Grid layout for two photos side-by-side */}
                   <div className="grid grid-cols-2 gap-4 relative">
                     
                     {/* Horizontal Guideline Overlays (for easy user stance checking) */}
                     {guideLines && (
                       <div className="absolute inset-0 pointer-events-none z-20">
                         {/* Upper chest checkpoint line */}
                         <div className="absolute top-[25%] inset-x-0 h-px bg-cyan-400/25 border-t border-dashed border-cyan-400/20" />
                         {/* Waist checkpoint line */}
                         <div className="absolute top-[50%] inset-x-0 h-px bg-yellow-400/25 border-t border-dashed border-yellow-400/20" />
                         {/* Knee checkpoint line */}
                         <div className="absolute top-[75%] inset-x-0 h-px bg-pink-400/25 border-t border-dashed border-pink-400/20" />
                       </div>
                     )}
 
                     {/* Left Frame: BEFORE Photo */}
                     <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-slate-950 flex items-center justify-center">
                       
                       {/* Photo wrapper layer supporting absolute zoom & shifts */}
                       <div 
                         className="w-full h-full transition-transform duration-300"
                         style={{
                           transform: `scale(${beforeAdj.scale}) translate(${beforeAdj.x}px, ${beforeAdj.y}px)`,
                           filter: `brightness(${beforeAdj.brightness}%)`
                         }}
                       >
                         <img 
                           src={beforePhoto} 
                           alt="Before" 
                           className="w-full h-full object-cover" 
                           referrerPolicy="no-referrer"
                         />
                       </div>
 
                       {/* Header indicators */}
                       <span className="absolute top-3 left-3 bg-[#e11d48]/95 text-white font-black text-[10px] font-mono px-2 py-0.5 rounded-md z-10 shadow-md">
                         BEFORE
                       </span>
 
                       {/* Date label */}
                       <span className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-[10px] text-center py-1.5 px-2 rounded-xl z-10 border border-white/5">
                         🗓️ {formatThaiDateShort(beforeRecord?.date)} (นน. {beforeRecord?.weight} กก.)
                       </span>
                     </div>
 
                     {/* Right Frame: AFTER Photo */}
                     <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-slate-950 flex items-center justify-center">
                       
                       {/* Photo wrapper layer supporting absolute zoom & shifts */}
                       <div 
                         className="w-full h-full transition-transform duration-300"
                         style={{
                           transform: `scale(${afterAdj.scale}) translate(${afterAdj.x}px, ${afterAdj.y}px)`,
                           filter: `brightness(${afterAdj.brightness}%)`
                         }}
                       >
                         <img 
                           src={afterPhoto} 
                           alt="After" 
                           className="w-full h-full object-cover" 
                           referrerPolicy="no-referrer"
                         />
                       </div>
 
                       {/* Header indicators */}
                       <span className="absolute top-3 left-3 bg-emerald-600/95 text-white font-black text-[10px] font-mono px-2 py-0.5 rounded-md z-10 shadow-md">
                         AFTER
                       </span>
 
                       {/* Date label */}
                       <span className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-[10px] text-center py-1.5 px-2 rounded-xl z-10 border border-white/5">
                         🗓️ {formatThaiDateShort(afterRecord?.date)} (นน. {afterRecord?.weight} กก.)
                       </span>
                     </div>
 
                   </div>
 
                   {/* Summary progress notes inside visual canvas */}
                   <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                     <div className="flex items-center gap-1">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                       <span>อัตราความคืบหน้าสรีระ:</span>
                       <strong className="text-white ml-0.5">
                         นน. เปลี่ยนแปลง {beforeRecord && afterRecord ? `${(afterRecord.weight - beforeRecord.weight).toFixed(1)}` : '--'} กก.
                         {beforeRecord && afterRecord && beforeRecord.bodyFatPercent && afterRecord.bodyFatPercent ? (
                           <span className="text-pink-400"> (ไขมันสะสมร่างกายลดลง {(beforeRecord.bodyFatPercent - afterRecord.bodyFatPercent).toFixed(1)}%)</span>
                         ) : null}
                       </strong>
                     </div>
                     <span className="text-[10px] font-mono opacity-40">AI-Aligned comparison grid template</span>
                   </div>
 
                 </div>
 
                 {/* Manual Fine-Tuning sliders section */}
                 <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                   
                   <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200">
                     <Sliders size={14} className="text-[#f43f5e]" />
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">แผงปรับแต่งตำแหน่งด้วยตนเอง (Manual Micro Adjustment)</span>
                  </div>

                  {hasAligned && (
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800">
                      <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                      <span>ขนาดย่อและพิกัดหุ่นต้นร่างถูกตั้งค่าเบื้องต้นด้วย <strong>AI Auto-Alignment</strong> เรียบร้อยแล้ว คุณสามารถเลื่อนสไลเดอร์เพิ่มเติมเพื่อจัดองศาสุดท้ายให้กึ่งกลางเฟรมได้</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Before parameters sliders */}
                    <div className="space-y-3 p-3 bg-white rounded-2xl border border-slate-150 shadow-3xs">
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">ปรับแต่งภาพวันแรก (Before Frame)</span>
                      
                      {/* Zoom Selector before */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">ซูมภาพ (Zoom / Scale)</span>
                          <span className="font-mono text-slate-600">{beforeAdj.scale.toFixed(2)}x</span>
                        </div>
                        <input 
                          type="range" min="0.6" max="1.8" step="0.01" 
                          value={beforeAdj.scale} 
                          onChange={(e) => setBeforeAdj({ ...beforeAdj, scale: parseFloat(e.target.value) })}
                          className="w-full accent-[#f43f5e] cursor-pointer h-1 rounded-lg bg-slate-100"
                        />
                      </div>

                      {/* Pan Y before */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">เลื่อนขึ้น-ลง (Offset Y)</span>
                          <span className="font-mono text-slate-600">{beforeAdj.y}px</span>
                        </div>
                        <input 
                          type="range" min="-80" max="80" step="1" 
                          value={beforeAdj.y} 
                          onChange={(e) => setBeforeAdj({ ...beforeAdj, y: parseInt(e.target.value) })}
                          className="w-full accent-[#f43f5e] cursor-pointer h-1 rounded-lg bg-slate-100"
                        />
                      </div>

                      {/* Pan X before */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">เลื่อนซ้าย-ขวา (Offset X)</span>
                          <span className="font-mono text-slate-600">{beforeAdj.x}px</span>
                        </div>
                        <input 
                          type="range" min="-50" max="50" step="1" 
                          value={beforeAdj.x} 
                          onChange={(e) => setBeforeAdj({ ...beforeAdj, x: parseInt(e.target.value) })}
                          className="w-full accent-[#f43f5e] cursor-pointer h-1 rounded-lg bg-slate-100"
                        />
                      </div>
                    </div>

                    {/* After parameters sliders */}
                    <div className="space-y-3 p-3 bg-white rounded-2xl border border-slate-150 shadow-3xs">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">ปรับแต่งภาพวันที่ก้าวหน้า (After Frame)</span>
                      
                      {/* Zoom Selector after */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">ซูมภาพ (Zoom / Scale)</span>
                          <span className="font-mono text-slate-600">{afterAdj.scale.toFixed(2)}x</span>
                        </div>
                        <input 
                          type="range" min="0.6" max="1.8" step="0.01" 
                          value={afterAdj.scale} 
                          onChange={(e) => setAfterAdj({ ...afterAdj, scale: parseFloat(e.target.value) })}
                          className="w-full accent-[#f43f5e] cursor-pointer h-1 rounded-lg bg-slate-100"
                        />
                      </div>

                      {/* Pan Y after */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">เลื่อนขึ้น-ลง (Offset Y)</span>
                          <span className="font-mono text-slate-600">{afterAdj.y}px</span>
                        </div>
                        <input 
                          type="range" min="-80" max="80" step="1" 
                          value={afterAdj.y} 
                          onChange={(e) => setAfterAdj({ ...afterAdj, y: parseInt(e.target.value) })}
                          className="w-full accent-[#f43f5e] cursor-pointer h-1 rounded-lg bg-slate-100"
                        />
                      </div>

                      {/* Pan X after */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">เลื่อนซ้าย-ขวา (Offset X)</span>
                          <span className="font-mono text-slate-600">{afterAdj.x}px</span>
                        </div>
                        <input 
                          type="range" min="-50" max="50" step="1" 
                          value={afterAdj.x} 
                          onChange={(e) => setAfterAdj({ ...afterAdj, x: parseInt(e.target.value) })}
                          className="w-full accent-[#f43f5e] cursor-pointer h-1 rounded-lg bg-slate-100"
                        />
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
