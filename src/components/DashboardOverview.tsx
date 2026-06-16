import React, { useState } from 'react';
import { Client, BodyRecord, MetricKey, METRIC_DEFINITIONS } from '../types';
import {
  getBmiStatus,
  getVisceralFatStatus,
  getBodyFatStatus,
} from '../utils';
import BodyCompositionVisualizer from './BodyCompositionVisualizer';
import {
  TrendingUp,
  Activity,
  Calendar,
  Flame,
  Scale,
  Smile,
  ChevronDown,
  Trash2,
  Table,
  LineChart,
  User,
  Plus,
  Compass,
  Download,
  Award,
  BookOpen
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardOverviewProps {
  client: Client;
  records: BodyRecord[];
  onDeleteRecord: (recordId: string) => void;
  onOpenAddRecordForm: () => void;
}

export default function DashboardOverview({
  client,
  records,
  onDeleteRecord,
  onOpenAddRecordForm,
}: DashboardOverviewProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('weight');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // Sort chronological (oldest to newest) for chart
  const chronologicalRecords = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Newest first for list/table display
  const newestRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalRecords = records.length;
  const latestRecord = newestRecords[0] || null;
  const startingRecord = chronologicalRecords[0] || null;

  // Helper to construct Thai long date
  const formatThaiDate = (dateStr: string) => {
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0]) + 543; // convert to Buddhist Era
    const month = months[parseInt(parts[1]) - 1];
    const day = parseInt(parts[2]);
    return `${day} ${month} ${year}`;
  };

  // Safe delta calculation
  const getDeltaValue = (key: MetricKey) => {
    if (!latestRecord || !startingRecord || totalRecords < 2) return null;
    const latestVal = latestRecord[key] as number;
    const startingVal = startingRecord[key] as number;
    const diff = latestVal - startingVal;
    return parseFloat(diff.toFixed(2));
  };

  // Generate appropriate feedback & colors for delta metrics
  const getDeltaFeedback = (key: MetricKey, val: number) => {
    if (val === 0) return { text: 'ไม่เปลี่ยนแปลง', color: 'text-slate-500', bg: 'bg-slate-50', icon: '•' };

    const isPositiveChange = val > 0;
    
    // Categorize positive and negative outcomes depending on the fitness metric
    switch (key) {
      case 'weight':
      case 'bodyFatPercent':
      case 'visceralFat':
      case 'bodyAge':
      case 'bmi':
      case 'fatMass':
        // REDUCING these is generally healthy for fat loss
        return isPositiveChange
          ? { text: `เพิ่มขึ้น +${val}`, color: 'text-rose-600', bg: 'bg-rose-50', icon: '🔺' }
          : { text: `ลดลง ${val}`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '🔽' };

      case 'musclePercent':
      case 'muscleMass':
      case 'bmr':
        // INCREASING these is healthy for strength/muscle building
        return isPositiveChange
          ? { text: `เพิ่มขึ้น +${val}`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '🔺' }
          : { text: `ลดลง ${val}`, color: 'text-rose-600', bg: 'bg-rose-50', icon: '🔽' };

      default:
        return { text: `${val > 0 ? '+' : ''}${val}`, color: 'text-slate-600', bg: 'bg-slate-50', icon: '' };
    }
  };

  // Get current active metrics list to map simple dashboard summary cards
  const displayedMetricsConfig = [
    { key: 'weight' as MetricKey, icon: '⚖️', label: 'น้ำหนักตัว', color: 'indigo' },
    { key: 'bodyFatPercent' as MetricKey, icon: '🔥', label: '% ไขมันร่างกาย', color: 'rose' },
    { key: 'musclePercent' as MetricKey, icon: '💪', label: '% กล้ามเนื้อโครงร่าง', color: 'emerald' },
    { key: 'visceralFat' as MetricKey, icon: '⚠️', label: 'ไขมันช่องท้อง', color: 'amber' },
    { key: 'bmi' as MetricKey, icon: '📐', label: 'ดัชนี BMI', color: 'pink' },
    { key: 'fatMass' as MetricKey, icon: '🥩', label: 'มวลไขมันรวม', color: 'orange' },
    { key: 'muscleMass' as MetricKey, icon: '✊', label: 'มวลกล้ามเนื้อรวม', color: 'teal' },
    { key: 'bodyAge' as MetricKey, icon: '⏳', label: 'อายุร่างกาย', color: 'purple' },
  ];

  return (
    <div id="dashboard-overview" className="space-y-6">
      
      {/* Client Mini Profile Dashboard Top */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-rose-100/30 border border-rose-100/60 rounded-3xl p-6 text-slate-800 shadow-xl shadow-rose-950/[0.02] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none text-[#f43f5e]">
          <Activity size={180} />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100/80 flex items-center justify-center text-2xl select-none shadow-sm">
              {client.gender === 'male' ? '🧔' : '👩'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#f43f5e] border border-rose-200/50 shadow-3xs">
                  ลูกเทรนก้าวหน้า
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {client.id.split('-')[1] || client.id}</span>
              </div>
              <h2 className="text-2xl font-black mt-1 tracking-tight text-slate-800">{client.name}</h2>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 flex-wrap">
                <span>เพศ: <span className="text-slate-800 font-semibold">{client.gender === 'male' ? 'ชาย' : 'หญิง'}</span></span>
                <span>•</span>
                <span>อายุ: <span className="text-slate-800 font-semibold">{client.age} ปี</span></span>
                <span>•</span>
                <span>ส่วนสูงตั้งต้น: <span className="text-slate-800 font-semibold">{client.height} ซม.</span></span>
                {client.phone && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-600">โทร: {client.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            id="btn-add-record-top"
            onClick={onOpenAddRecordForm}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#f43f5e] hover:bg-rose-600 active:scale-95 text-white rounded-2xl text-sm font-bold shadow-md shadow-rose-500/10 cursor-pointer transition-all duration-150"
          >
            <Plus size={16} className="stroke-[3px]" />
            เพิ่มสถิติใหม่ (วัดค่าร่างกาย)
          </button>
        </div>

        {client.note && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-600 bg-rose-50/40 p-3.5 rounded-xl">
            <BookOpen size={14} className="text-[#f43f5e] shrink-0 mt-0.5" />
            <p className="font-light italic leading-relaxed">{client.note}</p>
          </div>
        )}
      </div>

      {latestRecord ? (
        <>
          {/* Main Quick metrics grid */}
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Compass size={18} className="text-[#f43f5e]" />
              สรุปสถิติล่าสุด และ อัตราการเปลี่ยนแปลง
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedMetricsConfig.map(({ key, icon, label, color }) => {
                const def = METRIC_DEFINITIONS[key];
                const latestVal = latestRecord[key] as number;
                const startingVal = startingRecord ? startingRecord[key] as number : latestVal;
                const delta = getDeltaValue(key);

                // CSS styles mapped to tailwind config colors dynamically
                const colorMap: Record<string, { bg: string, text: string, accent: string }> = {
                  indigo: { bg: 'bg-indigo-50/70', text: 'text-indigo-700', accent: 'bg-indigo-500' },
                  rose: { bg: 'bg-rose-50/70', text: 'text-rose-700', accent: 'bg-rose-500' },
                  emerald: { bg: 'bg-emerald-50/70', text: 'text-emerald-700', accent: 'bg-emerald-500' },
                  amber: { bg: 'bg-amber-50/70', text: 'text-amber-700', accent: 'bg-amber-500' },
                  pink: { bg: 'bg-pink-50/70', text: 'text-pink-700', accent: 'bg-pink-500' },
                  orange: { bg: 'bg-orange-50/70', text: 'text-orange-700', accent: 'bg-orange-500' },
                  teal: { bg: 'bg-rose-50/70', text: 'text-rose-700', accent: 'bg-rose-500' },
                  purple: { bg: 'bg-purple-50/70', text: 'text-purple-700', accent: 'bg-purple-500' },
                };

                const style = colorMap[color] || colorMap.indigo;

                return (
                  <div
                    id={`metric-summary-card-${key}`}
                    key={key}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">{label}</span>
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${style.bg} ${style.text}`}>
                        {icon}
                      </span>
                    </div>

                    <div className="mt-3.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-800 font-mono tracking-tight">{latestVal}</span>
                        <span className="text-xs text-slate-400 font-medium">{def.unit}</span>
                      </div>

                      {/* Status badge depending on the metric */}
                      <div className="mt-1">
                        {key === 'bmi' && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block font-medium ${getBmiStatus(latestVal).bg} ${getBmiStatus(latestVal).color}`}>
                            {getBmiStatus(latestVal).label}
                          </span>
                        )}
                        {key === 'visceralFat' && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block font-medium ${getVisceralFatStatus(latestVal).bg} ${getVisceralFatStatus(latestVal).color}`}>
                            ระดับไขมัน: {getVisceralFatStatus(latestVal).label}
                          </span>
                        )}
                        {key === 'bodyFatPercent' && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block font-medium ${getBodyFatStatus(latestVal, client.gender).bg} ${getBodyFatStatus(latestVal, client.gender).color}`}>
                            สถานะไขมัน: {getBodyFatStatus(latestVal, client.gender).label}
                          </span>
                        )}
                        {(key !== 'bmi' && key !== 'visceralFat' && key !== 'bodyFatPercent') && (
                          <span className="text-[10px] text-slate-400">ค่าเริ่มต้น: {startingVal} {def.unit}</span>
                        )}
                      </div>
                    </div>

                    {/* Change indicators compared to start record */}
                    {delta !== null && (
                      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                        <span className="text-slate-400">เทียบจากวันแรก</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${getDeltaFeedback(key, delta).bg} ${getDeltaFeedback(key, delta).color}`}>
                          <span>{getDeltaFeedback(key, delta).icon}</span>
                          <span className="font-mono">{getDeltaFeedback(key, delta).text}</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Special BMR Card */}
              <div className="col-span-2 lg:col-span-4 bg-gradient-to-r from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                    <Flame size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">พลังงานอัตราการเผาผลาญพื้นฐาน (BMR)</p>
                    <p className="text-xs text-slate-500 mt-1">
                      เป็นพลังงานขั้นต่ำที่ร่างกายต้องการในการดำรงชีพต่อวัน (คำนวณจากสูตร Mifflin-St Jeor)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-slate-800 font-mono">{latestRecord.bmr}</span>
                  <span className="text-xs text-slate-400 ml-1">kcal/วัน</span>
                </div>
              </div>
            </div>
          </div>

          {/* 💎 Visual Body Composition Blueprint (รูปคนจำลองสัดส่วนกล้ามเนื้อ/ไขมันตามแบบผู้ใช้งานต้องการ) */}
          <BodyCompositionVisualizer
            gender={client.gender}
            currentRecord={latestRecord}
            baselineRecord={startingRecord !== latestRecord ? startingRecord : undefined}
          />

          {/* Interactive Chart and Table Historical Views */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2">
                <button
                  id="tab-view-chart"
                  onClick={() => setViewMode('chart')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    viewMode === 'chart'
                      ? 'bg-rose-50 text-[#f43f5e] shadow-2xs border border-rose-100'
                      : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <LineChart size={14} />
                  กราฟเปรียบเทียบการเปลี่ยนแปลง
                </button>
                <button
                  id="tab-view-table"
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    viewMode === 'table'
                      ? 'bg-rose-50 text-[#f43f5e] shadow-2xs border border-rose-100'
                      : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <Table size={14} />
                  ตารางบันทึกประวัติทั้งหมด
                </button>
              </div>

              {viewMode === 'chart' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">เลือกค่าแสดงกราฟ:</span>
                  <select
                    id="chart-metric-selector"
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value as MetricKey)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-rose-500 cursor-pointer font-medium"
                  >
                    {Object.entries(METRIC_DEFINITIONS).map(([key, def]) => (
                      <option key={key} value={key}>
                        {def.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Interactive Trend Chart rendering */}
            {viewMode === 'chart' && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 text-center flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: METRIC_DEFINITIONS[selectedMetric].color }}></span>
                    <span className="text-slate-600 font-bold">เทรนแนวโน้มการเปลี่ยนแปลง:</span>
                    <span className="text-rose-700 font-semibold">{METRIC_DEFINITIONS[selectedMetric].label} ({METRIC_DEFINITIONS[selectedMetric].unit})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-light max-w-lg text-left">
                    💡 {METRIC_DEFINITIONS[selectedMetric].description}
                  </p>
                </div>

                {chronologicalRecords.length < 2 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <Activity size={32} className="stroke-1 text-slate-300 mb-2 animate-bounce" />
                    <p className="text-xs">จำเป็นต้องมีอย่างน้อย 2 บันทึกเพื่อลากทิศทางกราฟ</p>
                    <p className="text-[11px] text-slate-400 mt-1">กรุณากดปุ่ม "เพิ่มสถิติใหม่ (วัดค่าร่างกาย)" เพิ่มเติม</p>
                  </div>
                ) : (
                  <div className="h-80 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={chronologicalRecords.map(r => ({
                        dateStr: formatThaiDate(r.date),
                        [selectedMetric]: r[selectedMetric],
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="dateStr"
                          stroke="#94a3b8"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '11px',
                            fontFamily: 'inherit'
                          }}
                          labelStyle={{ opacity: 0.8 }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Line
                          name={METRIC_DEFINITIONS[selectedMetric].label}
                          type="monotone"
                          dataKey={selectedMetric}
                          stroke={METRIC_DEFINITIONS[selectedMetric].color}
                          strokeWidth={3}
                          dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                          activeDot={{ r: 7 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* List / Table Viewing */}
            {viewMode === 'table' && (
              <div className="overflow-x-auto select-none rounded-2xl border border-slate-100">
                <table id="records-list-table" className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                      <th className="p-3">วันที่ชั่งวัด</th>
                      <th className="p-3 text-right">น้ำหนัก (สูง)</th>
                      <th className="p-3 text-right">% ไขมัน</th>
                      <th className="p-3 text-right">% กล้ามเนื้อ</th>
                      <th className="p-3 text-right">ไขมันช่องท้อง</th>
                      <th className="p-3 text-right">BMI</th>
                      <th className="p-3 text-right">มวลไขมัน</th>
                      <th className="p-3 text-right">มวลกล้ามเนื้อ</th>
                      <th className="p-3 text-right">BMR/อายุร่างกาย</th>
                      <th className="p-3">ความคิดเห็นและโน้ตเทรนเนอร์</th>
                      <th className="p-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {newestRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                          {formatThaiDate(r.date)}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <span className="font-bold text-slate-800 font-mono">{r.weight}</span> <span className="text-slate-400">กก.</span>
                          <span className="block text-[10px] text-slate-400 font-light">สูง {r.height} ซม.</span>
                        </td>
                        <td className="p-3 text-right font-semibold font-mono text-rose-600 whitespace-nowrap">
                          {r.bodyFatPercent}%
                        </td>
                        <td className="p-3 text-right font-semibold font-mono text-emerald-600 whitespace-nowrap">
                          {r.musclePercent}%
                        </td>
                        <td className="p-3 text-right font-medium text-slate-700 whitespace-nowrap">
                          ระดับ <span className="font-bold font-mono">{r.visceralFat}</span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <span className="font-bold font-mono text-indigo-600">{r.bmi}</span>
                        </td>
                        <td className="p-3 text-right font-mono text-orange-600 whitespace-nowrap">
                          {r.fatMass} กก.
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-600 whitespace-nowrap">
                          {r.muscleMass} กก.
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <span className="font-bold font-mono text-slate-700">{r.bmr} kcal</span>
                          <span className="block text-[10px] text-purple-600 font-mono font-sans mt-0.5">อายุสุขภาพ: {r.bodyAge} ปี</span>
                        </td>
                        <td className="p-3 max-w-[200px] truncate text-slate-500 font-light font-sans" title={r.note}>
                          {r.note || '-'}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            id={`btn-delete-record-${r.id}`}
                            onClick={() => {
                              if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบข้อมูลบันทึกวันที่ {formatThaiDate(r.date)}?`)) {
                                onDeleteRecord(r.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="ลบบันทึกสถิตินี้"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-100 rounded-3xl text-center shadow-3xs">
          <Activity size={56} className="text-slate-300 stroke-1 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">ยังไม่มีบันทึกมวลกาย</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm font-light leading-relaxed">
            สถิติทั้งหมดและการเดินทางของลูกเทรน <span className="font-semibold text-slate-700">{client.name}</span> ยังไม่เริ่มขึ้น บันทึกสถิติแรกตอนนี้เลย!
          </p>
          <button
            id="btn-add-record-empty-state"
            onClick={onOpenAddRecordForm}
            className="mt-5 flex items-center gap-1.5 px-5 py-3 bg-[#f43f5e] hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-500/10 cursor-pointer"
          >
            <Plus size={16} />
            เพิ่มบันทึกมวลร่างกายแรก
          </button>
        </div>
      )}
    </div>
  );
}
