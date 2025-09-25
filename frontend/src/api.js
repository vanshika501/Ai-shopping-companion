const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = {
  async request(path, { method = 'GET', body, headers = {} } = {}) {
    const opts = {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    if (body !== undefined) {
      opts.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const res = await fetch(`${BASE_URL}${path}`, opts); // 👈 prefix backend URL
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json().catch(() => ({})) : await res.text();

    if (!res.ok) {
      const msg = (isJson && data && (data.message || data.error)) || res.statusText || 'Request failed';
      throw new Error(msg);
    }
    return data;
  },
  get(path) { return this.request(path); },
  post(path, body) { return this.request(path, { method: 'POST', body }); },
};
