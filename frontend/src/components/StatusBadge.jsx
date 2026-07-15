const statusStyle = {
  processing: { bg: '#EAF1FB', color: '#2563EB', label: 'Diproses' },
  success: { bg: '#E6F4EC', color: '#1F8A5C', label: 'Berhasil' },
  partial: { bg: '#FDF3E3', color: '#B7791F', label: 'Sebagian' },
  failed: { bg: '#FBEAE9', color: '#C0392B', label: 'Gagal' },
};

const StatusBadge = ({ status }) => {
  const s = statusStyle[status] || statusStyle.failed;
  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.color,
        fontSize: '11.5px',
        fontWeight: 600,
        padding: '3px 10px',
        borderRadius: '4px',
      }}
    >
      {s.label}
    </span>
  );
};

export default StatusBadge;