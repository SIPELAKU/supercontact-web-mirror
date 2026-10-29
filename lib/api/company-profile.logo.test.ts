import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The company logo is uploaded as multipart (field `file`) and removed with a
// DELETE; both answer with the updated company. Every company write shares one
// response reader, so its errors are covered here too.

import { deleteCompanyLogo, updateCompanyGeneral, uploadCompanyLogo } from './company-profile';

const fetchMock = vi.fn();
const company = { id: 'c1', name: 'Solvera', logo_url: 'https://storage.example/logo.webp', logo_file_id: 'f1' };
const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const lastCall = () => fetchMock.mock.calls.at(-1) as [string, RequestInit];

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('NEXT_PUBLIC_API_URL', '/api/proxy');
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('uploadCompanyLogo', () => {
  it('posts the file as multipart field `file` and returns the updated company', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, data: company, error: null }));
    const logo = new File(['png'], 'logo.png', { type: 'image/png' });

    const result = await uploadCompanyLogo('token-1', logo);

    const [url, init] = lastCall();
    expect(url).toBe('/api/proxy/internal/company-profile/logo');
    expect(init.method).toBe('POST');
    expect((init.body as FormData).get('file')).toBe(logo);
    expect(init.headers).toEqual({ Authorization: 'Bearer token-1', Accept: 'application/json' });
    expect(result).toEqual(company);
  });

  it("passes on the API's message for a rejected file", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, { success: false, data: null, error: { code: 'BAD_REQUEST', message: 'File rusak' } })
    );

    await expect(uploadCompanyLogo('t', new File(['x'], 'x.png', { type: 'image/png' }))).rejects.toThrow('File rusak');
  });

  it('says what failed when a gateway answers with a page instead of JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>502 Bad Gateway</html>', { status: 502 }));

    await expect(uploadCompanyLogo('t', new File(['x'], 'x.png', { type: 'image/png' }))).rejects.toThrow(
      'Failed to upload the logo'
    );
  });
});

describe('deleteCompanyLogo', () => {
  it('sends a DELETE and returns the company without a logo', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { success: true, data: { ...company, logo_url: null, logo_file_id: null }, error: null })
    );

    const result = await deleteCompanyLogo('token-1');

    const [url, init] = lastCall();
    expect(url).toBe('/api/proxy/internal/company-profile/logo');
    expect(init.method).toBe('DELETE');
    expect(result.logo_url).toBeNull();
  });
});

describe('updateCompanyGeneral (same response reader)', () => {
  it('still returns the company, and keeps the error code and details', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { success: true, data: company, error: null }));
    expect(await updateCompanyGeneral('t', { name: 'Solvera' })).toEqual(company);

    fetchMock.mockResolvedValueOnce(
      jsonResponse(422, { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid', details: [{ loc: ['name'] }] } })
    );
    await expect(updateCompanyGeneral('t', { name: '' })).rejects.toMatchObject({
      message: 'Invalid',
      code: 'VALIDATION_ERROR',
      details: [{ loc: ['name'] }],
    });
  });

  it('turns a 401 into UNAUTHORIZED', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { detail: 'expired' }));
    await expect(updateCompanyGeneral('t', { name: 'Solvera' })).rejects.toThrow('UNAUTHORIZED');
  });
});
