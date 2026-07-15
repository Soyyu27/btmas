const EmptyState = ({ message = 'Tidak ada data untuk filter ini' }) => (
  <div className="d-flex align-items-center justify-content-center text-center" style={{ height: '260px', color: '#8A93A6', fontSize: '13px' }}>
    {message}
  </div>
);

export default EmptyState;