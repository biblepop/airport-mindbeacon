import { NextResponse } from "next/server";

export const revalidate = 0;

interface HourlyItem {
  hour: string;       // "HH:00"
  t1Passenger: number;
  t2Passenger: number;
}

/** 실제 API 응답에서 배열 추출 — 다양한 래핑 구조 대응 */
function extractRawItems(data: unknown): Record<string, unknown>[] {
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;

  // response.body.items.item  (XML→JSON 변환 형태)
  const resBody = (d.response as Record<string, unknown>)?.body as Record<string, unknown> | undefined;
  if (resBody) {
    const ri = (resBody.items as Record<string, unknown>)?.item;
    if (ri) return Array.isArray(ri) ? ri : [ri];
    if (Array.isArray(resBody.items)) return resBody.items as Record<string, unknown>[];
  }

  // body.items.item
  const body = d.body as Record<string, unknown> | undefined;
  if (body) {
    const bi = (body.items as Record<string, unknown>)?.item;
    if (bi) return Array.isArray(bi) ? bi : [bi];
    if (Array.isArray(body.items)) return body.items as Record<string, unknown>[];
  }

  // items 직접
  if (Array.isArray(d.items)) return d.items as Record<string, unknown>[];

  return [];
}

/** 단일 row → HourlyItem 정규화 */
function normalizeItem(item: Record<string, unknown>): HourlyItem | null {
  // --- 시간 추출 ---
  let hourStr = "";

  // paxmon: "YYYYMMDDХХ" 마지막 2자리가 시(時)
  if (typeof item.paxmon === "string" && item.paxmon.length >= 10) {
    hourStr = item.paxmon.slice(-2);
  } else if (typeof item.paxmon === "string" && item.paxmon.length === 2) {
    hourStr = item.paxmon;
  } else if (typeof item.hour === "string") {
    hourStr = item.hour.replace(":00", "").padStart(2, "0");
  } else if (typeof item.hour === "number") {
    hourStr = String(item.hour).padStart(2, "0");
  }

  if (!hourStr || isNaN(Number(hourStr))) return null;

  // --- 승객 수 추출 (필드명 후보 순서대로 시도) ---
  const t1 =
    parseInt(
      String(
        item.t1Pax ?? item.t1pax ?? item.t1sum ?? item.t1Passenger ?? item.t1 ?? "0"
      ),
      10
    ) || 0;

  const t2 =
    parseInt(
      String(
        item.t2Pax ?? item.t2pax ?? item.t2sum ?? item.t2Passenger ?? item.t2 ?? "0"
      ),
      10
    ) || 0;

  return { hour: `${hourStr.padStart(2, "0")}:00`, t1Passenger: t1, t2Passenger: t2 };
}

export async function GET() {
  console.log("[passenger] 함수 실행됨", new Date().toISOString());
  const apiKey = process.env.AIRPORT_API_KEY;
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const url =
    `https://apis.data.go.kr/B551177/PassengerNotice/getPassengerNotice` +
    `?serviceKey=${apiKey}&numOfRows=24&pageNo=1&type=json&paxmon=${dateStr}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    console.log("[passenger] HTTP status:", res.status);

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const rawText = await res.text();
    console.log("[passenger] 응답 전체:\n", rawText);

    const data = JSON.parse(rawText);
    console.log("[passenger] 파싱된 data:", JSON.stringify(data, null, 2));

    const rawItems = extractRawItems(data);
    console.log("[passenger] extractRawItems 결과:", rawItems.length, "개", rawItems);

    const items: HourlyItem[] = rawItems
      .map(normalizeItem)
      .filter((x): x is HourlyItem => x !== null)
      .sort((a, b) => a.hour.localeCompare(b.hour));

    console.log("[passenger] 정규화 items:", items.length, "개", items);

    if (items.length === 0) throw new Error("정규화된 시간대 데이터 없음");

    return NextResponse.json({ items, _mock: false });
  } catch (error) {
    console.error("[passenger] 실패 → mock 반환:", error);

    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, "0")}:00`,
      t1Passenger: Math.floor(Math.random() * 3000 + 500),
      t2Passenger: Math.floor(Math.random() * 2500 + 400),
    }));
    return NextResponse.json({ items: hours, _mock: true, _error: String(error) });
  }
}
