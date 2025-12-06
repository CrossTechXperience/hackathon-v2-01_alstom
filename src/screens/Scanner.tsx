/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, useCameraFormat, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';

// Taille ecran et taille du carré pour le mask
const { width, height } = Dimensions.get('window');
const SCAN_SIZE = 250;

export default function Scanner({ onClose, onScan }: { onClose : () => void, onScan: (val: string) => void }) {
    const { hasPermission, requestPermission} = useCameraPermission();
    const device = useCameraDevice('back');
    const [lastScanned, setLastScanned] = useState('');

    const format = useCameraFormat(device, [
        { videoResolution: { width: 1280, height: 720 } },
        { fps: 30 }
    ]);

    useEffect(() => {
        if (!hasPermission) requestPermission();
    }, [hasPermission, requestPermission]);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: (codes) => {
            if (codes.length > 0) {
                console.log("On scanne");
                const value = codes[0].value;
                if (value && value !== lastScanned) {
                    setLastScanned(value);
                    // On renvoie le code scanné au parent.
                    if (onScan) onScan(value);
                }
            }
        }
    });

    if (!device || !hasPermission) return <View><Text>Il est nécessaire d'autoriser la caméra</Text></View>

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                codeScanner={codeScanner}
                format={format}
            />

            {/* MASQUE */}
            <View style={styles.maskContainer}>
                {/* BANDEAU HAUT */}
                <View style={styles.maskRow} />

                {/* LIGNE AVEC TROU */}
                <View style={styles.maskCenterRow}>
                    <View style={styles.maskSide} />
                    <View style={styles.scanFrame} />
                    <View style={styles.maskSide} />
                </View>

                {/* BANDEAU BAS */}
                <View style={styles.maskRow} />
            </View>

            {/* BOUTON DE FERMETURE */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>Fermer X</Text>
            </TouchableOpacity>

        </View>
    );
}

const overlayColor = 'rgba(0,0,0,0.9)';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },

        // --- NOUVEAUX STYLES DU MASQUE ---
        maskContainer: {
            ...StyleSheet.absoluteFillObject,
            zIndex: 1, // Juste au-dessus de la caméra
        },
        maskRow: {
            flex: 1,
            backgroundColor: overlayColor,
            width: width,
        },
        maskCenterRow: {
            flexDirection: 'row',
            height: SCAN_SIZE, // Hauteur fixe pour la ligne du milieu
        },
        maskSide: {
            flex: 1,
            backgroundColor: overlayColor,
        },
        scanFrame: {
            width: SCAN_SIZE,
            height: SCAN_SIZE,
            // Pas de fond ! C'est le trou.
            borderWidth: 2,
            borderColor: '#00FF00', // Bordure verte
        },
        // --- FIN STYLES DU MASQUE ---

        closeButton: {
            position: 'absolute',
            top: 50,
            left: 20,
            zIndex: 10, // Tout au-dessus
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: 10,
            borderRadius: 8,
        },
        closeText: { fontWeight: 'bold', color: 'white' },
        helpTextContainer: {
            position: 'absolute',
            bottom: 80,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 10,
        },
        helpText: {
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: 8,
            borderRadius: 5,
        }
});