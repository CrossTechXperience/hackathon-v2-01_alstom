export interface Wagon {
  id?: number;
  numero: string;
  createdAt?: string;
}

export interface Zone {
  id?: number;
  numero: number; // 1, 2, 3, ou 4
  wagonId: number;
  createdAt?: string;
}

export interface Sac {
  id?: number;
  identifiant: string;
  zoneId: number;
  createdAt?: string;
}

export enum EtatPiece {
  RIEN = 'RIEN',
  SCANNE = 'SCANNE',
  POSE = 'POSE',
}

export interface Piece {
  id?: number;
  code: string; // K50, A1, etc.
  etat: EtatPiece;
  prioritaire: boolean; // 0 = non, 1 = oui
  position: number; // 0 à 15, position dans la grille
  sacId: number;
  createdAt?: string;
}
