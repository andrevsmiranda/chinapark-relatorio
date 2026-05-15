export default function handler(req, res) {
  res.setHeader('Set-Cookie', [
    'cp_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    'cp_auth=; Path=/; SameSite=Lax; Max-Age=0'
  ]);
  res.redirect(302, '/');
}
