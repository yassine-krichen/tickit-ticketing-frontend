export interface TreatmentAct {
    idacte: string;
    refTacheBPU: string;
    prestationId: string;
    type_element: string;
    quantite: number;
    dateReception: string;
    dateLivraison: string;
    dateValidation: string | null;
    affectation: string;
    duree: number;
    commentaire: string;
    motif: string;
    statutFacturation: string;
    dateReprise: string | null;
    repriseFacturable: boolean | null;
    dateDeadline: string | null;
    priorite: string;
    tarifId: string;
    tarifName: string;
    classification: string;
    caseId: string;
    caseName: string;
    caseStatus: string;
    caseType: string;
    casePriority: string;
    prestationName: string;
    deleted: boolean;
}

export interface TreatmentActHistoryEntry {
    id: string;
    timestamp: Date;
    userFingerprint: string;
    actionType: string;
    entityType: string;
    dataSnapshot: {
        commentaire: string;
        [key: string]: any;
    };
    isLatest?: boolean; // Marks the last entry for styling
}

export interface RawHistoryEntry {
    id: string;
    timestamp: string; // ISO string format
    userFingerprint: string; 
    actionType: string;
    entityType: string;
    dataSnapshot: {
        commentaire: string;
        [key: string]: any;
    };
}