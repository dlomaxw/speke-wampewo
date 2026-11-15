/**
 * Role-based access control.
 *
 * Permissions are checked on the server for every mutation. The admin UI hides
 * what a role cannot do, but hiding is not enforcement — `requirePermission`
 * in src/lib/auth.ts is what actually stops the action.
 */

export const ROLES = [
  'system_admin',
  'property_manager',
  'reservations',
  'sales_crm',
  'marketing',
  'finance',
  'reporting',
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  system_admin: 'System administrator',
  property_manager: 'Property manager',
  reservations: 'Reservations team',
  sales_crm: 'Sales and CRM team',
  marketing: 'Marketing / content editor',
  finance: 'Finance',
  reporting: 'Read-only reporting',
};

export const PERMISSIONS = [
  // Content
  'content.view', 'content.edit', 'content.publish',
  'media.view', 'media.upload', 'media.delete',
  // Accommodation and commercial terms
  'rooms.view', 'rooms.edit',
  'rates.view', 'rates.edit',
  'offers.view', 'offers.edit',
  // Bookings
  'bookings.view', 'bookings.create', 'bookings.amend', 'bookings.cancel',
  // Payments
  'payments.view', 'payments.reconcile', 'refunds.issue',
  // CRM
  'crm.view', 'crm.edit', 'crm.assign', 'crm.export',
  'crm.rates.view',            // confidential negotiated corporate rates
  'quotes.create', 'quotes.approve',
  // Messaging
  'messaging.view', 'messaging.send', 'templates.edit',
  // Platform
  'users.manage', 'settings.manage', 'integrations.manage',
  'audit.view', 'reports.view',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL = [...PERMISSIONS] as Permission[];

/**
 * Deliberately explicit rather than hierarchical. Hospitality roles do not nest
 * cleanly — reservations may amend a booking but must never issue a refund,
 * and finance may refund but must not rewrite the website.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  system_admin: ALL,

  property_manager: [
    'content.view', 'content.edit', 'content.publish',
    'media.view', 'media.upload', 'media.delete',
    'rooms.view', 'rooms.edit',
    'rates.view', 'rates.edit',
    'offers.view', 'offers.edit',
    'bookings.view', 'bookings.create', 'bookings.amend', 'bookings.cancel',
    'payments.view', 'payments.reconcile',
    'crm.view', 'crm.edit', 'crm.assign', 'crm.export', 'crm.rates.view',
    'quotes.create', 'quotes.approve',
    'messaging.view', 'messaging.send', 'templates.edit',
    'audit.view', 'reports.view',
  ],

  reservations: [
    'content.view',
    'media.view',
    'rooms.view', 'rates.view', 'offers.view',
    'bookings.view', 'bookings.create', 'bookings.amend', 'bookings.cancel',
    'payments.view',
    'crm.view', 'crm.edit',
    'quotes.create',
    'messaging.view', 'messaging.send',
    'reports.view',
  ],

  sales_crm: [
    'content.view',
    'media.view',
    'rooms.view', 'rates.view', 'offers.view',
    'bookings.view',
    'crm.view', 'crm.edit', 'crm.assign', 'crm.export', 'crm.rates.view',
    'quotes.create',
    'messaging.view', 'messaging.send',
    'reports.view',
  ],

  marketing: [
    'content.view', 'content.edit', 'content.publish',
    'media.view', 'media.upload',
    'rooms.view', 'offers.view', 'offers.edit',
    'crm.view',
    'templates.edit',
    'reports.view',
  ],

  finance: [
    'content.view',
    'rooms.view', 'rates.view',
    'bookings.view',
    'payments.view', 'payments.reconcile', 'refunds.issue',
    'crm.view', 'crm.rates.view',
    'reports.view', 'audit.view',
  ],

  reporting: [
    'content.view', 'rooms.view', 'bookings.view', 'payments.view',
    'crm.view', 'reports.view',
  ],
};

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const granted = ROLE_PERMISSIONS[role];
  return Array.isArray(granted) && granted.includes(permission);
}

export function canAny(role: Role | undefined | null, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
