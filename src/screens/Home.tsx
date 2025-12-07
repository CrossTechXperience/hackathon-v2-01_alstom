import React, { useState, useEffect } from 'react';
import { StyleSheet, useColorScheme, View, Text, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Scanner from './Scanner'; // Assure-toi que c'est le bon chemin
import { scannerManager } from '../services/scannerManager';
import { PlacementGrid } from './PlacementGrid';
import { database } from '../services/database';
import { seedDatabase } from '../services/seedData';
import TestScreen from './TestScreen';
// IMPORT CRUCIAL : On utilise le modèle partagé !
import { EtatPiece } from '../types/models';

type PieceData = {
  id: string; // ou number selon ta DB, attention ici
  priority: boolean;
  state: EtatPiece; // On utilise l'Enum du model
  zone: any;
  wagon: any;
  positionIndex: number;
  piece: any;
  sac: any;
};

// Fonction utilitaire mise à jour avec EtatPiece
function getStatusText(state: EtatPiece): string {
    switch(state) {
        case EtatPiece.UNINSTALLED: return "Non installé";
        case EtatPiece.ONWAIT: return "En attente (Scanné)";
        case EtatPiece.BEING: return "En cours";
        case EtatPiece.INSTALLED: return "Installé";
        case EtatPiece.ERROR: return "Erreur";
        default: return "Inconnu";
    }
}

export default function Home() {
  const isDarkMode = useColorScheme() === 'dark';
  const safeAreaInsets = useSafeAreaInsets();

  // États
  const [modalVisible, setModalVisible] = useState(false);
  const [isGridViewVisible, setGridViewVisible] = useState(false);
  const [isTestViewVisible, setTestViewVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPiece, setScannedPiece] = useState<PieceData | null>(null);

  // Indices pour la grille
  const [installedPieces, setInstalledPieces] = useState<number[]>([]);
  const [waitingPieces, setWaitingPieces] = useState<number[]>([]);

  const [dbReady, setDbReady] = useState(false);

  const ROWS = 4; // Ta seedData va jusqu'à l'index 15, donc 4x4
  const COLS = 4;

  // Initialisation DB
  useEffect(() => {
    const init = async () => {
        try {
            console.log('🔄 Initialisation de la base de données...');
            await database.init();
            console.log('✅ Base de données initialisée');

            const pieces = await database.getAllPieces();
            console.log(`📊 ${pieces.length} pièces trouvées dans la DB`);

            if (pieces.length === 0) {
                console.log('🌱 Aucune donnée - Lancement du seed...');
                await seedDatabase();
                console.log('✅ Seed terminé');
            }

            // Recharger les états visuels pour la grille
            const allPieces = await database.getAllPieces();
            updateGridState(allPieces);

            setDbReady(true);
            console.log('✅ Application prête !');
        } catch (error) {
            console.error('❌ ERREUR lors de l\'initialisation de la DB:');
            console.error(error);
            Alert.alert('Erreur DB', `Impossible de charger la base de données: ${error}`);
            setDbReady(true); // On laisse passer même si erreur pour pas bloquer
        }
    };
    init();
  }, []);

  const updateGridState = (pieces: any[]) => {
      const installed = pieces.filter(p => p.etat === EtatPiece.INSTALLED).map(p => p.positionIndex);
      const waiting = pieces.filter(p => p.etat === EtatPiece.ONWAIT).map(p => p.positionIndex);
      setInstalledPieces(installed);
      setWaitingPieces(waiting);
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#333' : '#fff',
    flex: 1,
  };
  const textStyle = { color: isDarkMode ? '#fff' : '#000' };

  const handlePieceAction = async (newState: EtatPiece) => {
    if (scannedPiece && scannedPiece.piece) {
      try {
          // 1. Update DB
          await database.updatePieceEtat(scannedPiece.piece.id, newState);

          // 2. Update UI Local
          const updatedPiece = { ...scannedPiece, state: newState };
          setScannedPiece(updatedPiece);

          // 3. Refresh Grille
          if (newState === EtatPiece.INSTALLED) {
            setInstalledPieces(prev => [...new Set([...prev, scannedPiece.positionIndex])]);
            setWaitingPieces(prev => prev.filter(p => p !== scannedPiece.positionIndex));
          } else if (newState === EtatPiece.ONWAIT) {
            setWaitingPieces(prev => [...new Set([...prev, scannedPiece.positionIndex])]);
            setInstalledPieces(prev => prev.filter(p => p !== scannedPiece.positionIndex));
          }

          setModalVisible(false);
      } catch (e) {
          Alert.alert("Erreur", "Impossible de sauvegarder");
      }
    }
  };

  if (isScanning) {
      return (
        <Scanner
            onClose={() => setIsScanning(false)}
            onScan={async (val) => {
                try {
                    console.log("Scan:", val);
                    const info = await scannerManager.handlePieceScan(val);

                    if (info) {
                        // Mapping pour l'affichage UI
                        const uiData: Piece = {
                            id: info.id,
                            priority: info.prioritaire,
                            state: info.etat,
                            zone: info.numero,
                            wagon: info.numero,
                            positionIndex: info.positionIndex,
                            piece: info.piece,
                            sac: info.sac
                        };
                        setScannedPiece(uiData);
                        setIsScanning(false);
                        setModalVisible(true);
                    } else {
                        Alert.alert("Inconnu", "Code non trouvé dans la base");
                        setIsScanning(false);
                    }
                } catch (e) {
                    setIsScanning(false);
                }
            }}
          />
      );
  }

  if (!dbReady) {
      return (
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Chargement...</Text>
        </View>
      );
  }

  return (
    <View style={[styles.container, backgroundStyle, { paddingTop: safeAreaInsets.top }]}>

      <TouchableOpacity style={styles.topRightLink} onPress={() => { setScannedPiece(null); setModalVisible(true); }}>
        <Text style={styles.helpButton}>?</Text>
      </TouchableOpacity>

      <Text style={[styles.title, textStyle]}>Alstom CTX</Text>

      <TouchableOpacity style={styles.bigScanButton} onPress={() => setIsScanning(true)}>
        <Text style={styles.bigScanButtonText}>Scanner</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.viewGridButton} onPress={() => setGridViewVisible(true)}>
        <Text style={styles.bigScanButtonText}>Voir la grille</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={() => setTestViewVisible(true)}>
        <Text style={styles.bigScanButtonText}>🧪 Tests</Text>
      </TouchableOpacity>

      {/* MODALE INFO PIÈCE */}
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                {scannedPiece ? (
                    <>
                        <Text style={[styles.modalTitle, {color: 'green'}]}>Pièce Identifiée !</Text>
                        <View style={styles.pieceDetailsContainer}>
                            <View style={{flex: 1, marginRight: 10, height: 150}}>
                                <PlacementGrid
                                    rows={ROWS} columns={COLS}
                                    highlightedIndex={scannedPiece.positionIndex}
                                    installedIndices={installedPieces}
                                    waitingIndices={waitingPieces}
                                />
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.label}>CODE: {scannedPiece.piece.code}</Text>
                                <Text>Sac: {scannedPiece.sac.identifiant}</Text>
                                <Text>Zone: {scannedPiece.zone}</Text>
                                <Text>Wagon: {scannedPiece.wagon}</Text>
                                <Text style={{fontWeight:'bold', marginTop:5}}>
                                    Etat: {getStatusText(scannedPiece.state)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#2E7D32'}]} onPress={() => handlePieceAction(EtatPiece.INSTALLED)}>
                                <Text style={styles.actionButtonText}>Valider Pose</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#FFC107'}]} onPress={() => handlePieceAction(EtatPiece.ONWAIT)}>
                                <Text style={styles.actionButtonText}>Attente</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.modalTitle}>Aide</Text>
                        <Text>Scannez un code QR.</Text>
                    </>
                )}
                <TouchableOpacity style={[styles.closeButton, {backgroundColor:'grey'}]} onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
            </View>
          </View>
      </Modal>

      {/* MODALE GRILLE GLOBALE */}
      <Modal visible={isGridViewVisible} transparent={true} animationType="slide" onRequestClose={() => setGridViewVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Grille Complète</Text>
                <PlacementGrid
                    rows={ROWS} columns={COLS}
                    highlightedIndex={-1}
                    installedIndices={installedPieces}
                    waitingIndices={waitingPieces}
                />
                <TouchableOpacity style={[styles.closeButton, {backgroundColor:'grey'}]} onPress={() => setGridViewVisible(false)}>
                    <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
            </View>
          </View>
      </Modal>

      {/* MODALE TESTS */}
      <Modal visible={isTestViewVisible} transparent={false} animationType="slide" onRequestClose={() => setTestViewVisible(false)}>
          <View style={{flex: 1, paddingTop: safeAreaInsets.top}}>
            <TestScreen />
            <TouchableOpacity
              style={{position: 'absolute', top: safeAreaInsets.top + 10, right: 20, backgroundColor: '#FF3B30', padding: 10, borderRadius: 8}}
              onPress={() => setTestViewVisible(false)}
            >
              <Text style={{color: 'white', fontWeight: 'bold'}}>Fermer X</Text>
            </TouchableOpacity>
          </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 20 },
  topRightLink: { position: 'absolute', right: 20, top: 50, zIndex: 10 },
  helpButton: { fontSize: 30, color: 'green', fontWeight: 'bold' },
  bigScanButton: { backgroundColor: '#005EB8', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 20, elevation: 5 },
  bigScanButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  viewGridButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10, elevation: 5 },
  testButton: { backgroundColor: '#FF9800', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10, elevation: 5 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: 'black' },
  pieceDetailsContainer: { flexDirection: 'row', width: '100%', marginBottom: 20 },
  infoBox: { flex: 1, backgroundColor: '#F5F5F5', padding: 10, borderRadius: 10, justifyContent: 'center' },
  label: { fontWeight: 'bold', color: '#555' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 },
  actionButton: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' },
  actionButtonText: { color: 'white', fontWeight: 'bold' },
  closeButton: { padding: 12, borderRadius: 10, width: '100%', marginTop: 20 },
  closeButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});