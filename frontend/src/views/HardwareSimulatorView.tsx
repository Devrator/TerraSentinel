import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Flame,
  Droplets,
  Wind,
  Battery,
  Cpu,
  Radio,
  RefreshCw,
  Send,
  Sliders,
  CheckCircle2,
  Maximize2,
  Sun,
  Sparkles,
  Play,
  Pause
} from 'lucide-react';
import type { SensorNode } from '../types';
import { api } from '../services/api';

interface HardwareSimulatorViewProps {
  nodes?: SensorNode[];
  selectedNodeId?: string;
  onSelectNode?: (id: string) => void;
}

type InspectionMode = 'ASSEMBLED' | 'EXPLODED' | 'THERMAL';
type CameraViewPreset = 'ISO' | 'PCB' | 'RAIN' | 'TOP' | 'FRONT';

interface ComponentInfo {
  id: string;
  name: string;
  partNumber: string;
  interface: string;
  pin: string;
  voltage: string;
  currentReading: string;
  rawAdc: string;
  status: string;
  description: string;
  specs: string[];
}

// ============================================================================
// PROCEDURAL ULTRA-HD TEXTURE GENERATORS (Canvas to Three.js CanvasTexture)
// ============================================================================

/**
 * 1. Monocrystalline Solar Panel Texture with 45-degree chamfered octagonal silicon wafers,
 * fine silver micro-grid fingers, multi-collector busbars, and aluminum frame.
 */
