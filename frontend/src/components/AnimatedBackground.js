import React, { useRef, useEffect } from 'react';

const ASL_LETTERS = 'ABCDEFGHIKLMNOPQRSTUVWXY'.split('');

// Simplified hand landmark constellation (21 points, normalized)
const HAND_SHAPE = [
  [0, 0],        // 0: wrist
  [-0.3, -0.2],  // 1: thumb_cmc
  [-0.5, -0.4],  // 2: thumb_mcp
  [-0.6, -0.6],  // 3: thumb_ip
  [-0.65, -0.8], // 4: thumb_tip
  [-0.15, -0.6], // 5: index_mcp
  [-0.15, -0.85],// 6: index_pip
  [-0.15, -1.0], // 7: index_dip
  [-0.15, -1.1], // 8: index_tip
  [0.0, -0.6],   // 9: middle_mcp
  [0.0, -0.88],  // 10: middle_pip
  [0.0, -1.05],  // 11: middle_dip
  [0.0, -1.15],  // 12: middle_tip
  [0.15, -0.58], // 13: ring_mcp
  [0.15, -0.82], // 14: ring_pip
  [0.15, -0.95], // 15: ring_dip
  [0.15, -1.05], // 16: ring_tip
  [0.3, -0.52],  // 17: pinky_mcp
  [0.3, -0.7],   // 18: pinky_pip
  [0.3, -0.82],  // 19: pinky_dip
  [0.3, -0.9],   // 20: pinky_tip
];

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];

function AnimatedBackground() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Colors
    const colors = [
      { r: 34, g: 211, b: 238 },  // cyan
      { r: 45, g: 212, b: 191 },  // teal
      { r: 251, g: 191, b: 36 },  // amber
      { r: 74, g: 222, b: 128 },  // green
    ];

    // Floating letters
    const letters = [];
    for (let i = 0; i < 18; i++) {
      const c = colors[i % colors.length];
      letters.push({
        char: ASL_LETTERS[Math.floor(Math.random() * ASL_LETTERS.length)],
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        size: 16 + Math.random() * 24,
        opacity: 0.08 + Math.random() * 0.1,
        color: c,
        rotation: Math.random() * Math.PI * 0.3 - Math.PI * 0.15,
        rotSpeed: (Math.random() - 0.5) * 0.0004,
      });
    }

    // Hand constellations
    const hands = [];
    for (let i = 0; i < 5; i++) {
      const c = colors[i % colors.length];
      hands.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        scale: 35 + Math.random() * 35,
        opacity: 0.1 + Math.random() * 0.08,
        color: c,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.001,
      });
    }

    // Small floating particles
    const particles = [];
    for (let i = 0; i < 40; i++) {
      const c = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: 1.2 + Math.random() * 2,
        opacity: 0.12 + Math.random() * 0.15,
        color: c,
      });
    }

    const drawHand = (hand) => {
      const { x, y, scale, opacity, color, rotation } = hand;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Draw connections
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.8})`;
      ctx.lineWidth = 1.2;
      for (const [a, b] of HAND_CONNECTIONS) {
        const pa = HAND_SHAPE[a];
        const pb = HAND_SHAPE[b];
        ctx.beginPath();
        ctx.moveTo(pa[0] * scale, pa[1] * scale);
        ctx.lineTo(pb[0] * scale, pb[1] * scale);
        ctx.stroke();
      }

      // Draw joints
      for (const point of HAND_SHAPE) {
        ctx.beginPath();
        ctx.arc(point[0] * scale, point[1] * scale, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 1.5})`;
        ctx.fill();
      }

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw and update particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      // Draw and update hand constellations
      for (const hand of hands) {
        drawHand(hand);
        hand.x += hand.vx;
        hand.y += hand.vy;
        hand.rotation += hand.rotSpeed;
        if (hand.x < -80) hand.x = w + 80;
        if (hand.x > w + 80) hand.x = -80;
        if (hand.y < -80) hand.y = h + 80;
        if (hand.y > h + 80) hand.y = -80;
      }

      // Draw and update letters
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const l of letters) {
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rotation);
        ctx.font = `700 ${l.size}px 'Orbitron', sans-serif`;
        ctx.fillStyle = `rgba(${l.color.r}, ${l.color.g}, ${l.color.b}, ${l.opacity})`;
        ctx.fillText(l.char, 0, 0);
        ctx.restore();

        l.x += l.vx;
        l.y += l.vy;
        l.rotation += l.rotSpeed;
        if (l.x < -30) l.x = w + 30;
        if (l.x > w + 30) l.x = -30;
        if (l.y < -30) l.y = h + 30;
        if (l.y > h + 30) l.y = -30;
      }

      // Draw connecting lines between nearby particles
      ctx.lineWidth = 0.7;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.1;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}

export default AnimatedBackground;
