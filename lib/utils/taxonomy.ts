/**
 * TAXONOMY DATA MAPPING
 * 
 * This file provides a comprehensive mapping of Industries, Geographical Locations (Provinces and Cities),
 * and Functional Roles used for standardizing data across the platform.
 * 
 * Purpose:
 * 1. Data Normalization for CRM Contacts
 * 2. Demographic Targeting in Campaigns
 * 3. Consistent Analytics Reporting
 */

export const INDUSTRY_TAXONOMY = {
  "TECHNOLOGY": {
    "SOFTWARE_DEVELOPMENT": ["SaaS", "Mobile Apps", "Enterprise Software", "Gaming"],
    "HARDWARE": ["Semiconductors", "Peripherals", "Networking Equipment"],
    "IT_SERVICES": ["Consulting", "Managed Services", "Cybersecurity", "Cloud Computing"],
    "ARTIFICIAL_INTELLIGENCE": ["Machine Learning", "NLP", "Computer Vision", "Robotics"],
    "FINTECH": ["Payment Gateways", "Digital Banking", "Crypto/Blockchain", "Lending Platforms"],
    "E_COMMERCE": ["B2C Marketplace", "B2B Supply Chain", "Direct to Consumer", "Dropshipping"]
  },
  "FINANCE": {
    "BANKING": ["Retail Banking", "Investment Banking", "Corporate Finance", "Wealth Management"],
    "INSURANCE": ["Life Insurance", "Health Insurance", "General Insurance", "Reinsurance"],
    "ASSET_MANAGEMENT": ["Hedge Funds", "Private Equity", "Mutual Funds", "Venture Capital"],
    "ACCOUNTING": ["Audit", "Taxation", "Bookkeeping", "Forensic Accounting"]
  },
  "HEALTHCARE": {
    "MEDICAL_DEVICES": ["Diagnostic Equipment", "Surgical Tools", "Prosthetics"],
    "PHARMACEUTICALS": ["Drug Development", "Generic Medicines", "Biotechnology"],
    "HEALTH_SERVICES": ["Hospitals", "Specialized Clinics", "Telemedicine", "Senior Care"],
    "WELLNESS": ["Fitness Technology", "Dietary Supplements", "Mental Health Platforms"]
  },
  "MANUFACTURING": {
    "AUTOMOTIVE": ["Electric Vehicles", "Spare Parts", "Heavy Machinery", "Public Transport"],
    "TEXTILES": ["Fashion Apparel", "Industrial Fibers", "Smart Fabrics"],
    "CONSUMER_GOODS": ["FMCG", "Electronics", "Home Appliances", "Furniture"],
    "AEROSPACE": ["Civil Aviation", "Defense Systems", "Satellite Technology"]
  },
  "EDUCATION": {
    "EDTECH": ["LMS Platforms", "Online Courses", "Virtual Classrooms"],
    "INSTITUTIONS": ["Primary Schools", "Higher Education", "Vocational Training"],
    "RESEARCH": ["Academic Journals", "Scientific Labs", "Social Studies"]
  },
  "HORECA": {
    "HOTELS": ["Luxury Resorts", "Business Hotels", "Boutique Stays"],
    "RESTAURANTS": ["Fine Dining", "Fast Food Chains", "Cafes/Bistro", "Cloud Kitchens"],
    "TOURISM": ["Travel Agencies", "Event Management", "Leisure Parks"]
  }
};

