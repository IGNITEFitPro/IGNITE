import React, { useState, useEffect } from 'react';
import { BodyRecord } from '../types';
import { calculateComputedValues } from '../utils';
import { Calendar, HelpCircle, Save, X, Calculator, Info, Flame, Scale, TrendingUp, Sparkles, Camera, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

// Client-side image compression to stay safely within memory/quota budgets
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250; // optimized compact resolution for comparative side-by-side grids
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.65); // High-compress factor
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error("Image render failed"));
    };
    reader.onerror = (error) => reject(error);
  });
};

interface RecordFormProps {
  clientId: string;
  clientName: string;
  clientGender: 'male' | 'female';
  clientAge: number;
  clientHeight: number;
  onAddRecord: (record: Omit<BodyRecord, 'id' | 'clientId' | 'bmi' | 'fatMass' | 'muscleMass' | 'bmr'>) => void;
  onClose: () => void;
}

export default function RecordForm({
  clientId,
  clientName,
  clientGender,
  clientAge,
  clientHeight,
  onAddRecord,
  onClose,
}: RecordFormProps) {
  // Input fields
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>(clientHeight);
  const [bodyFatPercent, setBodyFatPercent] = useState<number | ''>('');
  const [musclePercent, setMusclePercent] = useState<number | ''>('');
  const [visceralFat, setVisceralFat] = useState<number | ''>('');
  const [bodyAge, setBodyAge] = useState<number | ''>('');
  const [note, setNote] = useState('');

  // New tape measurements state
  const [armCircumference, setArmCircumference] = useState<number | ''>('');
  const [waistCircumference, setWaistCircumference] = useState<number | ''>('');
  const [thighCircumference, setThighCircumference] = useState<number | ''>('');

  // New photo files state (base64 compressed strings)
  const [frontPhoto, setFrontPhoto] = useState<string>('');
  const [leftPhoto, setLeftPhoto] = useState<string>('');
  const [rightPhoto, setRightPhoto] = useState<string>('');
  
  // Real-time computed feedback
  const [liveComputed, setLiveComputed] = useState<{
    bmi: number;
    fatMass: number;
    muscleMass: number;
    bmr: number;
  } | null>(null);

  // Recalculate computed feedback live on input change
  useEffect(() => {
    if (
      typeof weight === 'number' && weight > 0 &&
      typeof height === 'number' && height > 0 &&
      typeof bodyFatPercent === 'number' && bodyFatPercent >= 0 &&
      typeof musclePercent === 'number' && musclePercent >= 0
    ) {
      const computed = calculateComputedValues({
        weight,
        height,
        bodyFatPercent,
        musclePercent,
        age: clientAge,
        gender: clientGender,
      });
      setLiveComputed(computed);
    } else {
      setLiveComputed(null);
    }
  }, [weight, height, bodyFatPercent, musclePercent, clientAge, clientGender]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || weight <= 0) return;
    if (!height || height <= 0) return;
    if (typeof bodyFatPercent !== 'number' || bodyFatPercent < 0 || bodyFatPercent > 100) return;
    if (typeof musclePercent !== 'number' || musclePercent < 0 || musclePercent > 100) return;
    if (!visceralFat || visceralFat <= 0) return;
    if (!bodyAge || bodyAge <= 0) return;

    onAddRecord({
      date,
      weight: Number(weight),
      height: Number(height),
      bodyFatPercent: Number(bodyFatPercent),
      musclePercent: Number(musclePercent),
      visceralFat: Number(visceralFat),
      bodyAge: Number(bodyAge),
      note: note.trim() || undefined,
      armCircumference: armCircumference !== '' ? Number(armCircumference) : undefined,
      waistCircumference: waistCircumference !== '' ? Number(waistCircumference) : undefined,
      thighCircumference: thighCircumference !== '' ? Number(thighCircumference) : undefined,
      frontPhoto: frontPhoto || undefined,
      leftPhoto: leftPhoto || undefined,
      rightPhoto: rightPhoto || undefined,
    });

    onClose();
  };

  return (
    <div id="record-form-container" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">📝 บันทึกค่ามวลกายลูกเทรน</h3>
          <p className="text-xs text-slate-500 mt-0.5">ของ: <span className="font-semibold text-teal-600">{clientName}</span> (เพศ{clientGender === 'male' ? 'ชาย' : 'หญิง'}, อายุ {clientAge} ปี)</p>
        </div>
        <button
          id="btn-close-record-form"
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          
          {/* วันที่วัดผล */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              วันที่ชั่งและวัดผล *
            </label>
            <input
              id="record-date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
            />
          </div>

          {/* ส่วนสูง */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              ส่วนสูงปัจจุบัน * (ซม.)
            </label>
            <input
              id="record-height-input"
              type="number"
              placeholder="เช่น 165"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
              required
              min="100"
              max="250"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
            />
          </div>

          {/* น้ำหนักตัว */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
              <span>น้ำหนักตัว * (กก.)</span>
              <span className="text-[10px] text-slate-400 font-light">เช่น 62.4</span>
            </label>
            <input
              id="record-weight-input"
              type="number"
              placeholder="กก."
              step="0.05"
              value={weight}
              onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
              required
              min="20"
              max="300"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono font-bold"
            />
          </div>

          {/* เปอร์เซ็นต์ไขมัน */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
              <span>เปอร์เซ็นต์ไขมันร่างกาย * (% Body Fat)</span>
              <span className="text-[10px] text-slate-400 font-light">ใช้ชั่งวัดจากเครื่องทานิต้า/โอมรอน</span>
            </label>
            <input
              id="record-fat-input"
              type="number"
              placeholder="%"
              step="0.1"
              value={bodyFatPercent}
              onChange={(e) => setBodyFatPercent(e.target.value === '' ? '' : Number(e.target.value))}
              required
              min="1"
              max="70"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
            />
          </div>

          {/* เปอร์เซ็นต์กล้ามเนื้อโครงร่าง */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
              <span>เปอร์เซ็นต์กล้ามเนื้อโครงร่าง * (% Muscle)</span>
              <span className="text-[10px] text-slate-400 font-light">เช่น 24.5%</span>
            </label>
            <input
              id="record-muscle-input"
              type="number"
              placeholder="%"
              step="0.1"
              value={musclePercent}
              onChange={(e) => setMusclePercent(e.target.value === '' ? '' : Number(e.target.value))}
              required
              min="5"
              max="70"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
            />
          </div>

          {/* ไขมันช่องท้อง */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
              <span>ไขมันช่องท้อง * (Visceral Fat level)</span>
              <span className="text-[10px] text-slate-400 font-light">ช่วงปกติ: 1 - 9</span>
            </label>
            <input
              id="record-visceral-input"
              type="number"
              placeholder="ระดับไขมันช่องท้อง (ตัวเลขเช่น 4, 7, 12)"
              step="1"
              value={visceralFat}
              onChange={(e) => setVisceralFat(e.target.value === '' ? '' : Number(e.target.value))}
              required
              min="1"
              max="59"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
            />
          </div>

          {/* อายุร่างกาย */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
              <span>อายุร่างกาย * (Body Age)</span>
              <span className="text-[10px] text-slate-400 font-light">ปี (เปรียบเทียบจากเกณฑ์เครื่องวัด)</span>
            </label>
            <input
              id="record-bodyage-input"
              type="number"
              placeholder="อายุร่างกายเป็นปี"
              step="1"
              value={bodyAge}
              onChange={(e) => setBodyAge(e.target.value === '' ? '' : Number(e.target.value))}
              required
              min="10"
              max="110"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono"
            />
          </div>

          {/* โน้ตชี้แจงการเทรน */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              หมายเหตุ / การกิน / การพักผ่อน ในช่วงการวัดผลนี้
            </label>
            <input
              id="record-note-input"
              type="text"
              placeholder="เช่น ประจำเดือนเพิ่งหมด, เริ่มลดคาร์โบไฮเดรตลงเล็กน้อย, เน้นชั่งช่วงเช้าท้องว่าง"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-teal-500 font-light"
            />
          </div>
        </div>

        {/* 📐 การบันทึกสัดส่วนเพิ่มเติม (Body Circumferences) */}
        <div id="body-tape-section" className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <span className="text-base">📐</span> บันทึกสัดส่วนเพิ่มเติม (Body Tape Measurements)
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">ไม่บังคับกรอก</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* รอบต้นแขน */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                <span>รอบต้นแขน * (ซม.)</span>
                <span className="text-[9px] text-slate-400 font-normal">เช่น 28.4 ซม.</span>
              </label>
              <input
                id="record-arm-input"
                type="number"
                placeholder="ซม."
                step="0.05"
                value={armCircumference}
                onChange={(e) => setArmCircumference(e.target.value === '' ? '' : Number(e.target.value))}
                min="5"
                max="120"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono font-medium"
              />
            </div>

            {/* รอบเอว */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                <span>รอบเอว * (นิ้ว)</span>
                <span className="text-[9px] text-slate-400 font-normal">เช่น 31.5 นิ้ว</span>
              </label>
              <input
                id="record-waist-input"
                type="number"
                placeholder="นิ้ว"
                step="0.05"
                value={waistCircumference}
                onChange={(e) => setWaistCircumference(e.target.value === '' ? '' : Number(e.target.value))}
                min="10"
                max="100"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-mono font-medium"
              />
            </div>

            {/* รอบต้นขา */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                <span>รอบต้นขา * (นิ้ว)</span>
                <span className="text-[9px] text-slate-400 font-normal">เช่น 21.2 นิ้ว</span>
              </label>
              <input
                id="record-thigh-input"
                type="number"
                placeholder="นิ้ว"
                step="0.05"
                value={thighCircumference}
                onChange={(e) => setThighCircumference(e.target.value === '' ? '' : Number(e.target.value))}
                min="5"
                max="100"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono font-medium"
              />
            </div>
          </div>
        </div>

        {/* 📸 ส่วนอัปโหลดรูปถ่ายสรีระ (Body Photos) */}
        <div id="body-photos-section" className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span className="text-base">📸</span> อัปโหลดรูปถ่ายสรีระ (Body Photos)
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">ภาพถ่ายหน้าตรง ข้างซ้าย ข้างขวา เพื่อใช้วิเคราะห์เปรียบเทียบขนาดสัดส่วน</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium whitespace-nowrap">ไม่บังคับกรอก</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { idKey: 'front', label: 'หน้าตรง (Front Profile)', val: frontPhoto, setVal: setFrontPhoto },
              { idKey: 'left', label: 'หันข้างซ้าย (Left Profile)', val: leftPhoto, setVal: setLeftPhoto },
              { idKey: 'right', label: 'หันข้างขวา (Right Profile)', val: rightPhoto, setVal: setRightPhoto }
            ].map((item) => (
              <div key={item.idKey} className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">{item.label}</span>
                {item.val ? (
                  <div className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                    <img src={item.val} alt={item.label} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-slate-950/70 py-4 px-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end items-center">
                      <button
                        type="button"
                        onClick={() => item.setVal('')}
                        className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 size={11} /> ลบรูปถ่ายออก
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        try {
                          const base64 = await compressImage(file);
                          item.setVal(base64);
                        } catch (err) {
                          alert("ไม่สามารถอ่านรูปภาพนี้ได้");
                        }
                      }
                    }}
                    className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-500 bg-white hover:bg-slate-50 cursor-pointer transition-all p-4 text-center select-none"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const base64 = await compressImage(file);
                            item.setVal(base64);
                          } catch (err) {
                            alert("ไม่สามารถอ่านรูปภาพนี้ได้");
                          }
                        }
                      }}
                    />
                    <Camera size={22} className="text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-600">{item.label}</span>
                    <span className="text-[9px] text-slate-400 mt-1">ลากไฟล์ลงที่นี่ หรือ คลิกอัปโหลด</span>
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live Calculation Preview Dashboard */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 mb-3.5">
            <Calculator size={15} className="text-teal-600" />
            <span className="text-xs font-bold text-slate-700 tracking-wider uppercase">📊 ระบบคำนวณแบบไลฟ์สไตล์ (Live Preview)</span>
          </div>

          {liveComputed ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-100/70 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-medium">ดัชนีมวลกาย BMI</p>
                <p className="text-lg font-extrabold text-slate-800 font-mono mt-0.5">{liveComputed.bmi}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 inline-block mt-1">
                  {liveComputed.bmi < 18.5 ? 'ผอม' : liveComputed.bmi < 23 ? 'สมส่วน' : liveComputed.bmi < 25 ? 'ท้วม' : 'อ้วน'}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100/70 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-medium">มวลไขมัน (Fat Mass)</p>
                <p className="text-lg font-extrabold text-slate-800 font-mono mt-0.5">{liveComputed.fatMass} <span className="text-[10px] font-normal text-slate-500 font-sans">กก.</span></p>
                <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400">
                  <Scale size={10} />
                  <span>มวลไขมันรวม</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100/70 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-medium">มวลกล้ามเนื้อ (Muscle)</p>
                <p className="text-lg font-extrabold text-slate-800 font-mono mt-0.5">{liveComputed.muscleMass} <span className="text-[10px] font-normal text-slate-500 font-sans">กก.</span></p>
                <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400">
                  <TrendingUp size={10} />
                  <span>มวลแร่ธาตุกล้ามเนื้อ</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100/70 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-medium">พลังงานเผาผลาญ BMR</p>
                <p className="text-lg font-extrabold text-indigo-700 font-mono mt-0.5">{liveComputed.bmr} <span className="text-[10px] font-normal text-slate-500 font-sans">kcal</span></p>
                <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400">
                  <Flame size={10} className="text-orange-400" />
                  <span>พลังงานชีพจรพื้นฐาน</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-white/50 border border-dashed border-slate-200 rounded-xl justify-center text-xs text-slate-400 font-light">
              <Sparkles size={14} className="text-amber-500 animate-spin" />
              <span>กรอก น้ำหนัก, ส่วนสูง, % ไขมัน, % กล้ามเนื้อ เพื่อดูผลการคำนวณอัตโนมัติ</span>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            id="btn-cancel-record"
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            id="btn-submit-record"
            type="submit"
            disabled={!weight || !bodyFatPercent || !musclePercent || !visceralFat || !bodyAge}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold cursor-pointer shadow-md shadow-teal-600/10 transition-colors"
          >
            <Save size={16} />
            บันทึกประวัติการพัฒนา
          </button>
        </div>
      </form>
    </div>
  );
}
