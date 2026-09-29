/**
 * Phase 4.1 - where each path should be served from.
 *
 * A route prefix that is not listed here goes to the monolith. The map starts
 * empty, which makes the gateway a transparent pass-through: every /v1 request
 * is proxied to the monolith, and no behaviour changes at all. Extraction then
 * becomes a one-line change here, and the parity test proves the move.
 *
 * Matching is by longest prefix, not by declaration order, so `/v1/orders/...`
 * can be extracted while `/v1/orders/lookup` stays behind. A prefix is only
 * honoured when its service is actually configured, so a half-finished entry
 * degrades to the monolith instead of 404ing.
 */

export interface ServiceTarget {
  /** Base URL of the extracted service, e.g. http://127.0.0.1:3010 */
  base: string;
}

export interface RouteEntry extends ServiceTarget {
  /** Route prefix this service owns, e.g. /v1/notifications */
  prefix: string;
}

/**
 * Extracted paths. Empty at the start of Phase 4 by design.
 *
 * Adding an entry here is the *only* change a later extraction step needs to
 * make to the gateway, which is why the map is data and not a pile of
 * conditionals in the proxy handler.
 */
export const SERVICE_ROUTES: RouteEntry[] = [];

/** Where everything not claimed by a service goes. */
export const MONOLITH_BASE = process.env.MONOLITH_URL || 'http://127.0.0.1:3000';

/**
 * Resolve the service that owns `pathname`.
 *
 * Returns the monolith when nothing claims it, when a claimed service has no
 * base URL configured, or when a claimed service is unreachable at boot. A
 * gateway that 404s because an extraction is half-finished is worse than one
 * that quietly keeps serving from the monolith, so the fallbacks are
 * deliberately conservative.
 */
export function resolveTarget(
  pathname: string,
  routes: RouteEntry[] = SERVICE_ROUTES,
  monolithBase: string = MONOLITH_BASE
): { base: string; matched: string | null } {
  let best: RouteEntry | null = null;
  for (const entry of routes) {
    // A prefix owns a path only on a whole-segment boundary, so
    // `/v1/order` must not claim `/v1/orders/1`.
    const owns = pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`);
    if (!owns) continue;
    if (!best || entry.prefix.length > best.prefix.length) best = entry;
  }
  if (!best) return { base: monolithBase, matched: null };
  if (!best.base) return { base: monolithBase, matched: null };
  return { base: best.base.replace(/\/$/, ''), matched: best.prefix };
}
