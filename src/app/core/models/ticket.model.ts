export enum Priority {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4',
  P5 = 'P5',
}

export enum Status {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// Simplified CaseType enum (add the ones you need from backend CaseType)
export enum CaseType {
  GRAFIC = 'GRAFIC',
  XOIP = 'XOIP',
  // TRAVAUX_TIERS = 'TRAVAUX_TIERS',
  BRAME = 'BRAME',
  GEORESO = 'GEORESO',
  INTERCONNEXION_RIP_TIERS = 'INTERCONNEXION_RIP_TIERS',
  DOMMAGES = 'DOMMAGES',
  MUTATION = 'MUTATION',
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
  type?: string;
  step?: string;
}

export interface TicketMeta {
  created: string;
  responseTime: string;
  responseSla?: string;
  resolutionSla?: string;
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
  type?: CaseType;
  step?: CaseType;
  subStatus?: string;
}

// Backend compatible interfaces
export interface BackendTicket {
  id: string;
  acteTraitement: string;
  subject: string;
  description: string;
  type: CaseType;
  step: CaseType;
  subStatus: string;
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
  type: CaseType;
  step: CaseType;
  subStatus?: string;
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
  type?: CaseType;
  step?: CaseType;
  subStatus?: string;
  priority?: Priority;
  status?: Status;
  issuedBy?: string;
}

export interface TicketCount {
  category: any;
  count: number;
}

export interface TypeStepValidation {
  type: CaseType;
  step: CaseType;
}

/**
 * Generic wrapper for paginated API responses.
 */
export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  isLastPage?: boolean;
}
