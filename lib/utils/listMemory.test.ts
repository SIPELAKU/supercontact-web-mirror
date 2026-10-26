import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearListMemory, LIST_CURSOR_PREFIX, LIST_POSITION_PREFIX } from './listMemory';
import { listCursorKey } from '@/components/ui/super-table/hooks/useListCursor';

/** A Storage with real key()/length semantics, which the loop relies on. */
function fakeSessionStorage(initial: Record<string, string>) {
  const map = new Map(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    keys: () => [...map.keys()],
  };
}

describe('clearListMemory (called on login and logout)', () => {
  let store: ReturnType<typeof fakeSessionStorage>;

  beforeEach(() => {
    store = fakeSessionStorage({
      'st:pos:/whatsapp-marketing/template-broadcasting::broadcast-templates-table':
        '{"batches":2,"scrollTop":900,"token":"x"}',
      'st:pos:/whatsapp-marketing/broadcasting-wa::wa-broadcasts-table': '{"batches":3,"scrollTop":0,"token":"y"}',
      'st:list:/contacts': '/contacts?q=budi',
      'st:list:/support/tickets': '/support/tickets?sort=created_at:desc',
      'some-other-feature': 'keep me',
      'stale-but-not-ours:st:pos:': 'keep me too',
    });
    vi.stubGlobal('window', { sessionStorage: store });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('removes every remembered list position and list URL, and nothing else', () => {
    clearListMemory();
    expect(store.keys()).toEqual(['some-other-feature', 'stale-but-not-ours:st:pos:']);
  });

  it('uses the same prefixes the SuperTable hooks write with', () => {
    expect(listCursorKey('/contacts').startsWith(LIST_CURSOR_PREFIX)).toBe(true);
    expect(LIST_POSITION_PREFIX).toBe('st:pos:');
  });

  it('does not throw when storage is unavailable', () => {
    vi.stubGlobal('window', {
      get sessionStorage(): Storage {
        throw new Error('SecurityError');
      },
    });
    expect(() => clearListMemory()).not.toThrow();
  });
});
