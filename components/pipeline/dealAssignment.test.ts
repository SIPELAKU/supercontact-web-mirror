import { describe, expect, it } from 'vitest';
import { canAssignDeals } from './dealAssignment';

describe('canAssignDeals', () => {
  it('lets an Admin, a Manager and a Super Admin pick the assignee', () => {
    expect(canAssignDeals('Admin')).toBe(true);
    expect(canAssignDeals('Manager')).toBe(true);
    expect(canAssignDeals('Super Admin')).toBe(true);
    expect(canAssignDeals('super_admin')).toBe(true); // the BE's own value
  });

  it('matches regardless of case, spaces and underscores', () => {
    expect(canAssignDeals('manager')).toBe(true);
    expect(canAssignDeals('super_admin')).toBe(true);
    expect(canAssignDeals('SUPERADMIN')).toBe(true);
    expect(canAssignDeals(' Super  Admin ')).toBe(true);
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
});
