/**
 * LoginRequest represents the payload for user login.
 */
export interface LoginRequest {
    username: string;
    password: string;
}

/**
 * SignupRequest represents the payload for user registration.
 */
export interface SignupRequest {
    username: string;
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone?: string;
    idEquipe?: number;
}

/**
 * JwtResponse represents the response from the backend after login.
 */
export interface JwtResponse {
    token: string;
    id: number;
    username: string;
    email: string;
    active: boolean;
    roles: string[];
    collaborateur: Collaborateur;
} 

/**
 * Equipe represents the team details.
 */
export interface Equipe {
    idEquipe: number;
    nom: string;
  }
  
  /**
   * Collaborateur represents the collaborator details.
   */   
  export interface Collaborateur {
    nom: string;
    prenom: string;
    fonction?: string | null;
    photo?: string | null;
    email: string;
    equipe: Equipe;
  }
  


