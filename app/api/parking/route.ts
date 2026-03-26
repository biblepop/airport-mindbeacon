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

/** 응답에서 주차장 항목 배열 추출 */
function extractItems(data: unknown): Record<string, unknown>[] {
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;

  type Nested = Record<string, unknown>;
  const response = d.response as Nested | undefined;
  const resBody = response?.body as Nested | undefined;
  const resItems = resBody?.items as Nested | undefined;
  const body = d.body as Nested | undefined;
  const bodyItems = body?.items as Nested | undefined;

  const tryPaths = [
    () => {
      const item = resItems?.item;
      if (item) return Array.isArray(item) ? item : [item];
    },
    () => {
      const item = bodyItems?.item;
      if (item) return Array.isArray(item) ? item : [item];
    },
    () => Array.isArray(resBody?.items) ? resBody?.items as unknown[] : null,
    () => Array.isArray(body?.items) ? body?.items as unknown[] : null,
    () => Array.isArray(d.items) ? d.items : null,
  ];

  for (const fn of tryPaths) {
    const result = fn();
    if (result && result.length > 0) return result as Record<string, unknown>[];
  }
  return [];
}

/** 단일 row → ParkingItem */
function normalizeItem(item: Record<string, unknown>): ParkingItem | null {
  const name = String(
    item.pkgNm ?? item.pkNm ?? item.parkNm ?? item.name ?? item.floor ?? ""
  );
  if (!name) return null;

  const total =
    toNum(item.totalCnt ?? item.pkTotalCnt ?? item.total ?? item.cntTotal ?? 0);
  const used =
    toNum(item.usedCnt ?? item.pkUsedCnt ?? item.used ?? item.cntUsed ?? 0);
  const remain =
    toNum(item.remainCnt ?? item.pkRemainCnt ?? item.remain ?? item.cntRemain ?? 0);

  const actualUsed = used > 0 ? used : total > 0 ? total - remain : 0;
  if (total === 0) return null;

  const usageRate = Math.round((actualUsed / total) * 100);
  return { name, total, used: actualUsed, usageRate, status: getStatus(usageRate) };
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

    // 파싱 경로 순서대로 시도
    type Nested = Record<string, unknown>;
    const body = (data as Nested)?.body as Nested | undefined;
    const resBody = ((data as Nested)?.response as Nested | undefined)?.body as Nested | undefined;

    console.log("[parking] data.body.items:", JSON.stringify(body?.items));
    console.log("[parking] data.response.body.items:", JSON.stringify(resBody?.items));
    console.log("[parking] data.body.items.item:", JSON.stringify((body?.items as Nested | undefined)?.item));
    console.log("[parking] data.items:", JSON.stringify((data as Nested)?.items));

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
