import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketHookOptions {
  onSensorUpdate?: (data: any) => void;
  onNodeStatusUpdate?: (data: any) => void;
}

export function useWebSocket(options: WebSocketHookOptions = {}) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const getWsUrl = useCallback(() => {
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    return `${protocol}//${host}:8000/ws/dashboard`;
  }, []);

  const retryDelayRef = useRef<number>(2000);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = getWsUrl();
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        retryDelayRef.current = 2000;
        console.log('[WebSocket] Connected to live telemetry stream:', url);
      };

      ws.onmessage = (event) => {
        setLastMessageTime(new Date());
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SENSOR_UPDATE' && optionsRef.current.onSensorUpdate) {
            optionsRef.current.onSensorUpdate(data);
          } else if (data.type === 'NODE_STATUS_UPDATE' && optionsRef.current.onNodeStatusUpdate) {
            optionsRef.current.onNodeStatusUpdate(data);
          }
        } catch (err) {
          console.warn('[WebSocket] Error parsing telemetry payload:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        const nextDelay = Math.min(retryDelayRef.current * 1.5, 10000);
        retryDelayRef.current = nextDelay;
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = window.setTimeout(connect, nextDelay);
      };

      ws.onerror = () => {
        // Quietly handle connection errors (e.g. backend offline or starting up)
        // onclose will handle scheduled reconnection
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (e) {
      console.warn('[WebSocket] Connection attempt failed, retrying in 3s...', e);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
    }
  }, [getWsUrl]);

  useEffect(() => {
    connect();

    // Ping interval to keep connection healthy
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'PING' }));
      }
    }, 15000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, lastMessageTime };
}
