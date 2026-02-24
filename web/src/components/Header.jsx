export default function Header({ meta }) {
  return (
    <div className="card">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:10}}>
        <div>
          <div style={{fontSize:18, fontWeight:900}}>📱 관세 조회 (Mobile)</div>
          <div className="muted" style={{fontSize:12, marginTop:4}}>
            수출국/수입국/품목 기준 관세율을 빠르게 조회합니다.
          </div>
        </div>
        <div className="badge" title="데이터 업데이트 시각">
          ⏱️ <span className="muted" style={{fontSize:12}}>
            {meta?.updatedAt ? new Date(meta.updatedAt).toLocaleString() : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}