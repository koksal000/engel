// @ts-nocheck
'use client';
import type { DBSchema, IDBPDatabase} from 'idb';
import { openDB } from 'idb';
import type { AnalysisResult } from './actions';

const DB_NAME = 'bakirkoy-merkezi-db';
const DB_VERSION = 2; // Incremented version for schema change
const APPLICATIONS_STORE_NAME = 'applications';
const CALLS_STORE_NAME = 'calls';

export interface ApplicationData extends AnalysisResult {
  id?: number;
  referral?: {
    doctor: string;
    date: Date;
    time: string;
    status: 'reddedildi' | 'onaylandı';
    reason?: string;
  }
}

export interface Call {
    id?: number;
    applicationId: number;
    patientName: string;
    status: 'answered' | 'rejected' | 'missed';
    date: Date;
    duration: number; // in seconds
    transcript?: { speaker: 'user' | 'consultant'; text: string }[];
}


interface MyDB extends DBSchema {
  [APPLICATIONS_STORE_NAME]: {
    key: number;
    value: ApplicationData;
    indexes: { 'by-name': string };
  };
  [CALLS_STORE_NAME]: {
      key: number;
      value: Call;
      indexes: { 'by-applicationId': number };
  }
}

let dbPromise: Promise<IDBPDatabase<MyDB>> | null = null;

const initDB = () => {
  if (dbPromise) return dbPromise;
  
  dbPromise = openDB<MyDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(APPLICATIONS_STORE_NAME)) {
        const store = db.createObjectStore(APPLICATIONS_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-name', 'name');
      }
      if (!db.objectStoreNames.contains(CALLS_STORE_NAME)) {
        const store = db.createObjectStore(CALLS_STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('by-applicationId', 'applicationId');
      }
    },
  });
  return dbPromise;
};


// Application Functions
export const addApplication = async (application: ApplicationData): Promise<number> => {
  const db = await initDB();
  return db.add(APPLICATIONS_STORE_NAME, application);
};

export const getAllApplications = async (): Promise<ApplicationData[]> => {
  const db = await initDB();
  return db.getAll(APPLICATIONS_STORE_NAME);
};

export const updateApplication = async (application: ApplicationData): Promise<number> => {
    const db = await initDB();
    return db.put(APPLICATIONS_STORE_NAME, application);
}

// Call Functions
export const addCall = async (call: Call): Promise<number> => {
    const db = await initDB();
    return db.add(CALLS_STORE_NAME, call);
}

export const getAllCalls = async (): Promise<Call[]> => {
    const db = await initDB();
    return db.getAll(CALLS_STORE_NAME);
}

export const updateCall = async (call: Call): Promise<number> => {
    const db = await initDB();
    return db.put(CALLS_STORE_NAME, call);
}
