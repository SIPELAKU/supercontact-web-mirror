export interface DemoEmployee {
  id: number;
  name: string;
  email: string;
  department:
    | 'Engineering'
    | 'Marketing'
    | 'Sales'
    | 'HR'
    | 'Finance'
    | 'Operations';
  status: 'Aktif' | 'Nonaktif' | 'Cuti';
  salary: number; // 5_000_000 - 50_000_000
  age: number; // 22 - 58
  joinDate: Date;
  isRemote: boolean;
  city: string; // 10 kota Indonesia
}

const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
];
const STATUSES = ['Aktif', 'Nonaktif', 'Cuti'];
const CITIES = [
  'Jakarta',
  'Surabaya',
  'Bandung',
  'Medan',
  'Semarang',
  'Makassar',
  'Palembang',
  'Depok',
  'Tangerang',
  'Bogor',
];

export const mockEmployees500: DemoEmployee[] = Array.from(
  { length: 500 },
  (_, i) => ({
    id: i + 1,
    name: `Karyawan ${i + 1}`,
    email: `karyawan${i + 1}@perusahaan.com`,
    department: DEPARTMENTS[i % DEPARTMENTS.length] as DemoEmployee['department'],
    status: STATUSES[i % 3] as DemoEmployee['status'],
    // Random salary between 5,000,000 and 50,000,000
    salary: Math.floor(Math.random() * 45_000_000) + 5_000_000,
    // Random age between 22 and 58
    age: Math.floor(Math.random() * 37) + 22,
    // Random joinDate
    joinDate: new Date(2015 + (i % 9), i % 12, (i % 28) + 1),
    isRemote: i % 3 === 0,
    city: CITIES[i % CITIES.length],
  })
);

export const mockEmployees200: DemoEmployee[] = mockEmployees500.slice(0, 200);

export interface DemoProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  status: 'Aktif' | 'Nonaktif' | 'Draft';
  stock: number;
}

export const initialProducts: DemoProduct[] = Array.from(
  { length: 20 },
  (_, i) => ({
    id: `PROD-${String(i + 1).padStart(3, '0')}`,
    name: `Produk Demo ${i + 1}`,
    sku: `SKU-D-${1000 + i}`,
    price: Math.floor(Math.random() * 900_000) + 100_000,
    status: (i % 4 === 0 ? 'Draft' : i % 5 === 0 ? 'Nonaktif' : 'Aktif') as DemoProduct['status'],
    stock: Math.floor(Math.random() * 500),
  })
);
