import { database } from './database';
import { Piece, Sac, Zone, Wagon, EtatPiece } from '../types/models';

export interface PieceCompleteInfo {
  piece: Piece;
  sac: Sac;
  zone: Zone;
  wagon: Wagon;
}

class ScannerManager {
  /**
   * Gère le scan d'une pièce
   * 1. Cherche la pièce dans la DB par son code
   * 2. Met à jour son état si trouvée
   * 3. Retourne toutes les infos complètes
   */
  async handlePieceScan(code: string): Promise<PieceCompleteInfo | null> {
    try {
      // 1. Chercher la pièce par son code
      const allPieces = await database.getAllPieces();
      const piece = allPieces.find(p => p.code.toUpperCase() === code.toUpperCase());

      if (!piece || !piece.id) {
        console.log(`Pièce "${code}" non trouvée dans la DB`);
        return null;
      }

      // 2. Mettre à jour l'état de la pièce
      // UNINSTALLED → ONWAIT → INSTALLED
      let newEtat: EtatPiece = piece.etat;

      if (piece.etat === EtatPiece.UNINSTALLED) {
        newEtat = EtatPiece.ONWAIT;
      } else if (piece.etat === EtatPiece.ONWAIT) {
        newEtat = EtatPiece.INSTALLED;
      }
      // Si déjà INSTALLED, on garde INSTALLED

      if (newEtat !== piece.etat) {
        await database.updatePieceEtat(piece.id, newEtat);
        piece.etat = newEtat; // Mettre à jour l'objet local
      }

      // 3. Récupérer les infos complètes (sac, zone, wagon)
      const sac = await this.getSacByPiece(piece);
      if (!sac) return null;

      const zone = await this.getZoneBySac(sac);
      if (!zone) return null;

      const wagon = await this.getWagonByZone(zone);
      if (!wagon) return null;

      return {
        piece,
        sac,
        zone,
        wagon,
      };
    } catch (error) {
      console.error('Erreur dans handlePieceScan:', error);
      return null;
    }
  }

  /**
   * Gère le scan d'un sac
   * Retourne toutes les pièces de ce sac
   */
  async handleSacScan(identifiant: string): Promise<{
    sac: Sac;
    pieces: Piece[];
    zone: Zone;
    wagon: Wagon;
  } | null> {
    try {
      const allSacs = await database.getAllSacs();
      const sac = allSacs.find(s => s.identifiant.toUpperCase() === identifiant.toUpperCase());

      if (!sac || !sac.id) {
        console.log(`Sac "${identifiant}" non trouvé dans la DB`);
        return null;
      }

      const pieces = await database.getPiecesBySac(sac.id);
      const zone = await this.getZoneBySac(sac);
      if (!zone) return null;

      const wagon = await this.getWagonByZone(zone);
      if (!wagon) return null;

      return {
        sac,
        pieces,
        zone,
        wagon,
      };
    } catch (error) {
      console.error('Erreur dans handleSacScan:', error);
      return null;
    }
  }

  /**
   * Récupère le sac d'une pièce
   */
  private async getSacByPiece(piece: Piece): Promise<Sac | null> {
    const allSacs = await database.getAllSacs();
    return allSacs.find(s => s.id === piece.sacId) || null;
  }

  /**
   * Récupère la zone d'un sac
   */
  private async getZoneBySac(sac: Sac): Promise<Zone | null> {
    const allZones = await database.getAllZones();
    return allZones.find(z => z.id === sac.zoneId) || null;
  }

  /**
   * Récupère le wagon d'une zone
   */
  private async getWagonByZone(zone: Zone): Promise<Wagon | null> {
    const allWagons = await database.getAllWagons();
    return allWagons.find(w => w.id === zone.wagonId) || null;
  }

  /**
   * Récupère toutes les pièces prioritaires non posées
   */
  async getPiecesPrioritairesNonPosees(): Promise<PieceCompleteInfo[]> {
    try {
      const piecesPrioritaires = await database.getPiecesPrioritaires();
      const nonPosees = piecesPrioritaires.filter(p => p.etat !== EtatPiece.INSTALLED);

      const result: PieceCompleteInfo[] = [];
      for (const piece of nonPosees) {
        const sac = await this.getSacByPiece(piece);
        if (!sac) continue;

        const zone = await this.getZoneBySac(sac);
        if (!zone) continue;

        const wagon = await this.getWagonByZone(zone);
        if (!wagon) continue;

        result.push({ piece, sac, zone, wagon });
      }

      return result;
    } catch (error) {
      console.error('Erreur dans getPiecesPrioritairesNonPosees:', error);
      return [];
    }
  }

  /**
   * Réinitialise l'état d'une pièce à UNINSTALLED
   */
  async resetPieceEtat(pieceId: number): Promise<void> {
    await database.updatePieceEtat(pieceId, EtatPiece.UNINSTALLED);
  }
}

export const scannerManager = new ScannerManager();
