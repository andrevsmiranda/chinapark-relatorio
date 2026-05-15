// POST /api/login → { password }
// Valida APP_PASSWORD env var, seta cookie HMAC, notifica Slack

async function sign(payload, secret) {
  const enc = new TextEncoder();
  const payloadB64 = btoa(JSON.stringify(payload));
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
  return `${payloadB64}.${sig}`;
}

async function notifySlack({ ip, ua, geoCity, geoCountry }) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  const when = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🌅 Acesso ao Relatório Gerencial' },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Quando:*\n${when}` },
        { type: 'mrkdwn', text: `*De onde:*\n${geoCity || '?'}, ${geoCountry || '?'}` },
        { type: 'mrkdwn', text: `*IP:*\n\`${ip}\`` },
        { type: 'mrkdwn', text: `*Navegador:*\n${(ua || '').slice(0, 60)}` },
      ],
    },
  ];
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });
  } catch (e) { console.error('Slack notify failed:', e); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Senha obrigatória' });

  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) return res.status(500).json({ error: 'APP_PASSWORD não configurado' });
  if (password !== appPassword) return res.status(401).json({ error: 'Senha incorreta' });

  const secret = process.env.SESSION_SECRET;
  if (!secret) return res.status(500).json({ error: 'SESSION_SECRET não configurado' });

  const session = { exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }; // 30 dias
  const cookie = await sign(session, secret);

  const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for']?.split(',')[0] || 'desconhecido';
  const ua = req.headers['user-agent'] || '';
  const geoCity = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : null;
  const geoCountry = req.headers['x-vercel-ip-country'] || null;

  notifySlack({ ip, ua, geoCity, geoCountry }).catch(() => {});

  res.setHeader('Set-Cookie', [
    `cp_session=${cookie}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
  ]);
  return res.status(200).json({ ok: true });
}
