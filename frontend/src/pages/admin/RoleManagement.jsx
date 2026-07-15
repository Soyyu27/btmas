import { menuConfig } from '../../config/menuConfig';
import KpiCard from '../../components/KpiCard';

const roles = [
  { code: 'admin', name: 'Administrator' },
  { code: 'cabang', name: 'Cabang' },
  { code: 'auditor', name: 'Auditor' },
];

const roleDescription = {
  admin: 'Akses penuh ke seluruh menu, termasuk Master Data dan Administrasi.',
  cabang: 'Akses terbatas pada data cabangnya sendiri, difilter otomatis berdasarkan kode cabang akun.',
  auditor: 'Akses lihat seluruh data (semua cabang) untuk keperluan audit, tanpa akses ubah data.',
};

const CheckMark = ({ active }) => (
  <span style={{ color: active ? '#1F8A5C' : '#D8DBE2', fontWeight: 700, fontSize: '14px' }}>
    {active ? '✓' : '—'}
  </span>
);

const RoleManagement = () => {
  const allItems = menuConfig.flatMap((group) =>
    group.items.map((item) => ({ ...item, group: group.group }))
  );

  // Bangun baris tabel sebagai array flat, hindari <> tanpa key di dalam .map()
  const tableRows = [];
  allItems.forEach((item, idx) => {
    const isFirstInGroup = idx === 0 || allItems[idx - 1].group !== item.group;
    if (isFirstInGroup) {
      tableRows.push(
        <tr key={`group-${item.group}`}>
          <td
            colSpan={roles.length + 1}
            className="ps-3"
            style={{
              fontSize: '10.5px', fontWeight: 700, letterSpacing: '1px',
              color: 'var(--gold)', textTransform: 'uppercase',
              backgroundColor: '#FBFAF8', paddingTop: '10px', paddingBottom: '6px',
            }}
          >
            {item.group}
          </td>
        </tr>
      );
    }
    tableRows.push(
      <tr key={item.path}>
        <td className="ps-3">{item.label}</td>
        {roles.map((r) => (
          <td key={r.code} className="text-center">
            <CheckMark active={item.roles.includes(r.code)} />
          </td>
        ))}
      </tr>
    );
  });

  return (
    <div>
      <h5 className="fw-bold mb-3">Role Management</h5>

      {/* Ringkasan role — pakai KpiCard yang sama dengan Dashboard/Analitik, biar konsisten */}
      <div className="row row-cols-3 g-3 mb-4">
        {roles.map((r) => (
          <KpiCard
            key={r.code}
            label={r.code}
            value={r.name}
            sublabel={roleDescription[r.code]}
            accent="var(--navy-950)"
          />
        ))}
      </div>

      {/* Matriks hak akses — pola tabel sama dengan Master Data / Data Transaksi */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }}>
        <div className="px-3 pt-3 pb-2">
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Matriks Hak Akses Menu</div>
          <div style={{ fontSize: '12px', color: '#8A93A6' }}>Menu yang dapat diakses oleh masing-masing role</div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                <th className="ps-3">Menu</th>
                {roles.map((r) => (
                  <th key={r.code} className="text-center">{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#8A93A6', marginTop: '10px' }}>
        Role bersifat tetap dan tidak dapat dibuat/dihapus bebas — didesain untuk menjaga konsistensi hak akses di seluruh sistem.
      </div>
    </div>
  );
};

export default RoleManagement;