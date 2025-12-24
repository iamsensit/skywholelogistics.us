'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initialize Socket.IO connection
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
        path: '/api/socket',
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Socket.IO connected');
        // Join user-specific room
        socket?.emit('join-user-room', session.user.id);
      });

      socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
      });

      socket.on('new-reply', (data: any) => {
        console.log('New reply received:', data);
        setNotifications((prev) => [...prev, { ...data, id: Date.now() }]);
        
        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Email Reply - SkyWhole Logistics', {
            body: `Reply from ${data.driverName} (MC: ${data.driverMcNo})\n${data.subject}`,
            icon: '/swl logo.png',
            tag: `reply-${data.emailId}`,
            requireInteraction: false,
          });
        }
        
        // Update page title if not on the sent-emails page
        if (!window.location.pathname.includes('/sent-emails')) {
          const currentTitle = document.title.replace(/^\(\d+\)\s*/, '');
          const match = currentTitle.match(/^\((\d+)\)/);
          const currentCount = match ? parseInt(match[1]) : 0;
          document.title = `(${currentCount + 1}) ${currentTitle.replace(/^\(\d+\)\s*/, '')}`;
        }
      });

      // Make socket available globally for other components
      (window as any).socket = socket;
    }

    return () => {
      // Don't disconnect on cleanup - keep connection alive
      // Socket will be reused across re-renders
    };
  }, [session?.user?.id]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      {children}
      {/* Notification Toast */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notif, idx) => (
            <NotificationToast
              key={idx}
              notification={notif}
              onClose={() => {
                setNotifications((prev) => prev.filter((_, i) => i !== idx));
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

function NotificationToast({ notification, onClose }: { notification: any; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-start gap-3 min-w-[350px] max-w-md animate-in slide-in-from-right">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm mb-1">New Reply Received</p>
        <p className="text-xs opacity-90">
          {notification.driverName} (MC: {notification.driverMcNo})
        </p>
        <p className="text-xs opacity-75 mt-1 line-clamp-2">
          {notification.subject}
        </p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

