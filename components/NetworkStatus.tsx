import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * Custom Hook: useNetworkStatus
 * Lắng nghe trạng thái mạng online/offline
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * Component hiển thị trạng thái mạng toàn cục
 * - Mất mạng: Hiện thanh đỏ (không ẩn)
 * - Có mạng lại: Hiện thanh xanh (ẩn sau 3s)
 */
export const NetworkStatusNotification = () => {
  const isOnline = useNetworkStatus();
  const [showSuccess, setShowSuccess] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowSuccess(false);
    } else if (wasOffline) {
      // Khi có mạng lại sau khi đã mất mạng
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Nếu đang online và không cần hiện thông báo thành công -> Ẩn
  if (isOnline && !showSuccess) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center px-4 py-2 shadow-md transition-colors duration-300 ${
        isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {isOnline ? (
          <>
            <Wifi size={18} className="text-green-600" />
            <span>Đã kết nối mạng thành công</span>
          </>
        ) : (
          <>
            <WifiOff size={18} className="text-red-600" />
            <span>Mất kết nối internet. Một số chức năng đang bị tạm khóa.</span>
          </>
        )}
      </div>
    </div>
  );
};
