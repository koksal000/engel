// @ts-nocheck
'use client';
import type { DBSchema, IDBPDatabase} from 'idb';
import { openDB } from 'idb';
import type { AnalysisResult } from './actions';

const DB_NAME = 'bakirkoy-merkezi-db';
const DB_VERSION = 1;
const STORE_NAME = 'applications';

interface ApplicationData extends AnalysisResult {
  id?: number;
  referral?: {
    doctor: string;
    date: Date;
    time: string;
    status: 'reddedildi' | 'onaylandı';
    reason?: string;
  }
}
interface MyDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: ApplicationData;
    indexes: { 'by-name': string };
  };
}

let dbPromise: Promise<IDBPDatabase<MyDB>> | null = null;

const initDB = () => {
  if (dbPromise) return dbPromise;
  
  dbPromise = openDB<MyDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-name', 'name');
      }
    },
  });
  return dbPromise;
};


export const addApplication = async (application: ApplicationData): Promise<number> => {
  const db = await initDB();
  return db.add(STORE_NAME, application);
};

export const getAllApplications = async (): Promise<ApplicationData[]> => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const getApplicationById = async (id: number): Promise<ApplicationData | undefined> => {
  const db = await initDB();
  return db.get(STORE_NAME, id);
};

export const updateApplicationStatus = async (
  id: number,
  status: 'reddedildi' | 'onaylandı',
  reason?: string
): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const application = await store.get(id);

  if (application && application.referral) {
    application.referral.status = status;
    application.referral.reason = reason ?? '';
    await store.put(application);
  }
  await tx.done;
};
