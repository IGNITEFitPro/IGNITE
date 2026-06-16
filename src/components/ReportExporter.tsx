import React, { useState, useRef, useEffect } from 'react';
import { Client, BodyRecord, MetricKey, METRIC_DEFINITIONS } from '../types';
import { getBmiStatus, getVisceralFatStatus, getBodyFatStatus } from '../utils';
import {
  Download,
  Printer,
  Calendar,
  Share2,
  FileSpreadsheet,
  Check,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Info,
  ChevronUp,
  Award,
  ChevronDown,
  User,
  HeartCrack,
  Activity,
  PenTool,
  AlertCircle,
  Copy
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface ReportExporterProps {
  client: Client;
  records: BodyRecord[];
}

export default function ReportExporter({ client, records }: ReportExporterProps) {
  const [selectedRecordAId, setSelectedRecordAId] = useState<string>('');
  const [selectedRecordBId, setSelectedRecordBId] = useState<string>('');
  const [customFeedback, setCustomFeedback] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  // Chronological sort
  const chronologicalRecords = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Initialize selected records (Record A = Earliest, Record B = Latest) on load
  useEffect(() => {
    if (chronologicalRecords.length > 0) {
      setSelectedRecordAId(chronologicalRecords[0].id);
      setSelectedRecordBId(chronologicalRecords[chronologicalRecords.length - 1].id);
    }
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-slate-100 rounded-3xl text-slate-400">
        <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
        <p className="text-xs font-light font-sans">กรุณาเพิ่มสถิติมวลกายลูกเทรนอย่างน้อย 1 รายการเพื่อเปิดระบบออกรายงาน</p>
      </div>
    );
  }

  const recordA = records.find((r) => r.id === selectedRecordAId) || chronologicalRecords[0];
  const recordB = records.find((r) => r.id === selectedRecordBId) || chronologicalRecords[chronologicalRecords.length - 1];

  const formatThaiDateFull = (dateStr: string) => {
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0]) + 543;
    const month = months[parseInt(parts[1]) - 1];
    const day = parseInt(parts[2]);
    return `${day} ${month} พ.ศ. ${year}`;
  };

  const getDeltaValue = (key: MetricKey) => {
    if (!recordA || !recordB) return 0;
    const valA = recordA[key] as number;
    const valB = recordB[key] as number;
    return parseFloat((valB - valA).toFixed(2));
  };

  const getLineShareText = () => {
    if (!recordA || !recordB) return '';
    
    const weightDiff = recordB.weight - recordA.weight;
    const fatDiff = recordB.bodyFatPercent - recordA.bodyFatPercent;
    const muscleDiff = recordB.musclePercent - recordA.musclePercent;
    const visceralDiff = recordB.visceralFat - recordA.visceralFat;
    
    let text = `📊 รายงานสรุปผลวิเคราะห์มวลแร่ธาตุร่างกาย ✦ IGNITE FitPro\n`;
    text += `👤 ลูกเทรน: ${client.name}\n`;
    text += `🗓️ ไทม์ไลน์เปรียบเทียบ:\n   [${recordA.date.split('-').reverse().join('/')}] ➔ [${recordB.date.split('-').reverse().join('/')}]\n\n`;
    
    text += `⚖️ น้ำหนักตัว (Weight):\n   ${recordA.weight} ➔ ${recordB.weight} กก. (${weightDiff > 0 ? '+' : ''}${weightDiff.toFixed(1)} กก.)\n`;
    text += `🔥 เปอร์เซ็นต์ไขมัน (% Body Fat):\n   ${recordA.bodyFatPercent}% ➔ ${recordB.bodyFatPercent}% (${fatDiff > 0 ? '+' : ''}${fatDiff.toFixed(1)}%)\n`;
    text += `💪 เปอร์เซ็นต์กล้ามเนื้อลาย (% Muscle):\n   ${recordA.musclePercent}% ➔ ${recordB.musclePercent}% (${muscleDiff > 0 ? '+' : ''}${muscleDiff.toFixed(1)}%)\n`;
    text += `⚠️ ไขมันช่องท้อง (Visceral Fat):\n   ระดับ ${recordA.visceralFat} ➔ ระดับ ${recordB.visceralFat} (${visceralDiff > 0 ? '+' : ''}${visceralDiff} ระดับ)\n`;
    
    let hasTape = false;
    let tapeText = `\n📐 สัดส่วนสรีระวัดเพิ่มเติม (Body Tape):\n`;
    
    if (recordA.armCircumference !== undefined && recordB.armCircumference !== undefined) {
      const armDiff = recordB.armCircumference - recordA.armCircumference;
      tapeText += `   • รอบต้นแขน: ${recordA.armCircumference} ➔ ${recordB.armCircumference} ซม. (${armDiff > 0 ? '+' : ''}${armDiff.toFixed(1)} ซม.)\n`;
      hasTape = true;
    }
    if (recordA.waistCircumference !== undefined && recordB.waistCircumference !== undefined) {
      const waistDiff = recordB.waistCircumference - recordA.waistCircumference;
      tapeText += `   • รอบเอว: ${recordA.waistCircumference} ➔ ${recordB.waistCircumference} นิ้ว (${waistDiff > 0 ? '+' : ''}${waistDiff.toFixed(1)} นิ้ว)\n`;
      hasTape = true;
    }
    if (recordA.thighCircumference !== undefined && recordB.thighCircumference !== undefined) {
      const thighDiff = recordB.thighCircumference - recordA.thighCircumference;
      tapeText += `   • รอบต้นขา: ${recordA.thighCircumference} ➔ ${recordB.thighCircumference} นิ้ว (${thighDiff > 0 ? '+' : ''}${thighDiff.toFixed(1)} นิ้ว)\n`;
      hasTape = true;
    }
    
    if (hasTape) {
      text += tapeText;
    }
    
    if (customFeedback.trim()) {
      text += `\n💬 บันทึกวิเคราะห์และการบ้านจากเทรนเนอร์:\n"${customFeedback.trim()}"\n`;
    }
    
    text += `\n✨ IGNITE FitPro - วินัยสร้างผลลัพธ์ที่ดีที่สุด!`;
    return text;
  };

  const handleShareToLine = () => {
    const text = getLineShareText();
    const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(text)}`;
    window.open(lineUrl, '_blank');
  };

  const handleCopyToClipboard = async () => {
    const text = getLineShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const getReportSummaryMessage = () => {
    if (!recordA || !recordB) return '';
    const weightDiff = recordB.weight - recordA.weight;
    const fatDiff = recordB.bodyFatPercent - recordA.bodyFatPercent;
    const muscleDiff = recordB.musclePercent - recordA.musclePercent;

    let text = `ภาพรวมการพัฒนาการเทรน:\n`;
    if (weightDiff < 0) {
      text += `• น้ำหนักตัวลดลง ${Math.abs(weightDiff).toFixed(1)} กก.\n`;
    } else if (weightDiff > 0) {
      text += `• น้ำหนักตัวเพิ่มขึ้น +${weightDiff.toFixed(1)} กก.\n`;
    }

    if (fatDiff < 0) {
      text += `• เปอร์เซ็นต์ไขมันร่างกายลดลง ${Math.abs(fatDiff).toFixed(1)}% (ลดสัดส่วนลีนได้ยอดเยี่ยม!)\n`;
    } else if (fatDiff > 0) {
      text += `• เปอร์เซ็นต์ไขมันเพิ่มขึ้น +${fatDiff.toFixed(1)}%\n`;
    }

    if (muscleDiff > 0) {
      text += `• เปอร์เซ็นต์กล้ามเนื้อโครงร่างเพิ่มขึ้น +${muscleDiff.toFixed(1)}% (ระบบเตาเผาเพิ่มประสิทธิภาพ)\n`;
    } else if (muscleDiff < 0) {
      text += `• เปอร์เซ็นต์กล้ามเนื้อโครงร่างลดลง ${Math.abs(muscleDiff).toFixed(1)}%\n`;
    }

    const visceralDiff = recordB.visceralFat - recordA.visceralFat;
    if (visceralDiff < 0) {
      text += `• ไขมันช่องท้อง (Visceral Fat) สุขภาพภายในดีขึ้นอย่างเด่นชัด ลดลงไป ${Math.abs(visceralDiff)} ระดับ\n`;
    }

    text += `สรุป: ร่างกายมีการพัฒนาและปรับสัดส่วนที่ดีขึ้น ขอให้หมั่นรักษาดั่งนี้ คุมสารอาหารโปรตีนและเวทเทรนนิ่ง สู้ๆ นะครับ!`;
    return text;
  };

  // Populate dynamic default message
  useEffect(() => {
    if (recordA && recordB) {
      setCustomFeedback(getReportSummaryMessage());
    }
  }, [selectedRecordAId, selectedRecordBId]);

  const handleDownloadImage = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // retina 2x crisp quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Find and clean all stylesheets in cloned iframe to replace oklch colors with basic rgb
          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            const style = styleTags[i];
            if (style.textContent && style.textContent.includes('oklch')) {
              style.textContent = style.textContent.replace(/oklch\([^)]+\)/g, 'rgb(71, 85, 105)');
            }
          }

          // Clean all elements inline styles just in case
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el.style) {
              if (el.style.color && el.style.color.includes('oklch')) {
                el.style.color = '#1e293b';
              }
              if (el.style.backgroundColor && el.style.backgroundColor.includes('oklch')) {
                el.style.backgroundColor = '#ffffff';
              }
              if (el.style.borderColor && el.style.borderColor.includes('oklch')) {
                el.style.borderColor = '#e2e8f0';
              }
            }
          }
        }
      });
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `IGNITEFitPro_รายงานมวลกาย_${client.name}.png`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Metrics checklist configuration specifically designed for beautiful layout boxes
  const metricsToCompare: { key: MetricKey; label: string; icon: string; successDir: 'lower' | 'higher'; colorClass: string }[] = [
    { key: 'weight', label: 'น้ำหนักตัว (Body Weight)', icon: '⚖️', successDir: 'lower', colorClass: 'text-indigo-600' },
    { key: 'bodyFatPercent', label: 'สัดส่วนเปอร์เซ็นต์ไขมัน (% Body Fat)', icon: '🔥', successDir: 'lower', colorClass: 'text-rose-600' },
    { key: 'musclePercent', label: 'มวลกล้ามเนื้อลาย (% Muscle)', icon: '💪', successDir: 'higher', colorClass: 'text-emerald-600' },
    { key: 'visceralFat', label: 'ไขมันสะสมในช่องท้อง (Visceral Fat)', icon: '⚠️', successDir: 'lower', colorClass: 'text-amber-500' },
    { key: 'bmi', label: 'ดัชนีมวลกายเฉลี่ย (BMI)', icon: '📐', successDir: 'lower', colorClass: 'text-pink-600' },
    { key: 'fatMass', label: 'มวลไขมันสุทธิ (Fat Mass)', icon: '🥩', successDir: 'lower', colorClass: 'text-rose-500' },
    { key: 'muscleMass', label: 'มวลกล้ามเนื้อสุทธิ (Muscle Mass)', icon: '✊', successDir: 'higher', colorClass: 'text-emerald-600' },
    { key: 'bodyAge', label: 'อายุร่างกายสัมพัทธ์ (Body Age)', icon: '⏳', successDir: 'lower', colorClass: 'text-purple-600' },
    { key: 'armCircumference', label: 'รอบต้นแขน (Arm Circumference)', icon: '💪', successDir: 'higher', colorClass: 'text-pink-500' },
    { key: 'waistCircumference', label: 'รอบเอว (Waist Circumference)', icon: '📏', successDir: 'lower', colorClass: 'text-cyan-500' },
    { key: 'thighCircumference', label: 'รอบต้นขา (Thigh Circumference)', icon: '🦵', successDir: 'lower', colorClass: 'text-orange-500' },
  ];

  const getChangeArrow = (diff: number, successDir: 'lower' | 'higher') => {
    if (diff === 0) return { symbol: '—', text: 'คงที่', className: 'text-slate-400 bg-slate-50' };
    
    const isIncrease = diff > 0;
    const isSuccess = (successDir === 'lower' && !isIncrease) || (successDir === 'higher' && isIncrease);

    if (isSuccess) {
      return {
        symbol: isIncrease ? '▲' : '▼',
        text: `${isIncrease ? 'เพิ่มขึ้น' : 'ลดลง'} ${Math.abs(diff)}`,
        className: 'text-emerald-600 bg-emerald-50 border border-emerald-100 font-bold',
      };
    } else {
      return {
        symbol: isIncrease ? '▲' : '▼',
        text: `${isIncrease ? 'เพิ่มขึ้น' : 'ลดลง'} ${Math.abs(diff)}`,
        className: 'text-rose-600 bg-rose-50 border border-rose-100 font-medium',
      };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Settings Panel & Selectors */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm no-print">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Share2 size={18} className="text-[#f43f5e]" />
          การตั้งค่าส่งออกรายงานเปรียบเทียบผลลัพธ์
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Record Selection Dropdowns */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-semibold">เลือกวันที่ข้อมูลตั้งต้น (Record A - ก่อนหน้า)</label>
            <div className="relative">
              <select
                id="select-record-a"
                value={selectedRecordAId}
                onChange={(e) => setSelectedRecordAId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden text-slate-700 cursor-pointer"
              >
                {chronologicalRecords.map((r) => (
                  <option key={r.id} value={r.id}>
                    {formatThaiDateFull(r.date)} (น้ำหนัก: {r.weight} กก. / ไขมัน: {r.bodyFatPercent}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-semibold">เลือกวันที่ข้อมูลปัจจุบัน (Record B - หลังจากตั้งต้น)</label>
            <div className="relative">
              <select
                id="select-record-b"
                value={selectedRecordBId}
                onChange={(e) => setSelectedRecordBId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden text-slate-700 cursor-pointer"
              >
                {chronologicalRecords.map((r) => (
                  <option key={r.id} value={r.id}>
                    {formatThaiDateFull(r.date)} (น้ำหนัก: {r.weight} กก. / ไขมัน: {r.bodyFatPercent}%)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Input box to directly type comment in Infographic Report ! */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <PenTool size={14} className="text-[#f43f5e]" />
              ข้อคิดเห็นของเทรนเนอร์ (จะปรากฏบนรูปภาพสรุปรายงานอัตโนมัติ)
            </span>
            <span className="text-[10px] text-slate-400">แก้ไขพิมพ์ข้อความที่ต้องการได้เลย</span>
          </label>
          <textarea
            id="report-coach-notes-input"
            value={customFeedback}
            onChange={(e) => setCustomFeedback(e.target.value)}
            rows={4}
            placeholder="คำแนะนำในการเทรนเนอร์ โภชนาการ และการออกกำลังกาย..."
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#f43f5e] font-light resize-none leading-relaxed"
          />
        </div>

        {/* Trigger Download/Print/LINE Share Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-3 justify-end flex-wrap gap-y-3">
          <button
            id="btn-copy-report-text"
            onClick={handleCopyToClipboard}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer transition-transform duration-100 active:scale-95"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-500 animate-bounce" />
                คัดลอกคำสรุปแล้ว!
              </>
            ) : (
              <>
                <Copy size={14} />
                คัดลอกสรุปข้อความ
              </>
            )}
          </button>
          
          <button
            id="btn-share-line"
            onClick={handleShareToLine}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#06C755] hover:bg-[#05B34C] hover:shadow-lg hover:shadow-green-500/10 text-white text-xs font-bold rounded-xl cursor-pointer transition-all duration-100 active:scale-95"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738S0 4.935 0 10.304c0 4.805 4.272 8.835 10.046 9.58-.093-.204-.251-.629-.328-.962l-.121-.527c-.073-.312-.294-.961-.632-1.928l-.348-.992c-.177-.514-.114-.707.136-.838.256-.135.706-.051 1.258.121 2.378.739 5.378.681 7.242-1.077C21.737 17.518 24 14.195 24 10.304zm-14.793 2.92c-.3 0-.543-.243-.543-.542V9.32a.543.543 0 011.086 0v2.82c0 .3-.243.543-.543.543zm3.26 0c-.3 0-.543-.243-.543-.542V9.32a.543.543 0 011.086 0v2.82c0 .3-.243.543-.543.543zm3.111 0a.539.539 0 01-.383-.159l-1.98-2.072v1.689c0 .3-.243.542-.543.542a.543.543 0 01-.543-.542V9.32c0-.3.243-.543.543-.543a.542.542 0 01.383.159l1.98 2.071V9.32c0-.3.243-.543.543-.543a.543.543 0 01.543.543v3.362c0 .3-.243.542-.543.542zm3.328 0h-2.126c-.3 0-.543-.243-.543-.542V9.32a.543.543 0 011.086 0v2.278h1.04c.3 0 .543.243.543.543 0 .3-.243.542-.543.542z" />
            </svg>
            แชร์ไปทาง LINE
          </button>

          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer transition-transform duration-100 active:scale-95"
          >
            <Printer size={14} />
            พิมพ์ไฟล์ / บันทึก PDF
          </button>
          <button
            id="btn-download-png-report"
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#f43f5e] hover:bg-rose-600 disabled:bg-slate-200 text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all duration-100 active:scale-95"
          >
            {isExporting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                กำลังประมวลผลรูป...
              </span>
            ) : (
              <>
                <Download size={14} />
                เซฟส่งในแชท: บันทึกข้อมูลเป็นรูปภาพ (Download Image)
              </>
            )}
          </button>
        </div>
      </div>



      {/* The Printable Infographic Masterpiece */}
      {recordA && recordB && (
        <div className="flex justify-center bg-slate-300/30 p-1 md:p-6 rounded-3xl overflow-x-auto">
          
          {/* Infographic container box width: 720px for perfect proportions with CSS heights */}
          <div
            id="premium-infographic-card"
            ref={reportRef}
            className="w-[720px] shrink-0 bg-white p-7 text-slate-800 shadow-xl border border-slate-100 rounded-2xl flex flex-col justify-between"
            style={{ fontFamily: 'Kanit, Inter, sans-serif' }}
          >
            
            {/* Infographic Header */}
            <div className="border-b-4 border-slate-900 pb-5 mb-5 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold text-teal-600 tracking-widest uppercase font-mono">
                  ✦ BODY COMPOSITION PROGRESS REPORT
                </p>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  ใบสรุปรายงานวิเคราะห์มวลแร่ธาตุร่างกาย
                </h1>
                <p className="text-xs text-slate-400 font-light mt-0.5">
                  เครื่องชั่งวัดชนิดประจุไฟฟ้าแบบกระแสต่ำ (Segmental BIA Tracker)
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-[#f43f5e] text-white rounded-lg text-xs font-bold tracking-tight">
                  IGNITE Studio
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  Generated On: {new Date().toLocaleDateString('th-TH')}
                </p>
              </div>
            </div>

            {/* Client Info Grid Block */}
            <div className="grid grid-cols-4 bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100/60 text-xs">
              <div className="border-r border-slate-200/60 pr-2">
                <p className="text-[10px] text-slate-400 font-semibold mb-0.5">👤 สมาชิก / ลูกเทรน</p>
                <p className="font-bold text-slate-800 truncate text-sm">{client.name}</p>
              </div>
              <div className="border-r border-slate-200/60 px-3">
                <p className="text-[10px] text-slate-400 font-semibold mb-0.5">🧬 อายุ / ส่วนสูง</p>
                <p className="font-bold text-slate-800">{client.age} ปี / {client.height} ซม.</p>
              </div>
              <div className="border-r border-slate-200/60 px-3">
                <p className="text-[10px] text-slate-400 font-semibold mb-0.5">เพศกำเนิด</p>
                <p className="font-bold text-slate-800">{client.gender === 'male' ? 'ชาย (Male)' : 'หญิง (Female)'}</p>
              </div>
              <div className="pl-3">
                <p className="text-[10px] text-slate-400 font-semibold mb-0.5">🗓️ ไทม์ไลน์เปรียบเทียบ</p>
                <p className="font-bold text-[#f43f5e] font-mono text-[11px]">
                  {recordA.date.split('-').reverse().join('/')} ➔ {recordB.date.split('-').reverse().join('/')}
                </p>
              </div>
            </div>

            {/* High-Fidelity Comparison Box Grid */}
            <div className="space-y-3 flex-1 mb-5">
              
              {/* Box Section Label */}
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Activity size={14} className="text-slate-800" />
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">ดัชนีชี้วัดและการเปลี่ยนแปลง (Comparative Metrics)</span>
              </div>

              {/* Comparative Table Header in Infographic Card */}
              <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase px-3 py-1.5 bg-slate-100 rounded-lg">
                <div className="col-span-4">ตัวชี้วัดองค์ประกอบร่างกาย</div>
                <div className="col-span-2 text-center">ค่าเดิม (A)</div>
                <div className="col-span-2 text-center text-[#f43f5e]">ค่าใหม่ (B)</div>
                <div className="col-span-1 text-center">หน่วย</div>
                <div className="col-span-3 text-center">อัตราการพัฒนา</div>
              </div>

              {/* Rows matching every metric */}
              <div className="divide-y divide-slate-100 font-sans">
                {metricsToCompare.map(({ key, label, icon, successDir, colorClass }) => {
                  const valA = recordA[key] as number;
                  const valB = recordB[key] as number;
                  const diff = getDeltaValue(key);
                  const status = getChangeArrow(diff, successDir);

                  return (
                    <div key={key} className="grid grid-cols-12 py-2.5 px-3 items-center text-xs">
                      <div className="col-span-4 flex items-center" style={{ gap: '8px' }}>
                        <span className="text-sm select-none mr-2">{icon}</span>
                        <span className="font-semibold text-slate-700">{METRIC_DEFINITIONS[key].label.split('(')[0]}</span>
                      </div>
                      
                      <div className="col-span-2 text-center font-bold text-slate-500 font-mono">
                        {valA}
                      </div>

                      <div className="col-span-2 text-center font-black text-slate-800 font-mono text-sm">
                        {valB}
                      </div>

                      <div className="col-span-1 text-center text-slate-400 font-light font-sans">
                        {METRIC_DEFINITIONS[key].unit}
                      </div>

                      <div className="col-span-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] ${status.className} font-bold`}>
                          {status.symbol} {status.text} {METRIC_DEFINITIONS[key].unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Double Column Health Evaluator Cards */}
              <div className="grid grid-cols-3 gap-3 pt-3">
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-xs shadow-3xs flex flex-col justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-indigo-500 uppercase">ดัชนี BMI ล่าสุด</p>
                    <p className="text-base font-black text-slate-800 font-mono mt-0.5">{recordB.bmi}</p>
                  </div>
                  <span className={`mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-center ${getBmiStatus(recordB.bmi).bg} ${getBmiStatus(recordB.bmi).color}`}>
                    {getBmiStatus(recordB.bmi).label}
                  </span>
                </div>

                <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 text-xs shadow-3xs flex flex-col justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-rose-500 uppercase">ไขมันช่องท้องล่าสุด</p>
                    <p className="text-base font-black text-slate-800 font-mono mt-0.5">ระดับ {recordB.visceralFat}</p>
                  </div>
                  <span className={`mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-center ${getVisceralFatStatus(recordB.visceralFat).bg} ${getVisceralFatStatus(recordB.visceralFat).color}`}>
                    {getVisceralFatStatus(recordB.visceralFat).label}
                  </span>
                </div>

                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-xs shadow-3xs flex flex-col justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-emerald-500 uppercase">พลังงาน BMR</p>
                    <p className="text-base font-black text-slate-800 font-mono mt-0.5">{recordB.bmr} kcal</p>
                  </div>
                  <div className="mt-1.5 text-[9px] text-slate-400 flex items-center justify-center gap-1 font-sans">
                    <Sparkles size={10} className="text-amber-500" />
                    <span>พลังงานเผาผลาญพื้นฐาน</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Coach Comments on bottom section inside report canvas */}
            {customFeedback.trim() && (
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center gap-1 border-b border-white/10 pb-1.5 mb-2">
                  <Award size={14} className="text-amber-400" />
                  <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">💬 บันทึกวิเคราะห์และการบ้านจากเทรนเนอร์ (Coach Advice)</span>
                </div>
                <p className="text-xs font-light whitespace-pre-wrap leading-relaxed text-slate-200 font-sans">
                  {customFeedback}
                </p>
              </div>
            )}

            {/* Infographic Footer credit & standard advice */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-sans">
              <span className="font-light">IGNITE FitPro - Designed specifically for trainers & athletes</span>
              <span className="font-light italic">"วินัย ความพยายาม ส่งผลลัพธ์เป็นตัวเลขมวลกายที่ดีขึ้น"</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
