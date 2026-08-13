import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Animated aurora particle field used as the home hero background.
// Pure canvas via Three.js, pause-friendly, lazy-loaded through the page bundle.
export default function AuroraField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.z = 12;

    const count = 900;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [new THREE.Color('#7c3aed'), new THREE.Color('#06b6d4'), new THREE.Color('#0ea5e9'), new THREE.Color('#a78bfa')];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const speeds = positions.slice().map((_, i) => ((i % 7) * 0.3 + 0.2) * (Math.random() > 0.5 ? 1 : -1));
    let raf = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const dt = clock.getDelta();
      points.rotation.y += dt * 0.04;
      points.rotation.x = Math.sin(clock.elapsedTime * 0.1) * 0.1;
      // gentle drift
      const pos = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length; i++) {
        pos[i] += speeds[i] * dt * 0.02;
        if (pos[i] > 15) pos[i] = -15;
        if (pos[i] < -15) pos[i] = 15;
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden />
  );
}