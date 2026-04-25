const SUPABASE_HOST = 'mpbmusdufavfhrqhbfrc.supabase.co';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    url.hostname = SUPABASE_HOST;
    url.protocol = 'https:';
    url.port = '';

    const proxyRequest = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });

    return fetch(proxyRequest);
  },
};
