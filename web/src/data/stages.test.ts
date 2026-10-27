import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import stageRows from '../../../docs/data/stages.json';
import { STAGES, stageNumber, stageSpec } from './stages';

describe('stages', () => {
  it('match the database enum, in order', () => {
    const sql = readFileSync(resolve(__dirname, '../../../db/migrations/0001_core.sql'), 'utf8');
    const m = sql.match(/create type stage_t as enum \(([^)]*)\)/s);
    expect(m).not.toBeNull();
    const dbStages = [...m![1].matchAll(/'([a-z_]+)'/g)].map((x) => x[1]);
    expect(dbStages).toEqual([...STAGES]);
  });

  it('match the 16 spec rows', () => {
    expect(stageRows).toHaveLength(16);
    expect(STAGES).toHaveLength(16);
  });

  it('numbers and spec rows line up', () => {
    expect(stageNumber('lead_captured')).toBe(1);
    expect(stageNumber('handover')).toBe(16);
    expect(stageSpec('installation').timeLimit).toContain('14 days');
  });
});
