import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import Filters from "./components/Filters.jsx";
import ResultCard from "./components/ResultCard.jsx";
import CompareChart from "./components/CompareChart.jsx";
import { fetchTariffData } from "./api/tariffs.js";

const PLACEHOLDER = "-선택-";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const [state, setState] = useState({
    exporter: PLACEHOLDER,
    importer: PLACEHOLDER,
    item: PLACEHOLDER,
    detail: PLACEHOLDER,
    material: PLACEHOLDER
  });

  const reset = () => setState({
    exporter: PLACEHOLDER,
    importer: PLACEHOLDER,
    item: PLACEHOLDER,
    detail: PLACEHOLDER,
    material: PLACEHOLDER
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { meta, rows } = await fetchTariffData();
        setMeta(meta);
        setRows(rows);
      } catch (e) {
        setErr(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedRow = useMemo(() => {
    const { exporter, importer, item, detail, material } = state;
    const baseOk = exporter !== PLACEHOLDER && importer !== PLACEHOLDER && item !== PLACEHOLDER;
    if (!baseOk) return null;

    const detailCandidates = Array.from(new Set(
      rows.filter(r => r.수출국 === exporter && r.수입국 === importer && r.품목 === item)
          .map(r => r.세부품목).filter(Boolean)
    ));
    const requireDetail = (detailCandidates.length > 0);

    const mats = rows
      .filter(r => (r.수출국 === exporter) && (r.수입국 === importer) && (r.품목 === item))
      .map(r => r.재질).filter(Boolean);
    const materialCandidates = Array.from(new Set(mats));
    const requireMaterial = materialCandidates.length > 0 && (item === "Module" || requireDetail);

    if (requireDetail && detail === PLACEHOLDER) return null;
    if (requireMaterial && material === PLACEHOLDER) return null;

    let filtered = rows.filter(r => r.수출국 === exporter && r.수입국 === importer && r.품목 === item);
    if (requireDetail) filtered = filtered.filter(r => r.세부품목 === detail);
    if (requireMaterial) filtered = filtered.filter(r => r.재질 === material);

    return filtered.length ? filtered[0] : null;
  }, [rows, state]);

  const selectionLabel = useMemo(() => {
    const { exporter, importer, item, detail, material } = state;
    const parts = [];
    if (exporter !== PLACEHOLDER) parts.push(exporter);
    if (importer !== PLACEHOLDER) parts.push(`➜ ${importer}`);
    const sub = [];
    if (item !== PLACEHOLDER) sub.push(item);
    if (detail !== PLACEHOLDER) sub.push(`세부: ${detail}`);
    if (material !== PLACEHOLDER) sub.push(`재질: ${material}`);
    const right = sub.length ? `(${sub.join(" · ")})` : "";
    return parts.length ? `${parts.join(" ")} ${right}`.trim() : "미선택";
  }, [state]);

  return (
    <div className="container">
      <Header meta={meta} />

      {loading ? (
        <div className="card">⏳ 관세 데이터를 불러오는 중...</div>
      ) : err ? (
        <div className="card">
          <div style={{fontWeight:900}}>❌ 로딩 실패</div>
          <div className="muted" style={{marginTop:8, whiteSpace:"pre-wrap"}}>{err}</div>
        </div>
      ) : (
        <>
          <Filters rows={rows} state={state} setState={setState} onReset={reset} />
          <ResultCard selectedRow={selectedRow} selectionLabel={selectionLabel} />
          <CompareChart rows={rows} state={state} />
          <div className="card notice">
            <div style={{fontWeight:900, fontSize:14, marginBottom:6}}>⚠️ 주의 사항</div>
            <div>
              1) 본 대시보드의 HS code와 실제 수입 시 적용되는 HS code는 상이할 수 있습니다.<br/>
              2) 특혜 관세 적용에는 원산지 충족 및 원산지증명서 구비가 필요합니다. (미충족 시 기본관세율 적용)<br/>
              3) 협정/관세정책 변화에 따라 관세율이 수시로 변동될 수 있으니, 반드시 수입법인을 통해 Cross check 바랍니다.<br/>
              4) 복합물품 분류는 관세율표 규정에 따라 추가 검토가 필요합니다.
            </div>
          </div>
        </>
      )}
    </div>
  );
}