
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  query,
  collection,
  where,
  getDocs,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T = DocumentData>(path: string, uid?: string) {
  const db = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      return;
    }
    setLoading(true);
    let q: Query;
    const collRef = collection(db, path);
    if (uid) {
      q = query(collRef, where('userId', '==', uid));
    } else {
      q = query(collRef);
    }
    
    getDocs(q).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: q.toString(),
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: q.toString(),
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, path, uid]);

  return { data, loading };
}