export const GEOGRAPHIC_TAXONOMY = {
  "INDONESIA": {
    "ACEH": ["Banda Aceh", "Langsa", "Lhokseumawe", "Sabang", "Subulussalam", "Aceh Besar", "Aceh Jaya", "Aceh Tengah"],
    "BALI": ["Denpasar", "Badung", "Bangli", "Buleleng", "Gianyar", "Jembrana", "Karangasem", "Klungkung", "Tabanan"],
    "BANTEN": ["Serang", "Cilegon", "Tangerang", "Tangerang Selatan", "Lebak", "Pandeglang"],
    "BENGKULU": ["Bengkulu", "Bengkulu Selatan", "Bengkulu Tengah", "Bengkulu Utara", "Kaur", "Kepahiang"],
    "DIY": ["Yogyakarta", "Bantul", "Gunungkidul", "Kulon Progo", "Sleman"],
    "DKI_JAKARTA": ["Jakarta Pusat", "Jakarta Utara", "Jakarta Timur", "Jakarta Selatan", "Jakarta Barat", "Kepulauan Seribu"],
    "GORONTALO": ["Gorontalo", "Boalemo", "Bone Bolango", "Pohuwato"],
    "JAMBI": ["Jambi", "Sungaipenuh", "Batanghari", "Bungo", "Kerinci", "Merangin", "Muaro Jambi"],
    "JAWA_BARAT": ["Bandung", "Banjar", "Bekasi", "Bogor", "Cimahi", "Cirebon", "Depok", "Sukabumi", "Tasikmalaya", "Ciamis", "Cianjur", "Garut", "Indramayu", "Karawang", "Kuningan", "Majalengka", "Pangandaran", "Purwakarta", "Subang", "Sumedang"],
    "JAWA_TENGAH": ["Semarang", "Salatiga", "Surakarta", "Magelang", "Pekalongan", "Tegal", "Banyumas", "Batang", "Blora", "Boyolali", "Brebes", "Cilacap", "Demak", "Grobogan", "Jepara", "Karanganyar", "Kebumen", "Kendal", "Klaten", "Kudus", "Pati", "Pemalang", "Purbalingga", "Purworejo", "Rembang", "Sragen", "Sukoharjo", "Temanggung", "Wonogiri", "Wonosobo"],
    "JAWA_TIMUR": ["Surabaya", "Batu", "Blitar", "Kediri", "Madiun", "Malang", "Mojokerto", "Pasuruan", "Probolinggo", "Bangkalan", "Banyuwangi", "Bojonegoro", "Bondowoso", "Gresik", "Jember", "Jombang", "Lamongan", "Lumajang", "Magetan", "Nganjuk", "Ngawi", "Pacitan", "Pamekasan", "Ponorogo", "Sampang", "Sidoarjo", "Situbondo", "Sumenep", "Trenggalek", "Tuban", "Tulungagung"],
    "KALIMANTAN_BARAT": ["Pontianak", "Singkawang", "Bengkayang", "Kapuas Hulu", "Kayong Utara", "Ketapang", "Kubu Raya"],
    "KALIMANTAN_SELATAN": ["Banjarmasin", "Banjarbaru", "Balangan", "Banjar", "Barito Kuala", "Hulu Sungai Selatan"],
    "KALIMANTAN_TENGAH": ["Palangka Raya", "Barito Selatan", "Barito Timur", "Barito Utara", "Gunung Mas", "Kapuas"],
    "KALIMANTAN_TIMUR": ["Samarinda", "Balikpapan", "Bontang", "Berau", "Kutai Barat", "Kutai Kartanegara"],
    "KALIMANTAN_UTARA": ["Tarakan", "Bulungan", "Malinau", "Nunukan", "Tana Tidung"],
    "KEP_BANGKA_BELITUNG": ["Pangkalpinang", "Bangka", "Bangka Barat", "Bangka Selatan", "Bangka Tengah", "Belitung"],
    "KEP_RIAU": ["Tanjungpinang", "Batam", "Bintan", "Karimun", "Kepulauan Anambas", "Lingga", "Natuna"],
    "LAMPUNG": ["Bandar Lampung", "Metro", "Lampung Barat", "Lampung Selatan", "Lampung Tengah", "Lampung Timur"],
    "MALUKU": ["Ambon", "Tual", "Buru", "Buru Selatan", "Kepulauan Aru", "Maluku Barat Daya"],
    "MALUKU_UTARA": ["Ternate", "Tidore Kepulauan", "Halmahera Barat", "Halmahera Tengah", "Halmahera Timur"],
    "NTB": ["Mataram", "Bima", "Dompu", "Lombok Barat", "Lombok Tengah", "Lombok Timur", "Lombok Utara"],
    "NTT": ["Kupang", "Alor", "Belu", "Ende", "Flores Timur", "Lembata", "Malaka", "Manggarai"],
    "PAPUA": ["Jayapura", "Asmat", "Biak Numfor", "Boven Digoel", "Deiyai", "Dogiyai", "Intan Jaya"],
    "PAPUA_BARAT": ["Sorong", "Fakfak", "Kaimana", "Manokwari", "Manokwari Selatan", "Maybrat"],
    "RIAU": ["Pekanbaru", "Dumai", "Bengkalis", "Indragiri Hilir", "Indragiri Hulu", "Kampar", "Kepulauan Meranti"],
    "SULAWESI_BARAT": ["Majene", "Mamasa", "Mamuju", "Mamuju Tengah", "Mamuju Utara", "Polewali Mandar"],
    "SULAWESI_SELATAN": ["Makassar", "Palopo", "Parepare", "Bantaeng", "Barru", "Bone", "Bulukumba", "Enrekang"],
    "SULAWESI_TENGAH": ["Palu", "Banggai", "Banggai Kepulauan", "Banggai Laut", "Buol", "Donggala", "Morowali"],
    "SULAWESI_TENGGARA": ["Kendari", "Baubau", "Bombana", "Buton", "Buton Selatan", "Buton Tengah", "Buton Utara"],
    "SULAWESI_UTARA": ["Manado", "Bitung", "Kotamobagu", "Tomohon", "Bolaang Mongondow", "Minahasa"],
    "SUMATERA_BARAT": ["Padang", "Bukittinggi", "Padangpanjang", "Pariaman", "Payakumbuh", "Sawahlunto", "Solok"],
    "SUMATERA_SELATAN": ["Palembang", "Lubuklinggau", "Pagar Alam", "Prabumulih", "Banyuasin", "Empat Lawang"],
    "SUMATERA_UTARA": ["Medan", "Binjai", "Gunungsitoli", "Padangsidimpuan", "Pematangsiantar", "Sibolga", "Tanjungbalai", "Tebing Tinggi"]
  }
};

