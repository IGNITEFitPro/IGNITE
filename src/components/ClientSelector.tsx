import React, { useState } from 'react';
import { Client } from '../types';
import { User, Plus, Search, Phone, FileText, ChevronRight, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClientSelectorProps {
  clients: Client[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
  onAddClient: (client: Omit<Client, 'id' | 'createdAt'>) => string;
  onUpdateClient: (client: Client) => void;
}

export default function ClientSelector({
  clients,
  selectedClientId,
  onSelectClient,
  onAddClient,
  onUpdateClient,
}: ClientSelectorProps) {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>(170); // default fallback height
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Sieve clients
  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  const resetForm = () => {
    setName('');
    setGender('male');
    setAge('');
    setHeight('');
    setPhone('');
    setNote('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณากรอกชื่อลูกเทรน');
      return;
    }
    if (!age || Number(age) <= 0) {
      setError('กรุณากรอกอายุที่ถูกต้อง (มากกว่า 0)');
      return;
    }
    if (!height || Number(height) <= 0) {
      setError('กรุณากรอกส่วนสูงที่ถูกต้อง (มากกว่า 0 ซม.)');
      return;
    }

    const newId = onAddClient({
      name: name.trim(),
      gender,
      age: Number(age),
      height: Number(height),
      phone: phone.trim() || undefined,
      note: note.trim() || undefined,
    });

    setIsAdding(false);
    resetForm();
    onSelectClient(newId);
  };

  const handleStartEdit = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selecting client while clicking edit
    setEditingClient(client);
    setName(client.name);
    setGender(client.gender);
    setAge(client.age);
    setHeight(client.height);
    setPhone(client.phone || '');
    setNote(client.note || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    if (!name.trim()) {
      setError('กรุณากรอกชื่อลูกเทรน');
      return;
    }
    if (!age || Number(age) <= 0) {
      setError('กรุณากรอกอายุที่ถูกต้อง');
      return;
    }
    if (!height || Number(height) <= 0) {
      setError('กรุณากรอกส่วนสูงที่ถูกต้อง');
      return;
    }

    onUpdateClient({
      ...editingClient,
      name: name.trim(),
      gender,
      age: Number(age),
      height: Number(height),
      phone: phone.trim() || undefined,
      note: note.trim() || undefined,
    });

    setEditingClient(null);
    resetForm();
  };

  return (
    <div id="client-selector" className="flex flex-col h-full bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
      {/* Header with Add Client Button */}
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">รายชื่อลูกเทรน</h2>
          <p className="text-xs text-slate-500 mt-1">มีทั้งหมด {clients.length} คนในระบบ</p>
        </div>
        <button
          id="btn-open-add-client"
          onClick={() => {
            resetForm();
            setIsAdding(true);
            setEditingClient(null);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium cursor-pointer shadow-xs transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Plus size={16} />
          เพิ่มลูกเทรน
        </button>
      </div>

      {/* Search Input Box */}
      <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-50">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
          <input
            id="client-search-input"
            type="text"
            placeholder="ค้นหาด้วยชื่อ หรือ เบอร์โทร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all font-light"
          />
        </div>
      </div>

      {/* List / Form Overlay */}
      <div className="flex-1 overflow-y-auto relative min-h-[350px]">
        <AnimatePresence mode="wait">
          {/* Add or Edit Client Modal-like Overlay */}
          {(isAdding || editingClient) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-white z-10 p-6 flex flex-col overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                  {isAdding ? '➕ เพิ่มลูกเทรนใหม่' : '✏️ แก้ไขข้อมูลลูกเทรน'}
                </h3>
                <button
                  id="btn-close-client-form"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingClient(null);
                    resetForm();
                  }}
                  className="p-1 px-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                >
                  ยกเลิก
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl mb-4 font-light animate-pulse">
                  <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={isAdding ? handleSubmit : handleSaveEdit} className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 font-sans">ชื่อ-นามสกุล / ชื่อคนติดต่อ *</label>
                    <input
                      id="input-client-name"
                      type="text"
                      placeholder="เช่น น้องบี, คุณกฤษ"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 font-sans">เพศ * (ใช้คำนวณ BMR & ไขมัน)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        id="gender-male"
                        type="button"
                        onClick={() => setGender('male')}
                        className={`py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          gender === 'male'
                            ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        🚹 ชาย
                      </button>
                      <button
                        id="gender-female"
                        type="button"
                        onClick={() => setGender('female')}
                        className={`py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          gender === 'female'
                            ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        🚺 หญิง
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 font-sans">อายุ * (ปี)</label>
                      <input
                        id="input-client-age"
                        type="number"
                        placeholder="อายุคร่าวๆ"
                        value={age}
                        onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-teal-500"
                        min="1"
                        max="120"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 font-sans">ส่วนสูงปัจจุบัน * (ซม.)</label>
                      <input
                        id="input-client-height"
                        type="number"
                        placeholder="ซม. เพื่อหา BMI"
                        value={height}
                        onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-teal-500"
                        min="100"
                        max="250"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 font-sans">เบอร์โทรศัพท์ (ถ้ามี)</label>
                    <input
                      id="input-client-phone"
                      type="text"
                      placeholder="เช่น 081-XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 font-sans">เป้าหมาย / ปัญหาสุขภาพ / บันทึกเพิ่มเติม</label>
                    <textarea
                      id="input-client-note"
                      placeholder="ความมุ่งมั่น หรือ ปัญหาข้อเข่า เพื่อใช้วิเคราะห์ผล"
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-teal-500 resize-none font-light"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex gap-3 mt-6">
                  <button
                    id="btn-client-form-submit"
                    type="submit"
                    className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-md"
                  >
                    🚀 บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Client List Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="divide-y divide-slate-50"
          >
            {filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <User size={36} className="stroke-1 text-slate-300 mb-3" />
                <p className="text-sm">ไม่พบรายชื่อลูกเทรนในเงื่อนไขการค้นหา</p>
                <button
                  id="btn-add-client-fallback"
                  onClick={() => {
                    resetForm();
                    setIsAdding(true);
                  }}
                  className="mt-3 text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  คลิกเพิ่มเพื่อเริ่มใหม่
                </button>
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClientId === client.id;
                return (
                  <div
                    id={`client-item-${client.id}`}
                    key={client.id}
                    onClick={() => onSelectClient(client.id)}
                    className={`p-4 flex items-center justify-between transition-all cursor-pointer group relative ${
                      isSelected
                        ? 'bg-teal-50/50 border-l-4 border-teal-600 pl-3'
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium ${
                        isSelected
                          ? client.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {client.gender === 'male' ? '🚹' : '🚺'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-teal-700 transition-colors">
                          {client.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          <span>เพศ{client.gender === 'male' ? 'ชาย' : 'หญิง'}</span>
                          <span>•</span>
                          <span>อายุ {client.age} ปี</span>
                          <span>•</span>
                          <span>สูง {client.height} ซม.</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        id={`btn-edit-client-${client.id}`}
                        onClick={(e) => handleStartEdit(client, e)}
                        className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title="แก้ไขโปรไฟล์"
                      >
                        <Edit2 size={13} />
                      </button>
                      <ChevronRight size={16} className={`text-slate-300 transition-transform ${
                        isSelected ? 'translate-x-1 text-teal-600' : 'group-hover:translate-x-1'
                      }`} />
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
