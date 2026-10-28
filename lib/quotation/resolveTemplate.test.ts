import { describe, expect, it } from 'vitest';

import { chooseTemplate } from './resolveTemplate';
import { buildTemplateDocument } from './renderTemplate';

const snapshot = { id: 't-old', name: 'Corporate', html: '<div></div>', css: '' };

describe('chooseTemplate', () => {
  it('renders a sent quotation from its snapshot, whatever the default is now', () => {
    expect(chooseTemplate({ template_id: 't-1', template_snapshot: snapshot }, 't-default')).toEqual({
      kind: 'snapshot',
      snapshot,
    });
  });

  it('uses the quotation template, then the company default', () => {
    expect(chooseTemplate({ template_id: 't-1', template_snapshot: null }, 't-default')).toEqual({ kind: 'id', id: 't-1' });
    expect(chooseTemplate({ template_id: null }, 't-default')).toEqual({ kind: 'id', id: 't-default' });
  });

  it('reports when there is nothing to render with', () => {
    expect(chooseTemplate({ template_id: null }, null)).toEqual({ kind: 'none' });
  });
});

describe('buildTemplateDocument', () => {
  it('puts the css in a style tag and the html in the body', () => {
    const doc = buildTemplateDocument('<div class="qt">Hi</div>', '.qt{color:red}');
    expect(doc).toMatch(/^<!doctype html>/);
    expect(doc).toContain('<style>html,body{margin:0;padding:0;background:#fff}.qt{color:red}</style>');
    expect(doc).toContain('<body><div class="qt">Hi</div></body>');
  });

  it('does not let the css close its style tag', () => {
    const doc = buildTemplateDocument('', '.a{}</style><img src=x>');
    expect(doc.match(/<\/style>/gi)).toHaveLength(1);
  });
});
