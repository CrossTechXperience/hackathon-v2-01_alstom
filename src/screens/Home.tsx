import React, { useState } from 'react';
import { StyleSheet, useColorScheme, View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Scanner from './Scanner';
import {PlacementGrid} from './PlacementGrid';

type PieceData = {
  id: string;
  priority: boolean;
  state: PieceState;
  zone: string;
  wagon: string;
  positionIndex: number;
};

export enum PieceState {
    UNINSTALLED = 0,
    ONWAIT = 1,
    BEING = 2,
    INSTALLED = 3,
    ERROR = 4,
}

function getStatusText(state: PieceState): string {
    switch(state) {
        case PieceState.UNINSTALLED:
            return "Non installé";
        case PieceState.ONWAIT:
            return "En attente";
        case PieceState.BEING:
            return "Installation en cours";
        case PieceState.INSTALLED:
            return "Installé";
        case PieceState.ERROR:
            return "Erreur";
        default:
            return "Inconnu";
    }
}

export default function Home() {
  const isDarkMode = useColorScheme() === 'dark';
  const safeAreaInsets = useSafeAreaInsets();

  // États
  const [modalVisible, setModalVisible] = useState(false);
  const [isGridViewVisible, setGridViewVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPiece, setScannedPiece] = useState<PieceData | null>(null);
  const [installedPieces, setInstalledPieces] = useState<number[]>([]);
  const [waitingPieces, setWaitingPieces] = useState<number[]>([]);

  const ROWS = 3;
  const COLS = 3;

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#333' : '#fff',
    flex: 1,
  };
  const textStyle = { color: isDarkMode ? '#fff' : '#000' };

  const handlePieceAction = (newState: PieceState) => {
    if (scannedPiece) {
      setScannedPiece({ ...scannedPiece, state: newState });

      if (newState === PieceState.INSTALLED) {
        setInstalledPieces(prev => [...new Set([...prev, scannedPiece.positionIndex])]);
        setWaitingPieces(prev => prev.filter(p => p !== scannedPiece.positionIndex));
      } else if (newState === PieceState.ONWAIT) {
        setWaitingPieces(prev => [...new Set([...prev, scannedPiece.positionIndex])]);
        setInstalledPieces(prev => prev.filter(p => p !== scannedPiece.positionIndex));
        setModalVisible(false);
      }
    }
  };

  // --- LOGIQUE DU SCANNER ---
  if (isScanning) {
      return (
          <Scanner
            onClose={() => setIsScanning(false)}
            onScan={(val) => {
                try {
                    const data = JSON.parse(val);
                    setScannedPiece(data);
                    setIsScanning(false);
                    setModalVisible(true);
                } catch (e) {
                    Alert.alert("Erreur", "Ce QR Code n'est pas valide pour l'application.");
                    setIsScanning(false);
                }
            }}
          />
      );
  }

  // --- ACCUEIL ---
  return (
    <View style={[styles.container, backgroundStyle, { paddingTop: safeAreaInsets.top }]}>

      <TouchableOpacity
        style={styles.topRightLink}
        onPress={() => {
            setScannedPiece(null);
            setModalVisible(true);
        }}
      >
        <Text style={styles.helpButton}>?</Text>
      </TouchableOpacity>

      <Text style={[styles.title, textStyle]}>Alstom CTX</Text>
      <Text style={[styles.text, textStyle, {marginBottom: 30}]}>Prêt à poser les panneaux ?</Text>

      <TouchableOpacity
        style={styles.bigScanButton}
        onPress={() => setIsScanning(true)}
      >
        <Text style={styles.bigScanButtonText}>Scanner</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.viewGridButton}
        onPress={() => setGridViewVisible(true)}
      >
        <Text style={styles.bigScanButtonText}>Voir la grille</Text>
      </TouchableOpacity>

      {/* --- MODALE PIÈCE --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>

                {scannedPiece ? (
                    <>
                        <Text style={[styles.modalTitle, {color: '#2E7D32'}]}>Pièce Identifiée !</Text>
                        <View style={styles.pieceDetailsContainer}>
                            <View style={{flex: 2, marginRight: 10}}>
                                <PlacementGrid
                                    rows={ROWS}
                                    columns={COLS}
                                    highlightedIndex={scannedPiece.positionIndex}
                                    installedIndices={installedPieces}
                                    waitingIndices={waitingPieces}
                                />
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.label}>REF : {scannedPiece.id}</Text>
                                <Text style={styles.label}>Zone : {scannedPiece.zone}</Text>
                                <Text style={styles.label}>Wagon : {scannedPiece.wagon}</Text>
                                <Text style={styles.label}>État : {getStatusText(scannedPiece.state)}</Text>
                            </View>
                        </View>

                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                style={[styles.actionButton, {backgroundColor: '#2E7D32'}]}
                                onPress={() => handlePieceAction(PieceState.INSTALLED)}
                            >
                                <Text style={styles.actionButtonText}>Valider la pose</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, {backgroundColor: '#FFC107'}]}
                                onPress={() => handlePieceAction(PieceState.ONWAIT)}
                            >
                                <Text style={[styles.actionButtonText, {color: 'black'}]}>Mettre en attente</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.modalTitle}>Aide</Text>
                        <Text style={styles.modalText}>
                            Utilisez le scanner pour identifier l'emplacement des panneaux phoniques via leur QR Code.
                        </Text>
                    </>
                )}

                <TouchableOpacity
                    style={[styles.closeButton, {marginTop: 20, backgroundColor: '#888'}]}
                    onPress={() => setModalVisible(false)}
                >
                    <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
            </View>
          </View>
      </Modal>

      {/* --- MODALE GRILLE --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isGridViewVisible}
        onRequestClose={() => setGridViewVisible(false)}
      >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Grille de Placement</Text>
                <PlacementGrid
                    rows={ROWS}
                    columns={COLS}
                    highlightedIndex={-1} // Aucune pièce mise en avant ici
                    installedIndices={installedPieces}
                    waitingIndices={waitingPieces}
                />

                <TouchableOpacity
                    style={[styles.closeButton, {backgroundColor: '#888'}]}
                    onPress={() => setGridViewVisible(false)}
                >
                    <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
            </View>
          </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 20 },
  text: { fontSize: 18 },
  topRightLink: { position: 'absolute', right: 20, top: 50, zIndex: 10 },
  helpButton: { fontSize: 30, color: 'green', fontWeight: 'bold' },
  bigScanButton: { backgroundColor: '#005EB8', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 20, elevation: 5 },
  bigScanButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  viewGridButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
  },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: 'black' },
  modalText: { marginBottom: 20, textAlign: 'center', color: '#333' },
  pieceDetailsContainer: { flexDirection: 'row', width: '100%', alignItems: 'center' },
  infoBox: { flex: 1, backgroundColor: '#F5F5F5', padding: 15, borderRadius: 10, justifyContent: 'center' },
  label: { fontWeight: 'bold', color: '#555', marginTop: 5 },
  value: { fontSize: 18, color: '#000', marginBottom: 5 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 },
  actionButton: { flex: 1, padding: 15, borderRadius: 10, marginHorizontal: 5, alignItems: 'center' },
  actionButtonText: { color: 'white', fontWeight: 'bold' },
  closeButton: { backgroundColor: '#2196F3', borderRadius: 10, padding: 12, paddingHorizontal: 20, width: '100%', marginTop: 20 },
  closeButtonText: { fontWeight: 'bold', textAlign: 'center', color: 'white', fontSize: 16 },
});