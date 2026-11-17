// Role-aware greetings: "Good morning, Dr. Wanjiku", "Hello, Lab Scientist Kamau", ...
import type { User, UserRole } from '$lib/api/client';

interface RoleInfo {
  /** Human label shown in badges and hover cards */
  label: string;
  /** Honorific placed before the surname in greetings ('' for none) */
  title: string;
  /** One-line description of what this member type can do */
  blurb: string;
  /** Emoji used in the welcome toast */
  icon: string;
  /** Tailwind classes for the role badge */
  badge: string;
}

export const ROLE_INFO: Record<UserRole, RoleInfo> = {
  doctor: {
    label: 'Doctor',
    title: 'Dr.',
    blurb: 'Reviews verified results and patient timelines',
    icon: '🩺',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  technician: {
    label: 'Lab Scientist',
    title: '',
    blurb: 'Runs specimens through the AI Vision Engine',
    icon: '🔬',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  lab_director: {
    label: 'Lab Director',
    title: '',
    blurb: 'Oversees lab quality, throughput and sign-off',
    icon: '🧪',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  admin: {
    label: 'System Admin',
    title: '',
    blurb: 'Manages users, roles and platform settings',
    icon: '🛡️',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export function roleInfo(role: string | undefined | null): RoleInfo {
  return ROLE_INFO[(role as UserRole) ?? 'technician'] ?? ROLE_INFO.technician;
}

function lastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : '';
}

/** Name as it should be addressed, e.g. "Dr. Wanjiku" or "Brian". */
export function addressName(user: Pick<User, 'full_name' | 'username' | 'role'>): string {
  const info = roleInfo(user.role);
  const full = (user.full_name || '').trim();
  if (!full) return user.username;
  if (info.title) return `${info.title} ${lastName(full)}`;
  return full.split(/\s+/)[0];
}

export function timeOfDayGreeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** "Good evening, Dr. Wanjiku" */
export function greetingFor(user: Pick<User, 'full_name' | 'username' | 'role'>): string {
  return `${timeOfDayGreeting()}, ${addressName(user)}`;
}

/** Two-letter avatar initials from the full name (falls back to username). */
export function initials(user: Pick<User, 'full_name' | 'username'>): string {
  const parts = (user.full_name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0] || user.username).substring(0, 2).toUpperCase();
}
