import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from "recharts";

/** Module 비교용 대표행 추출 (Streamlit 로직 반영) */
function pickRepresentativeRowsForModule(rows, selectedDetail, detailImporters = new Set(["중국", "한국"])) {
  const byImporter = new Map();
  for (const r of rows) {
    const imp = (r.수입국 || "").trim();
    if (!imp) continue;
    if (!byImporter.has(imp)) byImporter.set(imp, []);
    byImporter.get(imp).push(r);
  }
  const out = [];
  for (const [imp, arr] of byImporter.entries()) {
    const blank = (x) => !x || String(x).trim() === "";
    let pick = null;
    if (detailImporters.has(imp)) {
      // 1) 선택한 LCD/OLED 우선
      pick = arr.find(x => String(x.세부품목 || "").trim() === String(selectedDetail || "").trim());
      // 2) 없으면 일반(세부 공백)
      if (!pick) pick = arr.find(x => blank(x.세부품목));
      // 3) 그래도 없으면 첫 행
      if (!pick) pick = arr[0];
    } else {
      // 그 외: 무조건 일반(세부 공백)
      pick = arr.find(x => blank(x.세부품목)) || arr[0];
    }
    if (pick) out.push(pick);
  }
  return out;
}

function buildCompare(rows, state) {
  const { exporter, importer, item, detail, material } = state;
  if (!exporter || exporter === "-선택-" || !item || item === "-선택-") return [];

  // 기본 후보: 같은 수출국 + 같은 품목
  let pool = rows.filter(r => r.수출국 === exporter && r.품목 === item);

  // 특수 케이스: Module + LCD/OLED + (선택 수입국이 중국/한국 중 하나인 경우)
  const isModule = (item === "Module");
  const isLcdOled = ["LCD", "OLED"].includes(String(detail || "").trim());
  const isSpecialImporter = ["중국", "한국"].includes(String(importer || "").trim());

  if (isModule && isLcdOled && isSpecialImporter) {
    pool = pickRepresentativeRowsForModule(pool, detail, new Set(["중국", "한국"]));
  } else {
    // 일반 케이스: 세부/재질 필터(필요 시)
    const detailCandidates = Array.from(new Set(
      rows
        .filter(r => r.수출국 === exporter && r.품목 === item && (!importer || importer === "-선택-" || r.수입국 === importer))
        .map(r => r.세부품목).filter(Boolean)
    ));
    const requireDetail = (detailCandidates.length > 0);
    if (requireDetail && detail && detail !== "-선택-") {
      pool = pool.filter(r => r.세부품목 === detail);
    }
    const materialCandidates = Array.from(new Set(pool.map(r => r.재질).filter(Boolean)));
    const requireMaterial = materialCandidates.length > 0 && (item === "Module" || requireDetail);
    if (requireMaterial && material && material !== "-선택-") {
      pool = pool.filter(r => r.재질 === material);
    }
  }

  // 수입국별 대표 1행
  const byImporter = new Map();
  for (const r of pool) {
    const key = r.수입국 || "";
    if (!key) continue;
    if (!byImporter.has(key)) byImporter.set(key, r);
  }

  const out = Array.from(byImporter.entries()).map(([imp, r]) => ({
    importer: imp,
    general: r.일반관세 != null ? r.일반관세 * 100 : null,
    agreement: (r.협정 && r.협정관세 != null) ? r.협정관세 * 100 : null,
    agrName: (r.협정 || "").trim() || null
  }));
  // 일반 관세 오름차순
  out.sort((a,b) => (a.general ?? 9999) - (b.general ?? 9999));
  return out;
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const g = payload.find(p=>p.dataKey==="general")?.value;
  const a = payload.find(p=>p.dataKey==="agreement")?.value;
  const name = payload.find(p=>p.dataKey==="agreement")?.payload?.agrName;
  return (
    <div className="tooltipCard">
      <div style={{fontWeight:900}}>{label}</div>
      <div style={{fontSize:12, marginTop:6}}>
        일반 관세: {g == null ? "—" : `${g.toFixed(1)}%`}<br/>
        협정 관세: {a == null ? "—" : `${a.toFixed(1)}%`}{name ? ` (${name})` : ""}
      </div>
    </div>
  );
}

