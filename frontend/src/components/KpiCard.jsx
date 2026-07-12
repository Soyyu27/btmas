const KpiCard = ({ label, value, sublabel, accent }) => {
  return (
    <div className="col">
      <div
        className="p-3 h-100"
        style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }}
      >
        <div style={{ fontSize: '11.5px', letterSpacing: '1px', color: '#8A93A6', textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </div>
        <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 700, color: accent || '#1D2433', marginTop: '6px' }}>
          {value}
        </div>
        {sublabel && (
          <div style={{ fontSize: '12px', color: '#8A93A6', marginTop: '2px' }}>{sublabel}</div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;