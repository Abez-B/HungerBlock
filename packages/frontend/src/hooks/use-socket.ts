import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function useSocket() {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize socket connection
        if (!socket) {
            const authToken = localStorage.getItem('auth_token');

            socket = io(SOCKET_URL, {
                auth: authToken ? { token: authToken } : undefined,
                transports: ['websocket', 'polling'],
            });

            socket.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            socket.on('error', (error: Error) => {
                console.error('Socket error:', error);
            });
        }

        return () => {
            // Cleanup on unmount
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    }, []);

    return {
        socket,
        isConnected,
    };
}

// Subscribe to specific events
export function useSocketEvent(
    eventName: string,
    callback: (data: any) => void
) {
    useEffect(() => {
        if (!socket) return;

        socket.on(eventName, callback);

        return () => {
            socket.off(eventName, callback);
        };
    }, [eventName, callback]);
}

// Subscribe to donation updates
export function useDonationUpdates(callback: (data: any) => void) {
    useSocketEvent('donation:created', callback);
    useSocketEvent('donation:matched', callback);
    useSocketEvent('donation:verified', callback);
}

// Subscribe to request updates
export function useRequestUpdates(callback: (data: any) => void) {
    useSocketEvent('request:created', callback);
}

// Subscribe to match updates
export function useMatchUpdates(callback: (data: any) => void) {
    useSocketEvent('match:created', callback);
    useSocketEvent('match:verified', callback);
}