/** 라벨 컴포넌트(모바일 축소 시 더 작게 표시) */
function GeneralLabel({ x, y, width, value, fontSize = 12 }) {
  if (value == null) return null;
  const cx = x + width / 2;
  const cy = y - 4; // 더 붙여서 공간 절약
  return (
    <text x={cx} y={cy} textAnchor="middle" fill="#ffffff" fontWeight="800" fontSize={fontSize}>
      {value.toFixed(1)}%
    </text>
  );
}
function AgreementLabel({ x, y, width, value, payload, fontSize = 12, gap = 14 }) {
  if (value == null) return null;
  const name = (payload?.agrName || "").trim();
  const cx = x + width / 2;
  const line1y = y - (gap + fontSize); // 협정명
  const line2y = y - 4;                // 협정 관세값
  return (
    <g>
      {name ? (
        <text x={cx} y={line1y} textAnchor="middle" fill="#5AB0F6" fontWeight="800" fontSize={fontSize}>
          {name}
        </text>
      ) : null}
      <text x={cx} y={line2y} textAnchor="middle" fill="#5AB0F6" fontWeight="800" fontSize={fontSize}>
        {value.toFixed(1)}%
      </text>
    </g>
  );
}

export default function CompareChart({ rows, state }) {
  const data = useMemo(() => buildCompare(rows, state), [rows, state]);

  // 🔎 화면폭 감지로 "축소 모드" 자동 적용
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const update = () => setIsCompact(window.innerWidth <= 420); // 420px 이하면 축소
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!data.length) {
    return (
      <div className="card">
        <div style={{fontWeight:900, fontSize:16}}>📊 수입국별 관세 비교</div>
        <div className="muted" style={{marginTop:8}}>수출국/품목 선택 후 비교 차트가 표시됩니다.</div>
      </div>
    );
  }

  // ⬇️ 축소 모드에서 전반적으로 더 조밀하게
  const cfg = {
    height: isCompact ? 300 : 360,
    perBarWidth: isCompact ? 68 : 100,    
    xLabelAngle: isCompact ? -20 : -25,
    xLabelHeight: isCompact ? 56 : 70,
    fontLabel: isCompact ? 11 : 12,        // 일반막대 라벨
    fontAgreement: isCompact ? 12 : 14,    // 협정 라벨
    gapAgreement: isCompact ? 10 : 14,     // 협정 두 줄 간격
    barSize: isCompact ? 18 : 22,          // 막대 두께 축소
    barGap: isCompact ? 6 : 8,             // 막대 간격 축소
    legendFont: isCompact ? 12 : 12
  };

  // 라벨 자리 확보: 너무 크지 않게 1.20로 상단 여유만 유지
  const maxVal = Math.max(...data.map(d => Math.max(d.general ?? 0, d.agreement ?? 0, 0)));
  const yMax = Math.max(10, Math.ceil(maxVal * 1.20));

  // 가로 스크롤 폭
  const width = Math.max(360, data.length * cfg.perBarWidth);

  return (
    <div className="card">
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        marginBottom:10
      }}>
        <div style={{fontWeight:900, fontSize:16}}>📊 수입국별 관세 비교</div>
        <div className="badge" title={isCompact ? "축소모드(모바일)" : "기본모드"}>
        </div>
      </div>

      <div style={{overflowX:"auto"}}>
        <div style={{width}}>
          <ResponsiveContainer width="100%" height={cfg.height}>
            <BarChart
              data={data}
              margin={{ top: 16, right: 12, left: 6, bottom: isCompact ? 40 : 50 }}
              barSize={cfg.barSize}
              barGap={cfg.barGap}
            >
              <XAxis
                dataKey="importer"
                angle={cfg.xLabelAngle}
                textAnchor="end"
                interval={0}
                height={cfg.xLabelHeight}
                tick={{ fontSize: isCompact ? 11 : 12, fill: "#fff" }}
              />
              <YAxis
                domain={[0, yMax]}
                tickFormatter={(v)=>`${v}%`}
                tick={{ fontSize: isCompact ? 11 : 12, fill: "#fff" }}
              />
              <Tooltip content={<Tip />} />
              <Legend
                wrapperStyle={{ fontSize: cfg.legendFont }}
              />
              <Bar dataKey="general" name="일반 관세(%)" fill="#999999" radius={[6,6,0,0]}>
                <LabelList
                  dataKey="general"
                  content={(props) => <GeneralLabel {...props} fontSize={cfg.fontLabel} />}
                />
              </Bar>
              <Bar dataKey="agreement" name="협정 관세(%)" fill="#A7D8F9" radius={[6,6,0,0]}>
                <LabelList
                  dataKey="agreement"
                  content={(props) => <AgreementLabel {...props} fontSize={cfg.fontAgreement} gap={cfg.gapAgreement} />}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="muted" style={{fontSize:12, marginTop:8, lineHeight:1.45}}>
        - 협정 관세는 협정명/값이 있는 경우만 표시됩니다. <br/>
        - 모바일에서는 축소모드가 자동 적용되고, 좌우 스크롤로 모든 수입국을 확인할 수 있습니다.
      </div>
    </div>
  );
}
