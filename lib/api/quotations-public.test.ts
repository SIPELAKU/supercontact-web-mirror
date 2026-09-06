import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  QuotationPublicApiError,
  acceptPublicQuotation,
  getPublicQuotation,
  publicQuotationUrl,
  PUBLIC_ACCEPT_NAME_MAX,
} from './quotations-public';

/**
 * The public acceptance client is the ONE api module in this repo that must
 * never carry a credential, and the one whose error statuses are load-bearing:
 *
 *  - NO `Authorization` header, ever. The opaque 22-character `public_code` in
 *    the path is the sole authority (spec A30). Reaching for
 *    `lib/utils/axiosClient.ts` here - the reflex everywhere else in the app -
 *    would attach the SIGNED-IN TENANT USER'S token to a page rendered for
 *    their customer.
 *  - 404 (dead or unknown link) and 409 (already decided) have to stay
 *    distinguishable on the client, because they are different messages to a
 *    customer, even though the API deliberately refuses to distinguish an
 *    unknown code from an expired one.
 */

const API_ROOT = 'https://api.example.test/api/v1';

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = API_ROOT;
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** The headers the module actually sent, as a lower-cased plain object. */
function sentHeaders(callIndex = 0): Record<string, string> {
  const init = fetchMock.mock.calls[callIndex]?.[1] ?? {};
  const raw = (init.headers ?? {}) as Record<string, string>;
  return Object.fromEntries(Object.entries(raw).map(([key, value]) => [key.toLowerCase(), value]));
}

describe('getPublicQuotation', () => {
  it('never attaches an Authorization header', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: true, data: { quotation_number: 'QUO-1', lines: [] } })
    );
    await getPublicQuotation('abc123');

    const headers = sentHeaders();
    expect(headers.authorization).toBeUndefined();
    // Nothing that could smuggle a credential in under another name either.
    expect(Object.keys(headers)).toEqual(['accept']);
  });

  it('calls the API host directly, not the /api/proxy route', async () => {
    // Going through the proxy would collapse every visitor onto ONE address,
    // which is both the recorded `accepted_ip` and the per-IP rate limit
    // (spec A31 / I8).
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: {} }));
    await getPublicQuotation('abc123');

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toBe(`${API_ROOT}/public/quotations/abc123`);
    expect(url).not.toContain('/api/proxy');
  });

  it('percent-encodes the code rather than pasting it into the path', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: {} }));
    await getPublicQuotation('a/b?c');
    expect(String(fetchMock.mock.calls[0][0])).toBe(`${API_ROOT}/public/quotations/a%2Fb%3Fc`);
  });

  it('unwraps the {success, data, error} envelope', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        success: true,
        data: { quotation_number: 'QUO-2026-0007', company_display_name: 'PT Contoh' },
        error: null,
      })
    );
    const result = await getPublicQuotation('abc123');
    expect(result.quotation_number).toBe('QUO-2026-0007');
    expect(result.company_display_name).toBe('PT Contoh');
  });

  it('keeps 404 and 410 distinguishable from 409 on the thrown error', async () => {
    for (const status of [404, 410, 409, 429, 500]) {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ success: false, error: { message: 'nope' } }, status)
      );
      await expect(getPublicQuotation('abc123')).rejects.toMatchObject({
        name: 'QuotationPublicApiError',
        status,
      });
    }
  });

  it('treats a 200 carrying success:false as a failure, not as data', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: false, error: { message: 'gone' } }, 200));
    await expect(getPublicQuotation('abc123')).rejects.toBeInstanceOf(QuotationPublicApiError);
  });

  it('fails loudly when NEXT_PUBLIC_API_URL is unset instead of hitting a relative URL', async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    await expect(getPublicQuotation('abc123')).rejects.toBeInstanceOf(QuotationPublicApiError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('acceptPublicQuotation', () => {
  it('posts JSON with no Authorization header', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        success: true,
        data: { accepted: true, accepted_at: '2026-09-05T00:00:00Z', quotation_number: 'QUO-1' },
      })
    );
    const result = await acceptPublicQuotation('abc123', { name: 'Budi' });

    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe('POST');
    expect(sentHeaders().authorization).toBeUndefined();
    expect(JSON.parse(init.body)).toEqual({ name: 'Budi' });
    expect(String(fetchMock.mock.calls[0][0])).toBe(`${API_ROOT}/public/quotations/abc123/accept`);
    expect(result.accepted).toBe(true);
  });

  it('caps the name at the length the API enforces before any DB work', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: {} }));
    await acceptPublicQuotation('abc123', { name: 'x'.repeat(500) });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.name).toHaveLength(PUBLIC_ACCEPT_NAME_MAX);
  });

  it('surfaces 409 as its own status so "already decided" is not shown as a dead link', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: false, error: { message: 'sudah diputuskan' } }, 409)
    );
    await expect(acceptPublicQuotation('abc123', { name: 'Budi' })).rejects.toMatchObject({
      status: 409,
      message: 'sudah diputuskan',
    });
  });
});

describe('publicQuotationUrl', () => {
  it('builds the /q/{code} path and encodes the code', () => {
    // No `window` under the node test environment, so the origin is empty and
    // the path is what is asserted - which is the part a route rename breaks.
    expect(publicQuotationUrl('abc123')).toBe('/q/abc123');
    expect(publicQuotationUrl('a/b')).toBe('/q/a%2Fb');
  });

  it('returns null for a quotation that has no code yet', () => {
    // `public_code` is minted only when the quotation first reaches `sent`
    // (A6), so a draft legitimately has none and must not be handed a link
    // that would 404 for the customer.
    expect(publicQuotationUrl(null)).toBeNull();
    expect(publicQuotationUrl(undefined)).toBeNull();
    expect(publicQuotationUrl('')).toBeNull();
  });
});
