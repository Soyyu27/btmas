// utils/produkMap.js

// Mapping rule-based: VXPDES -> { produk, kategori }
// Key HARUS uppercase, exact match (deskripsi harus sama persis)
const VXPDES_MAP = {
  // ===== TELCO =====
  'PEMBAYARAN TSEL POST': { produk: 'TELKOMSEL', kategori: 'TELCO' },
  'PEMBAYARAN TSEL PREPAID': { produk: 'TELKOMSEL', kategori: 'TELCO' },
  'PEMBAYARAN TSEL OMNI': { produk: 'TELKOMSEL', kategori: 'TELCO' },
  'PEMBAYARAN TSEL INTERNET': { produk: 'TELKOMSEL', kategori: 'TELCO' },
  'PEMBAYARAN TELKOMSEL COMBO': { produk: 'TELKOMSEL', kategori: 'TELCO' },
  'PEMBAYARAN TELKOMSEL POST': { produk: 'TELKOMSEL', kategori: 'TELCO' },
  'PEMBAYARAN TELKOMSEL PRE MULTI': { produk: 'TELKOMSEL', kategori: 'TELCO' },
  'PEMBAYARAN XL POST FINNET': { produk: 'XL', kategori: 'TELCO' },
  'PEMBAYARAN XL PRE FINNET': { produk: 'XL', kategori: 'TELCO' },
  'PEMBAYARAN THREE PRE FINNET': { produk: 'THREE', kategori: 'TELCO' },
  'SMARTFREN PREPAID FINNET': { produk: 'SMARTFREN', kategori: 'TELCO' },
  'TELKOMPAY/JASTEL FINNET': { produk: 'TELKOMPAY', kategori: 'TELCO' },
  'PEMBAYARAN INDOSAT MATRIX': { produk: 'INDOSAT', kategori: 'TELCO' },
  'PEMBAYARAN INDOSAT IM3': { produk: 'INDOSAT', kategori: 'TELCO' },

  // ===== LISTRIK =====
  'PAY PLN POSTPAID TUNAI': { produk: 'PLN', kategori: 'LISTRIK' },
  'PAY PLN PREPAID TUNAI': { produk: 'PLN', kategori: 'LISTRIK' },
  'PEMBAYARAN PLN NONTAGLIS': { produk: 'PLN', kategori: 'LISTRIK' },
  'PEMBAYARAN PLN POSTPAID': { produk: 'PLN', kategori: 'LISTRIK' },
  'PEMBAYARAN PLN PREPAID': { produk: 'PLN', kategori: 'LISTRIK' },

  // ===== AIR =====
  'PAYMENT PDAM ATB BATAM': { produk: 'PDAM', kategori: 'AIR' },

  // ===== E-WALLET =====
  'PAYMENT OVO': { produk: 'OVO', kategori: 'EWALLET' },
  'PAYMENT LINKAJA': { produk: 'LINKAJA', kategori: 'EWALLET' },
  'PAYMENT ISAKU': { produk: 'ISAKU', kategori: 'EWALLET' },
  'PAYMENT GOPAY': { produk: 'GOPAY', kategori: 'EWALLET' },
  'PAYMENT EMONEY': { produk: 'EMONEY', kategori: 'EWALLET' },
  'PAYMENT SHOPEE PAY': { produk: 'SHOPEEPAY', kategori: 'EWALLET' },

  // ===== PAJAK / RETRIBUSI =====
  'PEMBAYARAN PBB ON US': { produk: 'PBB', kategori: 'PAJAK_RETRIBUSI' },
  'PEMBAYARAN PHRI ON US': { produk: 'PHRI', kategori: 'PAJAK_RETRIBUSI' },
  'PEMBAYARAN MPNG2': { produk: 'MPN G2', kategori: 'PAJAK_RETRIBUSI' },

  // ===== ASURANSI / JAMINAN SOSIAL =====
  'PAYMENT BPJS': { produk: 'BPJS', kategori: 'ASURANSI_JAMINAN' },

  // ===== TRAVEL =====
  'PAYMENT LIONAIR': { produk: 'LION AIR', kategori: 'TRAVEL' },

  // ===== TAGIHAN LAIN =====
  'PEMBAYARAN NON TAGLIST': { produk: 'NON TAGLIST', kategori: 'TAGIHAN_LAIN' },
  'PEMBAYARAN NONTAGLIS': { produk: 'NON TAGLIST', kategori: 'TAGIHAN_LAIN' },
};

