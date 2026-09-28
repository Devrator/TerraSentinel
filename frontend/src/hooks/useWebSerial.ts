import { useState, useEffect, useRef, useCallback } from 'react';
import type { WebSerialConnectionStatus, WebSerialPacketLog, SensorReading } from '../types';
import { api } from '../services/api';

export function useWebSerial() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [status, setStatus] = useState<WebSerialConnectionStatus>('DISCONNECTED');
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [packetCount, setPacketCount] = useState<number>(0);
  const [lastReading, setLastReading] = useState<Partial<SensorReading> | null>(null);
  const [logs, setLogs] = useState<WebSerialPacketLog[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const keepReadingRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serial' in navigator) {
      setIsSupported(true);
      setStatus('DISCONNECTED');
    } else {
      setIsSupported(false);
      setStatus('UNSUPPORTED');
    }
  }, []);

  const addLog = useCallback((raw: string, parsed?: Partial<SensorReading>, valid: boolean = true) => {
    const entry: WebSerialPacketLog = {
      timestamp: new Date().toLocaleTimeString(),
      raw,
      parsed,
      valid,
    };
    setLogs((prev) => [entry, ...prev.slice(0, 49)]);
  }, []);

  const parseLine = useCallback((line: string): Partial<SensorReading> | null => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // 1. Try parsing JSON
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const obj = JSON.parse(trimmed);
        return {
          node_id: obj.node_id || obj.id || 'ESP32-HARDWARE',
          temperature: Number(obj.temperature ?? obj.temp ?? 25.0),
          humidity: Number(obj.humidity ?? obj.hum ?? 50.0),
          pressure: Number(obj.pressure ?? obj.press ?? 1013.25),
          rain_value: Number(obj.rain_value ?? obj.rain ?? 0.0),
          air_quality: Number(obj.air_quality ?? obj.aqi ?? obj.gas ?? 50.0),
          latitude: Number(obj.latitude ?? obj.lat ?? 25.2138),
          longitude: Number(obj.longitude ?? obj.lng ?? 75.8648),
          battery_percentage: Number(obj.battery_percentage ?? obj.battery ?? obj.bat ?? 95.0),
          is_virtual: false,
          source: 'HARDWARE',
        };
      } catch {
        // Not valid JSON, fall through to CSV
      }
    }

    // 2. Try parsing CSV: temp, hum, pressure, rain, aqi, battery, lat, lng
    const parts = trimmed.split(',').map((p) => p.trim());
    if (parts.length >= 5) {
      const temp = parseFloat(parts[0]);
      const hum = parseFloat(parts[1]);
      const press = parseFloat(parts[2]);
      const rain = parseFloat(parts[3]);
      const aqi = parseFloat(parts[4]);
      const bat = parts.length > 5 ? parseFloat(parts[5]) : 95.0;
      const lat = parts.length > 6 ? parseFloat(parts[6]) : 25.2138;
      const lng = parts.length > 7 ? parseFloat(parts[7]) : 75.8648;

      if (!isNaN(temp) && !isNaN(hum)) {
        return {
          node_id: 'ESP32-HARDWARE',
          temperature: temp,
          humidity: hum,
          pressure: isNaN(press) ? 1013.25 : press,
          rain_value: isNaN(rain) ? 0.0 : rain,
          air_quality: isNaN(aqi) ? 50.0 : aqi,
          latitude: lat,
          longitude: lng,
          battery_percentage: isNaN(bat) ? 95.0 : bat,
          is_virtual: false,
          source: 'HARDWARE',
        };
      }
    }

    return null;
  }, []);

  const connectSerial = async (selectedBaudRate: number = 115200) => {
    if (!isSupported) {
      setErrorMessage('WebSerial API is not supported in this browser. Please use Chrome, Edge, or Opera.');
      return;
    }

    try {
      setErrorMessage(null);
      setStatus('CONNECTING');
      const serial = (navigator as any).serial;
      const port = await serial.requestPort();
      await port.open({ baudRate: selectedBaudRate });

      portRef.current = port;
      setBaudRate(selectedBaudRate);
      setStatus('CONNECTED');
      keepReadingRef.current = true;

      // Start asynchronous reading loop
      readSerialStream(port);
    } catch (err: any) {
      console.error('WebSerial connection error:', err);
      setStatus('ERROR');
      setErrorMessage(err.message || 'Failed to open serial port.');
    }
  };

  const readSerialStream = async (port: any) => {
    let lineBuffer = '';
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    readerRef.current = reader;

    setStatus('STREAMING');

    try {
      while (keepReadingRef.current) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          lineBuffer += value;
          const lines = lineBuffer.split(/\r?\n/);
          lineBuffer = lines.pop() || ''; // Keep partial line in buffer

          for (const line of lines) {
            if (!line.trim()) continue;
            const parsed = parseLine(line);

            if (parsed) {
              setLastReading(parsed);
              setPacketCount((c) => c + 1);
              addLog(line, parsed, true);

              // Ingest parsed reading through real unified FastAPI backend pipeline
              api.ingestSensorData({
                ...parsed,
                timestamp: new Date().toISOString(),
              }).catch((e) => console.error('Failed to ingest hardware packet:', e));
            } else {
              addLog(line, undefined, false);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Serial read error:', err);
      if (keepReadingRef.current) {
        setStatus('ERROR');
        setErrorMessage(err.message || 'Stream interrupted.');
      }
    } finally {
      reader.releaseLock();
      await readableStreamClosed.catch(() => {});
    }
  };

  const disconnectSerial = async () => {
    keepReadingRef.current = false;
    try {
      if (readerRef.current) {
        await readerRef.current.cancel().catch(() => {});
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close().catch(() => {});
        portRef.current = null;
      }
    } catch (err) {
      console.error('Error closing serial port:', err);
    } finally {
      setStatus('DISCONNECTED');
    }
  };

  return {
    isSupported,
    status,
    baudRate,
    setBaudRate,
    packetCount,
    lastReading,
    logs,
    errorMessage,
    connectSerial,
    disconnectSerial,
  };
}
