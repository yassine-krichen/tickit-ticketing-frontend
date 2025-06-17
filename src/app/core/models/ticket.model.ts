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

// Main Case Types - high level categories
export enum CaseType {
  GRAFIC = 'GRAFIC', // INCLUDED
  XOIP = 'XOIP', // INCLUDED
  // TRAVAUX_TIERS = 'TRAVAUX_TIERS',
  MUTATION = 'MUTATION', // INCLUDED
  // PORTA_SORTANTE = 'PORTA_SORTANTE',
  // EVOLUTION_STATUT_IMB = 'EVOLUTION_STATUT_IMB',
  INTERCONNEXION_RIP_TIERS = 'INTERCONNEXION_RIP_TIERS', // INCLUDED
  DOMMAGES = 'DOMMAGES', // INCLUDED
  // LIEN_NROPM = 'LIEN_NROPM',
  // FACTU_TIERS = 'FACTU_TIERS',
  // DESATURATIONS_COUPLEURS = 'DESATURATIONS_COUPLEURS',
  // FACTURATION_TECHNICIEN = 'FACTURATION_TECHNICIEN',
  // RECALAGE = 'RECALAGE',
  // RECALAGE_IA = 'RECALAGE_IA',
  BRAME = 'BRAME', // INCLUDED
  GEORESO = 'GEORESO', // INCLUDED
  BO_RIP = 'BO_RIP', // INCLUDED
  // MISSING_CUIVRE_FIBRE_CLASSIQUE = 'MISSING_CUIVRE_FIBRE_CLASSIQUE',
  // CONTROLE_TRAVAUX = 'CONTROLE_TRAVAUX'
}

// Case Steps - detailed workflow steps (these are the actual step values from backend)
export enum CaseStep {
  // Mutation steps
  MUTATION_NATNE = 'MUTATION_NATNE',
  MUTATION_NATHD = 'MUTATION_NATHD',
  MUTATION_NAT42C = 'MUTATION_NAT42C',

  // Interconnexion RIP Tiers steps
  INTERCONNEXION_RIP_TIERS_PHASE_1 = 'INTERCONNEXION_RIP_TIERS_PHASE_1',
  INTERCONNEXION_RIP_TIERS_PHASE_2 = 'INTERCONNEXION_RIP_TIERS_PHASE_2',
  INTERCONNEXION_RIP_TIERS_CONTROLE_TRAVAUX = 'INTERCONNEXION_RIP_TIERS_CONTROLE_TRAVAUX',

  // BRAME steps
  BRAME_PRE_ETUDE = 'BRAME_PRE_ETUDE',
  BRAME_ETUDE = 'BRAME_ETUDE',
  BRAME_RACCORDEMENT = 'BRAME_RACCORDEMENT',
  BRAME_CONTROLE_TRAVAUX = 'BRAME_CONTROLE_TRAVAUX',

  // Dommages steps
  AFFECTATION_ET_MISE_EN_CAUSE = 'AFFECTATION_ET_MISE_EN_CAUSE',
  CREANCE = 'CREANCE',
  RAPPEL = 'RAPPEL',
  MISE_EN_DEMEURE = 'MISE_EN_DEMEURE',
  DERNIERE_LETTRE = 'DERNIERE_LETTRE',
  MISE_CONTENTIEUX = 'MISE_CONTENTIEUX',
  DEMANDE_DINFORMATIONS = 'DEMANDE_DINFORMATIONS',
  CONTESTATION_OU_RECLAMATION = 'CONTESTATION_OU_RECLAMATION',
  CLOTURE_DOSSIER = 'CLOTURE_DOSSIER',

  // Control Travaux steps
  // CONTROLE_TRAVAUX_LIEN_NROPM = 'CONTROLE_TRAVAUX_LIEN_NROPM',
  // CONTROLE_TRAVAUX_DESATURATIONS_COUPLEURS = 'CONTROLE_TRAVAUX_DESATURATIONS_COUPLEURS',

  // Georeso steps
  GEORESO_IMB = 'GEORESO_IMB',
  GEORESO_SITE_SUPPORT = 'GEORESO_SITE_SUPPORT',
  GEORESO_CABLE = 'GEORESO_CABLE',

  // BO RIP steps
  BO_RIP_GC = 'BO_RIP_GC',
  BO_RIP_CABLAGE = 'BO_RIP_CABLAGE',
  BO_RIP_GC_CABLAGE = 'BO_RIP_GC_CABLAGE',
  GRAFIC = 'GRAFIC',
  XOIP = 'XOIP',

  // Missing Cuivre Fibre step
  // MISSING_CUIVRE_FIBRE_DOUBLON = 'MISSING_CUIVRE_FIBRE_DOUBLON',
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
  step?: CaseStep; // Updated to use CaseStep
  subStatus?: string;
}

// Backend compatible interfaces
export interface BackendTicket {
  id: string;
  acteTraitement: string;
  subject: string;
  description: string;
  type: CaseType;
  step: CaseStep; // Updated to use CaseStep
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
  step: CaseStep; // Updated to use CaseStep
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
  step?: CaseStep; // Updated to use CaseStep
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
  step: CaseStep; // Updated to use CaseStep
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
