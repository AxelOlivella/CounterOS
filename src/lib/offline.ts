// Offline-First Architecture for CounterOS
// Ensures resilience in low-connectivity environments

export interface OfflineCapable {
  id: string;
  data: any;
  timestamp: number;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  tableName: string;
  synced: boolean;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingOperations: number;
  syncInProgress: boolean;
}

// IndexedDB wrapper for offline storage
export class OfflineStorage {
  private dbName = 'counteros-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store for pending operations
        if (!db.objectStoreNames.contains('pending_operations')) {
          const pendingStore = db.createObjectStore('pending_operations', { keyPath: 'id' });
          pendingStore.createIndex('synced', 'synced', { unique: false });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store for cached data
        if (!db.objectStoreNames.contains('cached_data')) {
          const cacheStore = db.createObjectStore('cached_data', { keyPath: 'key' });
          cacheStore.createIndex('tableName', 'tableName', { unique: false });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store for user preferences
        if (!db.objectStoreNames.contains('user_preferences')) {
          db.createObjectStore('user_preferences', { keyPath: 'key' });
        }
      };
    });
  }

  async savePendingOperation(operation: OfflineCapable): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['pending_operations'], 'readwrite');
    const store = transaction.objectStore('pending_operations');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(operation);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingOperations(): Promise<OfflineCapable[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['pending_operations'], 'readonly');
    const store = transaction.objectStore('pending_operations');
    const index = store.index('synced');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.only(false)); // Get unsynced operations
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markOperationSynced(operationId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['pending_operations'], 'readwrite');
    const store = transaction.objectStore('pending_operations');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(operationId);
      
      getRequest.onsuccess = () => {
        const operation = getRequest.result;
        if (operation) {
          operation.synced = true;
          const updateRequest = store.put(operation);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async cacheData(key: string, data: any, tableName: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['cached_data'], 'readwrite');
    const store = transaction.objectStore('cached_data');
    
    const cacheEntry = {
      key,
      data,
      tableName,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cacheEntry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['cached_data'], 'readonly');
    const store = transaction.objectStore('cached_data');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result && this.isDataFresh(result.timestamp)) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  private isDataFresh(timestamp: number, maxAge: number = 5 * 60 * 1000): boolean {
    return Date.now() - timestamp < maxAge; // 5 minutes by default
  }
}

// Sync manager for online/offline operations
export class SyncManager {
  private storage: OfflineStorage;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private listeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    this.storage = new OfflineStorage();
    this.setupNetworkListeners();
    this.init();
  }

  async init(): Promise<void> {
    await this.storage.init();
    
    // Auto-sync when coming back online
    if (this.isOnline) {
      this.syncPendingOperations();
    }
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  // Queue operations for later sync
  async queueOperation(
    operation: 'CREATE' | 'UPDATE' | 'DELETE',
    tableName: string,
    data: any
  ): Promise<void> {
    const operationData: OfflineCapable = {
      id: `${tableName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data,
      timestamp: Date.now(),
      operation,
      tableName,
      synced: false,
    };

    await this.storage.savePendingOperation(operationData);
    this.notifyListeners();

    // Try immediate sync if online
    if (this.isOnline) {
      this.syncPendingOperations();
    }
  }

  // Sync all pending operations
  async syncPendingOperations(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;
    this.notifyListeners();

    try {
      const pendingOperations = await this.storage.getPendingOperations();
      
      for (const operation of pendingOperations) {
        try {
          await this.executeSyncOperation(operation);
          await this.storage.markOperationSynced(operation.id);
        } catch (error) {
          console.error('Failed to sync operation:', operation.id, error);
          // Continue with other operations
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
      this.notifyListeners();
    }
  }

  private async executeSyncOperation(operation: OfflineCapable): Promise<void> {
    // This would integrate with your Supabase client
    const { supabase } = await import('@/integrations/supabase/client');

    try {
      switch (operation.operation) {
        case 'CREATE':
          await (supabase as any).from(operation.tableName).insert(operation.data);
          break;
        case 'UPDATE':
          await (supabase as any).from(operation.tableName).update(operation.data).eq('id', operation.data.id);
          break;
        case 'DELETE':
          await (supabase as any).from(operation.tableName).delete().eq('id', operation.data.id);
          break;
      }
    } catch (error) {
      console.error(`Failed to sync ${operation.operation} on ${operation.tableName}:`, error);
      throw error;
    }
  }

  // Add listener for sync status changes
  addListener(callback: (status: SyncStatus) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private async notifyListeners(): Promise<void> {
    const pendingOperations = await this.storage.getPendingOperations();
    const status: SyncStatus = {
      isOnline: this.isOnline,
      lastSync: null, // Would track actual last sync time
      pendingOperations: pendingOperations.length,
      syncInProgress: this.syncInProgress,
    };

    this.listeners.forEach(listener => listener(status));
  }

  // Get current status
  async getStatus(): Promise<SyncStatus> {
    const pendingOperations = await this.storage.getPendingOperations();
    return {
      isOnline: this.isOnline,
      lastSync: null,
      pendingOperations: pendingOperations.length,
      syncInProgress: this.syncInProgress,
    };
  }

  // Manual sync trigger
  async forcSync(): Promise<void> {
    await this.syncPendingOperations();
  }
}

// Global sync manager instance
export const syncManager = new SyncManager();

// React hooks for offline functionality
import React from 'react';

export function useOfflineStatus(): SyncStatus {
  const [status, setStatus] = React.useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingOperations: 0,
    syncInProgress: false,
  });

  React.useEffect(() => {
    const unsubscribe = syncManager.addListener(setStatus);
    
    // Get initial status
    syncManager.getStatus().then(setStatus);

    return unsubscribe;
  }, []);

  return status;
}

export function useOfflineStorage() {
  return {
    queueOperation: syncManager.queueOperation.bind(syncManager),
    syncNow: syncManager.forcSync.bind(syncManager),
    getStatus: syncManager.getStatus.bind(syncManager),
  };
}

// Offline-aware data fetching hook
export function useOfflineQuery<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: { cacheTime?: number } = {}
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const offlineStatus = useOfflineStatus();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to get cached data first
        const cachedData = await syncManager['storage'].getCachedData(key);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
        }

        // If online, fetch fresh data
        if (offlineStatus.isOnline) {
          const freshData = await fetchFn();
          await syncManager['storage'].cacheData(key, freshData, key.split('_')[0]);
          setData(freshData);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, offlineStatus.isOnline]);

  return { data, loading, error, isOffline: !offlineStatus.isOnline };
}