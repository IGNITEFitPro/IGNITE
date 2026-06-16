export interface Client {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number; // Age in years
  height: number; // starting height in cm
  phone?: string;
  note?: string;
  createdAt: string;
}

export interface BodyRecord {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  height: number; // cm
  bodyFatPercent: number; // %
  musclePercent: number; // %
  visceralFat: number; // level (1-59)
  bodyAge: number; // years
  
  // Computed values stored or calculated
  bmi: number;
  fatMass: number; // kg
  muscleMass: number; // kg
  bmr: number; // kcal
  note?: string;

  // New Body measurements (Optional to keep legacy compatibility)
  armCircumference?: number; // cm
  waistCircumference?: number; // inches
  thighCircumference?: number; // inches

  // New Before/After photos (stored as small compressed base64 strings)
  frontPhoto?: string;
  leftPhoto?: string;
  rightPhoto?: string;
}

export type MetricKey = 
  | 'weight' 
  | 'bodyFatPercent' 
  | 'musclePercent' 
  | 'visceralFat' 
  | 'bodyAge' 
  | 'bmi' 
  | 'fatMass' 
  | 'muscleMass' 
  | 'bmr'
  | 'armCircumference'
  | 'waistCircumference'
  | 'thighCircumference';

export interface MetricDefinition {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
  gradient: [string, string];
  description: string;
}

export const METRIC_DEFINITIONS: Record<MetricKey, MetricDefinition> = {
  weight: {
    key: 'weight',
    label: 'น้ำหนัก (Weight)',
    unit: 'กก.',
    color: '#3B82F6', // blue
    gradient: ['#60A5FA', '#2563EB'],
    description: 'น้ำหนักตัวรวมทั้งหมดของร่างกาย',
  },
  bodyFatPercent: {
    key: 'bodyFatPercent',
    label: '% ไขมัน (% Body Fat)',
    unit: '%',
    color: '#EF4444', // red
    gradient: ['#F87171', '#DC2626'],
    description: 'ร้อยละของมวลไขมันเมื่อเทียบกับน้ำหนักตัว',
  },
  musclePercent: {
    key: 'musclePercent',
    label: '% กล้ามเนื้อ (% Muscle)',
    unit: '%',
    color: '#10B981', // emerald
    gradient: ['#34D399', '#059669'],
    description: 'ร้อยละของมวลกล้ามเนื้อโครงร่างเมื่อเทียบกับน้ำหนักตัว',
  },
  visceralFat: {
    key: 'visceralFat',
    label: 'ไขมันช่องท้อง (Visceral Fat)',
    unit: 'ระดับ',
    color: '#F59E0B', // amber
    gradient: ['#FBBF24', '#D97706'],
    description: 'ระดับไขมันที่เกาะอยู่รอบอวัยวะภายในช่องท้อง (ค่าปกติควร < 10)',
  },
  bodyAge: {
    key: 'bodyAge',
    label: 'อายุร่างกาย (Body Age)',
    unit: 'ปี',
    color: '#8B5CF6', // purple
    gradient: ['#A78BFA', '#7C3AED'],
    description: 'อายุของสุขภาพร่างกายเมื่อเทียบกับเกณฑ์มาตรฐานทั่วไป',
  },
  bmi: {
    key: 'bmi',
    label: 'ดัชนีมวลกาย (BMI)',
    unit: 'kg/m²',
    color: '#EC4899', // pink
    gradient: ['#F472B6', '#DB2777'],
    description: 'เกณฑ์วัดความสมดุลของน้ำหนักและส่วนสูง (ค่าปกติ 18.5 - 22.9)',
  },
  fatMass: {
    key: 'fatMass',
    label: 'มวลไขมัน (Fat Mass)',
    unit: 'กก.',
    color: '#F97316', // orange
    gradient: ['#FB923C', '#EA580C'],
    description: 'น้ำหนักของไขมันทั้งหมดในร่างกาย',
  },
  muscleMass: {
    key: 'muscleMass',
    label: 'มวลกล้ามเนื้อ (Muscle Mass)',
    unit: 'กก.',
    color: '#14B8A6', // teal
    gradient: ['#2DD4BF', '#0D9488'],
    description: 'น้ำหนักของกล้ามเนื้อมวลร่างกายไม่รวมกระดูกและไขมัน',
  },
  bmr: {
    key: 'bmr',
    label: 'อัตราเผาผลาญ (BMR)',
    unit: 'kcal',
    color: '#6366F1', // indigo
    gradient: ['#818CF8', '#4F46E5'],
    description: 'ปริมาณพลังงานต่ำสุดที่ร่างกายต้องการในแต่ละวันขณะพัก',
  },
  armCircumference: {
    key: 'armCircumference',
    label: 'รอบต้นแขน (Arm)',
    unit: 'ซม.',
    color: '#EC4899', // pink
    gradient: ['#F472B6', '#DB2777'],
    description: 'ขนาดสัดส่วนเส้นรอบวงแขนซ้าย/ขวาในจุดเกณฑ์กว้างสุด',
  },
  waistCircumference: {
    key: 'waistCircumference',
    label: 'รอบเอว (Waist)',
    unit: 'นิ้ว',
    color: '#06B6D4', // cyan
    gradient: ['#22D3EE', '#0891B2'],
    description: 'ขนาดสัดส่วนเส้นรอบเอวระนาบกึ่งกลางสะดือเมื่อปล่อยลมหายใจออก',
  },
  thighCircumference: {
    key: 'thighCircumference',
    label: 'รอบต้นขา (Thigh)',
    unit: 'นิ้ว',
    color: '#F59E0B', // amber
    gradient: ['#FBBF24', '#D97706'],
    description: 'ขนาดสัดส่วนเส้นรอบวงต้นขาในระนาบที่กว้างที่สุด',
  },
};
