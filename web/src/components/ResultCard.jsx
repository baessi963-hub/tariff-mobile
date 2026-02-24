export default function ResultCard({ selectedRow, selectionLabel }) {
  if (!selectedRow) {
    return (
      <div className="card">
        <div style={{fontWeight:900, fontSize:15, lineHeight:1}}>✅ 결과</div>
        <div className="muted" style={{marginTop:8}}>
          수출국/수입국/품목(필요 시 세부/재질)을 선택하세요.
        </div>
      </div>
    );
  }
  const genPct = selectedRow.일반관세 != null ? selectedRow.일반관세 * 100 : null;
  const agrPct = selectedRow.협정관세 != null ? selectedRow.협정관세 * 100 : null;
  return (
    <div className="card">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:10}}>
        <div style={{fontWeight:900, fontSize:15, lineHeight:1}}>✅ 결과</div>
        <div className="badge">{selectionLabel}</div>
      </div>
      <div className="kpis" style={{marginTop:12}}>
        <div className="kpi">
          <div className="title">일반 관세율</div>
          <div className="value">{genPct == null ? "—" : `${genPct.toFixed(1)}%`}</div>
        </div>
        <div className="kpi">
          <div className="title">HS Code</div>
          <div className="value">{selectedRow.HS || "—"}</div>
        </div>
        <div className="kpi">
          <div className="title">협정 관세율</div>
          <div className="value">{selectedRow.협정 && agrPct != null ? `${agrPct.toFixed(1)}%` : "—"}</div>
        </div>
        <div className="kpi">
          <div className="title">협정명</div>
          <div className="value" style={{fontSize:16}}>{selectedRow.협정 || "—"}</div>
        </div>
      </div>

      {selectedRow.MS코멘트 ? (
        <div style={{
          marginTop:12, padding:"12px 14px", borderRadius:10,
          background:"rgba(0,0,0,0.03)", border:"1px solid #e5e7eb", color:"#fff"
        }}>
          <div style={{fontWeight:800, color:"#fff", marginBottom:6}}>🧩 MS관세 Comment</div>
          <div style={{lineHeight:1.55, fontWeight:500, color:"#fff"}}>{selectedRow.MS코멘트}</div>
        </div>
      ) : null}
    </div>
  );
}