import * as XLSX from "xlsx";
import { normalizeTariffRows } from "../utils/tariffNormalize";

const XLSX_FILE = "datacustoms_logistics_관세전처리.xlsx";

async function safeFetchJSON(url) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (r.ok) return r.json();
  } catch (_) {}
  return null;
}

export async function fetchTariffMeta() {
  const meta = await safeFetchJSON("meta.json");
  if (meta?.updatedAt) return meta;
  return { updatedAt: (import.meta.env.VITE_BUILD_TIME || new Date().toISOString()), fileName: XLSX_FILE };
}

export async function fetchTariffData() {
  const meta = await fetchTariffMeta();
  const url = `${encodeURI(XLSX_FILE)}?v=${encodeURIComponent(meta.updatedAt)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("xlsx fetch failed");

  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheetName = wb.SheetNames.includes("Tariffs") ? "Tariffs" : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

  const normalized = normalizeTariffRows(rows);
  return { meta, rows: normalized };
}