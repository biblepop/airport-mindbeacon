import { NextResponse } from "next/server";

export const revalidate = 0;

export interface ParkingItem {
  name: string;
  total: number;
  used: number;
  usageRate: number;
  status: "원활" | "보통" | "혼잡";
}

function getStatus(rate: number): "원활" | "보통" | "혼잡" {
  if (rate >= 80) return "혼잡";
  if (rate >= 60) return "보통";
  return "원활";
}

function toNum(v: unknown): number {
  return parseInt(String(v ?? "0"), 10) || 0;
}

/** 응답에서 주차장 항목 배열 추출: data.response.body.items → 배열 직접 */
function extractItems(data: unknown): Record<string, unknown>[] {
  if (!data || typeof data !== "object") return [];
  type N = Record<string, unknown>;
  const d = data as N;
  const items = ((d.response as N | undefined)?.body as N | undefined)?.items;
  if (Array.isArray(items)) return items as N[];
  return [];
}

/** 단일 row → ParkingItem
 *  floor      = 주차장 이름
 *  parking    = 현재 주차 차량수
 *  parkingarea = 총 주차면수
 */
function normalizeItem(item: Record<string, unknown>): ParkingItem | null {
  const name = String(item.floor ?? "");
  if (!name) return null;

  const used  = toNum(item.parking);
  const total = toNum(item.parkingarea);
  if (total === 0) return null;

  const usageRate = Math.round((used / total) * 100);
  return { name, total, used, usageRate, status: getStatus(usageRate) };
}

const MOCK_ITEMS: ParkingItem[] = [
  { name: "T1 단기주차장", total: 3200, used: 2240, usageRate: 70, status: "보통" },
  { name: "T1 장기주차장", total: 5100, used: 2856, usageRate: 56, status: "원활" },
  { name: "T2 단기주차장", total: 2400, used: 1920, usageRate: 80, status: "혼잡" },
  { name: "T2 장기주차장", total: 3800, used: 1900, usageRate: 50, status: "원활" },
  { name: "화물터미널",    total:  800, used:  480, usageRate: 60, status: "보통" },
];

export async function GET() {
  console.log("[parking] 함수 실행됨", new Date().toISOString());
  const apiKey = process.env.AIRPORT_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ items: MOCK_ITEMS, _mock: true, _error: "API key missing" });
  }

  const url =
    `https://apis.data.go.kr/B551177/StatusOfParking/getTrackingParking` +
    `?serviceKey=${apiKey}&numOfRows=20&pageNo=1&type=json`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    console.log("[parking] HTTP status:", res.status);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const rawText = await res.text();
    console.log("[parking] 응답 전체:\n", rawText);

    const data = JSON.parse(rawText);
    console.log("[parking] 응답 전체:", JSON.stringify(data));

    const rawItems = extractItems(data);
    console.log("[parking] extractItems 결과:", rawItems.length, "개", JSON.stringify(rawItems));

    const items = rawItems.map(normalizeItem).filter((x): x is ParkingItem => x !== null);
    console.log("[parking] 정규화:", items.length, "개");

    if (items.length === 0) throw new Error("파싱된 주차장 데이터 없음");

    return NextResponse.json({ items, _mock: false });
  } catch (err) {
    console.error("[parking] 실패 → mock:", err);
    return NextResponse.json({ items: MOCK_ITEMS, _mock: true, _error: String(err) });
  }
}
