import { describe, expect, it } from 'vitest';

import { widgetEmbedUrls } from './widgetEmbed';

describe('widgetEmbedUrls', () => {
  it('our deploys (relative /api/proxy + wss base): the API over https, the WS as is', () => {
    expect(
      widgetEmbedUrls({ apiUrl: '/api/proxy', wsUrl: 'wss://dev-supersales.smartcore.id/api/v1' })
    ).toEqual({
      apiUrl: 'https://dev-supersales.smartcore.id/api/v1',
      wsUrl: 'wss://dev-supersales.smartcore.id/api/v1',
    });
  });

  it('a plain ws:// base gives a plain http:// API (local backend)', () => {
    expect(widgetEmbedUrls({ apiUrl: '/api/proxy', wsUrl: 'ws://127.0.0.1:8000/api/v1' })).toEqual({
      apiUrl: 'http://127.0.0.1:8000/api/v1',
      wsUrl: 'ws://127.0.0.1:8000/api/v1',
    });
  });

  it('an absolute API URL is used as is, with the WS base beside it', () => {
    expect(
      widgetEmbedUrls({ apiUrl: 'https://api.example.com/api/v1', wsUrl: 'wss://ws.example.com/api/v1' })
    ).toEqual({ apiUrl: 'https://api.example.com/api/v1', wsUrl: 'wss://ws.example.com/api/v1' });
  });

  it('an absolute API URL and no WS base: the WS address follows the API', () => {
    expect(widgetEmbedUrls({ apiUrl: 'https://api.example.com/api/v1', wsUrl: '' })).toEqual({
      apiUrl: 'https://api.example.com/api/v1',
      wsUrl: 'wss://api.example.com/api/v1',
    });
  });

  it('trailing slashes and spaces are dropped', () => {
    expect(widgetEmbedUrls({ apiUrl: ' /api/proxy/ ', wsUrl: ' wss://x.example.com/api/v1/ ' })).toEqual({
      apiUrl: 'https://x.example.com/api/v1',
      wsUrl: 'wss://x.example.com/api/v1',
    });
  });

  it('nothing absolute (an empty WS base, as in a fresh .env.local): null, no snippet', () => {
    expect(widgetEmbedUrls({ apiUrl: '/api/proxy', wsUrl: '' })).toBeNull();
    expect(widgetEmbedUrls({ apiUrl: '/api/proxy', wsUrl: undefined })).toBeNull();
    expect(widgetEmbedUrls({ apiUrl: '', wsUrl: '' })).toBeNull();
    expect(widgetEmbedUrls({})).toBeNull();
  });
});
