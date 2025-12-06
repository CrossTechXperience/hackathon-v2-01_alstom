import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';

const { width } = Dimensions.get('window');
const SCAN_SIZE = 250;

export default function Scanner({ onClose, onScan }: { onClose : () => void, onScan: (val: string) => void }) {
    const { hasPermission, requestPermission} = useCameraPermission();
    const device = useCameraDevice('back');
    const [lastScanned, setLastScanned] = useState('');

    // ON A SUPPRIMÉ useCameraFormat POUR ÉVITER LE CRASH ANDROID
    // La caméra va choisir le format par défaut automatiquement.

    useEffect(() => {
        if (!hasPermission) requestPermission();
    }, [hasPermission, requestPermission]);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: (codes) => {
            if (codes.length > 0) {
                const value = codes[0].value;
                if (value && value !== lastScanned) {
                    setLastScanned(value);
                    if (onScan) onScan(value);
                }
            }
        }
    });

    if (!device || !hasPermission) return <View style={styles.container}><Text style={{color:'white', marginTop:100, textAlign:'center'}}>Caméra non accessible</Text></View>

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                codeScanner={codeScanner}
                // Plus de format={format} ici
                video={false} // Optimisation perf
                photo={false} // Optimisation perf
            />

            {/* MASQUE VISUEL */}
            <View style={styles.maskContainer}>
                <View style={styles.maskRow} />
                <View style={styles.maskCenterRow}>
                    <View style={styles.maskSide} />
                    <View style={styles.scanFrame} />
                    <View style={styles.maskSide} />
                </View>
                <View style={styles.maskRow} />
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>Fermer X</Text>
            </TouchableOpacity>
        </View>
    );
}

const overlayColor = 'rgba(0,0,0,0.8)'; // Un peu plus sombre pour le contraste

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    maskContainer: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
    maskRow: { flex: 1, backgroundColor: overlayColor, width: width },
    maskCenterRow: { flexDirection: 'row', height: SCAN_SIZE },
    maskSide: { flex: 1, backgroundColor: overlayColor },
    scanFrame: { width: SCAN_SIZE, height: SCAN_SIZE, borderWidth: 2, borderColor: '#00FF00', backgroundColor: 'transparent' },
    closeButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 8 },
    closeText: { fontWeight: 'bold', color: 'white' }
});