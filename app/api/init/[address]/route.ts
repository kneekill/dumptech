import { NextRequest, NextResponse } from "next/server";
import { PRIVY_SIWE_BASE_URL, headers } from "../../utils";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = params;
  const res = await fetch(`${PRIVY_SIWE_BASE_URL}/init`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      address,
    }),
  });
  return NextResponse.json(await res.json());
}
