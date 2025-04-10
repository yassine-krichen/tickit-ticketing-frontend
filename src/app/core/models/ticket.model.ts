export enum Priority {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4',
  P5 = 'P5'
}

export enum Status {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export interface Assignee {
  initials: string;
  name: string;
  team: string;
  role: string;
}

export interface TicketTags {
  status: string;
  priority: string;
}

export interface TicketMeta {
  created: string;
  responseTime: string;
}

export interface Ticket {
  id: string;
  title: string;
  status: string;
  category: string;
  description: string;
  assignee: Assignee;
  tags: TicketTags;
  meta: TicketMeta;
}

// Backend compatible interfaces
export interface BackendTicket {
  id: string;
  acteTraitement: string;
  subject: string;
  description: string;
  priority: Priority;
  status: Status;
  issuedBy: string;
  createdAt: string;
  updatedAt: string;
  responseSla?: number;
  resolutionSla?: number;
}

export interface TicketRequest {
  acteTraitement: string;
  subject: string;
  description: string;
  priority: Priority;
  status: Status;
  issuedBy: string;
}

export interface TicketResponse extends BackendTicket {
  statusMessage?: string;
  message?: string;
}

export interface TicketUpdateDTO {
  subject?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  issuedBy?: string;
}

export interface TicketCount {
  status: Status;
  count: number;
}