const createSolarTexture = (): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark anti-reflective solar glass background
  ctx.fillStyle = '#060D1E';
  ctx.fillRect(0, 0, 1024, 1024);

  const rows = 4;
  const cols = 4;
  const margin = 32;
  const gap = 16;
  const cellW = (1024 - margin * 2 - (cols - 1) * gap) / cols;
  const cellH = (1024 - margin * 2 - (rows - 1) * gap) / rows;
  const cornerCut = 22;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = margin + c * (cellW + gap);
      const y = margin + r * (cellH + gap);

      // Draw Octagonal Monocrystalline Silicon Cell (Chamfered 45° corners)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + cornerCut, y);
      ctx.lineTo(x + cellW - cornerCut, y);
      ctx.lineTo(x + cellW, y + cornerCut);
      ctx.lineTo(x + cellW, y + cellH - cornerCut);
      ctx.lineTo(x + cellW - cornerCut, y + cellH);
      ctx.lineTo(x + cornerCut, y + cellH);
      ctx.lineTo(x, y + cellH - cornerCut);
      ctx.lineTo(x, y + cornerCut);
      ctx.closePath();
      ctx.clip();

      // Deep iridescent photovoltaic blue gradient
      const waferGrad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
      waferGrad.addColorStop(0, '#0E1F3D');
      waferGrad.addColorStop(0.5, '#0A1830');
      waferGrad.addColorStop(1, '#050D1A');
      ctx.fillStyle = waferGrad;
      ctx.fill();

      // Fine silver grid lines (micro-fingers)
      ctx.strokeStyle = 'rgba(70, 105, 155, 0.45)';
      ctx.lineWidth = 1;
      for (let fx = x + 6; fx < x + cellW; fx += 8) {
        ctx.beginPath();
        ctx.moveTo(fx, y);
        ctx.lineTo(fx, y + cellH);
        ctx.stroke();
      }

      // Silver multi-busbars (3 main collector ribbons with solder pads)
      const busbarOffsets = [0.25, 0.5, 0.75];
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 3.5;
      busbarOffsets.forEach((ratio) => {
        const bx = x + cellW * ratio;
        ctx.beginPath();
        ctx.moveTo(bx, y);
        ctx.lineTo(bx, y + cellH);
        ctx.stroke();

        // Solder joint dots on busbars
        ctx.fillStyle = '#CBD5E1';
        for (let sy = y + 25; sy < y + cellH; sy += 50) {
          ctx.beginPath();
          ctx.arc(bx, sy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Cell border bevel
      ctx.strokeStyle = '#1E3A5F';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Aluminum perimeter extrusion border
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, 1008, 1008);

  // Corner 45° miter cuts
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(24, 24);
  ctx.moveTo(1024, 0);
  ctx.lineTo(1000, 24);
  ctx.moveTo(0, 1024);
  ctx.lineTo(24, 1000);
  ctx.moveTo(1024, 1024);
  ctx.lineTo(1000, 1000);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
};

/**
 * 2. High-Density FR-4 IoT Motherboard PCB Texture:
 * Matte emerald green solder mask, copper hatch ground plane, gold ENIG traces,
 * through-hole vias, OSHW gear logo, FCC/CE markings, pinout silkscreen.
 */
const createPcbTexture = (): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // Matte Forest Green Solder Mask
  ctx.fillStyle = '#063D27';
  ctx.fillRect(0, 0, 2048, 2048);

  // Copper Ground Mesh Hatch Pattern
  ctx.strokeStyle = '#042A1B';
  ctx.lineWidth = 2;
  for (let i = 0; i < 2048; i += 24) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 2048);
    ctx.moveTo(0, i);
    ctx.lineTo(2048, i);
    ctx.stroke();
  }

  // Golden ENIG Copper Traces (High-density routing with 45° angles)
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const traceRoutes = [
    // ESP32 to DHT22
    [[400, 700], [700, 700], [800, 800], [1300, 800], [1400, 700], [1500, 700]],
    [[400, 730], [680, 730], [770, 820], [1280, 820], [1380, 730], [1500, 730]],
    // ESP32 to MQ-135
    [[400, 1100], [750, 1100], [900, 1250], [1350, 1250], [1450, 1350], [1500, 1350]],
    [[400, 1130], [730, 1130], [880, 1280], [1330, 1280], [1430, 1380], [1500, 1380]],
    // Power Bus 3.3V & GND Rails
    [[300, 400], [1700, 400], [1700, 1650], [300, 1650], [300, 400]],
    [[320, 420], [1680, 420], [1680, 1630], [320, 1630], [320, 420]],
    // GPS UART Traces
    [[400, 850], [550, 850], [600, 600], [700, 500], [850, 500]],
    [[400, 880], [530, 880], [580, 620], [680, 520], [850, 520]],
  ];

  traceRoutes.forEach((route) => {
    ctx.beginPath();
    ctx.moveTo(route[0][0], route[0][1]);
    for (let p = 1; p < route.length; p++) {
      ctx.lineTo(route[p][0], route[p][1]);
    }
    ctx.stroke();
  });

  // Through-Hole Vias with Gold Center Drills
  const viaPositions = [
    [350, 450], [550, 450], [750, 450], [950, 450], [1150, 450], [1350, 450], [1550, 450],
    [350, 1600], [550, 1600], [750, 1600], [950, 1600], [1150, 1600], [1350, 1600], [1550, 1600],
    [700, 700], [800, 800], [1300, 800], [1400, 700], [750, 1100], [900, 1250], [1350, 1250],
  ];
  viaPositions.forEach(([vx, vy]) => {
    // Outer annular ring
    ctx.beginPath();
    ctx.arc(vx, vy, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#D97706';
    ctx.fill();
    // Inner hole
    ctx.beginPath();
    ctx.arc(vx, vy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#062A1B';
    ctx.fill();
  });

  // Test Points (Gold ENIG Circular Pads)
  const testPads = [
    { x: 320, y: 550, label: 'TP_3V3' },
    { x: 320, y: 620, label: 'TP_GND' },
    { x: 320, y: 690, label: 'TP_EN' },
    { x: 320, y: 760, label: 'TP_IO0' },
    { x: 1720, y: 550, label: 'TP_ADC1' },
    { x: 1720, y: 620, label: 'TP_ADC2' },
    { x: 1720, y: 690, label: 'TP_TX2' },
    { x: 1720, y: 760, label: 'TP_RX2' },
  ];
  testPads.forEach((tp) => {
    ctx.beginPath();
    ctx.arc(tp.x, tp.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(tp.label, tp.x > 1000 ? tp.x - 90 : tp.x + 22, tp.y + 5);
  });

  // Crisp White Silkscreen Typography & Graphics
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px monospace';
  ctx.fillText('TERRASENTINEL AI IoT NODE v2.4', 120, 160);

  ctx.font = '24px monospace';
  ctx.fillStyle = '#E2E8F0';
  ctx.fillText('DESIGNED FOR HIGHWAY & WILDFIRE HAZARD MONITORING', 120, 210);
  ctx.fillText('DUAL-CORE ESP32 • LoRa 868MHz • SIH26178 HARDWARE SPEC', 120, 245);

  // Component Placement Footprint Boxes & Silkscreen Outlines
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;

  // ESP32 Footprint
  ctx.strokeRect(380, 520, 480, 720);
  ctx.font = 'bold 28px monospace';
  ctx.fillText('U1: ESP32-WROOM-32', 400, 570);

  // DHT22 Footprint
  ctx.strokeRect(1380, 520, 320, 360);
  ctx.fillText('U2: DHT22 (IO4)', 1400, 565);

  // MQ-135 Footprint
  ctx.beginPath();
  ctx.arc(1540, 1200, 180, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillText('U3: MQ-135 (IO34)', 1400, 1200);

  // NEO-6M GPS Footprint
  ctx.strokeRect(880, 460, 340, 340);
  ctx.fillText('U4: GPS-NEO6M', 900, 510);

  // Battery Cradle Footprint
  ctx.strokeRect(880, 950, 420, 800);
  ctx.fillText('BAT1: 18650 LI-ION (3.7V)', 900, 1000);
  ctx.font = 'bold 48px monospace';
  ctx.fillText('+', 1240, 1020);
  ctx.fillText('-', 920, 1700);

  // Bottom I/O Terminal Header Block Silkscreen
  ctx.strokeRect(120, 1840, 1808, 140);
  ctx.font = 'bold 26px monospace';
  ctx.fillText('PINOUT:  [3.3V]  [GND]  [IO4:DHT]  [IO34:GAS]  [IO35:RAIN]  [IO36:BAT_ADC]  [TX2:GPS]  [RX2:GPS]  [VIN:SOLAR]', 150, 1920);

  // OSHW Logo & CE/FCC Markings
  ctx.font = 'bold 28px monospace';
  ctx.fillText('⚙️ OSHW IN00042 • CE • FCC-ID: 2AC7Z-ESP32 • RoHS COMPLIANT', 120, 1780);

  // Optical Fiducial Alignment Markers in 4 corners
  const fiducials = [[60, 60], [1988, 60], [60, 1988], [1988, 1988]];
  fiducials.forEach(([fx, fy]) => {
    ctx.beginPath();
    ctx.arc(fx, fy, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(fx, fy, 26, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
};

/**
 * 3. Brushed Metal ESP32 Shield Texture with laser engraved markings
 */
const createEsp32ShieldTexture = (): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Brushed aluminum metallic background
  ctx.fillStyle = '#D1D5DB';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle brushed noise lines
  ctx.strokeStyle = '#9CA3AF';
  ctx.lineWidth = 1;
  for (let i = 0; i < 512; i += 3) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Laser engraved text
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('ESPRESSIF', 150, 120);
  ctx.font = 'bold 32px monospace';
  ctx.fillText('ESP32-WROOM-32', 110, 180);
  ctx.font = '16px monospace';
  ctx.fillText('FCC ID: 2AC7Z-ESPWROOM32', 120, 240);
  ctx.fillText('CE 1313  RoHS  IC: 21098-ESPWROOM32', 90, 280);
  ctx.fillText('Wi-Fi 802.11 b/g/n + BT 4.2 BR/EDR/BLE', 80, 320);

  // QR Code placeholder icon
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 4;
  ctx.strokeRect(360, 360, 90, 90);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(375, 375, 20, 20);
  ctx.fillRect(415, 375, 20, 20);
  ctx.fillRect(375, 415, 20, 20);

  // Pin 1 Index Dot
  ctx.beginPath();
  ctx.arc(60, 60, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#1E293B';
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

/**
 * 4. Capacitive Rain Sensor Plate Texture:
 * Interdigitated gold serpentine comb tracks with ENIG finish and high-voltage isolation.
 */
const createRainPcbTexture = (): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep royal blue solder mask
  ctx.fillStyle = '#0284C7';
  ctx.fillRect(0, 0, 1024, 1024);

  // Gold Interdigitated Comb Fingers (20 alternating track pairs)
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';

  const trackCount = 22;
  const spacing = 40;
  const startY = 80;

  // Left Comb Rails & Fingers
  ctx.beginPath();
  ctx.moveTo(80, startY);
  ctx.lineTo(80, startY + (trackCount - 1) * spacing);
  ctx.stroke();

  for (let i = 0; i < trackCount; i += 2) {
    const y = startY + i * spacing;
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(920, y);
    ctx.stroke();
  }

  // Right Comb Rails & Fingers
  ctx.beginPath();
  ctx.moveTo(944, startY + spacing);
  ctx.lineTo(944, startY + (trackCount - 1) * spacing);
  ctx.stroke();

  for (let i = 1; i < trackCount; i += 2) {
    const y = startY + i * spacing;
    ctx.beginPath();
    ctx.moveTo(944, y);
    ctx.lineTo(104, y);
    ctx.stroke();
  }

  // Silkscreen
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px monospace';
  ctx.fillText('PRECISION RAIN DETECTOR v2.0 • ENIG GOLD', 180, 48);
  ctx.font = '20px monospace';
  ctx.fillText('GPIO 35 (ADC1_CH7) • RESISTIVE / CAPACITIVE COMB', 190, 990);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
};

/**
 * 5. Panasonic 18650 Battery Label Texture
 */
const createBatteryTexture = (): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#059669'; // Panasonic metallic emerald
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText('Panasonic', 40, 70);

  ctx.font = 'bold 28px monospace';
  ctx.fillText('NCR18650B Li-ion', 40, 115);

  ctx.font = '20px monospace';
  ctx.fillText('3.7V  3400mAh  12.6Wh', 40, 155);
  ctx.fillText('RECHARGEABLE CELL • MADE IN JAPAN', 40, 195);

  // Polarity Indicators
  ctx.font = 'bold 44px monospace';
  ctx.fillText('[ + ]', 400, 80);
  ctx.fillText('[ - ]', 400, 200);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

/**
 * 6. Studio Turntable Platform Texture with laser etched angular scale
 */
const createPlatformTexture = (): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0B1512';
  ctx.fillRect(0, 0, 1024, 1024);

  // Concentric radius circles
  ctx.strokeStyle = '#152C25';
  ctx.lineWidth = 2;
  const center = 512;
  [120, 240, 360, 480].forEach((r) => {
    ctx.beginPath();
    ctx.arc(center, center, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Angular Degree Ticks
  ctx.strokeStyle = '#225244';
  for (let deg = 0; deg < 360; deg += 10) {
    const rad = (deg * Math.PI) / 180;
    const len = deg % 30 === 0 ? 30 : 15;
    const x1 = center + Math.cos(rad) * (480 - len);
    const y1 = center + Math.sin(rad) * (480 - len);
    const x2 = center + Math.cos(rad) * 480;
    const y2 = center + Math.sin(rad) * 480;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (deg % 30 === 0) {
      ctx.fillStyle = '#4ADE80';
      ctx.font = 'bold 18px monospace';
      const tx = center + Math.cos(rad) * (480 - 45);
      const ty = center + Math.sin(rad) * (480 - 45) + 6;
      ctx.fillText(`${deg}°`, tx - 14, ty);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

/**
 * 7. Particle Textures (Flame, Ember, Smoke, Raindrop)
 */
const createFlameSprite = (): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.15, 'rgba(255, 230, 80, 0.95)');
  grad.addColorStop(0.4, 'rgba(255, 120, 20, 0.7)');
  grad.addColorStop(0.7, 'rgba(220, 38, 38, 0.3)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

const createEmberSprite = (): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 240, 1.0)');
  grad.addColorStop(0.3, 'rgba(245, 158, 11, 0.9)');
  grad.addColorStop(0.8, 'rgba(220, 38, 38, 0.3)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

const createSmokeSprite = (): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(168, 85, 247, 0.65)');
  grad.addColorStop(0.35, 'rgba(126, 34, 206, 0.35)');
  grad.addColorStop(0.7, 'rgba(88, 28, 135, 0.12)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

const createRainStreakSprite = (): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
  grad.addColorStop(0.3, 'rgba(186, 230, 253, 0.7)');
  grad.addColorStop(0.9, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
  ctx.fillStyle = grad;
  ctx.fillRect(10, 0, 12, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

// ============================================================================
// COMPONENT COMPREHENSIVE SPECIFICATION CATALOG
// ============================================================================
const COMPONENT_CATALOG: Record<string, ComponentInfo> = {
  esp32: {
    id: 'esp32',
    name: 'ESP32-WROOM-32 Edge Microcontroller',
    partNumber: 'ESP32-D0WDQ6-V3 Dual-Core Tensilica Xtensa LX6 @ 240MHz',
    interface: 'FreeRTOS / SPI / UART / I2C / 12-bit SAR ADC',
    pin: 'Core MCU (38-Pin Module Footprint)',
    voltage: '3.3V DC (Integrated AMS1117-3.3 LDO)',
    currentReading: '80mA Active Wi-Fi Uplink • 15µA Deep Sleep',
    rawAdc: '12-bit Resolution (4096 Steps)',
    status: 'OPERATIONAL (FreeRTOS Core Active)',
    description:
      'High-performance IoT controller responsible for edge sensor acquisition, Kalman filter sensor fusion, AI hazard anomaly inference, and encrypted MQTT/WebSocket transmission.',
    specs: ['240 MHz Clock Frequency', '520 KB SRAM / 4 MB SPI Flash', 'Wi-Fi 802.11 b/g/n + BT 4.2 BLE', '-40°C to +125°C Industrial Grade'],
  },
  dht22: {
    id: 'dht22',
    name: 'DHT22 / AM2302 Precision Thermo-Hygrometer',
    partNumber: 'Aosong AM2302 Capacitive Humidity & NTC Thermistor',
    interface: 'Single-Bus Digital Serial Packet',
    pin: 'GPIO 4 (4.7kΩ Pull-Up Resistor)',
    voltage: '3.3V - 5.5V DC',
    currentReading: 'Temp: 32.5°C • Humidity: 45.0% RH',
    rawAdc: '40-bit Single-Wire Serial Frame',
    status: 'HEALTHY',
    description:
      'Calibrated digital composite sensor outputting ambient temperature and relative humidity with high accuracy, essential for vapor deficit calculations and wildfire ignition risk detection.',
    specs: ['Temp Range: -40°C ~ +80°C (±0.5°C)', 'Humidity: 0-100% RH (±2% RH)', 'Sampling Period: 2 Seconds', '4-pin Single-Row Package'],
  },
  mq135: {
    id: 'mq135',
    name: 'MQ-135 Hazardous Gas & Air Quality Sensor',
    partNumber: 'Hanwei MQ-135 SnO2 Metal Oxide Semiconductor',
    interface: 'Analog Voltage (0-3.3V) via Resistor Divider',
    pin: 'GPIO 34 (ADC1_CH6 - Input Only)',
    voltage: '5.0V Internal Heater • 3.3V Sensor Load',
    currentReading: '110 PPM (Gas Index Level)',
    rawAdc: 'ADC Value: 751 / 4095 (18.3%)',
    status: 'NORMAL BASELINE',
    description:
      'Detects hazardous airborne pollutants, combustible gases, toxic NOx, smoke particulate matter, ammonia, and CO2 emissions via a heated SnO2 sensing mesh.',
    specs: ['Target Gases: NH3, NOx, Alcohol, Benzene, Smoke, CO2', 'Concentration: 10 - 1000 PPM', 'Heater Consumption: ~800mW', 'Stainless Steel 316 Mesh Cage'],
  },
  rain: {
    id: 'rain',
    name: 'Capacitive / Resistive Gold Rain Sensor Array',
    partNumber: 'FR-4 Double-Sided ENIG Gold Interdigitated Comb Plate',
    interface: 'Analog Voltage Divider + LM393 High-Sensitivity Comparator',
    pin: 'GPIO 35 (ADC1_CH7 - Input Only)',
    voltage: '3.3V DC Sensor Excitation',
    currentReading: '0 ADC (Dry Surface)',
    rawAdc: '0 / 1024 Raw Scale',
    status: 'SURFACE DRY',
    description:
      'Dual-surface nickel/gold plated serpentine comb array that detects water droplets, rainfall intensity, and flash flood surface moisture with zero oxidation degradation.',
    specs: ['Immersion Gold (ENIG) Finish', '25° Drainage Angle Mounting', 'Dual Analog & Digital Trigger Out', 'Dimensions: 5.4cm x 4.0cm'],
  },
  gps: {
    id: 'gps',
    name: 'u-blox NEO-6M High-Precision GPS Engine',
    partNumber: 'u-blox NEO-6M-0-001 + 25x25mm Ceramic Patch Antenna',
    interface: 'Hardware UART (9600 Baud NMEA-0183 Output)',
    pin: 'TX: GPIO 16 (RX2) • RX: GPIO 17 (TX2)',
    voltage: '3.3V DC (On-board LDO)',
    currentReading: '25.2138° N, 75.8648° E (3D Fix Locked)',
    rawAdc: '8 Satellites Tracked • HDOP: 0.92',
    status: '3D FIX LOCKED',
    description:
      'High-sensitivity satellite positioning engine featuring 50 tracking channels and microsecond-level PPS timing sync for distributed telemetry correlation.',
    specs: ['Position Accuracy: 2.5m CEP', 'Cold Start: 27s • Hot Start: 1s', 'Sensitivity: -161 dBm Tracking', 'E-RAM & EEPROM Config Storage'],
  },
  solar: {
    id: 'solar',
    name: 'Monocrystalline Solar PV Harvesting Module',
    partNumber: '6V 2.5W High-Efficiency Monocrystalline Cell with EVA/PET Lamination',
    interface: 'TP4056 Linear Li-Ion Charging Controller & DW01 Protection',
    pin: 'VIN / B+ Solar Power Inflow',
    voltage: '5.85V DC Open Circuit • 4.95V MPP',
    currentReading: '380 mA Inflow Current (Full Sunlight)',
    rawAdc: '92% Battery State of Charge',
    status: 'CHARGING ACTIVE',
    description:
      'Weatherproof monocrystalline photovoltaic unit mounted on top of the polycarbonate lid for perpetual autonomous power harvesting.',
    specs: ['Peak Power: 2.5 Watts', 'Efficiency: 21.5% Monocrystalline', 'Anti-reflective Tempered Glass', 'Anodized Aluminum Framing'],
  },
  battery: {
    id: 'battery',
    name: 'Panasonic NCR18650B Lithium-Ion Power Cell',
    partNumber: 'Panasonic NCR18650B 3400mAh 3.7V Protected Li-ion',
    interface: 'Analog Voltage Divider (100kΩ / 100kΩ to ADC1_CH0)',
    pin: 'GPIO 36 (ADC1_CH0 / SENSOR_VP)',
    voltage: '4.12V DC (92% Charged)',
    currentReading: '92% Capacity (14.2 Days Autonomous Runtime)',
    rawAdc: 'ADC: 3765 / 4095',
    status: 'NOMINAL HEALTH (Cycle Count: 14)',
    description:
      'Industrial-grade high energy density lithium-ion cell encased in a spring-loaded Keystone cradle providing reliable power during prolonged solar occlusion.',
    specs: ['Capacity: 3400 mAh (12.6 Wh)', 'Nominal Voltage: 3.7V (Max 4.2V)', 'Max Discharge Current: 6.8A', 'Integrated BMS Overcurrent Protection'],
  },
  antenna: {
    id: 'antenna',
    name: 'Omnidirectional High-Gain Dipole Antenna',
    partNumber: '2.4GHz / 868MHz +3.5dBi Rubber Duck SMA Swivel Antenna',
    interface: 'IPEX / U.FL to Female SMA Bulkhead Connector',
    pin: 'RF Antenna Port (50Ω Impedance)',
    voltage: 'Passive RF Grounded',
    currentReading: '-62 dBm RSSI (Strong Link Quality)',
    rawAdc: 'Packet Delivery Ratio: 99.8%',
    status: 'UPLINK STABLE',
    description:
      'High-gain articulated rubber duck antenna providing omnidirectional radio wave propagation across dense foliage, hilly highways, and urban environments.',
    specs: ['Frequency: 868MHz / 915MHz / 2.4GHz', 'Gain: +3.5 dBi', 'Impedance: 50 Ohms', 'Brass Knurled SMA Connector'],
  },
  gland: {
    id: 'gland',
    name: 'IP68 Weatherproof Nylon Cable Gland',
    partNumber: 'PG7 / M12 Industrial Nylon Compression Cable Gland',
    interface: 'Mechanical Compression Seal',
    pin: 'Chassis Feedthrough',
    voltage: 'N/A (Insulated PA66 Nylon)',
    currentReading: 'Hermetic IP68 Submersion Rating',
    rawAdc: 'Seal Compression: 100%',
    status: 'SEALED',
    description:
      'Industrial cable gland with NBR rubber compression collar and neoprene O-ring gasket preventing moisture, dust, and toxic fumes from breaching the inner electronics.',
    specs: ['IP Rating: IP68 (5 Bar Submersion)', 'Material: UL94-V2 Polyamide 66', 'Cable Range: 3.5mm - 6.5mm OD', 'Temperature: -40°C to +100°C'],
  },
};

// ============================================================================
// MAIN COMPONENT EXPORT
// ============================================================================
export const HardwareSimulatorView: React.FC<HardwareSimulatorViewProps> = ({
  nodes = [],
  selectedNodeId = 'ENV-001',
  onSelectNode,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Physical Stimulus State
  const [temperature, setTemperature] = useState<number>(32.5);
  const [humidity, setHumidity] = useState<number>(45.0);
  const [rainValue, setRainValue] = useState<number>(0);
  const [airQuality, setAirQuality] = useState<number>(110);
  const [batteryPercentage, setBatteryPercentage] = useState<number>(92);
  const [solarActive, setSolarActive] = useState<boolean>(true);

  // Viewport & Inspection State
  const [inspectionMode, setInspectionMode] = useState<InspectionMode>('ASSEMBLED');
  const [isLidOpen, setIsLidOpen] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentInfo | null>(COMPONENT_CATALOG.esp32);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('ISO');
  const [isLiveSync, setIsLiveSync] = useState<boolean>(false);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [injectionSuccess, setInjectionSuccess] = useState<boolean>(false);

  // Camera Target Controller ref
  const cameraTargetRef = useRef<{ theta: number; phi: number; radius: number; lookY: number }>({
    theta: 0.5,
    phi: Math.PI / 3.4,
    radius: 7.2,
    lookY: 1.8,
  });

  // Active Node Resolution
  const activeNode = nodes.find((n) => n.node_id === selectedNodeId) || nodes[0] || null;

  // Backend Live Sync
  useEffect(() => {
    if (isLiveSync && activeNode?.latest_reading) {
      setTemperature(activeNode.latest_reading.temperature);
      setHumidity(activeNode.latest_reading.humidity);
      setRainValue(activeNode.latest_reading.rain_value);
      setAirQuality(activeNode.latest_reading.air_quality);
      setBatteryPercentage(activeNode.battery_percentage ?? 90);
    }
  }, [isLiveSync, activeNode]);

  // Set Camera Preset Handler
  const handleApplyCameraPreset = (preset: CameraViewPreset) => {
    setCameraPreset(preset);
    if (preset === 'ISO') {
      cameraTargetRef.current = { theta: 0.55, phi: Math.PI / 3.4, radius: 7.2, lookY: 1.8 };
    } else if (preset === 'PCB') {
      cameraTargetRef.current = { theta: 0.1, phi: Math.PI / 5.5, radius: 4.2, lookY: 2.2 };
      setIsLidOpen(true);
    } else if (preset === 'RAIN') {
      cameraTargetRef.current = { theta: 1.2, phi: Math.PI / 3.0, radius: 4.5, lookY: 1.9 };
    } else if (preset === 'TOP') {
      cameraTargetRef.current = { theta: 0.0, phi: 0.05, radius: 6.8, lookY: 2.0 };
    } else if (preset === 'FRONT') {
      cameraTargetRef.current = { theta: 0.0, phi: Math.PI / 2.2, radius: 6.5, lookY: 1.8 };
    }
  };

  // Inject Current Physical Stimulus to FastAPI backend
  const handleInjectStimuli = async () => {
    try {
      setIsInjecting(true);
      await api.getDashboardSummary(); // Check connectivity

      const nodeId = activeNode?.node_id || 'ENV-001';
      const payload = {
        node_id: nodeId,
        temperature: parseFloat(temperature.toFixed(1)),
        humidity: parseFloat(humidity.toFixed(1)),
        pressure: 1013.25 - (rainValue > 100 ? 18 : 0),
        rain_value: parseFloat(rainValue.toFixed(1)),
        air_quality: parseFloat(airQuality.toFixed(1)),
        latitude: activeNode?.latitude || 25.2138,
        longitude: activeNode?.longitude || 75.8648,
        battery_percentage: parseFloat(batteryPercentage.toFixed(1)),
        timestamp: new Date().toISOString(),
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/sensor-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setInjectionSuccess(true);
        setTimeout(() => setInjectionSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to inject 3D simulation telemetry:', err);
    } finally {
      setIsInjecting(false);
    }
  };

  // ==========================================================================
  // THREE.JS 3D SCENE INITIALIZATION & ANIMATION RENDER LOOP
  // ==========================================================================
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Cinematic Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#060B09');
    scene.fog = new THREE.FogExp2('#060B09', 0.028);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 8.5);

    // 3. High-Quality WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio 3-Point PBR Lighting
    const ambientLight = new THREE.AmbientLight('#E2E8F0', 1.1);
    scene.add(ambientLight);

    // Key Sunlight (Casts crisp soft contact shadows)
    const keySun = new THREE.DirectionalLight('#FFFBEB', 2.8);
    keySun.position.set(6, 12, 7);
    keySun.castShadow = true;
    keySun.shadow.mapSize.width = 2048;
    keySun.shadow.mapSize.height = 2048;
    keySun.shadow.camera.near = 1;
    keySun.shadow.camera.far = 25;
    keySun.shadow.camera.left = -5;
    keySun.shadow.camera.right = 5;
    keySun.shadow.camera.top = 5;
    keySun.shadow.camera.bottom = -5;
    keySun.shadow.bias = -0.0003;
    scene.add(keySun);

    // Cool Sky Rim / Fill Light
    const skyFill = new THREE.DirectionalLight('#38BDF8', 1.0);
    skyFill.position.set(-7, 8, -6);
    scene.add(skyFill);

    // Emerald Ground Bounce Light
    const groundBounce = new THREE.DirectionalLight('#10B981', 0.5);
    groundBounce.position.set(0, -6, 0);
    scene.add(groundBounce);

    // Dynamic Hazard Point Lights
    const fireLight = new THREE.PointLight('#FF4500', 0, 9, 1.8);
    fireLight.position.set(-2.8, 2.2, 0.6);
    scene.add(fireLight);

    const gasLight = new THREE.PointLight('#A855F7', 0, 8, 1.8);
    gasLight.position.set(2.8, 2.0, -0.6);
    scene.add(gasLight);

    const espLedLight = new THREE.PointLight('#10B981', 0.8, 2.0);
    espLedLight.position.set(-0.5, 2.45, 0.35);
    scene.add(espLedLight);

    // 5. Studio Platform Turntable Base & Precision Floor
    const platformTex = createPlatformTexture();
    const pedestalGeo = new THREE.CylinderGeometry(4.6, 4.9, 0.35, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      map: platformTex,
      roughness: 0.5,
      metalness: 0.35,
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestalMesh.position.y = -0.175;
    pedestalMesh.receiveShadow = true;
    scene.add(pedestalMesh);

    // Glowing Neon Accent Ring
    const neonRingGeo = new THREE.TorusGeometry(4.62, 0.035, 16, 64);
    const neonRingMat = new THREE.MeshBasicMaterial({ color: '#10B981' });
    const neonRing = new THREE.Mesh(neonRingGeo, neonRingMat);
    neonRing.rotation.x = Math.PI / 2;
    neonRing.position.y = 0.0;
    scene.add(neonRing);

    // Soft Shadow-Catcher Floor Plane
    const shadowFloorGeo = new THREE.PlaneGeometry(16, 16);
    const shadowFloorMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowFloor = new THREE.Mesh(shadowFloorGeo, shadowFloorMat);
    shadowFloor.rotation.x = -Math.PI / 2;
    shadowFloor.position.y = 0.005;
    shadowFloor.receiveShadow = true;
    scene.add(shadowFloor);

    // Rising Flood Water Basin (Translucent Physical Water with IOR)
    const waterGeo = new THREE.CylinderGeometry(4.55, 4.55, 0.8, 64);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: '#0284C7',
      transparent: true,
      opacity: 0.0,
      roughness: 0.04,
      transmission: 0.88,
      ior: 1.333,
      thickness: 0.5,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = 0.0;
    scene.add(waterMesh);

    // Stainless Steel Mounting Mast / Pole
    const mastGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.3, 32);
    const mastMat = new THREE.MeshStandardMaterial({
      color: '#64748B',
      metalness: 0.9,
      roughness: 0.2,
    });
    const mastMesh = new THREE.Mesh(mastGeo, mastMat);
    mastMesh.position.y = 1.05;
    mastMesh.castShadow = true;
    scene.add(mastMesh);

    // Mast Base Collar Flange with Stainless Steel Hex Bolts
    const flangeGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.12, 32);
    const flangeMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.85, roughness: 0.25 });
    const flangeMesh = new THREE.Mesh(flangeGeo, flangeMat);
    flangeMesh.position.y = 0.06;
    flangeMesh.castShadow = true;
    scene.add(flangeMesh);

    // 6. MAIN HARDWARE ASSEMBLY GROUP (All Physical Components)
    const hardwareGroup = new THREE.Group();
    hardwareGroup.position.set(0, 2.15, 0);
    scene.add(hardwareGroup);

    // ========================================================================
    // PHYSICAL HARDWARE 3D MODELING
    // ========================================================================

    // --- 1. IP67 WEATHERPROOF ENCLOSURE (Hammond / Fibox Heavy Polymer Tub) ---
    const chassisGroup = new THREE.Group();
    hardwareGroup.add(chassisGroup);

    // Main Tub Base (Industrial Dark Slate Polymer with Rounded Chamfers)
    const baseChassisGeo = new THREE.BoxGeometry(2.7, 0.75, 2.0);
    const baseChassisMat = new THREE.MeshStandardMaterial({
      color: '#0F251E',
      roughness: 0.38,
      metalness: 0.15,
    });
    const baseChassis = new THREE.Mesh(baseChassisGeo, baseChassisMat);
    baseChassis.position.y = 0.375;
    baseChassis.castShadow = true;
    baseChassis.receiveShadow = true;
    baseChassis.name = 'enclosure';
    chassisGroup.add(baseChassis);

    // Reinforced Structural Side Ribs
    const ribMat = new THREE.MeshStandardMaterial({ color: '#091A15', roughness: 0.5 });
    [-0.9, 0, 0.9].forEach((rx) => {
      const rib1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), ribMat);
      rib1.position.set(rx, 0.375, 1.02);
      chassisGroup.add(rib1);
      const rib2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), ribMat);
      rib2.position.set(rx, 0.375, -1.02);
      chassisGroup.add(rib2);
    });

    // Mounting Flange Wall Ears with Slotted Screw Holes
    const earGeo = new THREE.BoxGeometry(3.1, 0.09, 1.4);
    const earMat = new THREE.MeshStandardMaterial({ color: '#091A15', roughness: 0.55 });
    const earMesh = new THREE.Mesh(earGeo, earMat);
    earMesh.position.set(0, 0.045, 0);
    chassisGroup.add(earMesh);

    // Perimeter Silicone Weatherproof Gasket Seal (Fluorescent Orange/Neon)
    const gasketGeo = new THREE.BoxGeometry(2.66, 0.05, 1.96);
    const gasketMat = new THREE.MeshStandardMaterial({
      color: '#EA580C',
      roughness: 0.8,
    });
    const gasketMesh = new THREE.Mesh(gasketGeo, gasketMat);
    gasketMesh.position.set(0, 0.76, 0);
    chassisGroup.add(gasketMesh);

    // IP68 Heavy-Duty Nylon Cable Gland with Compression Hex Nut
    const glandGroup = new THREE.Group();
    glandGroup.position.set(0.65, 0.0, 0);
    glandGroup.name = 'gland';
    chassisGroup.add(glandGroup);

    const glandBodyGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.38, 6); // Hexagonal body
    const glandBodyMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.35, metalness: 0.4 });
    const glandBody = new THREE.Mesh(glandBodyGeo, glandBodyMat);
    glandBody.position.y = -0.15;
    glandBody.castShadow = true;
    glandGroup.add(glandBody);

    // Flexible Black PVC Cable emerging from gland
    const cableCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.65, -0.3, 0),
      new THREE.Vector3(0.65, -0.7, 0),
      new THREE.Vector3(1.3, -0.5, 0),
      new THREE.Vector3(1.5, 0.1, 0)
    );
    const cableGeo = new THREE.TubeGeometry(cableCurve, 20, 0.045, 12, false);
    const cableMat = new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.5 });
    const cableMesh = new THREE.Mesh(cableGeo, cableMat);
    chassisGroup.add(cableMesh);

    // --- 2. HINGED CRYSTAL-CLEAR POLYCARBONATE LID & SOLAR PV MODULE ---
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.77, -1.0); // Rear hinge pivot point
    hardwareGroup.add(lidGroup);

    // Polycarbonate Transparent Lid with Refractive Transmission & Bevel
    const lidGeo = new THREE.BoxGeometry(2.72, 0.48, 2.02);
    const lidMat = new THREE.MeshPhysicalMaterial({
      color: '#E0F2FE',
      transparent: true,
      opacity: 0.45,
      roughness: 0.08,
      transmission: 0.88,
      thickness: 0.4,
      ior: 1.52,
      reflectivity: 0.6,
    });
    const lidMesh = new THREE.Mesh(lidGeo, lidMat);
    lidMesh.position.set(0, 0.24, 1.0);
    lidMesh.castShadow = true;
    lidGroup.add(lidMesh);

    // 4 Corner Recessed Counterbore Stainless Steel Torx Screws
    const screwGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16);
    const screwMat = new THREE.MeshStandardMaterial({ color: '#F1F5F9', metalness: 0.95, roughness: 0.15 });
    const screwPositions = [
      [-1.22, 0.49, 0.15],
      [1.22, 0.49, 0.15],
      [-1.22, 0.49, 1.85],
      [1.22, 0.49, 1.85],
    ];
    screwPositions.forEach(([sx, sy, sz]) => {
      const screw = new THREE.Mesh(screwGeo, screwMat);
      screw.position.set(sx, sy, sz);
      lidGroup.add(screw);

      // Torx head cross indent
      const slotGeo = new THREE.BoxGeometry(0.07, 0.02, 0.015);
      const slotMat = new THREE.MeshBasicMaterial({ color: '#334155' });
      const slot = new THREE.Mesh(slotGeo, slotMat);
      slot.position.set(sx, sy + 0.042, sz);
      lidGroup.add(slot);
    });

    // Monocrystalline Solar Panel Module (High-Resolution Wafer Texture)
    const solarTex = createSolarTexture();
    const solarGeo = new THREE.BoxGeometry(2.05, 0.06, 1.45);
    const solarMat = new THREE.MeshStandardMaterial({
      map: solarTex,
      metalness: 0.65,
      roughness: 0.22,
    });
    const solarMesh = new THREE.Mesh(solarGeo, solarMat);
    solarMesh.position.set(0, 0.51, 1.0);
    solarMesh.castShadow = true;
    solarMesh.name = 'solar';
    lidGroup.add(solarMesh);

    // --- 3. HIGH-DENSITY MOTHERBOARD PCB ASSEMBLY ---
    const pcbGroup = new THREE.Group();
    pcbGroup.position.set(0, 0.45, 0);
    hardwareGroup.add(pcbGroup);

    const pcbTex = createPcbTexture();
    const pcbGeo = new THREE.BoxGeometry(2.35, 0.05, 1.7);
    const pcbMat = new THREE.MeshStandardMaterial({
      map: pcbTex,
      roughness: 0.32,
      metalness: 0.28,
    });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.receiveShadow = true;
    pcbMesh.name = 'pcb';
    pcbGroup.add(pcbMesh);

    // 4 Corner Brass Standoffs
    const standoffGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 16);
    const standoffMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', metalness: 0.9, roughness: 0.2 });
    [
      [-1.05, -0.08, -0.75],
      [1.05, -0.08, -0.75],
      [-1.05, -0.08, 0.75],
      [1.05, -0.08, 0.75],
    ].forEach(([px, py, pz]) => {
      const standoff = new THREE.Mesh(standoffGeo, standoffMat);
      standoff.position.set(px, py, pz);
      pcbGroup.add(standoff);
    });

    // --- 4. ESP32-WROOM-32 EDGE CONTROLLER MODULE ---
    const espGroup = new THREE.Group();
    espGroup.position.set(-0.55, 0.09, 0);
    espGroup.name = 'esp32';
    pcbGroup.add(espGroup);

    // Brushed Metal RF Shield with Laser Engraving
    const espShieldTex = createEsp32ShieldTexture();
    const espShieldGeo = new THREE.BoxGeometry(0.8, 0.09, 1.05);
    const espShieldMat = new THREE.MeshStandardMaterial({
      map: espShieldTex,
      metalness: 0.88,
      roughness: 0.22,
    });
    const espShield = new THREE.Mesh(espShieldGeo, espShieldMat);
    espShield.castShadow = true;
    espGroup.add(espShield);

    // Inverted-F PCB Meander Antenna (Gold on Black Substrate)
    const espAntGeo = new THREE.BoxGeometry(0.76, 0.03, 0.3);
    const espAntMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.4 });
    const espAnt = new THREE.Mesh(espAntGeo, espAntMat);
    espAnt.position.set(0, 0.055, -0.55);
    espGroup.add(espAnt);

    // Micro USB / USB-C Receptacle
    const usbGeo = new THREE.BoxGeometry(0.28, 0.11, 0.22);
    const usbMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', metalness: 0.95, roughness: 0.1 });
    const usbMesh = new THREE.Mesh(usbGeo, usbMat);
    usbMesh.position.set(0, 0.055, 0.6);
    espGroup.add(usbMesh);

    // Pulsing Status LED (Green TX/RX)
    const ledGeo = new THREE.SphereGeometry(0.035, 16, 16);
    const ledMat = new THREE.MeshBasicMaterial({ color: '#10B981' });
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(0.3, 0.09, 0.42);
    espGroup.add(ledMesh);

    // SMT Passive Components (0805 Capacitors & Resistors scattered on board)
    const smtCapGeo = new THREE.BoxGeometry(0.06, 0.03, 0.04);
    const smtCapMat = new THREE.MeshStandardMaterial({ color: '#A16207', roughness: 0.4 });
    for (let i = 0; i < 14; i++) {
      const cap = new THREE.Mesh(smtCapGeo, smtCapMat);
      cap.position.set(-0.2 + (i % 4) * 0.1, 0.04, -0.2 + Math.floor(i / 4) * 0.15);
      pcbGroup.add(cap);
    }

    // AMS1117-3.3V LDO Voltage Regulator (SOT-223 package)
    const ldoGeo = new THREE.BoxGeometry(0.22, 0.06, 0.16);
    const ldoMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.3 });
    const ldoMesh = new THREE.Mesh(ldoGeo, ldoMat);
    ldoMesh.position.set(-0.15, 0.055, 0.6);
    pcbGroup.add(ldoMesh);

    // LDO Metal Heatsink Tab
    const tabGeo = new THREE.BoxGeometry(0.18, 0.03, 0.08);
    const tabMat = new THREE.MeshStandardMaterial({ color: '#CBD5E1', metalness: 0.95 });
    const tabMesh = new THREE.Mesh(tabGeo, tabMat);
    tabMesh.position.set(-0.15, 0.055, 0.7);
    pcbGroup.add(tabMesh);

    // --- 5. DHT22 / AM2302 THERMO-HYGROMETER SENSOR ---
    const dhtGroup = new THREE.Group();
    dhtGroup.position.set(0.65, 0.22, -0.45);
    dhtGroup.name = 'dht22';
    pcbGroup.add(dhtGroup);

    // Slotted White Injection Molded Shell
    const dhtGeo = new THREE.BoxGeometry(0.46, 0.38, 0.42);
    const dhtMat = new THREE.MeshStandardMaterial({
      color: '#F8FAFC',
      roughness: 0.22,
    });
    const dhtMesh = new THREE.Mesh(dhtGeo, dhtMat);
    dhtMesh.castShadow = true;
    dhtGroup.add(dhtMesh);

    // Realistic Air Intake Ventilation Louvers
    const dhtGrillMat = new THREE.MeshBasicMaterial({ color: '#1E293B' });
    for (let i = -0.12; i <= 0.12; i += 0.045) {
      const grill = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.32), dhtGrillMat);
      grill.position.set(0, i, 0.08);
      dhtGroup.add(grill);
    }

    // 4 Gold-Plated Connector Pins
    const pinGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.18, 8);
    const pinMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', metalness: 0.95 });
    for (let p = -0.14; p <= 0.14; p += 0.09) {
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(p, -0.22, 0);
      dhtGroup.add(pin);
    }

    // --- 6. MQ-135 HAZARDOUS GAS SENSOR ---
    const mqGroup = new THREE.Group();
    mqGroup.position.set(0.65, 0.2, 0.45);
    mqGroup.name = 'mq135';
    pcbGroup.add(mqGroup);

    // Stainless Steel Dual-Layer Wire Mesh Cylinder Dome
    const mqMeshGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.36, 32);
    const mqMeshMat = new THREE.MeshStandardMaterial({
      color: '#CBD5E1',
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
    });
    const mqMeshDome = new THREE.Mesh(mqMeshGeo, mqMeshMat);
    mqMeshDome.castShadow = true;
    mqGroup.add(mqMeshDome);

    // Solid Polished Nickel Top Ring
    const mqRingGeo = new THREE.TorusGeometry(0.24, 0.03, 16, 32);
    const mqRingMat = new THREE.MeshStandardMaterial({ color: '#94A3B8', metalness: 0.95, roughness: 0.1 });
    const mqRing = new THREE.Mesh(mqRingGeo, mqRingMat);
    mqRing.rotation.x = Math.PI / 2;
    mqRing.position.y = 0.18;
    mqGroup.add(mqRing);

    // Internal Glowing Tungsten/Alumina Ceramic Heater Core
    const mqCoreGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.22, 16);
    const mqCoreMat = new THREE.MeshBasicMaterial({ color: '#EA580C' });
    const mqCore = new THREE.Mesh(mqCoreGeo, mqCoreMat);
    mqGroup.add(mqCore);

    // Black Bakelite 6-Pin Socket Base
    const mqBaseGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.09, 32);
    const mqBaseMat = new THREE.MeshStandardMaterial({ color: '#1C1917', roughness: 0.75 });
    const mqBase = new THREE.Mesh(mqBaseGeo, mqBaseMat);
    mqBase.position.y = -0.2;
    mqGroup.add(mqBase);

    // --- 7. NEO-6M GPS SATELLITE RECEIVER & CERAMIC PATCH ---
    const gpsGroup = new THREE.Group();
    gpsGroup.position.set(-0.55, 0.14, -0.55);
    gpsGroup.name = 'gps';
    pcbGroup.add(gpsGroup);

    // Ceramic Patch Antenna (Tan dielectric with silver ground patch)
    const gpsGeo = new THREE.BoxGeometry(0.42, 0.09, 0.42);
    const gpsMat = new THREE.MeshStandardMaterial({
      color: '#FEF3C7', // Tan ceramic
      roughness: 0.35,
      metalness: 0.3,
    });
    const gpsMesh = new THREE.Mesh(gpsGeo, gpsMat);
    gpsMesh.castShadow = true;
    gpsGroup.add(gpsMesh);

    // Center Gold Contact Solder Dot
    const goldDotGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.015, 16);
    const goldDotMat = new THREE.MeshStandardMaterial({ color: '#D97706', metalness: 0.95 });
    const goldDot = new THREE.Mesh(goldDotGeo, goldDotMat);
    goldDot.position.y = 0.052;
    gpsGroup.add(goldDot);

    // Pulsing Green PPS Satellite Lock LED
    const ppsLedGeo = new THREE.SphereGeometry(0.025, 12, 12);
    const ppsLedMat = new THREE.MeshBasicMaterial({ color: '#10B981' });
    const ppsLed = new THREE.Mesh(ppsLedGeo, ppsLedMat);
    ppsLed.position.set(0.16, 0.055, 0.16);
    gpsGroup.add(ppsLed);

    // --- 8. PANASONIC NCR18650B LI-ION BATTERY PACK & KEYSTONE CRADLE ---
    const batGroup = new THREE.Group();
    batGroup.position.set(-0.55, 0.16, 0.55);
    batGroup.rotation.z = Math.PI / 2;
    batGroup.name = 'battery';
    pcbGroup.add(batGroup);

    // Black Keystone Battery Cradle Base
    const cradleGeo = new THREE.BoxGeometry(0.34, 0.95, 0.2);
    const cradleMat = new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.7 });
    const cradleMesh = new THREE.Mesh(cradleGeo, cradleMat);
    cradleMesh.position.set(0, 0, -0.06);
    batGroup.add(cradleMesh);

    // Panasonic 18650 Battery Cylinder
    const batTex = createBatteryTexture();
    const batGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.88, 32);
    const batMat = new THREE.MeshStandardMaterial({
      map: batTex,
      roughness: 0.25,
      metalness: 0.5,
    });
    const batMesh = new THREE.Mesh(batGeo, batMat);
    batMesh.castShadow = true;
    batGroup.add(batMesh);

    // Positive Raised Button Terminal (+)
    const posTermGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.05, 16);
    const termMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', metalness: 0.95, roughness: 0.1 });
    const posTerm = new THREE.Mesh(posTermGeo, termMat);
    posTerm.position.y = 0.46;
    batGroup.add(posTerm);

    // Negative Flat Base Terminal (-)
    const negTermGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.02, 24);
    const negTerm = new THREE.Mesh(negTermGeo, termMat);
    negTerm.position.y = -0.45;
    batGroup.add(negTerm);

    // Red & Black Silicone Wires leading to motherboard
    const wireMatRed = new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.6 });
    const wireMatBlack = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.6 });
    const wireGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
    const wireRed = new THREE.Mesh(wireGeo, wireMatRed);
    wireRed.position.set(0.15, 0.45, 0);
    batGroup.add(wireRed);
    const wireBlack = new THREE.Mesh(wireGeo, wireMatBlack);
    wireBlack.position.set(-0.15, -0.45, 0);
    batGroup.add(wireBlack);

    // --- 9. HIGH-GAIN OMNIDIRECTIONAL SMA ANTENNA & RADIO WAVES ---
    const antGroup = new THREE.Group();
    antGroup.position.set(-1.45, 0.6, 0);
    antGroup.name = 'antenna';
    hardwareGroup.add(antGroup);

    // Knurled Gold Brass SMA Connector Nut
    const smaGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.22, 6); // Hexagonal nut
    const smaMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', metalness: 0.95, roughness: 0.18 });
    const smaMesh = new THREE.Mesh(smaGeo, smaMat);
    smaMesh.position.y = -0.1;
    antGroup.add(smaMesh);

    // Articulated Swivel Elbow Hinge Joint
    const hingeGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16);
    const hingeMat = new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.4 });
    const hingeMesh = new THREE.Mesh(hingeGeo, hingeMat);
    hingeMesh.rotation.z = Math.PI / 2;
    hingeMesh.position.y = 0.08;
    antGroup.add(hingeMesh);

    // Molded TPU Rubber Duck Antenna Body
    const antGeo = new THREE.CylinderGeometry(0.05, 0.07, 1.6, 24);
    const antMat = new THREE.MeshStandardMaterial({
      color: '#090D16',
      roughness: 0.35,
    });
    const antMesh = new THREE.Mesh(antGeo, antMat);
    antMesh.position.y = 0.88;
    antMesh.castShadow = true;
    antGroup.add(antMesh);

    // Rounded Antenna Tip Cap
    const capGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const capMesh = new THREE.Mesh(capGeo, antMat);
    capMesh.position.y = 1.68;
    antGroup.add(capMesh);

    // Animated Electromagnetic Radio Pulse Wave Rings
    const pulseRingGeo = new THREE.RingGeometry(0.12, 0.22, 32);
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: '#10B981',
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
    pulseRing.rotation.x = Math.PI / 2;
    pulseRing.position.set(0, 1.65, 0);
    antGroup.add(pulseRing);

    // --- 10. CAPACITIVE RAIN SENSOR ARRAY (Tilted 25° on Extension Bracket) ---
    const rainGroup = new THREE.Group();
    rainGroup.position.set(1.6, 0.32, 0);
    rainGroup.rotation.z = -Math.PI / 7.2; // 25° drainage angle
    rainGroup.name = 'rain';
    hardwareGroup.add(rainGroup);

    // Anodized Aluminum Mounting Extension Bracket
    const bracketGeo = new THREE.BoxGeometry(0.4, 0.06, 0.8);
    const bracketMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.85, roughness: 0.3 });
    const bracketMesh = new THREE.Mesh(bracketGeo, bracketMat);
    bracketMesh.position.set(-0.25, -0.04, 0);
    rainGroup.add(bracketMesh);

    // Rain PCB Plate with Interleaved Gold Comb Fingers
    const rainPlateTex = createRainPcbTexture();
    const rainPlateGeo = new THREE.BoxGeometry(0.9, 0.04, 1.15);
    const rainPlateMat = new THREE.MeshStandardMaterial({
      map: rainPlateTex,
      roughness: 0.22,
      metalness: 0.55,
    });
    const rainPlate = new THREE.Mesh(rainPlateGeo, rainPlateMat);
    rainPlate.castShadow = true;
    rainGroup.add(rainPlate);

    // 3D Physical Water Droplets Beaded on Rain Plate
    const waterDropletsGroup = new THREE.Group();
    rainGroup.add(waterDropletsGroup);

    const dropletGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const dropletMat = new THREE.MeshPhysicalMaterial({
      color: '#FFFFFF',
      transmission: 0.95,
      roughness: 0.02,
      ior: 1.333,
    });
    for (let d = 0; d < 12; d++) {
      const drop = new THREE.Mesh(dropletGeo, dropletMat);
      drop.scale.set(1, 0.35, 1.6);
      drop.position.set((Math.random() - 0.5) * 0.7, 0.035, (Math.random() - 0.5) * 0.85);
      waterDropletsGroup.add(drop);
    }

    // ========================================================================
    // ADVANCED HAZARD PARTICLE ENGINES (Fire, Embers, Rain, Toxic Gas)
    // ========================================================================

    // 1. Wildfire Flame Particle System (Radial Alpha Sprites)
    const flameTex = createFlameSprite();
    const flameCount = 450;
    const flameGeo = new THREE.BufferGeometry();
    const flamePositions = new Float32Array(flameCount * 3);
    const flameVelocities: { x: number; y: number; z: number; speed: number }[] = [];

    for (let i = 0; i < flameCount; i++) {
      flamePositions[i * 3] = (Math.random() - 0.5) * 2.2 - 2.6;
      flamePositions[i * 3 + 1] = Math.random() * 3.2;
      flamePositions[i * 3 + 2] = (Math.random() - 0.5) * 2.2 + 0.6;
      flameVelocities.push({
        x: (Math.random() - 0.5) * 0.025,
        y: 0.03 + Math.random() * 0.05,
        z: (Math.random() - 0.5) * 0.025,
        speed: 0.7 + Math.random() * 1.5,
      });
    }
    flameGeo.setAttribute('position', new THREE.BufferAttribute(flamePositions, 3));

    const flameMat = new THREE.PointsMaterial({
      map: flameTex,
      size: 0.65,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const flameParticles = new THREE.Points(flameGeo, flameMat);
    scene.add(flameParticles);

    // 2. Swirling Wildfire Embers
    const emberTex = createEmberSprite();
    const emberCount = 180;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 3.5 - 2.0;
      emberPositions[i * 3 + 1] = Math.random() * 4.5;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
      emberVelocities.push({
        x: (Math.random() - 0.5) * 0.04,
        y: 0.02 + Math.random() * 0.06,
        z: (Math.random() - 0.5) * 0.04,
      });
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

    const emberMat = new THREE.PointsMaterial({
      map: emberTex,
      size: 0.18,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const emberParticles = new THREE.Points(emberGeo, emberMat);
    scene.add(emberParticles);

    // 3. Falling Rain Shower Streaks
    const rainStreakTex = createRainStreakSprite();
    const rainCount = 850;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    const rainSpeeds: number[] = [];

    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 8.5;
      rainPositions[i * 3 + 1] = Math.random() * 10.0 + 1.0;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 8.5;
      rainSpeeds.push(0.22 + Math.random() * 0.2);
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

    const rainMat = new THREE.PointsMaterial({
      map: rainStreakTex,
      size: 0.32,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);

    // 4. Volumetric Toxic Gas / Combustion Smoke Plumes
    const smokeTex = createSmokeSprite();
    const gasCount = 320;
    const gasGeo = new THREE.BufferGeometry();
    const gasPositions = new Float32Array(gasCount * 3);

    for (let i = 0; i < gasCount; i++) {
      gasPositions[i * 3] = (Math.random() - 0.5) * 3.8 + 2.0;
      gasPositions[i * 3 + 1] = Math.random() * 2.8 + 0.3;
      gasPositions[i * 3 + 2] = (Math.random() - 0.5) * 3.8;
    }
    gasGeo.setAttribute('position', new THREE.BufferAttribute(gasPositions, 3));

    const gasMat = new THREE.PointsMaterial({
      map: smokeTex,
      size: 0.95,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const gasParticles = new THREE.Points(gasGeo, gasMat);
    scene.add(gasParticles);

    // ========================================================================
    // INTERACTION & ORBIT CONTROL WITH SMOOTH DAMPING
    // ========================================================================
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    let currentTheta = cameraTargetRef.current.theta;
    let currentPhi = cameraTargetRef.current.phi;
    let currentRadius = cameraTargetRef.current.radius;
    let currentLookY = cameraTargetRef.current.lookY;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        // Hover Raycaster for Interactive Component Glow
        const rect = container.getBoundingClientRect();
        const hx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const hy = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        const hoverRay = new THREE.Raycaster();
        hoverRay.setFromCamera(new THREE.Vector2(hx, hy), camera);
        const hits = hoverRay.intersectObjects(hardwareGroup.children, true);
        if (hits.length > 0) {
          let hit: THREE.Object3D | null = hits[0].object;
          while (hit && !hit.name && hit.parent) {
            hit = hit.parent;
          }
          if (hit && hit.name && COMPONENT_CATALOG[hit.name]) {
            setHoveredComponent(hit.name);
            container.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredComponent(null);
        container.style.cursor = 'grab';
        return;
      }

      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      cameraTargetRef.current.theta -= deltaX * 0.007;
      cameraTargetRef.current.phi = Math.max(0.12, Math.min(Math.PI / 2.05, cameraTargetRef.current.phi - deltaY * 0.007));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraTargetRef.current.radius = Math.max(2.8, Math.min(12.0, cameraTargetRef.current.radius + e.deltaY * 0.004));
    };

    // Component Click Raycaster for Pinout Inspection Drawer
    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clickMouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const clickRay = new THREE.Raycaster();
      clickRay.setFromCamera(clickMouse, camera);
      const intersects = clickRay.intersectObjects(hardwareGroup.children, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.name && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj && hitObj.name && COMPONENT_CATALOG[hitObj.name]) {
          setSelectedComponent(COMPONENT_CATALOG[hitObj.name]);
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onClick);

    // ========================================================================
    // HIGH-PERFORMANCE 60 FPS RENDER LOOP
    // ========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Auto-rotation when active
      if (isAutoRotate && !isDragging) {
        cameraTargetRef.current.theta += 0.005;
      }

      // Smooth Camera LERP Damping
      currentTheta = THREE.MathUtils.lerp(currentTheta, cameraTargetRef.current.theta, 0.08);
      currentPhi = THREE.MathUtils.lerp(currentPhi, cameraTargetRef.current.phi, 0.08);
      currentRadius = THREE.MathUtils.lerp(currentRadius, cameraTargetRef.current.radius, 0.08);
      currentLookY = THREE.MathUtils.lerp(currentLookY, cameraTargetRef.current.lookY, 0.08);

      camera.position.x = currentRadius * Math.sin(currentPhi) * Math.sin(currentTheta);
      camera.position.y = currentRadius * Math.cos(currentPhi);
      camera.position.z = currentRadius * Math.sin(currentPhi) * Math.cos(currentTheta);
      camera.lookAt(0, currentLookY, 0);

      // Exploded / Assembled Inspection Mode Transitions
      if (inspectionMode === 'EXPLODED') {
        lidGroup.position.y = THREE.MathUtils.lerp(lidGroup.position.y, 2.1, 0.08);
        solarMesh.position.y = THREE.MathUtils.lerp(solarMesh.position.y, 0.9, 0.08);
        pcbGroup.position.y = THREE.MathUtils.lerp(pcbGroup.position.y, 1.05, 0.08);
        dhtGroup.position.y = THREE.MathUtils.lerp(dhtGroup.position.y, 0.7, 0.08);
        mqGroup.position.y = THREE.MathUtils.lerp(mqGroup.position.y, 0.7, 0.08);
        gpsGroup.position.y = THREE.MathUtils.lerp(gpsGroup.position.y, 0.55, 0.08);
        batGroup.position.y = THREE.MathUtils.lerp(batGroup.position.y, 0.55, 0.08);
        rainGroup.position.x = THREE.MathUtils.lerp(rainGroup.position.x, 2.3, 0.08);
        antGroup.position.x = THREE.MathUtils.lerp(antGroup.position.x, -2.1, 0.08);
      } else {
        const lidTargetY = isLidOpen ? 1.6 : 0.77;
        lidGroup.position.y = THREE.MathUtils.lerp(lidGroup.position.y, lidTargetY, 0.08);
        lidGroup.rotation.x = isLidOpen
          ? THREE.MathUtils.lerp(lidGroup.rotation.x, -Math.PI / 2.7, 0.08)
          : THREE.MathUtils.lerp(lidGroup.rotation.x, 0, 0.08);
        solarMesh.position.y = THREE.MathUtils.lerp(solarMesh.position.y, 0.51, 0.08);
        pcbGroup.position.y = THREE.MathUtils.lerp(pcbGroup.position.y, 0.45, 0.08);
        dhtGroup.position.y = THREE.MathUtils.lerp(dhtGroup.position.y, 0.22, 0.08);
        mqGroup.position.y = THREE.MathUtils.lerp(mqGroup.position.y, 0.2, 0.08);
        gpsGroup.position.y = THREE.MathUtils.lerp(gpsGroup.position.y, 0.14, 0.08);
        batGroup.position.y = THREE.MathUtils.lerp(batGroup.position.y, 0.16, 0.08);
        rainGroup.position.x = THREE.MathUtils.lerp(rainGroup.position.x, 1.6, 0.08);
        antGroup.position.x = THREE.MathUtils.lerp(antGroup.position.x, -1.45, 0.08);
      }

      // FLIR Thermal Infrared Heatmap False-Coloring
      if (inspectionMode === 'THERMAL') {
        espShieldMat.color.set(temperature > 48 ? '#EF4444' : '#F59E0B');
        dhtMat.color.set(temperature > 40 ? '#F97316' : '#3B82F6');
        mqCoreMat.color.set('#FFFFFF'); // White Hot
        baseChassisMat.color.set('#1E1B4B');
      } else {
        espShieldMat.color.set('#FFFFFF');
        dhtMat.color.set('#F8FAFC');
        mqCoreMat.color.set('#EA580C');
        baseChassisMat.color.set('#0F251E');
      }

      // Blinking Status LEDs
      const ledPulse = Math.sin(elapsedTime * 7) > 0.1;
      ledMat.color.set(ledPulse ? '#10B981' : '#022C22');
      ppsLedMat.color.set(Math.sin(elapsedTime * 2) > 0.7 ? '#10B981' : '#022C22');
      espLedLight.intensity = ledPulse ? 0.9 : 0.05;

      // Radio wave ring animation
      const ringScale = 1.0 + (elapsedTime % 1.4) * 3.2;
      pulseRing.scale.set(ringScale, ringScale, 1);
      pulseRingMat.opacity = Math.max(0, 1.0 - (elapsedTime % 1.4) / 1.4);

      // Wildfire Flame & Ember Simulation
      const fireIntensity = Math.max(0, (temperature - 28) / 32);
      flameMat.opacity = THREE.MathUtils.lerp(flameMat.opacity, fireIntensity * 0.95, 0.06);
      emberMat.opacity = THREE.MathUtils.lerp(emberMat.opacity, fireIntensity * 0.85, 0.06);
      fireLight.intensity = fireIntensity * 4.5;

      if (fireIntensity > 0.01) {
        const fPos = flameGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < flameCount; i++) {
          fPos[i * 3 + 1] += flameVelocities[i].y * flameVelocities[i].speed;
          fPos[i * 3] += flameVelocities[i].x;
          fPos[i * 3 + 2] += flameVelocities[i].z;

          if (fPos[i * 3 + 1] > 3.8) {
            fPos[i * 3 + 1] = 0.1;
            fPos[i * 3] = (Math.random() - 0.5) * 2.2 - 2.6;
            fPos[i * 3 + 2] = (Math.random() - 0.5) * 2.2 + 0.6;
          }
        }
        flameGeo.attributes.position.needsUpdate = true;

        const ePos = emberGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < emberCount; i++) {
          ePos[i * 3 + 1] += emberVelocities[i].y;
          ePos[i * 3] += emberVelocities[i].x + Math.sin(elapsedTime + i) * 0.005;
          ePos[i * 3 + 2] += emberVelocities[i].z;

          if (ePos[i * 3 + 1] > 4.5) {
            ePos[i * 3 + 1] = 0.2;
            ePos[i * 3] = (Math.random() - 0.5) * 3.5 - 2.0;
            ePos[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
          }
        }
        emberGeo.attributes.position.needsUpdate = true;
      }

      // Rain Precipitation & Water Level Simulation
      const rainIntensity = Math.min(1.0, rainValue / 400);
      rainMat.opacity = THREE.MathUtils.lerp(rainMat.opacity, rainIntensity * 0.85, 0.06);
      waterMat.opacity = THREE.MathUtils.lerp(waterMat.opacity, rainIntensity * 0.85, 0.06);
      waterMesh.position.y = THREE.MathUtils.lerp(waterMesh.position.y, rainIntensity * 0.45, 0.06);
      waterDropletsGroup.visible = rainIntensity > 0.05;

      if (rainIntensity > 0.01) {
        const rPos = rainGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < rainCount; i++) {
          rPos[i * 3 + 1] -= rainSpeeds[i] * (1.3 + rainIntensity * 1.8);
          if (rPos[i * 3 + 1] < 0) {
            rPos[i * 3 + 1] = 10.0;
          }
        }
        rainGeo.attributes.position.needsUpdate = true;
      }

      // Toxic Gas Simulation
      const gasIntensity = Math.max(0, (airQuality - 80) / 400);
      gasMat.opacity = THREE.MathUtils.lerp(gasMat.opacity, gasIntensity * 0.88, 0.06);
      gasLight.intensity = gasIntensity * 3.5;

      if (gasIntensity > 0.01) {
        gasParticles.rotation.y = elapsedTime * 0.12;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [inspectionMode, isLidOpen, isAutoRotate, temperature, rainValue, airQuality]);

  return (
    <div className="space-y-5">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-purple-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                3D Hardware Physical Prototype Simulator
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                PBR HIGH-FIDELITY TWIN
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Photorealistic ESP32 hardware twin with IP67 enclosure, ENIG gold PCB traces, and multi-hazard physics testbed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Target Node Selector */}
          {onSelectNode && nodes.length > 0 && (
            <select
              value={selectedNodeId}
              onChange={(e) => onSelectNode(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-purple-500 cursor-pointer shadow-2xs"
            >
              {nodes.map((n) => (
                <option key={n.node_id} value={n.node_id}>
                  {n.node_id} ({n.name})
                </option>
              ))}
            </select>
          )}

          {/* Live Sync Toggle */}
          <button
            onClick={() => setIsLiveSync(!isLiveSync)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isLiveSync
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveSync ? 'animate-pulse' : ''}`} />
            <span>{isLiveSync ? 'Live Sync Active' : 'Manual Stimulus'}</span>
          </button>
        </div>
      </div>

      {/* Main 3D Simulator Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left/Center 3D Viewport (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="relative w-full h-[600px] rounded-2xl bg-[#060B09] border border-slate-800 overflow-hidden shadow-md">
            {/* 3D WebGL Canvas Container */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Top Overlay Controls & Mode Selector */}
            <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 pointer-events-auto shadow-md">
                {(['ASSEMBLED', 'EXPLODED', 'THERMAL'] as InspectionMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setInspectionMode(mode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      inspectionMode === mode
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {mode === 'ASSEMBLED' && '📦 Assembled'}
                    {mode === 'EXPLODED' && '💥 Exploded View'}
                    {mode === 'THERMAL' && '🌡️ FLIR Heatmap'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                {/* Camera View Angle Selector */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-md">
                  {(['ISO', 'PCB', 'RAIN', 'TOP', 'FRONT'] as CameraViewPreset[]).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleApplyCameraPreset(preset)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        cameraPreset === preset
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={`Switch to ${preset} View`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsAutoRotate(!isAutoRotate)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border backdrop-blur-md cursor-pointer flex items-center gap-1.5 ${
                    isAutoRotate
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-900/85 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                  title="Toggle 360° Cinematic Rotation"
                >
                  {isAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isAutoRotate ? 'Auto Rotate' : 'Rotate'}</span>
                </button>

                <button
                  onClick={() => setIsLidOpen(!isLidOpen)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border backdrop-blur-md cursor-pointer ${
                    isLidOpen
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-900/85 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {isLidOpen ? '🔓 Close Acrylic Lid' : '🔒 Open Acrylic Lid'}
                </button>
              </div>
            </div>

            {/* Hover Tooltip Overlay */}
            {hoveredComponent && COMPONENT_CATALOG[hoveredComponent] && (
              <div className="absolute top-16 left-4 bg-slate-900/90 backdrop-blur-md border border-purple-500/40 px-3 py-1.5 rounded-xl text-xs font-mono text-white pointer-events-none shadow-lg flex items-center gap-2 animate-in fade-in zoom-in duration-150">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{COMPONENT_CATALOG[hoveredComponent].name}</span>
                <span className="text-purple-400 font-bold">(Click to Inspect)</span>
              </div>
            )}

            {/* Thermal Mode Color Legend Bar */}
            {inspectionMode === 'THERMAL' && (
              <div className="absolute top-16 right-4 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-2.5 rounded-xl pointer-events-none space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                  <span>FLIR Blackbody</span>
                  <span className="text-rose-400 font-bold">10°C - 85°C</span>
                </div>
                <div className="w-36 h-2.5 rounded-full bg-gradient-to-r from-indigo-900 via-sky-500 via-amber-400 via-rose-600 to-white" />
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>Cold</span>
                  <span>Ambient</span>
                  <span>Hot</span>
                </div>
              </div>
            )}

            {/* Bottom 3D Hint HUD */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/85 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-slate-800/80 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Drag to Orbit • Scroll to Zoom • Click any component on PCB to inspect pinouts</span>
              </div>
              <span className="text-emerald-400 font-bold">PBR Studio Lighting • 60 FPS</span>
            </div>
          </div>

          {/* Quick Stimulus Preset Ribbons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => {
                setTemperature(56.0);
                setHumidity(12.0);
                setAirQuality(320);
                setRainValue(0);
              }}
              className="p-3 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-left transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-800 group-hover:text-rose-700">🔥 Wildfire Flare-Up</span>
                <Flame className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-[11px] text-slate-500">56°C • 12% RH • Soft Embers</p>
            </button>

            <button
              onClick={() => {
                setRainValue(720);
                setHumidity(96.0);
                setTemperature(21.0);
              }}
              className="p-3 rounded-xl bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-left transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-800 group-hover:text-cyan-700">🌧️ Rain Cloudburst</span>
                <Droplets className="w-4 h-4 text-cyan-500" />
              </div>
              <p className="text-[11px] text-slate-500">720 ADC • 96% RH • Flood Rise</p>
            </button>

            <button
              onClick={() => {
                setAirQuality(520);
                setTemperature(33.0);
              }}
              className="p-3 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-800 group-hover:text-purple-700">💨 Toxic Gas Leak</span>
                <Wind className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-[11px] text-slate-500">520 PPM • Volumetric Smog</p>
            </button>

            <button
              onClick={() => {
                setTemperature(26.0);
                setHumidity(48.0);
                setRainValue(0);
                setAirQuality(80);
                setBatteryPercentage(95);
              }}
              className="p-3 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-700">🌿 Nominal Baseline</span>
                <RefreshCw className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-[11px] text-slate-500">26°C • Clear Atmospheric Air</p>
            </button>
          </div>
        </div>

        {/* Right Sidebar: Stimulus Sliders & Component Inspector (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Stimulus Sliders Panel */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                  Physics Stimulator Controls
                </h3>
              </div>
              <span className="text-[10px] font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                REALTIME 60FPS
              </span>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" /> Thermal Surge
                </span>
                <span className="font-mono font-bold text-rose-600">{temperature.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="10"
                max="65"
                step="0.5"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>

            {/* Humidity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" /> Relative Humidity
                </span>
                <span className="font-mono font-bold text-blue-600">{humidity.toFixed(1)} %</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={humidity}
                onChange={(e) => setHumidity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Rain Precipitation Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-500" /> Rain Water Stream
                </span>
                <span className="font-mono font-bold text-cyan-600">{rainValue.toFixed(0)} ADC</span>
              </div>
              <input
                type="range"
                min="0"
                max="900"
                step="10"
                value={rainValue}
                onChange={(e) => setRainValue(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
            </div>

            {/* Toxic Gas Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-purple-500" /> Toxic Gas / Smoke
                </span>
                <span className="font-mono font-bold text-purple-600">{airQuality.toFixed(0)} PPM</span>
              </div>
              <input
                type="range"
                min="40"
                max="600"
                step="10"
                value={airQuality}
                onChange={(e) => setAirQuality(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Battery & Solar Controls */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-emerald-500" /> 18650 Battery Pack
                </span>
                <span className="font-mono font-bold text-emerald-700">{batteryPercentage.toFixed(0)} %</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={batteryPercentage}
                onChange={(e) => setBatteryPercentage(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Solar PV Harvesting
                </span>
                <button
                  onClick={() => setSolarActive(!solarActive)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    solarActive ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {solarActive ? 'CHARGING (5.8V)' : 'OCCLUDED (0V)'}
                </button>
              </div>
            </div>

            {/* Inject Stimulus Button */}
            <div className="pt-2">
              <button
                onClick={handleInjectStimuli}
                disabled={isInjecting}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-98 disabled:opacity-50"
              >
                {injectionSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Injected Into Live Pipeline!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{isInjecting ? 'Ingesting...' : 'Inject Stimulus to FastAPI Backend'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Component Diagnostics Inspector Drawer */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Component Inspector
              </h3>
              <span className="text-[10px] font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {selectedComponent ? selectedComponent.id.toUpperCase() : 'CLICK TO INSPECT'}
              </span>
            </div>

            {selectedComponent ? (
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedComponent.name}</h4>
                  <p className="text-[11px] font-mono text-slate-500">{selectedComponent.partNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Interface</span>
                    <p className="font-semibold text-slate-800 truncate">{selectedComponent.interface}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">GPIO Pin</span>
                    <p className="font-mono font-semibold text-purple-700 truncate">{selectedComponent.pin}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Operating Voltage</span>
                    <p className="font-mono font-semibold text-slate-800">{selectedComponent.voltage}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Live Telemetry</span>
                    <p className="font-mono font-bold text-emerald-700">{selectedComponent.currentReading}</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  {selectedComponent.description}
                </p>

                {/* Key Engineering Specs */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                    Engineering Specs
                  </span>
                  <ul className="space-y-1">
                    {selectedComponent.specs.map((spec, idx) => (
                      <li key={idx} className="text-[11px] font-mono text-slate-700 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                <Maximize2 className="w-6 h-6 text-slate-400 mx-auto" />
                <p>Click on any sensor, chip, or PCB component in the 3D viewport to inspect its electrical specs and pinout.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
