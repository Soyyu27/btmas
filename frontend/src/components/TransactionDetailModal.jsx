import { formatRupiah, formatChannel } from '../utils/formatters';

const Row = ({ label, value }) => (
  <div className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid #F0F1F4', fontSize: '13px' }}>
    <span className="text-muted">{label}</span>
    <span className="fw-semibold">{value ?? '-'}</span>
  </div>
);

const TransactionDetailModal = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: 'rgba(11,21,38,0.5)', zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: '#fff', borderRadius: '6px', width: '460px', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderBottom: '1px solid #E2E5EB' }}>
          <span style={{ fontSize: '15px', fontWeight: 700 }}>Detail Transaksi</span>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        <div className="px-4 py-2">
          <Row label="Tanggal" value={data.tgl_full} />
          <Row label="Waktu" value={data.vxlctm} />
          <Row label="Channel" value={formatChannel(data.vxchnl)} />
          <Row label="Cabang" value={data.kode_cabang} />
          <Row label="Produk" value={data.produk} />
          <Row label="Kategori" value={data.kategori} />
          <Row label="Deskripsi" value={data.vxpdes} />
          <Row label="Nominal" value={formatRupiah(data.vxamt)} />
          <Row label="Fee" value={formatRupiah(data.vxamfe)} />
          <Row label="Rekening" value={data.vxdbac} />
          <Row label="Issuer (ISBN)" value={data.vxisbn} />
          <Row label="Acquirer (AQBN)" value={data.vxaqbn} />
          <Row label="Status" value={data.vxstat === 'P' ? 'Sukses' : data.vxstat === 'F' ? 'Gagal' : data.vxstat} />
          <Row label="Kode Error" value={data.vxerr} />
        </div>
        <div className="px-4 py-3">
          <button className="btn btn-sm btn-outline-secondary w-100" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;