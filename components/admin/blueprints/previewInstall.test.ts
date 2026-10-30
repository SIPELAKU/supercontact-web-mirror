import { describe, expect, it } from 'vitest';

import type { BlueprintInstallReport } from '@/lib/types/IndustryBlueprint';
import { installButtonLabel, previewCanInstall } from './previewInstall';

const mod = (created: number, skipped: number) => ({ created, skipped, errors: [] });
const preview = (
  created: number,
  withKb: boolean
): Pick<BlueprintInstallReport, 'modules' | 'totals'> => ({
  modules: {
    ticket_categories: mod(created, 4),
    ...(withKb ? { knowledge_base: mod(0, 0) } : {}),
  },
  totals: { created, skipped: 4, failed: 0 },
});

describe('previewCanInstall', () => {
  it('something new to create: install', () => {
    expect(previewCanInstall(preview(3, false))).toBe(true);
  });

  it('everything else already installed but the knowledge base is selected: still install - a dry run never counts it', () => {
    expect(previewCanInstall(preview(0, true))).toBe(true);
  });

  it('nothing new and no knowledge base: nothing to install', () => {
    expect(previewCanInstall(preview(0, false))).toBe(false);
  });
});

describe('installButtonLabel', () => {
  it('counts the items when there are some', () => {
    expect(installButtonLabel(preview(3, true))).toBe('Pasang 3 item');
  });

  it('only the knowledge base left: names it instead of "0 item"', () => {
    expect(installButtonLabel(preview(0, true))).toBe('Pasang Knowledge Base');
  });

  it('nothing at all: the old label', () => {
    expect(installButtonLabel(preview(0, false))).toBe('Pasang 0 item');
  });
});
