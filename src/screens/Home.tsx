import React, { useState, useEffect } from 'react';
import { StyleSheet, useColorScheme, View, Text, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Scanner from './Scanner';
import { scannerManager, PieceCompleteInfo } from '../services/scannerManager';
import { database } from '../services/database';
import { seedDatabase } from '../services/seedData';

export default function Home() {
  const isDarkMode = useColorScheme() === 'dark';
  const safeAreaInsets = useSafeAreaInsets();

  // États
  const [modalVisible, setModalVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  //Etat pour stocker la pièce scannée
  const [scannedPiece, setScannedPiece] = useState<PieceCompleteInfo | null>(null);

  // Initialiser la DB au montage
  useEffect(() => {
    initDB();
    return () => {
      database.close();
    };
  }, []);

  const initDB = async () => {
    try {
      await database.init();

      // Vérifier si la DB est vide
      const pieces = await database.getAllPieces();

      // Si DB vide, générer des données de test automatiquement
      if (pieces.length === 0) {
        console.log('Base de données vide, génération des données de test...');
        await seedDatabase();
        console.log('Données de test générées avec succès !');
      }

      setDbReady(true);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'initialiser la base de données');
      console.error(error);
    }
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#333' : '#fff',
    flex: 1,
  };
  const textStyle = { color: isDarkMode ? '#fff' : '#000' };

  // --- LOGIQUE DU SCANNER ---
  if (isScanning) {
      return (
          <Scanner
            onClose={() => setIsScanning(false)}
            onScan={async (val) => {
                try {
                    console.log("Code scanné:", val);

                    // Chercher la pièce dans la DB
                    const pieceInfo = await scannerManager.handlePieceScan(val);

                    if (pieceInfo) {
                        setScannedPiece(pieceInfo); // On sauvegarde
                        setIsScanning(false);  // On ferme la caméra
                        setModalVisible(true); // On ouvre la fiche info
                    } else {
                        Alert.alert("Pièce non trouvée", `Le code "${val}" n'existe pas dans la base de données.`);
                        setIsScanning(false);
                    }
                } catch (e) {
                    console.error('Erreur scan:', e);
                    Alert.alert("Erreur", "Une erreur est survenue lors du scan.");
                    setIsScanning(false);
                }
            }}
          />
      );
  }

  // Afficher un loader pendant l'initialisation
  if (!dbReady) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Initialisation...</Text>
      </View>
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

      <Text style={[styles.title, textStyle]}>
        Alstom CTX
      </Text>

      <Text style={[styles.text, textStyle, {marginBottom: 30}]}>
        Prêt à poser les panneaux ?
      </Text>

      <TouchableOpacity
        style={styles.bigScanButton}
        onPress={() => setIsScanning(true)}
      >
        <Text style={styles.bigScanButtonText}>Scanner</Text>
      </TouchableOpacity>

      {/* --- MODALE DYNAMIQUE --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>

                {/* SI ON A SCANNÉ UNE PIÈCE */}
                {scannedPiece ? (
                    <>
                        <Text style={[styles.modalTitle, {color: '#2E7D32'}]}>Pièce Identifiée !</Text>
                        <View style={styles.infoBox}>
<<<<<<< HEAD
                            <Text style={styles.value}>CODE : {scannedPiece.piece.code}</Text>
=======
                            <Text style={styles.label}>REF : {scannedPiece.id}</Text>
>>>>>>> 2ca788e5a9ff732f9b4fd0f819099c2cc7f1d8a5

                            <Text style={styles.label}>Wagon : {scannedPiece.wagon.numero}</Text>

<<<<<<< HEAD
                            <Text style={styles.label}>Zone : {scannedPiece.zone.numero}</Text>

                            <Text style={styles.label}>Sac : {scannedPiece.sac.identifiant}</Text>

                            <Text style={styles.label}>État : {scannedPiece.piece.etat}</Text>

                            <Text style={styles.label}>
                              Prioritaire : {scannedPiece.piece.prioritaire ? '⭐ OUI' : 'Non'}
                            </Text>
=======
                            <Text style={styles.label}>Wagon : {scannedPiece.wagon}</Text>

                            <Text style={styles.label}>État : {scannedPiece.state}</Text>
>>>>>>> 2ca788e5a9ff732f9b4fd0f819099c2cc7f1d8a5
                        </View>
                    </>
                ) : (
                    /* SI C'EST JUSTE L'AIDE */
                    <>
                        <Text style={styles.modalTitle}>Aide</Text>
                        <Text style={styles.modalText}>
                            Utilisez le scanner pour identifier l'emplacement des panneaux phoniques via leur QR Code.
                        </Text>
                    </>
                )}

                {/* Bouton Fermer (s'affiche toujours en bas) */}
                <TouchableOpacity
                    style={[styles.closeButton, {marginTop: 10, backgroundColor: '#888'}]}
                    onPress={() => setModalVisible(false)}
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
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  text: {
    fontSize: 18,
  },
  topRightLink: {
    position: 'absolute',
    right: 20,
    top: 50,
    zIndex: 10,
  },
  helpButton: {
    fontSize: 30,
    color: 'green',
    fontWeight: 'bold',
  },
  bigScanButton: {
      backgroundColor: '#005EB8',
      padding: 20,
      borderRadius: 15,
      alignItems: 'center',
      marginTop: 20,
      elevation: 5,
  },
  bigScanButtonText: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'black',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  // Nouveaux styles pour la fiche pièce
  infoBox: {
      width: '100%',
      backgroundColor: '#F5F5F5',
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
  },
  label: {
      fontWeight: 'bold',
      color: '#555',
      marginTop: 5,
  },
  value: {
      fontSize: 18,
      color: '#000',
      marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 20,
    width: '100%',
  },
  closeButtonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    fontSize: 16
  },
});