// Partial map tetap dipertahankan sebagai FALLBACK/JARING PENGAMAN,
// kalau nanti ada deskripsi baru yang mirip tapi tidak persis sama
// dengan yang ada di VXPDES_MAP (misal beda tanda baca / typo minor)
const VXPDES_PARTIAL_MAP = {
  'TSEL': { produk: 'TELKOMSEL', kategori: 'TELCO' },
  'TELKOMSEL': { produk: 'TELKOMSEL', kategori: 'TELCO' },
  'INDOSAT': { produk: 'INDOSAT', kategori: 'TELCO' },
  'XL': { produk: 'XL', kategori: 'TELCO' },
  'THREE': { produk: 'THREE', kategori: 'TELCO' },
  'SMARTFREN': { produk: 'SMARTFREN', kategori: 'TELCO' },
  'TELKOMPAY': { produk: 'TELKOMPAY', kategori: 'TELCO' },
  'PLN': { produk: 'PLN', kategori: 'LISTRIK' },
  'PDAM': { produk: 'PDAM', kategori: 'AIR' },
  'GOPAY': { produk: 'GOPAY', kategori: 'EWALLET' },
  'OVO': { produk: 'OVO', kategori: 'EWALLET' },
  'LINKAJA': { produk: 'LINKAJA', kategori: 'EWALLET' },
  'ISAKU': { produk: 'ISAKU', kategori: 'EWALLET' },
  'SHOPEE': { produk: 'SHOPEEPAY', kategori: 'EWALLET' },
  'EMONEY': { produk: 'EMONEY', kategori: 'EWALLET' },
  'PBB': { produk: 'PBB', kategori: 'PAJAK_RETRIBUSI' },
  'PHRI': { produk: 'PHRI', kategori: 'PAJAK_RETRIBUSI' },
  'MPN': { produk: 'MPN G2', kategori: 'PAJAK_RETRIBUSI' },
  'BPJS': { produk: 'BPJS', kategori: 'ASURANSI_JAMINAN' },
  'LIONAIR': { produk: 'LION AIR', kategori: 'TRAVEL' },
  'TAGLIS': { produk: 'NON TAGLIST', kategori: 'TAGIHAN_LAIN' },
  'TRANSFER': { produk: 'TRANSFER', kategori: 'TRANSFER' },
  'TARIK TUNAI': { produk: 'TARIK TUNAI', kategori: 'CASH' },
};

function getProdukKategori(vxpdes) {
  if (!vxpdes) return { produk: 'UNKNOWN', kategori: 'UNKNOWN' };

  const key = vxpdes.toString().trim().toUpperCase();

  // 1. Exact match dulu (prioritas tertinggi, sesuai 32 deskripsi asli kamu)
  if (VXPDES_MAP[key]) {
    return VXPDES_MAP[key];
  }

  // 2. Kalau tidak exact match, coba partial match (jaring pengaman)
  for (const partial in VXPDES_PARTIAL_MAP) {
    if (key.includes(partial)) {
      return VXPDES_PARTIAL_MAP[partial];
    }
  }
  
  // 3. Tidak ketemu sama sekali
  return { produk: 'UNKNOWN', kategori: 'UNKNOWN' };
}

module.exports = { getProdukKategori, VXPDES_MAP, VXPDES_PARTIAL_MAP };