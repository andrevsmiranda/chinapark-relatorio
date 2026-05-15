// Vercel Edge Middleware (não-Next.js)
// Proteção de rotas via cookie HMAC

export const config = {
  matcher: ['/((?!login.html|api/login|api/logout|favicon).*)'],
};

async function verifySession(cookie, secret) {
  if (!cookie) return null;
  const [payloadB64, sig] = cookie.split('.');
  if (!payloadB64 || !sig) return null;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigBytes = Uint8Array.from(atob(sig), c => c.charCodeAt(0));
    const ok = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payloadB64));
    if (!ok) return null;
    const payload = JSON.parse(atob(payloadB64));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (e) { return null; }
}

export default async function middleware(request) {
  // Parse cookie manualmente
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)cp_session=([^;]+)/);
  const cookie = match ? match[1] : null;
  const secret = process.env.SESSION_SECRET || '';

  const session = await verifySession(cookie, secret);
  if (!session) {
    const url = new URL(request.url);
    const next = url.pathname + url.search;
    return Response.redirect(`${url.origin}/login.html?next=${encodeURIComponent(next)}`, 307);
  }
  return; // continue
}
