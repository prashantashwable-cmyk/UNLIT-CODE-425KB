import stageRows from '../../../docs/data/stages.json';

// Same order as the database enum stage_t (db/migrations/0001_core.sql); stages.test.ts checks both sources.
export const STAGES = [
  'lead_captured', 'lead_verified', 'contacted', 'quoted', 'agreement_token', 'site_readiness', 'qc_clearance',
  'permit_applied', 'production_order', 'dispatch', 'container_delivery', 'cabin_delivery', 'installation',
  'qc_inspector', 'licence', 'handover',
] as const;
export type Stage = (typeof STAGES)[number];

export const SIDE_STATES = ['none', 'on_hold', 'disputed', 'cancelled', 'lost'] as const;
export type SideState = (typeof SIDE_STATES)[number];

export function stageNumber(s: Stage): number {
  return STAGES.indexOf(s) + 1;
}

/** Spec §16.2 row for a stage: owner, gate and time limit (time limits are V3 proposals pending lift-engineer review). */
export function stageSpec(s: Stage) {
  const row = stageRows[STAGES.indexOf(s)];
  return { owner: row.Owner, gate: row['Gate to move on (proof)'], timeLimit: row['Time limit'] };
}
