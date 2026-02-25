export default function ResultCard({ selectedRow, selectionLabel }) {
  // selectionLabel 예: "한국 ➜ 중국 (Module · 세부: LCD · 재질: Glass)" 형태
  const SelectionLine = () => (
    <div className="muted" style={{ marginTop: 6, fontSize: 12, lineHeight: 1.35 }}>
      {selectionLabel || "미선택"}
    </div>
  );

  if (!selectedRow) {
    return (
      <div className="card">
        <div style={{ fontWeight: 900, fontSize: 15, lineHeight: 1 }}>✅ 결과</div>
        <SelectionLine />
        <div className="muted" style={{ marginTop: 8 }}>
          수출국/수입국/품목(필요 시 세부/재질)을 선택하세요.
        </div>
      </div>
    );
  }

  const genPct = selectedRow.일반관세 != null ? selectedRow.일반관세 * 100 : null;
  const agrPct = selectedRow.협정관세 != null ? selectedRow.협정관세 * 100 : null;

  const hasAgreementValue = selectedRow.협정 && agrPct != null;
  const agreementName = (selectedRow.협정 || "").trim();
  const agreementDesc = (selectedRow.설명 || "").trim();

  return (
    <div className="card">
      {/* 제목 + 선택 요약을 "제목 바로 아래"에 배치 */}
      <div style={{ fontWeight: 900, fontSize: 15, lineHeight: 1 }}>✅ 결과</div>
      <SelectionLine />

      {/* KPI 영역 */}
      <div className="kpis" style={{ marginTop: 12 }}>
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
          <div className="value">{hasAgreementValue ? `${agrPct.toFixed(1)}%` : "—"}</div>
        </div>
        <div className="kpi">
          {/* ✅ 요청: '협정명' → '💡 협정' 으로 라벨 변경 */}
          <div className="title">💡 협정</div>
          <div className="value" style={{ fontSize: 16 }}>{agreementName || "—"}</div>
        </div>
      </div>

      {/* 협정 상세 설명: 협정관세율이 있는 경우만 노출 */}
      {hasAgreementValue && agreementName && agreementDesc ? (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          {/* ✅ 요청: '협정명 :' → '💡 협정' */}
          <div style={{ fontWeight: 800, marginBottom: 6 }}>💡 협정</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            <b>{agreementName}</b>
            <br />
            <span className="muted">{agreementDesc}</span>
          </div>
        </div>
      ) : null}

      {/* MS 관세 코멘트 (있을 때만) */}
      {selectedRow.MS코멘트 ? (
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            borderRadius: 10,
            background: "rgba(0, 0, 0, 0.03)",
            border: "1px solid #e5e7eb",
            color: "#fff",
          }}
        >
          <div style={{ fontWeight: 800, color: "#fff", marginBottom: 6 }}>🧩 MS관세 Comment</div>
          <div style={{ lineHeight: 1.55, fontWeight: 500, color: "#fff" }}>{selectedRow.MS코멘트}</div>
        </div>
      ) : null}
    </div>
  );
}