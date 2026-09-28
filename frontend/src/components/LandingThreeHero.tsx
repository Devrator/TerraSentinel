import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

interface LandingThreeHeroProps {
  scrollY?: number;
}

export const LandingThreeHero: React.FC<LandingThreeHeroProps> = ({ scrollY = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const isDark = theme === 'dark';
    
    // Scene Fog for atmospheric depth
    scene.fog = new THREE.FogExp2(isDark ? 0x07090e : 0xf4f5f8, 0.0028);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 26);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.2 : 1.0;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(isDark ? 0x1e293b : 0xffffff, isDark ? 1.4 : 2.0);
    scene.add(ambientLight);

    const orangePoint = new THREE.PointLight(0xff4405, isDark ? 5 : 3, 50);
    orangePoint.position.set(12, 10, 15);
    scene.add(orangePoint);

    const cyanPoint = new THREE.PointLight(0x06b6d4, isDark ? 4 : 2.5, 50);
    cyanPoint.position.set(-14, -8, 12);
    scene.add(cyanPoint);

    // 3. Central Holographic Geospatial Sphere (AegisNet Mesh Node Cluster)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroup.position.set(0, 1.5, 0);

    // 3a. Particle Globe Core
    const particleCount = 1800;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const radius = 6.8;
    const colorOrange = new THREE.Color(0xff4405);
    const colorCyan = new THREE.Color(0x06b6d4);
    const colorWhite = new THREE.Color(isDark ? 0xffffff : 0x334155);

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      // Color variation across latitude
      const mixRatio = Math.sin(phi);
      const tempColor = new THREE.Color();
      if (i % 7 === 0) {
        tempColor.copy(colorOrange);
      } else if (i % 5 === 0) {
        tempColor.copy(colorCyan);
      } else {
        tempColor.lerpColors(colorWhite, colorCyan, mixRatio * 0.4);
      }

      particleColors[i * 3] = tempColor.r;
      particleColors[i * 3 + 1] = tempColor.g;
      particleColors[i * 3 + 2] = tempColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: isDark ? 0.16 : 0.14,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.85 : 0.65,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending
    });

    const particleGlobe = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particleGlobe);

    // 3b. Inner Wireframe Hologram
    const innerIcoGeo = new THREE.IcosahedronGeometry(radius * 0.96, 3);
    const innerIcoMat = new THREE.MeshBasicMaterial({
      color: 0xff4405,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.12 : 0.08
    });
    const innerIco = new THREE.Mesh(innerIcoGeo, innerIcoMat);
    globeGroup.add(innerIco);

    // 4. 5 Mesh Sensor Nodes on Globe Surface with Pulsing Rings & Connecting Arcs
    const nodeCoordinates = [
      { lat: 25.2138, lon: 75.8648, name: 'ENV-001', type: 'FLOOD' },
      { lat: 25.2450, lon: 75.8920, name: 'ENV-002', type: 'FIRE' },
      { lat: 25.1820, lon: 75.8310, name: 'ENV-003', type: 'AQI' },
      { lat: 25.2600, lon: 75.8150, name: 'ENV-004', type: 'FLOOD' },
      { lat: 25.1950, lon: 75.9100, name: 'ENV-005', type: 'HARDWARE' },
    ];

    const latLonToVector3 = (lat: number, lon: number, r: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    };

    const nodeVectors = nodeCoordinates.map((n) => latLonToVector3(n.lat, n.lon, radius));
    const nodeMeshes: THREE.Mesh[] = [];

    nodeVectors.forEach((pos, idx) => {
      // Pin dot
      const dotGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const isHw = idx === 4;
      const dotMat = new THREE.MeshBasicMaterial({
        color: isHw ? 0xff4405 : 0x06b6d4,
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      globeGroup.add(dot);
      nodeMeshes.push(dot);

      // Pulsing halo ring
      const ringGeo = new THREE.RingGeometry(0.32, 0.44, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isHw ? 0xff4405 : 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(ring);
    });

    // 5. Connecting LoRa Mesh Network Arcs between Node Pairs
    const arcCurves: THREE.CatmullRomCurve3[] = [];
    for (let i = 0; i < nodeVectors.length; i++) {
      for (let j = i + 1; j < nodeVectors.length; j++) {
        const v1 = nodeVectors[i];
        const v2 = nodeVectors[j];
        const mid = v1.clone().add(v2).multiplyScalar(0.5);
        // Push mid-point outward to form arc
        const midDist = mid.length();
        mid.normalize().multiplyScalar(radius * 1.25);

        const curve = new THREE.CatmullRomCurve3([v1, mid, v2]);
        arcCurves.push(curve);

        const points = curve.getPoints(36);
        const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
        const arcMat = new THREE.LineBasicMaterial({
          color: i === 4 || j === 4 ? 0xff4405 : 0x06b6d4,
          transparent: true,
          opacity: isDark ? 0.45 : 0.3,
          linewidth: 1.5,
        });
        const arcLine = new THREE.Line(arcGeo, arcMat);
        globeGroup.add(arcLine);
      }
    }

    // 6. Topographical River Basin Undulation Grid (Elevation Wave Plane)
    const planeGeo = new THREE.PlaneGeometry(60, 60, 48, 48);
    const planeMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0c1017 : 0xe2e8f0,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.22 : 0.28,
      roughness: 0.8,
    });
    const terrainPlane = new THREE.Mesh(planeGeo, planeMat);
    terrainPlane.rotation.x = -Math.PI / 2.3;
    terrainPlane.position.set(0, -9, 0);
    scene.add(terrainPlane);

    // 7. Floating Telemetry Atmospheric Particles
    const dustCount = 400;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 50;
      dustPositions[i + 1] = (Math.random() - 0.5) * 40;
      dustPositions[i + 2] = (Math.random() - 0.5) * 30;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: isDark ? 0xffffff : 0x94a3b8,
      size: 0.12,
      transparent: true,
      opacity: isDark ? 0.5 : 0.4,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // 8. Mouse Pointer Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 9. Responsive Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Rotate Globe smoothly
      globeGroup.rotation.y = elapsedTime * 0.12 + mouseX * 0.4;
      globeGroup.rotation.x = Math.sin(elapsedTime * 0.08) * 0.1 + mouseY * 0.2;
      innerIco.rotation.y = -elapsedTime * 0.06;

      // Undulate terrain wave geometry
      const posAttr = planeGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const u = posAttr.getX(i);
        const v = posAttr.getY(i);
        const z = Math.sin(u * 0.25 + elapsedTime * 1.2) * Math.cos(v * 0.25 + elapsedTime * 0.8) * 1.2;
        posAttr.setZ(i, z);
      }
      posAttr.needsUpdate = true;

      // Scroll reactive camera positioning
      const normalizedScroll = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
      camera.position.y = 5 - normalizedScroll * 6 - mouseY * 1.5;
      camera.position.z = 26 - normalizedScroll * 8;
      camera.position.x = mouseX * 2.5;
      camera.lookAt(0, 0.5 - normalizedScroll * 2, 0);

      // Pulse floating dust
      dustParticles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      innerIcoGeo.dispose();
      innerIcoMat.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-700"
      style={{ opacity: 0.95 }}
    />
  );
};