export const ROLE_TAXONOMY = {
  "EXECUTIVE": ["CEO", "CTO", "CFO", "COO", "CMO", "CIO", "CHRO", "Founder", "Managing Director"],
  "MANAGEMENT": ["General Manager", "Department Head", "Regional Manager", "Branch Manager", "Operations Manager"],
  "SALES_MARKETING": ["Account Manager", "Sales Representative", "Marketing Coordinator", "SEO Specialist", "Digital Marketer"],
  "ENGINEERING": ["Software Engineer", "Systems Architect", "QA Tester", "Product Manager", "UI/UX Designer", "DevOps Engineer"],
  "ADMINISTRATION": ["Office Manager", "HR Generalist", "Executive Assistant", "Receptionist", "Procurement Officer"],
  "FINANCE_LEGAL": ["Chartered Accountant", "Legal Counsel", "Financial Analyst", "Compliance Officer", "Internal Auditor"]
};

/**
 * Normalization Helpers
 */

export const normalizeIndustry = (input: string): string => {
  const normalized = input.toUpperCase().replace(/\s+/g, '_');
  for (const sector in INDUSTRY_TAXONOMY) {
    if (sector === normalized) return sector;
    for (const category in (INDUSTRY_TAXONOMY as any)[sector]) {
      if (category === normalized) return category;
      if ((INDUSTRY_TAXONOMY as any)[sector][category].some((s: string) => s.toUpperCase().replace(/\s+/g, '_') === normalized)) {
        return normalized;
      }
    }
  }
  return "OTHER";
};

export const normalizeLocation = (input: string): { province?: string; city?: string } => {
  const normalized = input.toUpperCase().trim();
  for (const province in GEOGRAPHIC_TAXONOMY.INDONESIA) {
    if (province.replace('_', ' ') === normalized) return { province };
    const cities = (GEOGRAPHIC_TAXONOMY.INDONESIA as any)[province];
    for (const city of cities) {
      if (city.toUpperCase() === normalized) return { province, city };
    }
  }
  return {};
};

export const getIndustryBreadcrumb = (category: string): string[] => {
  for (const sector in INDUSTRY_TAXONOMY) {
    const categories = (INDUSTRY_TAXONOMY as any)[sector];
    if (Object.keys(categories).includes(category)) {
      return [sector, category];
    }
  }
  return ["OTHER"];
};
