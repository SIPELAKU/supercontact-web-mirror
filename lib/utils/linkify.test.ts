import { describe, expect, it } from 'vitest';

import { splitLinks } from './linkify';

const link = (url: string) => ({ kind: 'link', text: url, href: url });
const text = (t: string) => ({ kind: 'text', text: t });

describe('splitLinks', () => {
  it('no link: one text piece (or none for empty)', () => {
    expect(splitLinks('Halo, ada yang bisa dibantu?')).toEqual([text('Halo, ada yang bisa dibantu?')]);
    expect(splitLinks('')).toEqual([]);
  });

  it('a link between text, newlines kept', () => {
    expect(splitLinks('Baca:\nhttps://dev.smartsales.id/help/toko/article/cara-bayar\nSemoga membantu')).toEqual([
      text('Baca:\n'),
      link('https://dev.smartsales.id/help/toko/article/cara-bayar'),
      text('\nSemoga membantu'),
    ]);
  });

  it('sentence punctuation after a link stays text', () => {
    expect(splitLinks('Lihat https://example.com/a.')).toEqual([text('Lihat '), link('https://example.com/a'), text('.')]);
    expect(splitLinks('(https://example.com/a), lalu')).toEqual([
      text('('),
      link('https://example.com/a'),
      text('), lalu'),
    ]);
  });

  it('a bracket the URL opens stays in the URL', () => {
    expect(splitLinks('https://en.wikipedia.org/wiki/Foo_(bar)')).toEqual([
      link('https://en.wikipedia.org/wiki/Foo_(bar)'),
    ]);
  });

  it('several links, query strings kept', () => {
    expect(splitLinks('http://a.id?x=1&y=2 dan https://b.id#top')).toEqual([
      link('http://a.id?x=1&y=2'),
      text(' dan '),
      link('https://b.id#top'),
    ]);
  });

  it('only http(s) becomes a link: javascript:, data:, mailto: stay text', () => {
    for (const s of ['javascript:alert(1)', 'data:text/html,<b>x</b>', 'mailto:cs@toko.id', 'www.toko.id']) {
      expect(splitLinks(s)).toEqual([text(s)]);
    }
  });

  it('HTML in the text is just text (the widget never parses it)', () => {
    expect(splitLinks('<b>tes</b> <a href="https://x.id">x</a>')).toEqual([
      text('<b>tes</b> <a href="'),
      link('https://x.id'),
      text('">x</a>'),
    ]);
  });

  it('"https://" alone is not a link', () => {
    expect(splitLinks('ketik https:// lalu alamatnya')).toEqual([text('ketik https:// lalu alamatnya')]);
  });
});
