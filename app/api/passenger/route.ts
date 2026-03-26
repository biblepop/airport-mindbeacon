import { NextResponse } from "next/server";

export const revalidate = 0;

interface HourlyItem {
  hour: string;
  t1Passenger: number;
  t2Passenger: number;
}

function extractRawItems(data: unknown): Record<string, unknown>[] {
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;

  const resBody = (d.response as Record<string, unknown>)?.body as Record<string, unknown> | undefined;
  if (resBody) {
    const ri = (resBody.items as Record<string, unknown>)?.item;
    if (ri) return Array.isArray(ri) ? ri : [ri];
    if (Array.isArray(resBody.items)) return resBody.items as Record<string, unknown>[];
  }

  const body = d.body as Record<string, unknown> | undefined;
  if (body) {
    const bi = (body.items as Record<string, unknown>)?.item;
    if (bi) return Array.isArray(bi) ? bi : [bi];
    if (Array.isArray(body.items)) return body.items as Record<string, unknown>[];
  }

  if (Array.isArray(d.items)) return d.items as Record<string, unknown>[];
  return [];
}

function normalizeItem(item: Record<string, unknown>): HourlyItem | null {
  let hourStr = "";
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

  const t1 = parseInt(String(
    item.t1Pax ?? item.t1pax ?? item.t1sum ?? item.t1Passenger ?? item.t1 ?? "0"
  ), 10) || 0;
  const t2 = parseInt(String(
    item.t2Pax ?? item.t2pax ?? item.t2sum ?? item.t2Passenger ?? item.t2 ?? "0"
  ), 10) || 0;

  return { hour: `${hourStr.padStart(2, "0")}:00`, t1Passenger: t1, t2Passenger: t2 };
}

// 현실적인 고정 mock (실제 API 실패 시 사용)
const MOCK_HOURLY: HourlyItem[] = [
  { hour: "00:00", t1Passenger:  320, t2Passenger:  280 },
  { hour: "01:00", t1Passenger:  180, t2Passenger:  150 },
  { hour: "02:00", t1Passenger:  120, t2Passenger:   90 },
  { hour: "03:00", t1Passenger:   95, t2Passenger:   75 },
  { hour: "04:00", t1Passenger:  420, t2Passenger:  350 },
  { hour: "05:00", t1Passenger: 1200, t2Passenger:  980 },
  { hour: "06:00", t1Passenger: 2100, t2Passenger: 1750 },
  { hour: "07:00", t1Passenger: 2800, t2Passenger: 2300 },
  { hour: "08:00", t1Passenger: 2650, t2Passenger: 2100 },
  { hour: "09:00", t1Passenger: 2200, t2Passenger: 1850 },
  { hour: "10:00", t1Passenger: 1800, t2Passenger: 1500 },
  { hour: "11:00", t1Passenger: 1650, t2Passenger: 1380 },
  { hour: "12:00", t1Passenger: 1900, t2Passenger: 1600 },
  { hour: "13:00", t1Passenger: 2050, t2Passenger: 1720 },
  { hour: "14:00", t1Passenger: 2300, t2Passenger: 1950 },
  { hour: "15:00", t1Passenger: 2500, t2Passenger: 2100 },
  { hour: "16:00", t1Passenger: 2700, t2Passenger: 2250 },
  { hour: "17:00", t1Passenger: 2900, t2Passenger: 2400 },
  { hour: "18:00", t1Passenger: 3100, t2Passenger: 2600 },
  { hour: "19:00", t1Passenger: 2850, t2Passenger: 2380 },
  { hour: "20:00", t1Passenger: 2400, t2Passenger: 2000 },
  { hour: "21:00", t1Passenger: 1950, t2Passenger: 1630 },
  { hour: "22:00", t1Passenger: 1400, t2Passenger: 1180 },
  { hour: "23:00", t1Passenger:  750, t2Passenger:  620 },
];

export async function GET() {
  console.log("[passenger] 함수 실행됨", new Date().toISOString());
  const apiKey = process.env.AIRPORT_API_KEY;

  const today = new Date();
  const dateStr =
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
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
    console.log("[passenger] extractRawItems:", rawItems.length, "개");

    const items: HourlyItem[] = rawItems
      .map(normalizeItem)
      .filter((x): x is HourlyItem => x !== null)
      .sort((a, b) => a.hour.localeCompare(b.hour));

    console.log("[passenger] 정규화:", items.length, "개");
    if (items.length === 0) throw new Error("정규화된 시간대 데이터 없음");

    return NextResponse.json({ items, _mock: false });
  } catch (error) {
    console.error("[passenger] 실패 → mock:", error);
    return NextResponse.json({ items: MOCK_HOURLY, _mock: true, _error: String(error) });
  }
}
