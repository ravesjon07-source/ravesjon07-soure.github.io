/**
 * MoyDeklarant Telegram request relay for Cloudflare Workers.
 * Secrets required: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.
 * Optional rate-limit binding: IP_RATE_LIMIT (configured in wrangler.jsonc).
 */
const ALLOWED_ORIGINS = new Set([
  'https://moydeklarant.uz',
  'https://www.moydeklarant.uz',
]);

function jsonResponse(data, status, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function clean(value, maxLength) {
  if (typeof value !== 'string') return '';
  // Keep user input plain text; remove control characters and excessive spaces.
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGINS.has(origin)) {
      return new Response('Forbidden', { status: 403 });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Method not allowed' }, 405, corsHeaders);
    }

    if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) {
      return jsonResponse({ ok: false, error: 'Expected JSON' }, 415, corsHeaders);
    }

    // Optional Cloudflare Workers Rate Limiting binding. Configure it using
    // wrangler.jsonc. Origin checks alone are not bot protection.
    if (env.IP_RATE_LIMIT && typeof env.IP_RATE_LIMIT.limit === 'function') {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const { success } = await env.IP_RATE_LIMIT.limit({ key: 'lead-form:' + ip });
      if (!success) {
        return jsonResponse({ ok: false, error: 'Too many requests' }, 429, corsHeaders);
      }
    }

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > 8000) {
      return jsonResponse({ ok: false, error: 'Request too large' }, 413, corsHeaders);
    }

    let bodyText;
    try {
      bodyText = await request.text();
    } catch {
      return jsonResponse({ ok: false, error: 'Invalid request' }, 400, corsHeaders);
    }

    if (new TextEncoder().encode(bodyText).byteLength > 8000) {
      return jsonResponse({ ok: false, error: 'Request too large' }, 413, corsHeaders);
    }

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return jsonResponse({ ok: false, error: 'Invalid JSON' }, 400, corsHeaders);
    }

    const name = clean(body.name, 100);
    const phone = clean(body.phone, 60);
    const telegram = clean(body.telegram, 100);
    const comment = clean(body.comment, 1000);

    if (!name || !phone) {
      return jsonResponse({ ok: false, error: 'Name and phone are required' }, 400, corsHeaders);
    }

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      // Don't disclose which secret is missing to anonymous visitors.
      console.error('Telegram integration is not configured.');
      return jsonResponse({ ok: false, error: 'Server configuration error' }, 500, corsHeaders);
    }

    const lines = [
      '🆕 Новая заявка с сайта МойДекларант',
      '',
      'Имя: ' + name,
      'Телефон: ' + phone,
    ];
    if (telegram) lines.push('Telegram: ' + telegram);
    if (comment) lines.push('Комментарий: ' + comment);
    lines.push('Время: ' + new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' }));

    try {
      const telegramResponse = await fetch(
        'https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: lines.join('\n'),
          }),
        }
      );

      let result;
      try {
        result = await telegramResponse.json();
      } catch {
        result = null;
      }

      if (!telegramResponse.ok || !result || result.ok !== true) {
        // Only log the HTTP status; never log the token, request body, or customer details.
        console.error('Telegram sendMessage failed. HTTP status:', telegramResponse.status);
        return jsonResponse({ ok: false, error: 'Telegram delivery failed' }, 502, corsHeaders);
      }

      return jsonResponse({ ok: true }, 200, corsHeaders);
    } catch {
      console.error('Telegram request failed due to a network error.');
      return jsonResponse({ ok: false, error: 'Telegram service unavailable' }, 502, corsHeaders);
    }
  },
};
