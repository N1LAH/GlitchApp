import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Fresh visitors (no glitch_started cookie) get sent to /start at the edge,
 * before the lab hub is ever rendered. A client-side redirect can't avoid
 * painting the hub for a frame first — this can, because it runs before any
 * HTML for "/" is generated.
 */
export function middleware(request: NextRequest) {
  const hasStarted = request.cookies.has("glitch_started");
  if (!hasStarted) {
    return NextResponse.redirect(new URL("/start", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
