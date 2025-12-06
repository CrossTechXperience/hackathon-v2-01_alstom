import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type PlacementGridProps = {
  rows: number;
  columns: number;
  highlightedIndex: number;
  installedIndices: number[];
  waitingIndices: number[];
};

export const PlacementGrid = ({ rows, columns, highlightedIndex, installedIndices, waitingIndices }: PlacementGridProps) => {
  // On calcule le nombre total de cases
  const totalCells = rows * columns;
  const cells = Array.from({ length: totalCells }, (_, index) => index);

  return (
    <View style={styles.gridContainer}>
      {cells.map(index => {
        const isHighlighted = index === highlightedIndex;
        const isInstalled = installedIndices.includes(index);
        const isWaiting = waitingIndices.includes(index);

        return (
          <View
            key={index}
            style={[
              styles.cell,
              { width: `${100 / columns}%` }, // Calcul dynamique de la largeur
              isHighlighted && styles.highlightedCell,
              isInstalled && styles.installedCell,
              isWaiting && styles.waitingCell,
            ]}
          >
            <Text style={[styles.cellText, (isHighlighted || isInstalled || isWaiting) && styles.highlightedText]}>
              {index}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: '#CCC',
    // IMPORTANT : On retire toute hauteur fixe ou flex: 1 ici
    alignSelf: 'flex-start', // Empêche le conteneur de s'étirer si le parent est grand
    backgroundColor: '#fff', // Fond blanc propre
  },
  cell: {
    aspectRatio: 1, // Garde les cases carrées
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5, // Bordures plus fines pour un rendu plus net
    borderColor: '#CCC',
    backgroundColor: '#F0F0F0',
  },
  highlightedCell: {
    backgroundColor: '#2E7D32',
    borderColor: 'gold',
    borderWidth: 2,
  },
  installedCell: {
    backgroundColor: '#005EB8',
  },
  waitingCell: {
    backgroundColor: '#FFC107',
  },
  cellText: {
    color: '#999',
    fontSize: 12,
  },
  highlightedText: {
    color: 'white',
    fontWeight: 'bold',
  },
});