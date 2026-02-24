const PLACEHOLDER = "-선택-";
function uniqSorted(arr) { 
  return Array.from(new Set(arr.filter(Boolean))).sort((a,b)=>a.localeCompare(b));
}
function ensureOptions(arr, current) {
  const out = [PLACEHOLDER, ...arr.filter(x=>x!==PLACEHOLDER)];
  return out.includes(current) ? out : [PLACEHOLDER, current, ...arr];
}
const ITEM_ORDER = ["Set", "Module", "원소재", "Press", "사출", "압출", "포장"];
function sortItemsWithPriority(items) {
  const s = new Set(items);
  const first = ITEM_ORDER.filter(x => s.has(x));
  const rest = Array.from(s).filter(x=>!ITEM_ORDER.includes(x)).sort((a,b)=>a.localeCompare(b));
  return [...first, ...rest];
}

export default function Filters({ rows, state, setState, onReset }) {
  const { exporter, importer, item, detail, material } = state;

  const exporters = uniqSorted(rows.map(r => r.수출국));
  const importers = exporter && exporter !== PLACEHOLDER
    ? uniqSorted(rows.filter(r => r.수출국 === exporter).map(r => r.수입국))
    : uniqSorted(rows.map(r => r.수입국));

  const itemsRaw = (exporter && exporter !== PLACEHOLDER && importer && importer !== PLACEHOLDER)
    ? uniqSorted(rows.filter(r => r.수출국 === exporter && r.수입국 === importer).map(r => r.품목))
    : uniqSorted(rows.map(r => r.품목));
  const items = sortItemsWithPriority(itemsRaw);

  // 세부품목 후보: 현재 선택에 실제 데이터가 있으면 "필수"
  const detailCandidates = (exporter && exporter !== PLACEHOLDER && importer && importer !== PLACEHOLDER && item && item !== PLACEHOLDER)
    ? uniqSorted(
        rows
          .filter(r => r.수출국 === exporter && r.수입국 === importer && r.품목 === item)
          .map(r => r.세부품목).filter(x => !!x)
      )
    : [];
  const requireDetail = (item && item !== PLACEHOLDER && detailCandidates.length > 0);

  // 재질 후보: (item === "Module" || requireDetail) 조건에서 후보가 있으면 필수
  const baseForMaterial = rows.filter(r => {
    if (exporter && exporter !== PLACEHOLDER && r.수출국 !== exporter) return false;
    if (importer && importer !== PLACEHOLDER && r.수입국 !== importer) return false;
    if (item && item !== PLACEHOLDER && r.품목 !== item) return false;
    if (requireDetail && detail && detail !== PLACEHOLDER && r.세부품목 !== detail) return false;
    return true;
  });
  const materialCandidates = uniqSorted(baseForMaterial.map(r => r.재질).filter(Boolean));
  const requireMaterial = (materialCandidates.length > 0) && (item === "Module" || requireDetail);

  // 후보가 1개면 자동선택
  if (requireMaterial && materialCandidates.length === 1 && state.material !== materialCandidates[0]) {
    setState(prev => ({ ...prev, material: materialCandidates[0] }));
  }

  const set = (patch) => setState(prev => ({ ...prev, ...patch }));

  return (
    <div className="card">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
        <div style={{fontSize:16, fontWeight:900}}>🔎 필터</div>
        <button className="danger" onClick={onReset} style={{maxWidth:120}}>↩️ 초기화</button>
      </div>
      <div className="row two">
        <div>
          <label>수출국</label>
          <select
            value={exporter}
            onChange={(e) => set({ exporter: e.target.value, importer: PLACEHOLDER, item: PLACEHOLDER, detail: PLACEHOLDER, material: PLACEHOLDER })}
          >
            {ensureOptions(exporters, exporter).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label>수입국</label>
          <select
            value={importer}
            onChange={(e) => set({ importer: e.target.value, item: PLACEHOLDER, detail: PLACEHOLDER, material: PLACEHOLDER })}
          >
            {ensureOptions(importers, importer).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="row">
        <div>
          <label>품목</label>
          <select
            value={item}
            onChange={(e) => set({ item: e.target.value, detail: PLACEHOLDER, material: PLACEHOLDER })}
          >
            {ensureOptions(items, item).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="row two">
        <div>
          <label>세부 품목 {requireDetail ? "(필수)" : "(선택)"}</label>
          <select
            value={detail}
            onChange={(e)=> set({ detail: e.target.value, material: PLACEHOLDER })}
            disabled={!requireDetail}
          >
            {ensureOptions(detailCandidates, detail).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label>재질 {requireMaterial ? "(필수)" : "(선택)"}{materialCandidates.length === 1 ? " - 자동선택" : ""}</label>
          <select
            value={material}
            onChange={(e)=> set({ material: e.target.value })}
            disabled={!requireMaterial}
          >
            {ensureOptions(materialCandidates, material).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="muted" style={{fontSize:12, marginTop:10, lineHeight:1.4}}>
        ⚠️ 제품의 정확한 HS Code 확인이 필요합니다. 협정/정책 변화로 관세율이 변동될 수 있습니다.
      </div>
    </div>
  );
}