import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resize
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    // Node particle system
    const nodes: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
    const numNodes = Math.floor((window.innerWidth * window.innerHeight) / 25000);

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 0.5,
      });
    }

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      }

      // Draw connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const alpha = 1 - dist / 150;
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.15})`; // Cyan connections
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        ctx.fillStyle = `rgba(168, 85, 247, 0.4)`; // Purple dots
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add subtle glow to slightly larger nodes
        if (node.radius > 1.2) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#00F0FF';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', setSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-background">
      {/* Generated image overlay with multiply/screen for subtle texture */}
      <div 
        className="absolute inset-0 opacity-15 mix-blend-screen bg-cover bg-center"
        style={{ backgroundImage: 'url(/src/assets/cyber-dashboard-bg.png)' }}
      />
      
      {/* CSS Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 mix-blend-overlay" />
      
      {/* Scanning radar line from CSS */}
      <div className="absolute inset-x-0 inset-y-0 opacity-30 cyber-border-scan pointer-events-none" />

      {/* Parallax Canvas */}
      <motion.div style={{ y: yParallax, height: '130%', width: '100%', position: 'absolute', top: '-15%', left: 0 }}>
        <canvas ref={canvasRef} className="w-full h-full opacity-60" />
      </motion.div>
      
      {/* Vignette/Gradients to keep focus center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,10,24,0.95)_100%)]" />
      
      {/* Subtle Purple/Cyan glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/15 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/15 blur-[120px]" />
    </div>
  );
}
