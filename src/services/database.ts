import SQLite from 'react-native-sqlite-storage';
import { Wagon, Zone, Sac, Piece, EtatPiece } from '../types/models';

SQLite.enablePromise(true);
SQLite.DEBUG(true);

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: 'hackathon.db',
        location: 'default',
      });

      await this.createTables();
      console.log('Base de données initialisée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');
    await this.db.executeSql('DROP TABLE IF EXISTS pieces');

    const createWagonsTable = `
      CREATE TABLE IF NOT EXISTS wagons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero TEXT NOT NULL UNIQUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createZonesTable = `
      CREATE TABLE IF NOT EXISTS zones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero INTEGER NOT NULL,
        wagonId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (wagonId) REFERENCES wagons(id) ON DELETE CASCADE
      );
    `;

    const createSacsTable = `
      CREATE TABLE IF NOT EXISTS sacs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifiant TEXT NOT NULL UNIQUE,
        zoneId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (zoneId) REFERENCES zones(id) ON DELETE CASCADE
      );
    `;

    const createPiecesTable = `
      CREATE TABLE IF NOT EXISTS pieces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL,
        etat INTEGER DEFAULT 0,
        prioritaire INTEGER NOT NULL DEFAULT 0,
        positionIndex INTEGER NOT NULL DEFAULT 0,
        sacId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sacId) REFERENCES sacs(id) ON DELETE CASCADE
      );
    `;

    await this.db.executeSql(createWagonsTable);
    await this.db.executeSql(createZonesTable);
    await this.db.executeSql(createSacsTable);
    await this.db.executeSql(createPiecesTable);
  }

  // ==================== WAGONS ====================
  async addWagon(numero: string): Promise<number> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.executeSql('INSERT INTO wagons (numero) VALUES (?)', [numero]);
    return result[0].insertId;
  }

  async getAllWagons(): Promise<Wagon[]> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.executeSql('SELECT * FROM wagons ORDER BY numero');
    const wagons: Wagon[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      wagons.push(result[0].rows.item(i));
    }
    return wagons;
  }

  async getWagonById(id: number): Promise<Wagon | null> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.executeSql('SELECT * FROM wagons WHERE id = ?', [id]);
    return result[0].rows.length > 0 ? result[0].rows.item(0) : null;
  }

  async deleteWagon(id: number): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');
    await this.db.executeSql('DELETE FROM wagons WHERE id = ?', [id]);
  }

  // ==================== ZONES ====================
  async addZone(numero: number, wagonId: number): Promise<number> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.executeSql(
      'INSERT INTO zones (numero, wagonId) VALUES (?, ?)',
      [numero, wagonId]
    );
    return result[0].insertId;
  }

  async getZonesByWagon(wagonId: number): Promise<Zone[]> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.executeSql(
      'SELECT * FROM zones WHERE wagonId = ? ORDER BY numero',
      [wagonId]
    );
    const zones: Zone[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      zones.push(result[0].rows.item(i));
    }
    return zones;
  }

  async getAllZones(): Promise<Zone[]> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.executeSql('SELECT * FROM zones ORDER BY wagonId, numero');
    const zones: Zone[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      zones.push(result[0].rows.item(i));
    }
    return zones;
  }

  async deleteZone(id: number): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');
    await this.db.executeSql('DELETE FROM zones WHERE id = ?', [id]);
  }

  // ==================== SACS ====================
  async addSac(identifiant: string, zoneId: number): Promise<number> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.executeSql(
      'INSERT INTO sacs (identifiant, zoneId) VALUES (?, ?)',
      [identifiant, zoneId]
    );
    return result[0].insertId;
  }

  async getSacsByZone(zoneId: number): Promise<Sac[]> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.executeSql(
      'SELECT * FROM sacs WHERE zoneId = ? ORDER BY identifiant',
      [zoneId]
    );
    const sacs: Sac[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      sacs.push(result[0].rows.item(i));
    }
    return sacs;
  }

  async getAllSacs(): Promise<Sac[]> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.executeSql('SELECT * FROM sacs ORDER BY identifiant');
    const sacs: Sac[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      sacs.push(result[0].rows.item(i));
    }
    return sacs;
  }

  async deleteSac(id: number): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');
    await this.db.executeSql('DELETE FROM sacs WHERE id = ?', [id]);
  }

  // ==================== PIECES ====================
  async addPiece(code: string, etat: EtatPiece, prioritaire: boolean, positionIndex: number, sacId: number): Promise<number> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.executeSql(
      'INSERT INTO pieces (code, etat, prioritaire, positionIndex, sacId) VALUES (?, ?, ?, ?, ?)',
      [code, etat, prioritaire ? 1 : 0, positionIndex, sacId]
    );
    return result[0].insertId;
  }

  async getPiecesBySac(sacId: number): Promise<Piece[]> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.executeSql(
      'SELECT * FROM pieces WHERE sacId = ? ORDER BY positionIndex',
      [sacId]
    );
    const pieces: Piece[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      pieces.push({
        ...row,
        etat: row.etat as EtatPiece,
        prioritaire: row.prioritaire === 1,
        positionIndex: row.positionIndex,
      });
    }
    return pieces;
  }

  async getAllPieces(): Promise<Piece[]> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.executeSql('SELECT * FROM pieces ORDER BY positionIndex');
    const pieces: Piece[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      pieces.push({
        ...row,
        etat: row.etat as EtatPiece,
        prioritaire: row.prioritaire === 1,
        positionIndex: row.positionIndex,
      });
    }
    return pieces;
  }

  async updatePieceEtat(id: number, etat: EtatPiece): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');
    await this.db.executeSql('UPDATE pieces SET etat = ? WHERE id = ?', [etat, id]);
  }

  async getPiecesPrioritaires(): Promise<Piece[]> {
    if (!this.db) throw new Error('Base de données non initialisée');
    const result = await this.db.executeSql('SELECT * FROM pieces WHERE prioritaire = 1 ORDER BY positionIndex');
    const pieces: Piece[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      pieces.push({
        ...row,
        etat: row.etat as EtatPiece,
        prioritaire: true,
        positionIndex: row.positionIndex,
      });
    }
    return pieces;
  }

  async deletePiece(id: number): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');
    await this.db.executeSql('DELETE FROM pieces WHERE id = ?', [id]);
  }

  // ==================== UTILS ====================
  async deleteAllData(): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');
    await this.db.executeSql('DELETE FROM pieces');
    await this.db.executeSql('DELETE FROM sacs');
    await this.db.executeSql('DELETE FROM zones');
    await this.db.executeSql('DELETE FROM wagons');
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('Base de données fermée');
    }
  }
}

export const database = new DatabaseService();
