
'use client';

import React, { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error(error); // Also log the full error to the console
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: (
          <div className="w-full">
            <p className="mb-2 text-sm">
              A Firestore operation was blocked by your security rules.
            </p>
            <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
              <code className="text-white text-xs">{error.message}</code>
            </pre>
          </div>
        ),
        duration: 20000, 
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
