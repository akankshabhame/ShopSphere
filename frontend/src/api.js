const BASE = import.meta.env.VITE_API_URL || '/api';
export const getToken = () => localStorage.getItem('ss_token');
export const setToken = (t) => (t ? localStorage.setItem('ss_token', t) : localStorage.removeItem('ss_token'));

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: 'Bearer ' + getToken() } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const fdate = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const discountOf = (p) => (p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0);
export const FREE_SHIPPING_ABOVE = 499;
export const SHIPPING_FEE = 49;
