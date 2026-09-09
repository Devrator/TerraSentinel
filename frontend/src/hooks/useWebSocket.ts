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

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/dashboard';

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('[WebSocket] Connected to live telemetry stream');
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
          console.error('[WebSocket] Error parsing message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.warn('[WebSocket] Connection closed. Reconnecting in 3s...');
        reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error('[WebSocket] Error:', err);
        ws.close();
      };
    } catch (e) {
      console.error('[WebSocket] Connection attempt failed:', e);
      reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
    }
  }, [wsUrl]);

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
