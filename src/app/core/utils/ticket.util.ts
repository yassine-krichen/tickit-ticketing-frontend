import { Priority, Status, CaseType, CaseStep } from '../models/ticket.model';

export interface UserInfo {
  initials: string;
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
  if (!issuedBy) {
    return {
      initials: 'UN',
      name: 'Unknown User',
      team: 'Unknown',
      role: 'Unknown',
    };
  }

  const parts = issuedBy.split('.');
  if (parts.length < 4) {
    return {
      initials: getInitials(issuedBy),
      name: issuedBy,
      team: 'Unknown',
      role: 'Unknown',
    };
  }

  const firstName = parts[0];
  const lastName = parts[1];
  const role = parts[2];
  const team = parts[3];

  const fullName = `${firstName.charAt(0).toUpperCase()}${firstName.slice(
    1
  )} ${lastName.charAt(0).toUpperCase()}${lastName.slice(1)}`;

  return {
    initials: getInitials(fullName),
    name: fullName,
    team: team.charAt(0).toUpperCase() + team.slice(1),
    role: role.charAt(0).toUpperCase() + role.slice(1),
  };
}

/**
 * Gets initials from a full name
 * @param name The full name string
 * @returns String containing up to two initials
 */
export function getInitials(name: string): string {
  if (!name) return 'UN';

  const nameParts = name.trim().split(' ');
  if (nameParts.length === 1) {
    return nameParts[0].substring(0, 2).toUpperCase();
  }

  return (
    nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
  ).toUpperCase();
}

/**
 * Gets a user-friendly label for priority
 * @param priority The priority value
 * @returns String containing the display label for the priority
 */
export function getPriorityLabel(priority: Priority | string): string {
  switch (priority) {
    case Priority.P5:
      return 'Very Low';
    case Priority.P4:
      return 'Low';
    case Priority.P3:
      return 'Medium';
    case Priority.P2:
      return 'High';
    case Priority.P1:
      return 'Critical';
    default:
      return 'Unknown';
  }
}

/**
 * Gets color class for priority badge
 * @param priority The priority value
 * @returns CSS class for priority badge
 */
