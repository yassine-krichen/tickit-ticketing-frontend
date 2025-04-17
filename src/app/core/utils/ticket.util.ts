import { CaseType, Priority, Status } from '../models/ticket.model';

export interface UserInfo {
  name: string;
  team: string;
  role: string;
}

/**
 * Extracts user information from the issuedBy string
 * @param issuedBy The issuedBy string in format "firstname.lastname.role.team"
 * @returns UserInfo object with formatted name, team, and role
 */
export function extractUserInfo(issuedBy: string): UserInfo {
  const parts = issuedBy.split('.');
  
  if (parts.length < 4) {
    return {
      name: issuedBy,
      team: 'Support Team',
      role: 'Agent'
    };
  }

  const name = `${parts[0]} ${parts[1]}`.replace(/\b\w/g, c => c.toUpperCase());
  const role = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
  const team = parts[3].charAt(0).toUpperCase() + parts[3].slice(1);

  return { name, team, role };
}

/**
 * Gets initials from a full name
 * @param name The full name string
 * @returns String containing up to two initials
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(part => part.length > 0)
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Gets a user-friendly label for priority
 * @param priority The priority value
 * @returns String containing the display label for the priority
 */
export function getPriorityLabel(priority: Priority | string): string {
  switch(priority) {
    case Priority.P1: return 'Very Low';
    case Priority.P2: return 'Low';
    case Priority.P3: return 'Medium';
    case Priority.P4: return 'High';
    case Priority.P5: return 'Critical';
    default: return 'Unknown';
  }
}

/**
 * Gets a user-friendly label for status
 * @param status The status value
 * @returns String containing the display label for the status
 */
export function getStatusLabel(status: Status | string): string {
  switch(status) {
    case Status.OPEN: return 'Open';
    case Status.IN_PROGRESS: return 'In Progress';
    case Status.BLOCKED: return 'Blocked';
    case Status.RESOLVED: return 'Resolved';
    case Status.CLOSED: return 'Closed';
    default: return 'Unknown';
  }
}

/**
 * Gets a user-friendly display name for case type
 * @param type The case type value
 * @returns String with formatted type name
 */
export function getCaseTypeLabel(type: CaseType | string): string {
  if (!type) return 'Unknown';
  
  // Convert enum string to readable format
  return type.toString()
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Gets user-friendly SLA display
 * @param duration Duration in ISO-8601 format
 * @returns Formatted SLA string
 */
export function formatSLA(duration: number | string): string {
  if (!duration) return 'Not set';
  
  // For number type (seconds), convert to human-readable format
  if (typeof duration === 'number') {
    const hours = Math.floor(duration / 3600);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  }
  
  // For ISO-8601 duration strings (PT24H)
  try {
    const hourMatch = duration.toString().match(/(\d+)H/);
    const dayMatch = duration.toString().match(/(\d+)D/);
    
    if (dayMatch && dayMatch[1]) {
      const days = parseInt(dayMatch[1]);
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hourMatch && hourMatch[1]) {
      const hours = parseInt(hourMatch[1]);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  } catch (e) {
    return 'Invalid duration';
  }
  
  return duration.toString();
}

/**
 * Gets color for action type
 * @param action The action type
 * @returns Hex color code
 */
export function getActionColor(action: string): string {
  switch (action) {
    case 'POST': return '#10b981';    // green
    case 'PUT': return '#3b82f6';     // blue
    case 'AI': return '#f97316';      // orange
    case 'DELETE': return '#ef4444';  // red
    default: return '#6b7280';
  }
}

/**
 * Gets icon class for action type
 * @param action The action type
 * @returns Font Awesome icon class
 */
export function getActionIcon(action: string): string {
  switch (action) {
    case 'POST': return 'fa-plus-circle';
    case 'PUT': return 'fa-edit';
    case 'AI': return 'fa-robot';
    case 'DELETE': return 'fa-trash';
    default: return 'fa-info-circle';
  }
}
