import React, { useState, useEffect } from 'react';
import { Client, BodyRecord } from './types';
import { generateSampleData, calculateComputedValues } from './utils';
import ClientSelector from './components/ClientSelector';
import DashboardOverview from './components/DashboardOverview';
import RecordForm from './components/RecordForm';
import ReportExporter from './components/ReportExporter';
import PhotoCompareDashboard from './components/PhotoCompareDashboard';
import {
  Sparkles,
  Activity,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  FileText,
  BarChart2,
  TrendingUp,
  Award,
  BookOpen,
  Info,
  Flame,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [records, setRecords] = useState<BodyRecord[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'report' | 'photos'>('dashboard');
  
  // Dialog toggles
  const [isAddingRecord, setIsAddingRecord] = useState(false);

  // 1. Initial configuration loading and caching
  useEffect(() => {
    const cachedClients = localStorage.getItem('fittrack_clients');
    const cachedRecords = localStorage.getItem('fittrack_records');

    if (cachedClients && cachedRecords) {
      try {
        const parsedClients = JSON.parse(cachedClients);
        const parsedRecords = JSON.parse(cachedRecords);
        setClients(parsedClients);
        setRecords(parsedRecords);
        if (parsedClients.length > 0) {
          setSelectedClientId(parsedClients[0].id);
        }
      } catch (err) {
        console.error('Failed to parse cached data:', err);
        seedSampleData();
      }
    } else {
      seedSampleData();
    }
  }, []);

  // Helper to force seed sample mock profiles
  const seedSampleData = () => {
    const { clients: sampleClients, records: sampleRecords } = generateSampleData();
    setClients(sampleClients);
    setRecords(sampleRecords);
    localStorage.setItem('fittrack_clients', JSON.stringify(sampleClients));
    localStorage.setItem('fittrack_records', JSON.stringify(sampleRecords));
    if (sampleClients.length > 0) {
      setSelectedClientId(sampleClients[0].id);
    }
  };

  // Sync to localStorage on active modifications
  const saveStateToStorage = (updatedClients: Client[], updatedRecords: BodyRecord[]) => {
    setClients(updatedClients);
    setRecords(updatedRecords);
    localStorage.setItem('fittrack_clients', JSON.stringify(updatedClients));
    localStorage.setItem('fittrack_records', JSON.stringify(updatedRecords));
  };

  // Handle addition of training accounts
  const handleAddClient = (clientData: Omit<Client, 'id' | 'createdAt'>): string => {
    const newId = `client-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    
    const updatedClients = [...clients, newClient];
    saveStateToStorage(updatedClients, records);
    return newId;
  };

  // Profile metadata update
  const handleUpdateClient = (updatedClient: Client) => {
    const updatedClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    saveStateToStorage(updatedClients, records);
  };

  // Add measurement record
  const handleAddRecord = (recordData: Omit<BodyRecord, 'id' | 'clientId' | 'bmi' | 'fatMass' | 'muscleMass' | 'bmr'>) => {
    if (!selectedClientId) return;
    const clientRef = clients.find(c => c.id === selectedClientId);
    if (!clientRef) return;

    // Run body math automatically under calculation tools
    const computed = calculateComputedValues({
      weight: recordData.weight,
      height: recordData.height,
      bodyFatPercent: recordData.bodyFatPercent,
      musclePercent: recordData.musclePercent,
      age: clientRef.age,
      gender: clientRef.gender,
    });

    const newRecord: BodyRecord = {
      ...recordData,
      ...computed,
      id: `record-${Date.now()}`,
      clientId: selectedClientId,
    };

    const updatedRecords = [...records, newRecord];
    saveStateToStorage(clients, updatedRecords);
  };

  // Records deletion
  const handleDeleteRecord = (recordId: string) => {
    const updatedRecords = records.filter(r => r.id !== recordId);
    saveStateToStorage(clients, updatedRecords);
  };

  // Reset all to blank space
  const handleHardReset = () => {
    if (window.confirm('🚨 คุณต้องการล้างข้อมูลทั้งหมดในระบบใช่หรือไม่? ข้อมูลประวัติและลูกเทรนทุกคนจะถูกลบ!')) {
      saveStateToStorage([], []);
      setSelectedClientId(null);
    }
  };

  // Download raw JSON configuration backup
  const handleBackupExport = () => {
    const payload = {
      clients,
      records,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `IGNITEFitPro_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Restore raw JSON database uploaded by trainer
  const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.clients) && Array.isArray(parsed.records)) {
          saveStateToStorage(parsed.clients, parsed.records);
          if (parsed.clients.length > 0) {
            setSelectedClientId(parsed.clients[0].id);
          }
          alert('✅ นำเข้าข้อมูลสำรองประวัติลูกเทรนสำเร็จ!');
        } else {
          alert('❌ ไฟล์สำรองข้อมูลไม่ถูกต้อง กรุณาอัปโหลดไฟล์ที่เคยสำรองจากระบบนี้');
        }
      } catch (err) {
        alert('❌ ไม่สามารถอ่านไฟล์นี้ได้ กรุณาตรวจสอบว่าเป็นไฟล์ JSON ที่ถูกต้อง');
      }
    };
    reader.readAsText(file);
  };

  const activeClient = clients.find(c => c.id === selectedClientId) || null;
  const activeClientRecords = records.filter(r => r.clientId === selectedClientId);

  return (
    <div id="fittrack-application-root" className="min-h-screen bg-slate-50 flex flex-col pb-12 font-sans">
      
      {/* Upper Navigation Rail bar */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-40 shadow-xs no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f43f5e] flex items-center justify-center text-white font-extrabold shadow-md shadow-rose-500/20">
              <Flame size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none font-sans">IGNITE FitPro</h1>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold font-sans">V1.1</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">แผงควบคุมระบบบันทึก วิเคราะห์ และจัดทำรายงานมวลร่างกายลูกเทรนอย่างมืออาชีพ</p>
            </div>
          </div>

          {/* Backup Database Sync buttons */}
          <div className="flex items-center gap-2 flex-wrap font-sans">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer transition-colors">
              <Upload size={13} />
              นำเข้าข้อมูล Backup
              <input
                id="btn-import-backup-file"
                type="file"
                accept=".json"
                onChange={handleBackupImport}
                className="hidden"
              />
            </label>
            
            <button
              id="btn-export-backup"
              onClick={handleBackupExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer transition-colors"
              title="เซฟไฟล์ประวัติลูกเทรนลงเครื่องเก็บไว้รันโปรแกรมใหม่ได้ปลอดภัย"
            >
              <Download size={13} />
              ส่งออกข้อมูล Backup (ดาวน์โหลด)
            </button>

            <button
              id="btn-restore-sample"
              onClick={() => {
                if (window.confirm('ต้องการรีเซ็ตข้อมูลและทดลองใช้ข้อมูลตัวอย่าง (Sample) ใหม่ใช่หรือไม่?')) {
                  seedSampleData();
                }
              }}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="รีเซ็ตสู่ข้อมูลเริ่มต้นโปรแกรม"
            >
              <RefreshCw size={13} />
            </button>

            <button
              id="btn-hard-clear"
              onClick={handleHardReset}
              className="p-2 rounded-xl border border-rose-100 hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="ล้างฐานข้อมูลระบบทั้งหมด!"
            >
              <Trash2 size={13} />
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Frame container */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 mt-6 flex-1 flex flex-col font-sans">
        <div className="grid grid-cols-12 gap-6 items-start flex-1">
          
          {/* Left panel Selection component (4 columns) */}
          <div className="col-span-12 lg:col-span-4 h-full no-print">
            <ClientSelector
              clients={clients}
              selectedClientId={selectedClientId}
              onSelectClient={(id) => {
                setSelectedClientId(id);
                setIsAddingRecord(false); // Close expanding forms on client switch
              }}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
            />
          </div>

          {/* Right panel Body Stats analysis (8 columns) */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            
            {activeClient ? (
              <>
                {/* Secondary Navigation view tabs */}
                <div className="flex border-b border-slate-200 no-print font-sans flex-wrap gap-y-2">
                  <button
                    id="nav-tab-dashboard"
                    onClick={() => {
                      setActiveTab('dashboard');
                      setIsAddingRecord(false);
                    }}
                    className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'dashboard'
                        ? 'border-[#f43f5e] text-[#f43f5e] font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <BarChart2 size={16} />
                    📊 กระดานวิเคราะห์ภาพรวม (Dashboard & Trends)
                  </button>
                  <button
                    id="nav-tab-photos"
                    onClick={() => {
                      setActiveTab('photos');
                      setIsAddingRecord(false);
                    }}
                    className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'photos'
                        ? 'border-[#f43f5e] text-[#f43f5e] font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Camera size={16} />
                    📸 เปรียบเทียบสรีระ Before/After (AI Photos)
                  </button>
                  <button
                    id="nav-tab-report"
                    onClick={() => {
                      setActiveTab('report');
                      setIsAddingRecord(false);
                    }}
                    className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'report'
                        ? 'border-[#f43f5e] text-[#f43f5e] font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <FileText size={16} />
                    📋 จัดส่งสรุปผลเปรียบเทียบ (Export Report Photo/PDF)
                  </button>
                </div>

                {/* Sub panels dynamic render toggled by State */}
                <div className="space-y-6">
                  
                  {/* Expanding Add Record overlay inline panel */}
                  <AnimatePresence>
                    {isAddingRecord && (
                      <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="no-print"
                      >
                        <RecordForm
                          clientId={activeClient.id}
                          clientName={activeClient.name}
                          clientGender={activeClient.gender}
                          clientAge={activeClient.age}
                          clientHeight={activeClientRecords.length > 0 ? activeClientRecords[activeClientRecords.length-1].height : activeClient.height}
                          onAddRecord={handleAddRecord}
                          onClose={() => setIsAddingRecord(false)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' ? (
                      <motion.div
                        key="dashboard-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                      >
                        <DashboardOverview
                          client={activeClient}
                          records={activeClientRecords}
                          onDeleteRecord={handleDeleteRecord}
                          onOpenAddRecordForm={() => setIsAddingRecord(true)}
                        />
                      </motion.div>
                    ) : activeTab === 'photos' ? (
                      <motion.div
                        key="photos-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                      >
                        <PhotoCompareDashboard
                          records={activeClientRecords}
                          clientName={activeClient.name}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="report-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ReportExporter
                          client={activeClient}
                          records={activeClientRecords}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-16 bg-white border border-slate-100 rounded-3xl min-h-[400px]">
                <Sparkles size={48} className="text-amber-400 mb-4 animate-spin" />
                <h3 className="text-xl font-bold text-slate-800 font-sans">👋 ยินดีต้อนรับสู่ IGNITE FitPro!</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-md font-light leading-relaxed font-sans">
                  เริ่มแชลเลนจ์ลีนหรือสร้างกล้ามเนื้อ โดยคลิก <span className="font-bold text-[#f43f5e]">"เพิ่มลูกเทรน"</span> ในแผงด้านซ้ายเพื่อกรอกรายชื่อผู้สอบถาม/คนรับการเทรน หรือกดปุ่มหมุนกลับเพื่อนำเข้าข้อมูลตัวอย่างเล่นทดลองเล่นได้ทันที!
                </p>
                <div className="flex gap-2.5 mt-6">
                  <button
                    id="btn-landing-seed"
                    onClick={seedSampleData}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-[#f43f5e] rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                  >
                    🎯 เติมรายชื่อและประวัติตัวอย่าง (Seed Demo)
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

    </div>
  );
}
