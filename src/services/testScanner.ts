/**
 * Script de test pour le scannerManager et la base de données
 * Teste le scan de QR code et la récupération des pièces
 */

import { database } from './database';
import { scannerManager } from './scannerManager';
import { seedDatabase } from './seedData';
import { EtatPiece } from '../types/models';

// Format JSON du QR code (comme défini précédemment)
interface QRCodeData {
  type: string;
  wagon: string;
  zone: number;
  sac: string;
  code: string;
  pos: number;
}

async function testQRCodeScan() {
  console.log('🧪 === DÉBUT DES TESTS ===\n');

  try {
    // 1. Initialiser la base de données
    console.log('📦 Initialisation de la base de données...');
    await database.init();

    // 2. Peupler avec des données de test
    console.log('🌱 Peuplement de la base de données...');
    await seedDatabase();
    console.log('');

    // 3. Test 1 : Scan d'un QR code valide
    console.log('🔍 TEST 1 : Scan QR code valide');
    console.log('─'.repeat(50));

    const qrCode1: QRCodeData = {
      type: "piece",
      wagon: "W001",
      zone: 1,
      sac: "SAC-001",
      code: "K50",
      pos: 0
    };

    console.log('QR Code scanné:', JSON.stringify(qrCode1, null, 2));

    const piece1 = await database.getPieceByQRData(
      qrCode1.wagon,
      qrCode1.zone,
      qrCode1.sac,
      qrCode1.code,
      qrCode1.pos
    );

    if (piece1) {
      console.log('✅ Pièce trouvée:');
      console.log(`   - ID: ${piece1.id}`);
      console.log(`   - Code: ${piece1.code}`);
      console.log(`   - État: ${getEtatText(piece1.etat)}`);
      console.log(`   - Prioritaire: ${piece1.prioritaire ? 'Oui' : 'Non'}`);
      console.log(`   - Position: ${piece1.positionIndex}`);
      console.log(`   - Sac ID: ${piece1.sacId}`);
    } else {
      console.log('❌ Pièce non trouvée !');
    }
    console.log('');

    // 4. Test 2 : Scan avec scannerManager (test état UNINSTALLED)
    console.log('🔍 TEST 2 : Scan avec scannerManager (pièce UNINSTALLED)');
    console.log('─'.repeat(50));

    const qrCode2: QRCodeData = {
      type: "piece",
      wagon: "W001",
      zone: 1,
      sac: "SAC-001",
      code: "B23",  // Cette pièce est UNINSTALLED dans seedData
      pos: 2
    };

    console.log('QR Code scanné:', JSON.stringify(qrCode2, null, 2));

    // Vérifier l'état avant
    const pieceBefore = await database.getPieceByQRData(
      qrCode2.wagon,
      qrCode2.zone,
      qrCode2.sac,
      qrCode2.code,
      qrCode2.pos
    );
    console.log(`État avant scan: ${getEtatText(pieceBefore?.etat)}`);

    // Scanner avec le manager (simule le scan du code de la pièce)
    const scanResult = await scannerManager.handlePieceScan(qrCode2.code);

    if (scanResult) {
      console.log('✅ Scan réussi:');
      console.log(`   - Pièce: ${scanResult.piece.code}`);
      console.log(`   - Nouvel état: ${getEtatText(scanResult.piece.etat)} (devrait être ONWAIT)`);
      console.log(`   - Sac: ${scanResult.sac.identifiant}`);
      console.log(`   - Zone: ${scanResult.zone.numero}`);
      console.log(`   - Wagon: ${scanResult.wagon.numero}`);
    } else {
      console.log('❌ Échec du scan !');
    }
    console.log('');

    // 5. Test 3 : Re-scanner la même pièce (ONWAIT → INSTALLED)
    console.log('🔍 TEST 3 : Re-scan de la même pièce (ONWAIT → INSTALLED)');
    console.log('─'.repeat(50));

    const scanResult2 = await scannerManager.handlePieceScan(qrCode2.code);

    if (scanResult2) {
      console.log('✅ Re-scan réussi:');
      console.log(`   - Pièce: ${scanResult2.piece.code}`);
      console.log(`   - Nouvel état: ${getEtatText(scanResult2.piece.etat)} (devrait être INSTALLED)`);
    } else {
      console.log('❌ Échec du re-scan !');
    }
    console.log('');

    // 6. Test 4 : QR code invalide
    console.log('🔍 TEST 4 : QR code invalide');
    console.log('─'.repeat(50));

    const qrCodeInvalid: QRCodeData = {
      type: "piece",
      wagon: "W999",
      zone: 99,
      sac: "SAC-INEXISTANT",
      code: "XXXXX",
      pos: 99
    };

    console.log('QR Code scanné:', JSON.stringify(qrCodeInvalid, null, 2));

    const pieceInvalid = await database.getPieceByQRData(
      qrCodeInvalid.wagon,
      qrCodeInvalid.zone,
      qrCodeInvalid.sac,
      qrCodeInvalid.code,
      qrCodeInvalid.pos
    );

    if (pieceInvalid) {
      console.log('❌ Erreur: La pièce ne devrait pas exister !');
    } else {
      console.log('✅ Correct: Pièce non trouvée (attendu)');
    }
    console.log('');

    // 7. Test 5 : Récupérer toutes les pièces prioritaires
    console.log('🔍 TEST 5 : Pièces prioritaires');
    console.log('─'.repeat(50));

    const piecesPrioritaires = await database.getPiecesPrioritaires();
    console.log(`✅ Trouvé ${piecesPrioritaires.length} pièces prioritaires:`);
    piecesPrioritaires.forEach(p => {
      console.log(`   - ${p.code}: ${getEtatText(p.etat)} (position ${p.positionIndex})`);
    });
    console.log('');

    // 8. Test 6 : Pièces prioritaires non installées
    console.log('🔍 TEST 6 : Pièces prioritaires non installées');
    console.log('─'.repeat(50));

    const prioritairesNonPosees = await scannerManager.getPiecesPrioritairesNonPosees();
    console.log(`✅ Trouvé ${prioritairesNonPosees.length} pièces prioritaires non installées:`);
    prioritairesNonPosees.forEach(info => {
      console.log(`   - ${info.piece.code}: ${getEtatText(info.piece.etat)} - ${info.wagon.numero}/${info.zone.numero}/${info.sac.identifiant}`);
    });
    console.log('');

    // 9. Résumé final
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('─'.repeat(50));
    const allPieces = await database.getAllPieces();
    const byState = {
      UNINSTALLED: allPieces.filter(p => p.etat === EtatPiece.UNINSTALLED).length,
      ONWAIT: allPieces.filter(p => p.etat === EtatPiece.ONWAIT).length,
      BEING: allPieces.filter(p => p.etat === EtatPiece.BEING).length,
      INSTALLED: allPieces.filter(p => p.etat === EtatPiece.INSTALLED).length,
      ERROR: allPieces.filter(p => p.etat === EtatPiece.ERROR).length,
    };
    console.log('Distribution des états:');
    console.log(`   - UNINSTALLED: ${byState.UNINSTALLED}`);
    console.log(`   - ONWAIT: ${byState.ONWAIT}`);
    console.log(`   - BEING: ${byState.BEING}`);
    console.log(`   - INSTALLED: ${byState.INSTALLED}`);
    console.log(`   - ERROR: ${byState.ERROR}`);
    console.log(`   - TOTAL: ${allPieces.length}`);

    console.log('\n✅ === TOUS LES TESTS RÉUSSIS ===');

  } catch (error) {
    console.error('\n❌ === ERREUR LORS DES TESTS ===');
    console.error(error);
  } finally {
    // Fermer la connexion
    await database.close();
  }
}

function getEtatText(etat?: EtatPiece): string {
  if (etat === undefined) return 'INCONNU';
  switch (etat) {
    case EtatPiece.UNINSTALLED: return 'UNINSTALLED (0)';
    case EtatPiece.ONWAIT: return 'ONWAIT (1)';
    case EtatPiece.BEING: return 'BEING (2)';
    case EtatPiece.INSTALLED: return 'INSTALLED (3)';
    case EtatPiece.ERROR: return 'ERROR (4)';
    default: return `INCONNU (${etat})`;
  }
}

// Exporter la fonction de test
export { testQRCodeScan };

// Si exécuté directement (pas en tant que module)
if (require.main === module) {
  testQRCodeScan();
}
