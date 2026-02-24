function formatYMD(dateLike) {
  try {
    const d = new Date(dateLike);
    if (isNaN(d.getTime())) return "—";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1);
    const day = String(d.getDate());
    return `${y}.${m}.${day}`;
  } catch {
    return "—";
  }
}

export default function Header({ meta }) {
  const ymd = meta?.updatedAt ? formatYMD(meta.updatedAt) : "—";
  return (
    <div className="card">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:10}}>
        <div>
          <div style={{fontSize:18, fontWeight:900}}>📱 관세 조회 (Mobile)</div>
          <div className="muted" style={{fontSize:12, marginTop:4}}>
            수출국/수입국/품목 기준 관세율을 빠르게 조회합니다.
          </div>
        </div>
        <div className="badge" title="데이터 업데이트 일자">
          ⏱️ <span className="muted" style={{fontSize:12}}>
            업데이트 날짜 : {ymd}
          </span>
        </div>
      </div>
    </div>
  );
}