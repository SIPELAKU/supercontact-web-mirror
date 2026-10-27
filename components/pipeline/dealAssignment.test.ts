import { describe, expect, it } from 'vitest';
import { canAssignDeals, canSeeAllDeals } from './dealAssignment';

describe('canAssignDeals', () => {
  it('lets an Admin and a Manager pick the assignee', () => {
    expect(canAssignDeals('Admin')).toBe(true);
    expect(canAssignDeals('Manager')).toBe(true);
  });

  it('matches regardless of case, spaces and underscores', () => {
    expect(canAssignDeals('manager')).toBe(true);
    expect(canAssignDeals('ADMIN')).toBe(true);
    expect(canAssignDeals(' Manager ')).toBe(true);
  });

  it('locks a Super Admin, which is not part of this feature (the BE answers 403)', () => {
    expect(canAssignDeals('Super Admin')).toBe(false);
    expect(canAssignDeals('super_admin')).toBe(false); // the BE's own value
  });

  it('locks every other role, and a missing role', () => {
    expect(canAssignDeals('Sales')).toBe(false);
    expect(canAssignDeals('Staff')).toBe(false);
    expect(canAssignDeals('Sales Manager')).toBe(false);
    expect(canAssignDeals('Admin Assistant')).toBe(false);
    expect(canAssignDeals('')).toBe(false);
    expect(canAssignDeals(null)).toBe(false);
    expect(canAssignDeals(undefined)).toBe(false);
  });

  it('the same roles see every deal on the kanban; others only their own', () => {
    expect(canSeeAllDeals('Admin')).toBe(true);
    expect(canSeeAllDeals('Manager')).toBe(true);
    expect(canSeeAllDeals('super_admin')).toBe(false);
    expect(canSeeAllDeals('Staff')).toBe(false);
    expect(canSeeAllDeals(null)).toBe(false);
  });
});
