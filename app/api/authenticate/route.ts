import { NextRequest, NextResponse } from "next/server";
import { PRIVY_SIWE_BASE_URL, headers } from "../utils";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { message, signature } = await req.json();
  const res = await fetch(`${PRIVY_SIWE_BASE_URL}/authenticate`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      message,
      signature,
    }),
  });
  return NextResponse.json(await res.json());
}
