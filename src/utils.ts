import { Client, BodyRecord } from './types';

// Calculate computed body composition values
export function calculateComputedValues(params: {
  weight: number;
  height: number;
  bodyFatPercent: number;
  musclePercent: number;
  age: number;
  gender: 'male' | 'female';
}): { bmi: number; fatMass: number; muscleMass: number; bmr: number } {
  const { weight, height, bodyFatPercent, musclePercent, age, gender } = params;

  // 1. BMI = weight(kg) / (height(m) * height(m))
  const heightInMeters = height / 100;
  const bmi = heightInMeters > 0 ? weight / (heightInMeters * heightInMeters) : 0;

  // 2. Fat Mass = weight * (%fat / 100)
  const fatMass = weight * (bodyFatPercent / 100);

  // 3. Muscle Mass = weight * (%muscle / 100)
  const muscleMass = weight * (musclePercent / 100);

  // 4. BMR (Mifflin-St Jeor Formula)
  // Men: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + 5
  // Women: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) - 161
  let bmr = 0;
  if (weight > 0 && height > 0 && age > 0) {
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  return {
    bmi: parseFloat(bmi.toFixed(2)),
    fatMass: parseFloat(fatMass.toFixed(2)),
    muscleMass: parseFloat(muscleMass.toFixed(2)),
    bmr: Math.round(bmr),
  };
}

// Get BMI Classification
export function getBmiStatus(bmi: number): { label: string; color: string; bg: string } {
  if (bmi < 18.5) return { label: 'น้ำหนักน้อย / ผอม', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (bmi < 23.0) return { label: 'น้ำหนักปกติ / สมส่วน', color: 'text-green-600', bg: 'bg-green-50' };
  if (bmi < 25.0) return { label: 'น้ำหนักเกิน (ท้วม)', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  if (bmi < 30.0) return { label: 'โรคอ้วนระดับ 1', color: 'text-orange-600', bg: 'bg-orange-50' };
  return { label: 'โรคอ้วนระดับ 2 (อันตราย)', color: 'text-red-600', bg: 'bg-red-50' };
}

// Get Visceral Fat Classification
export function getVisceralFatStatus(level: number): { label: string; color: string; bg: string } {
  if (level <= 4) return { label: 'ดีเยี่ยม (Excellent)', color: 'text-green-600', bg: 'bg-green-50' };
  if (level <= 9) return { label: 'ปกติ (Healthy)', color: 'text-teal-600', bg: 'bg-teal-50' };
  if (level <= 14) return { label: 'สูงปานกลาง (High)', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  return { label: 'สูงมาก (Dangerous)', color: 'text-red-600', bg: 'bg-red-50' };
}

// Get Body Fat % Classification
export function getBodyFatStatus(percent: number, gender: 'male' | 'female'): { label: string; color: string; bg: string } {
  if (gender === 'male') {
    if (percent < 8) return { label: 'ต่ำเกินไป (Too Low)', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (percent <= 19) return { label: 'ดีเยี่ยม / สุขภาพดี', color: 'text-green-600', bg: 'bg-green-50' };
    if (percent <= 24) return { label: 'ปกติ / พอใช้', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'ไขมันสูง / อ้วน', color: 'text-red-600', bg: 'bg-red-50' };
  } else {
    if (percent < 21) return { label: 'ต่ำเกินไป (Too Low)', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (percent <= 32) return { label: 'ดีเยี่ยม / สุขภาพดี', color: 'text-green-600', bg: 'bg-green-50' };
    if (percent <= 38) return { label: 'ปกติ / พอใช้', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'ไขมันสูง / อ้วน', color: 'text-red-600', bg: 'bg-red-50' };
  }
}

// Generate sample data for first-time onboarding of training application
export function generateSampleData(): { clients: Client[]; records: BodyRecord[] } {
  const sampleClients: Client[] = [
    {
      id: 'client-1',
      name: 'น้องบี (ลูกเทรนตัวอย่าง)',
      gender: 'female',
      age: 26,
      height: 162,
      phone: '081-234-5678',
      note: 'เป้าหมาย: ลดเปอร์เซ็นต์ไขมัน เพิ่มมวลกล้ามเนื้อและกระชับสัดส่วน มีอาการตึงไหล่เล็กน้อย',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'client-2',
      name: 'คุณนพ (ลูกเทรนตัวอย่าง)',
      gender: 'male',
      age: 32,
      height: 175,
      phone: '089-987-6543',
      note: 'เป้าหมาย: สร้างกล้ามเนื้อและพัฒนาความแข็งแกร่งของร่างกายส่วนล่าง',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];

  // History dates: today, 2 weeks ago, 4 weeks ago, 6 weeks ago
  const now = new Date();
  const getPastDateString = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const sampleRecords: BodyRecord[] = [
    // Client 1: Female, 26 yo, height 162
    {
      id: 'rec-1-1',
      clientId: 'client-1',
      date: getPastDateString(42),
      weight: 64.2,
      height: 162,
      bodyFatPercent: 33.5,
      musclePercent: 23.1,
      visceralFat: 7,
      bodyAge: 31,
      ...calculateComputedValues({ weight: 64.2, height: 162, bodyFatPercent: 33.5, musclePercent: 23.1, age: 26, gender: 'female' }),
      armCircumference: 29.5,
      waistCircumference: 31.5,
      thighCircumference: 22.0,
      note: 'ชั่งน้ำหนักช่วงเช้า วันแรกของการเทรน มีไขมันช่องท้องและไขมันร่างกายระดับปานกลางค่อนสูง',
    },
    {
      id: 'rec-1-2',
      clientId: 'client-1',
      date: getPastDateString(28),
      weight: 62.8,
      height: 162,
      bodyFatPercent: 31.8,
      musclePercent: 23.8,
      visceralFat: 6,
      bodyAge: 29,
      ...calculateComputedValues({ weight: 62.8, height: 162, bodyFatPercent: 31.8, musclePercent: 23.8, age: 26, gender: 'female' }),
      armCircumference: 29.0,
      waistCircumference: 30.5,
      thighCircumference: 21.6,
      note: 'หลังคุมอาหารและคาร์ดิโอ สัดส่วนเริ่มดีขึ้น น้ำหนักและไขมันร่างกายลดลงอย่างเหมาะสม',
    },
    {
      id: 'rec-1-3',
      clientId: 'client-1',
      date: getPastDateString(14),
      weight: 61.5,
      height: 162,
      bodyFatPercent: 29.5,
      musclePercent: 24.5,
      visceralFat: 5,
      bodyAge: 27,
      ...calculateComputedValues({ weight: 61.5, height: 162, bodyFatPercent: 29.5, musclePercent: 24.5, age: 26, gender: 'female' }),
      armCircumference: 28.2,
      waistCircumference: 29.8,
      thighCircumference: 21.1,
      note: 'พัฒนาได้ยอดเยี่ยม มวลกล้ามเนื้อเพิ่มขึ้นชัดเจนและการขับถ่ายดีขึ้นมาก',
    },
    {
      id: 'rec-1-4',
      clientId: 'client-1',
      date: getPastDateString(0),
      weight: 60.1,
      height: 162,
      bodyFatPercent: 27.2,
      musclePercent: 25.4,
      visceralFat: 4,
      bodyAge: 24,
      ...calculateComputedValues({ weight: 60.1, height: 162, bodyFatPercent: 27.2, musclePercent: 25.4, age: 26, gender: 'female' }),
      armCircumference: 27.5,
      waistCircumference: 28.5,
      thighCircumference: 20.4,
      note: 'ตรวจมวลร่างกายล่าสุด: รูปร่างเปลี่ยนไปอย่างชัดเจน เอวลดลงไป 2 นิ้ว ไขมันลงสวยงาม!',
    },

    // Client 2: Male, 32 yo, height 175
    {
      id: 'rec-2-1',
      clientId: 'client-2',
      date: getPastDateString(21),
      weight: 79.5,
      height: 175,
      bodyFatPercent: 24.8,
      musclePercent: 32.1,
      visceralFat: 11,
      bodyAge: 36,
      ...calculateComputedValues({ weight: 79.5, height: 175, bodyFatPercent: 24.8, musclePercent: 32.1, age: 32, gender: 'male' }),
      armCircumference: 36.5,
      waistCircumference: 35.8,
      thighCircumference: 23.5,
      note: 'เริ่มต้นเทรน ไขมันสะสมหน้าท้องระดับเกณฑ์แดง ไขมันสะสมช่องท้อง (Visceral) ค่อนข้างดีดสูง',
    },
    {
      id: 'rec-2-2',
      clientId: 'client-2',
      date: getPastDateString(10),
      weight: 78.4,
      height: 175,
      bodyFatPercent: 23.1,
      musclePercent: 33.2,
      visceralFat: 10,
      bodyAge: 34,
      ...calculateComputedValues({ weight: 78.4, height: 175, bodyFatPercent: 23.1, musclePercent: 33.2, age: 32, gender: 'male' }),
      armCircumference: 36.2,
      waistCircumference: 34.6,
      thighCircumference: 23.1,
      note: 'น้ำหนักลง ไขมันร่างกายเริ่มลดลง มวลกล้ามเนื้อเพิ่มขึ้นจากการเน้นเวทเทรนนิ่งไฮเปอร์โทรฟี่',
    },
    {
      id: 'rec-2-3',
      clientId: 'client-2',
      date: getPastDateString(0),
      weight: 77.2,
      height: 175,
      bodyFatPercent: 21.4,
      musclePercent: 34.5,
      visceralFat: 9,
      bodyAge: 31,
      ...calculateComputedValues({ weight: 77.2, height: 175, bodyFatPercent: 21.4, musclePercent: 34.5, age: 32, gender: 'male' }),
      armCircumference: 36.6,
      waistCircumference: 33.2,
      thighCircumference: 22.8,
      note: 'ผลลัพธ์เยี่ยมมาก! ไขมันช่องท้องลดลงเหลือเลขเดี่ยว (9) มวลร่างกายลีนขึ้นกระชับขึ้น',
    }
  ];

  return { clients: sampleClients, records: sampleRecords };
}