export function getPriorityClass(priority: Priority | string): string {
  switch (priority) {
    case Priority.P5:
      return 'bg-secondary';
    case Priority.P4:
      return 'bg-primary';
    case Priority.P3:
      return 'bg-info';
    case Priority.P2:
      return 'bg-warning text-dark';
    case Priority.P1:
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}

/**
 * Gets a user-friendly label for status
 * @param status The status value
 * @returns String containing the display label for the status
 */
export function getStatusLabel(status: Status | string): string {
  switch (status) {
    case Status.OPEN:
      return 'Open';
    case Status.IN_PROGRESS:
      return 'In Progress';
    case Status.BLOCKED:
      return 'Blocked';
    case Status.RESOLVED:
      return 'Resolved';
    case Status.CLOSED:
      return 'Closed';
    default:
      return 'Unknown';
  }
}

/**
 * Gets a user-friendly display name for case type
 * @param type The case type value
 * @returns String with formatted type name
 */
export function getCaseTypeLabel(type: CaseType | string): string {
  if (!type) return 'Unknown';

  const typeLabels: Record<string, string> = {
    GRAFIC: 'Grafic',
    XOIP: 'XOIP',
    // TRAVAUX_TIERS: 'Travaux Tiers',
    MUTATION: 'Mutation',
    // PORTA_SORTANTE: 'Porta Sortante',
    // EVOLUTION_STATUT_IMB: 'Evolution Statut IMB',
    INTERCONNEXION_RIP_TIERS: 'Interconnexion RIP Tiers',
    DOMMAGES: 'Dommages',
    // LIEN_NROPM: 'Lien-NROPM',
    // FACTU_TIERS: 'Factu Tiers',
    // DESATURATIONS_COUPLEURS: 'Désaturations Coupleurs',
    // FACTURATION_TECHNICIEN: 'Facturation Technicien',
    // RECALAGE: 'Recalage',
    // RECALAGE_IA: 'Recalage IA',
    BRAME: 'BRAME',
    GEORESO: 'Georeso',
    BO_RIP: 'BO RIP',
    // MISSING_CUIVRE_FIBRE_CLASSIQUE: 'Missing Cuivre Fibre - Classique',
    // CONTROLE_TRAVAUX: 'Contrôle Travaux',
  };

  return typeLabels[type.toString()] || type.toString().replace(/_/g, ' ');
}

/**
 * Gets a user-friendly display name for case step
 * @param step The case step value
 * @returns String with formatted step name
 */
export function getCaseStepLabel(step: CaseStep | string): string {
  if (!step) return 'Unknown';

  const stepLabels: Record<string, string> = {
    // Mutation steps
    MUTATION_NATNE: 'MUTATION NATNE',
    MUTATION_NATHD: 'MUTATION NATHD',
    MUTATION_NAT42C: 'MUTATION NAT42C',

    // Interconnexion RIP Tiers steps
    INTERCONNEXION_RIP_TIERS_PHASE_1: 'Interconnexion RIP Tiers - Phase 1',
    INTERCONNEXION_RIP_TIERS_PHASE_2: 'Interconnexion RIP Tiers - Phase 2',
    INTERCONNEXION_RIP_TIERS_CONTROLE_TRAVAUX:
      'Interconnexion RIP Tiers - Contrôle Travaux',

    // BRAME steps
    BRAME_PRE_ETUDE: 'BRAME - Pre-Etude',
    BRAME_ETUDE: 'BRAME - Etude',
    BRAME_RACCORDEMENT: 'BRAME - Raccordement',
    BRAME_CONTROLE_TRAVAUX: 'BRAME - Contrôle Travaux',

    // Dommages steps
    AFFECTATION_ET_MISE_EN_CAUSE: 'Affectation et Mise en Cause',
    CREANCE: 'Créance',
    RAPPEL: 'Rappel',
    MISE_EN_DEMEURE: 'Mise en Demeure',
    DERNIERE_LETTRE: 'Dernière Lettre',
    MISE_CONTENTIEUX: 'Mise Contentieux',
    DEMANDE_DINFORMATIONS: "Demande d'Informations",
    CONTESTATION_OU_RECLAMATION: 'Contestation ou Réclamation',
    CLOTURE_DOSSIER: 'Clôture Dossier',

    // Control Travaux steps
    // CONTROLE_TRAVAUX_LIEN_NROPM: 'Contrôle Travaux - Lien NROPM',
    // CONTROLE_TRAVAUX_DESATURATIONS_COUPLEURS:
    //   'Contrôle Travaux - Désaturations Coupleurs',

    // Georeso steps
    GEORESO_IMB: 'Georeso - IMB',
    GEORESO_SITE_SUPPORT: 'Georeso - Site Support',
    GEORESO_CABLE: 'Georeso - Cable',

    // BO RIP steps
    BO_RIP_GC: 'BO RIP - GC',
    BO_RIP_CABLAGE: 'BO RIP - Cablage',
    BO_RIP_GC_CABLAGE: 'BO RIP - GC Cablage',

    // Missing Cuivre Fibre step
    // MISSING_CUIVRE_FIBRE_DOUBLON: 'Missing Cuivre Fibre - Doublon',
  };

  return stepLabels[step.toString()] || step.toString().replace(/_/g, ' ');
}

/**
 * Gets valid steps for a given case type
 * @param type The case type
 * @returns Array of valid case steps for the type
 */
export function getValidStepsForType(type: CaseType): CaseStep[] {
  const typeStepMappings: Record<CaseType, CaseStep[]> = {
    [CaseType.MUTATION]: [
      CaseStep.MUTATION_NATNE,
      CaseStep.MUTATION_NATHD,
      CaseStep.MUTATION_NAT42C,
    ],
    [CaseType.INTERCONNEXION_RIP_TIERS]: [
      CaseStep.INTERCONNEXION_RIP_TIERS_PHASE_1,
      CaseStep.INTERCONNEXION_RIP_TIERS_PHASE_2,
      CaseStep.INTERCONNEXION_RIP_TIERS_CONTROLE_TRAVAUX,
    ],
    [CaseType.BRAME]: [
      CaseStep.BRAME_PRE_ETUDE,
      CaseStep.BRAME_ETUDE,
      CaseStep.BRAME_RACCORDEMENT,
      CaseStep.BRAME_CONTROLE_TRAVAUX,
    ],
    [CaseType.DOMMAGES]: [
      CaseStep.AFFECTATION_ET_MISE_EN_CAUSE,
      CaseStep.CREANCE,
      CaseStep.RAPPEL,
      CaseStep.MISE_EN_DEMEURE,
      CaseStep.DERNIERE_LETTRE,
      CaseStep.MISE_CONTENTIEUX,
      CaseStep.DEMANDE_DINFORMATIONS,
      CaseStep.CONTESTATION_OU_RECLAMATION,
      CaseStep.CLOTURE_DOSSIER,
    ],
    [CaseType.GEORESO]: [
      CaseStep.GEORESO_IMB,
      CaseStep.GEORESO_SITE_SUPPORT,
      CaseStep.GEORESO_CABLE,
    ],
    [CaseType.BO_RIP]: [
      CaseStep.BO_RIP_GC,
      CaseStep.BO_RIP_CABLAGE,
      CaseStep.BO_RIP_GC_CABLAGE,
    ],
    // [CaseType.CONTROLE_TRAVAUX]: [
    //   CaseStep.CONTROLE_TRAVAUX_LIEN_NROPM,
    //   CaseStep.CONTROLE_TRAVAUX_DESATURATIONS_COUPLEURS,
    // ],
    // [CaseType.MISSING_CUIVRE_FIBRE_CLASSIQUE]: [
    //   CaseStep.MISSING_CUIVRE_FIBRE_DOUBLON,
    // ],
    // Types without specific steps return empty array
    [CaseType.GRAFIC]: [CaseStep.GRAFIC],
    [CaseType.XOIP]: [CaseStep.XOIP],
    // [CaseType.TRAVAUX_TIERS]: [],
    // [CaseType.PORTA_SORTANTE]: [],
    // [CaseType.EVOLUTION_STATUT_IMB]: [],
    // [CaseType.LIEN_NROPM]: [],
    // [CaseType.FACTU_TIERS]: [],
    // [CaseType.DESATURATIONS_COUPLEURS]: [],
    // [CaseType.FACTURATION_TECHNICIEN]: [],
    // [CaseType.RECALAGE]: [],
    // [CaseType.RECALAGE_IA]: [],
  };

  return typeStepMappings[type] || [];
}

/**
 * Gets user-friendly SLA display
 * @param duration Duration in ISO-8601 format
 * @returns Formatted SLA string
 */
export function formatSLA(duration: number | string): string {
  if (!duration) return 'N/A';

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
    case 'POST':
      return '#10b981'; // green
    case 'PUT':
      return '#3b82f6'; // blue
    case 'AI':
      return '#f97316'; // orange
    case 'DELETE':
      return '#ef4444'; // red
    default:
      return '#6b7280';
  }
}

/**
 * Gets icon class for action type
 * @param action The action type
 * @returns Font Awesome icon class
 */
export function getActionIcon(action: string): string {
  switch (action) {
    case 'POST':
      return 'fa-plus-circle';
    case 'PUT':
      return 'fa-edit';
    case 'AI':
      return 'fa-robot';
    case 'DELETE':
      return 'fa-trash';
    default:
      return 'fa-info-circle';
  }
}
