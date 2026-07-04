import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useLoadingManager(room) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Menyiapkan ruang 3D...');
  
  const hasFinishedInitialLoadRef = useRef(false);

  // Jika room berubah, kita anggap loading awal belum selesai
  useEffect(() => {
    if (room) {
      hasFinishedInitialLoadRef.current = false;
    }
  }, [room]);

  useEffect(() => {
    let hideTimeout = null;

    THREE.DefaultLoadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      // Jika inisial load untuk room ini sudah selesai, abaikan load susulan (micro-loads)
      if (hasFinishedInitialLoadRef.current) return;

      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      setIsLoading(true);
      setProgress((itemsLoaded / itemsTotal) * 100);
      setLoadingText(`Memuat aset: ${itemsLoaded} / ${itemsTotal}`);
    };

    THREE.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (hasFinishedInitialLoadRef.current) return;

      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      
      setIsLoading(true); // Pastikan status tetap memuat
      setProgress((itemsLoaded / itemsTotal) * 100);
      setLoadingText(`Memuat aset: ${itemsLoaded} / ${itemsTotal}`);
    };

    THREE.DefaultLoadingManager.onLoad = () => {
      // Tandai bahwa load utama telah selesai, semua onStart/onProgress berikutnya diabaikan
      hasFinishedInitialLoadRef.current = true;

      setProgress(100);
      setLoadingText('Mempersiapkan ruangan...');
      
      // Memberikan jeda lebih panjang dan bisa dibatalkan jika ada antrian baru
      if (hideTimeout) clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 1000); 
    };

    THREE.DefaultLoadingManager.onError = (url) => {
      console.error('Ada masalah ketika memuat file:', url);
    };

    // Cleanup saat unmount
    return () => {
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, []);

  return { progress, isLoading, loadingText };
}
