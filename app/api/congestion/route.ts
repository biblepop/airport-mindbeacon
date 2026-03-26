import { NextResponse } from "next/server";

export const revalidate = 0;

interface GateItem {
  gateId?: string;
  terminalId?: string;
  waitTime?: string;
  waitLength?: string;
}

const T1_ITEMS: GateItem[] = [
  { gateId: "DG1_E", terminalId: "P01", waitTime: "5",  waitLength: "12" },
  { gateId: "DG2_E", terminalId: "P01", waitTime: "12", waitLength: "35" },
  { gateId: "DG3_E", terminalId: "P01", waitTime: "22", waitLength: "68" },
  { gateId: "DG4_W", terminalId: "P01", waitTime: "3",  waitLength: "8"  },
  { gateId: "DG5_W", terminalId: "P01", waitTime: "15", waitLength: "42" },
  { gateId: "DG6_W", terminalId: "P01", waitTime: "7",  waitLength: "20" },
];

const T2_ITEMS: GateItem[] = [
  { gateId: "DG1_E", terminalId: "P02", waitTime: "6",  waitLength: "18" },
  { gateId: "DG2_E", terminalId: "P02", waitTime: "14", waitLength: "44" },
  { gateId: "DG3_W", terminalId: "P02", waitTime: "9",  waitLength: "25" },
  { gateId: "DG4_W", terminalId: "P02", waitTime: "11", waitLength: "31" },
];

const ALL_ITEMS = [...T1_ITEMS, ...T2_ITEMS];
const TOTAL_PAX = ALL_ITEMS.reduce((s, i) => s + parseInt(i.waitLength ?? "0", 10), 0); // 303

export async function GET() {
  return NextResponse.json({
    body: { items: ALL_ITEMS, totalCount: ALL_ITEMS.length },
    t1Items: T1_ITEMS,
    t2Items: T2_ITEMS,
    totalPax: TOTAL_PAX,
    _mock: true,
  });
}
