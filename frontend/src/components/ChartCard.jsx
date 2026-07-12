const ChartCard = ({ title, subtitle, children, action }) => {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #E2E5EB', borderRadius: '6px' }} className="h-100">
      <div className="d-flex align-items-center justify-content-between px-3 pt-3">
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1D2433' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '12px', color: '#8A93A6' }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      <div className="px-2 pb-2">{children}</div>
    </div>
  );
};

export default ChartCard;