import { NextResponse } from "next/server";

export const revalidate = 0;

interface GateItem {
  gateId?: string;
  terminalId?: string;
  waitTime?: string;
  waitLength?: string;
}

const MOCK_ITEMS: GateItem[] = [
  { gateId: "DG1_E", terminalId: "P01", waitTime: "5",  waitLength: "12" },
  { gateId: "DG2_E", terminalId: "P01", waitTime: "12", waitLength: "35" },
  { gateId: "DG3_E", terminalId: "P01", waitTime: "22", waitLength: "68" },
  { gateId: "DG4_W", terminalId: "P01", waitTime: "3",  waitLength: "8"  },
  { gateId: "DG5_W", terminalId: "P01", waitTime: "15", waitLength: "42" },
  { gateId: "DG6_W", terminalId: "P01", waitTime: "7",  waitLength: "20" },
];

export async function GET() {
  return NextResponse.json({
    body: { items: MOCK_ITEMS, totalCount: MOCK_ITEMS.length },
    totalPax: 185,
    _mock: true,
  });
}
