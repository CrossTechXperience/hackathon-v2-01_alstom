/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, Text, Modal, TouchableOpacity } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  // Variables
  const appTitle = "Welcome to my app !";
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container, { paddingTop: safeAreaInsets.top }}>
      <TouchableOpacity
        style={[styles.topRightLink, {top: safeAreaInsets.top + 10}]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.helpContainer}>?</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        {appTitle}
      </Text>

      <Text style={styles.text}>
        Il est prêt à coder ?
      </Text>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Informations</Text>
            <Text styles={styles.text}>Ici les infos</Text>

            // Bouton de fermeture
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
            >
                <Text style={styles.text}>Fermer</Text>
            </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 50,
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },

  helpContainer: {
    position: 'absolute',
    right: 5,
    fontSize: 36,
    color: 'green'
  },

  text: {
    fontSize: 18,
    color: '#fff'
  },

  // Style du "Lien" en haut à droite
    topRightLink: {
      position: 'absolute',
      right: 20,
      zIndex: 10,
      padding: 5, // Zone de touche un peu plus grande
    },

    // --- STYLES DE LA MODALE ---
    modalOverlay: {
      flex: 1,
      justifyContent: 'center', // Centre verticalement
      alignItems: 'center',     // Centre horizontalement
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Noir à 50% de transparence
    },
    modalContent: {
      width: '80%', // Prend 80% de la largeur de l'écran
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 25,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    modalText: {
      marginBottom: 20,
      textAlign: 'center',
    },
    closeButton: {
      backgroundColor: '#2196F3', // Bleu Material Design
      borderRadius: 10,
      padding: 10,
      paddingHorizontal: 20,
      elevation: 2,
    },
    closeButtonText: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
},
});

export default App;
