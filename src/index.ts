import { handleMcpRequest } from './mcp/server';
import { handleHttpRequest } from './api/routes';
import { resetClient, type Env } from './db/client';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Reset Supabase client per request for Workers isolation
    resetClient();

    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, POST, OPTIONS',
          'access-control-allow-headers': 'content-type',
          'access-control-max-age': '86400',
        },
      });
    }

    let response: Response;

    // MCP endpoint
    if (url.pathname === '/mcp' || url.pathname.startsWith('/mcp/')) {
      response = await handleMcpRequest(request, env);
    } else {
      // HTTP API endpoints
      response = await handleHttpRequest(request, env);
    }

    // Add CORS headers to all responses
    const headers = new Headers(response.headers);
    headers.set('access-control-allow-origin', '*');

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  },
};
