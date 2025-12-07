import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { database } from '../services/database';
import { seedDatabase } from '../services/seedData';
import { Wagon, Zone, Sac, Piece } from '../types/models';

export default function DatabaseExample() {
  const [loading, setLoading] = useState(true);
  const [wagons, setWagons] = useState<Wagon[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [sacs, setSacs] = useState<Sac[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [piecesPrioritaires, setPiecesPrioritaires] = useState<Piece[]>([]);

  useEffect(() => {
    // Initialiser la DB avant de charger les données
    const initAndLoad = async () => {
      try {
        await database.init();
        await loadDataWithLoading();
      } catch (error) {
        Alert.alert('Erreur', 'Impossible d\'initialiser la base de données');
        console.error(error);
        setLoading(false);
      }
    };
    initAndLoad();
  }, []);

  const loadDataWithLoading = async () => {
    try {
      setLoading(true);
      await loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [w, z, s, p, pp] = await Promise.all([
        database.getAllWagons(),
        database.getAllZones(),
        database.getAllSacs(),
        database.getAllPieces(),
        database.getPiecesPrioritaires(),
      ]);
      setWagons(w);
      setZones(z);
      setSacs(s);
      setPieces(p);
      setPiecesPrioritaires(pp);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
      console.error(error);
    }
  };

  const handleSeedDatabase = async () => {
    Alert.alert(
      'Générer des données de test',
      'Cela va supprimer toutes les données existantes et créer des données artificielles. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Générer',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await seedDatabase();
              await loadData();
              Alert.alert('Succès', 'Données de test générées avec succès !');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de générer les données');
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAll = async () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer toutes les données ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.deleteAllData();
              await loadData();
              Alert.alert('Succès', 'Toutes les données ont été supprimées');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer les données');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const getEtatColor = (etat: string) => {
    switch (etat) {
      case 'POSE':
        return '#34C759';
      case 'SCANNE':
        return '#007AFF';
      case 'RIEN':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Base de données Hackathon</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.seedButton} onPress={handleSeedDatabase}>
          <Text style={styles.buttonText}>Générer données test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAll}>
          <Text style={styles.buttonText}>Tout supprimer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{wagons.length}</Text>
          <Text style={styles.statLabel}>Wagons</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{zones.length}</Text>
          <Text style={styles.statLabel}>Zones</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{sacs.length}</Text>
          <Text style={styles.statLabel}>Sacs</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{pieces.length}</Text>
          <Text style={styles.statLabel}>Pièces</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {wagons.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune donnée</Text>
            <Text style={styles.emptySubtext}>
              Générez des données de test pour commencer
            </Text>
          </View>
        ) : (
          <>
            {piecesPrioritaires.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  ⭐ Pièces prioritaires ({piecesPrioritaires.length})
                </Text>
                {piecesPrioritaires.map((piece) => (
                  <View key={piece.id} style={styles.pieceCard}>
                    <View style={styles.pieceHeader}>
                      <Text style={styles.pieceCode}>{piece.code}</Text>
                      <View
                        style={[
                          styles.etatBadge,
                          { backgroundColor: getEtatColor(piece.etat) },
                        ]}
                      >
                        <Text style={styles.etatText}>{piece.etat}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {wagons.map((wagon) => {
              const wagonZones = zones.filter((z) => z.wagonId === wagon.id);
              return (
                <View key={wagon.id} style={styles.wagonCard}>
                  <Text style={styles.wagonTitle}>🚂 Wagon {wagon.numero}</Text>

                  {wagonZones.map((zone) => {
                    const zoneSacs = sacs.filter((s) => s.zoneId === zone.id);
                    return (
                      <View key={zone.id} style={styles.zoneSection}>
                        <Text style={styles.zoneTitle}>
                          Zone {zone.numero} ({zoneSacs.length} sacs)
                        </Text>

                        {zoneSacs.map((sac) => {
                          const sacPieces = pieces.filter(
                            (p) => p.sacId === sac.id
                          );
                          return (
                            <View key={sac.id} style={styles.sacCard}>
                              <Text style={styles.sacTitle}>
                                📦 {sac.identifiant} - {sacPieces.length} pièces
                              </Text>

                              {sacPieces.map((piece) => (
                                <View key={piece.id} style={styles.pieceCard}>
                                  <View style={styles.pieceHeader}>
                                    <Text style={styles.pieceCode}>
                                      {piece.code}
                                      {piece.prioritaire && ' ⭐'}
                                    </Text>
                                    <View
                                      style={[
                                        styles.etatBadge,
                                        {
                                          backgroundColor: getEtatColor(
                                            piece.etat
                                          ),
                                        },
                                      ]}
                                    >
                                      <Text style={styles.etatText}>
                                        {piece.etat}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              ))}
                            </View>
                          );
                        })}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  seedButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  section: {
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  wagonCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  wagonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  zoneSection: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  zoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#007AFF',
  },
  sacCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  sacTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  pieceCard: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginBottom: 5,
  },
  pieceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pieceCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  etatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  etatText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
});
