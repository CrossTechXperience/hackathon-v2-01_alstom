import React, { useState } from 'react';
import { StyleSheet, useColorScheme, View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Scanner from './Scanner';

type PieceData = {
  id: string;
  priority: boolean;
  state: number;
  zone: string;
  wagon: string;
};

export default function Home() {
  const isDarkMode = useColorScheme() === 'dark';
  const safeAreaInsets = useSafeAreaInsets();

  // États
  const [modalVisible, setModalVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  //Etat pour stocker la pièce scannée
  const [scannedPiece, setScannedPiece] = useState<PieceData | null>(null);

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
            onScan={(val) => {
                try {
                    // On lit les infos
                    console.log("Lecture du QR:", val);
                    const data = JSON.parse(val); // On convertit le texte en Objet

                    setScannedPiece(data); // On sauvegarde
                    setIsScanning(false);  // On ferme la caméra
                    setModalVisible(true); // On ouvre la fiche info
                } catch (e) {
                    // Si ce n'est pas du JSON valide
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
                            <Text style={styles.label}>REF : {scannedPiece.id}</Text>

                            <Text style={styles.label}>Zone : {scannedPiece.zone}</Text>

                            <Text style={styles.label}>Wagon : {scannedPiece.wagon}</Text>

                            <Text style={styles.label}>État : {scannedPiece.state}</Text>
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