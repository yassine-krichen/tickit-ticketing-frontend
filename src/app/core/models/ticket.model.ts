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

// Simplified CaseType enum (add the ones you need from backend CaseType)
export enum CaseType {
  GRAFIC = 'GRAFIC',
  XOIP = 'XOIP',
  TRAVAUX_TIERS = 'TRAVAUX_TIERS',
  BRAME = 'BRAME',
  BRAME_PRE_ETUDE = 'BRAME_PRE_ETUDE',
  BRAME_ETUDE = 'BRAME_ETUDE',
  BRAME_RACCORDEMENT = 'BRAME_RACCORDEMENT',
  BRAME_CONTROLE_TRAVAUX = 'BRAME_CONTROLE_TRAVAUX',
  GEORESO = 'GEORESO',
  GEORESO_CABLE = 'GEORESO_CABLE',
  GEORESO_IMB = 'GEORESO_IMB',
  GEORESO_SITE_SUPPORT = 'GEORESO_SITE_SUPPORT'
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
