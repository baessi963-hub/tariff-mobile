function trim(v) { return String(v ?? "").trim(); }
function toNumber(v) {
  const s = trim(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function hsIntString(v) {
  const s = trim(v);
  if (!s) return "-";
  const noDot = s.includes(".") ? s.split(".")[0] : s;
  const n = Number(noDot);
  if (!Number.isFinite(n)) return "-";
  return String(Math.trunc(n));
}
export function pct1(rate) {
  if (rate == null) return "";
  const n = Number(rate);
  return Number.isFinite(n) ? `${(n*100).toFixed(1)}%` : "";
}

/** 정규화: Streamlit 컬럼과 매칭 */
export function normalizeTariffRows(rows) {
  const mapped = rows.map((r) => {
    const exportCountry = trim(r["수출국"] ?? r["Export"] ?? r["exporter"]);
    const importCountry = trim(r["수입국"] ?? r["Import"] ?? r["importer"]);
    const item = trim(r["품목"] ?? r["Item"]);
    const detail = trim(r["세부 품목"] ?? r["세부품목"] ?? r["Detail"]);
    const material = trim(r["재질"] ?? r["Material"]);
    const hs = hsIntString(r["HS code"] ?? r["HS"] ?? r["HSCode"]);
    const genRate = toNumber(r["일반 관세"] ?? r["General Tariff"]);
    const agr = trim(r["협정"] ?? r["Agreement"]);
    const agrRate = toNumber(r["협정 관세"] ?? r["Agreement Tariff"]);
    const desc = trim(r["설명"] ?? r["Description"]);
    const msComment = trim(r["MS관세 Comment"] ?? r["MS Comment"] ?? r["MS_Comment"]);
    return {
      수출국: exportCountry,
      수입국: importCountry,
      품목: item,
      세부품목: detail,
      재질: material,
      HS: hs,
      일반관세: genRate,
      협정: agr,
      협정관세: agrRate,
      설명: desc,
      MS코멘트: msComment
    };
  });
  return mapped.filter((x) => x.수출국 || x.수입국 || x.품목);
}