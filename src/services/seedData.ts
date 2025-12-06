import { database } from './database';
import { EtatPiece } from '../types/models';

export async function seedDatabase() {
  try {
    console.log('Début du peuplement de la base de données...');

    // Supprimer toutes les données existantes
    await database.deleteAllData();

    // Créer 3 wagons
    const wagon1Id = await database.addWagon('W001');
    const wagon2Id = await database.addWagon('W002');
    const wagon3Id = await database.addWagon('W003');

    console.log('✅ Wagons créés');

    // Pour chaque wagon, créer 4 zones (1 à 4)
    const zones: { [key: string]: number[] } = {
      W001: [],
      W002: [],
      W003: [],
    };

    for (const wagonId of [wagon1Id, wagon2Id, wagon3Id]) {
      const wagon = await database.getWagonById(wagonId);
      if (wagon) {
        for (let i = 1; i <= 4; i++) {
          const zoneId = await database.addZone(i, wagonId);
          zones[wagon.numero].push(zoneId);
        }
      }
    }

    console.log('✅ Zones créées (4 par wagon)');

    // Créer des sacs dans différentes zones
    const sacsData = [
      // Wagon 1
      { identifiant: 'SAC-001', zoneIndex: 0, wagon: 'W001' },
      { identifiant: 'SAC-002', zoneIndex: 1, wagon: 'W001' },
      { identifiant: 'SAC-003', zoneIndex: 2, wagon: 'W001' },
      { identifiant: 'SAC-004', zoneIndex: 3, wagon: 'W001' },
      // Wagon 2
      { identifiant: 'SAC-005', zoneIndex: 0, wagon: 'W002' },
      { identifiant: 'SAC-006', zoneIndex: 1, wagon: 'W002' },
      { identifiant: 'SAC-007', zoneIndex: 2, wagon: 'W002' },
      // Wagon 3
      { identifiant: 'SAC-008', zoneIndex: 0, wagon: 'W003' },
      { identifiant: 'SAC-009', zoneIndex: 1, wagon: 'W003' },
    ];

    const sacIds: number[] = [];
    for (const sacData of sacsData) {
      const zoneId = zones[sacData.wagon][sacData.zoneIndex];
      const sacId = await database.addSac(sacData.identifiant, zoneId);
      sacIds.push(sacId);
    }

    console.log('✅ Sacs créés');

    // Créer des pièces dans les sacs (position: 0-15 pour la grille 4x4)
    const piecesData = [
      // SAC-001 (positions 0-2)
      { code: 'K50', etat: EtatPiece.POSE, prioritaire: true, positionIndex: 0, sacIndex: 0 },
      { code: 'A1', etat: EtatPiece.SCANNE, prioritaire: false, positionIndex: 1, sacIndex: 0 },
      { code: 'B23', etat: EtatPiece.RIEN, prioritaire: false, positionIndex: 2, sacIndex: 0 },

      // SAC-002 (positions 3-4)
      { code: 'K51', etat: EtatPiece.POSE, prioritaire: true, positionIndex: 3, sacIndex: 1 },
      { code: 'C45', etat: EtatPiece.SCANNE, prioritaire: false, positionIndex: 4, sacIndex: 1 },

      // SAC-003 (positions 5-7)
      { code: 'D12', etat: EtatPiece.RIEN, prioritaire: false, positionIndex: 5, sacIndex: 2 },
      { code: 'K52', etat: EtatPiece.POSE, prioritaire: true, positionIndex: 6, sacIndex: 2 },
      { code: 'E78', etat: EtatPiece.SCANNE, prioritaire: false, positionIndex: 7, sacIndex: 2 },

      // SAC-004 (positions 8-9)
      { code: 'F90', etat: EtatPiece.RIEN, prioritaire: false, positionIndex: 8, sacIndex: 3 },
      { code: 'G34', etat: EtatPiece.SCANNE, prioritaire: false, positionIndex: 9, sacIndex: 3 },

      // SAC-005 (positions 10-11)
      { code: 'K53', etat: EtatPiece.POSE, prioritaire: true, positionIndex: 10, sacIndex: 4 },
      { code: 'H56', etat: EtatPiece.RIEN, prioritaire: false, positionIndex: 11, sacIndex: 4 },

      // SAC-006 (positions 12-13)
      { code: 'I22', etat: EtatPiece.SCANNE, prioritaire: false, positionIndex: 12, sacIndex: 5 },
      { code: 'J88', etat: EtatPiece.RIEN, prioritaire: false, positionIndex: 13, sacIndex: 5 },

      // SAC-007 (positions 14-15, puis 0)
      { code: 'K54', etat: EtatPiece.POSE, prioritaire: true, positionIndex: 14, sacIndex: 6 },
      { code: 'L15', etat: EtatPiece.SCANNE, prioritaire: false, positionIndex: 15, sacIndex: 6 },
      { code: 'M99', etat: EtatPiece.RIEN, prioritaire: false, positionIndex: 0, sacIndex: 6 },

      // SAC-008 (positions 1-2)
      { code: 'N44', etat: EtatPiece.SCANNE, prioritaire: false, positionIndex: 1, sacIndex: 7 },
      { code: 'K55', etat: EtatPiece.POSE, prioritaire: true, positionIndex: 2, sacIndex: 7 },

      // SAC-009 (positions 3-4)
      { code: 'O77', etat: EtatPiece.RIEN, prioritaire: false, positionIndex: 3, sacIndex: 8 },
      { code: 'P33', etat: EtatPiece.SCANNE, prioritaire: false, positionIndex: 4, sacIndex: 8 },
    ];

    for (const pieceData of piecesData) {
      await database.addPiece(
        pieceData.code,
        pieceData.etat,
        pieceData.prioritaire,
        pieceData.positionIndex,
        sacIds[pieceData.sacIndex]
      );
    }

    console.log('✅ Pièces créées');
    console.log('🎉 Base de données peuplée avec succès !');

    // Afficher un résumé
    const wagons = await database.getAllWagons();
    const allZones = await database.getAllZones();
    const sacs = await database.getAllSacs();
    const pieces = await database.getAllPieces();
    const piecesPrioritaires = await database.getPiecesPrioritaires();

    console.log(`📊 Résumé:`);
    console.log(`   - ${wagons.length} wagons`);
    console.log(`   - ${allZones.length} zones`);
    console.log(`   - ${sacs.length} sacs`);
    console.log(`   - ${pieces.length} pièces (dont ${piecesPrioritaires.length} prioritaires)`);

  } catch (error) {
    console.error('❌ Erreur lors du peuplement:', error);
    throw error;
  }
}
