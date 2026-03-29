import { type ReactNode, useEffect, useRef, useState } from "react";
import { Navbar } from "./Header";
import { Footer } from "./Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Interactive particle component
function InteractiveParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const particleCount = 25;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 2,
      opacity: Math.random() * 0.5 + 0.3,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      particles.forEach((particle, i) => {
        // Mouse interaction - particles avoid mouse
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          const force = (150 - dist) / 150;
          particle.vx -= (dx / dist) * force * 0.5;
          particle.vy -= (dy / dist) * force * 0.5;
        }

        // Apply velocity with damping
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
        ctx.fill();

        // Draw connections to nearby particles
        particles.slice(i + 1).forEach((other) => {
          const dx2 = particle.x - other.x;
          const dy2 = particle.y - other.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          
          if (dist2 < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 * (1 - dist2 / 120)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Draw connection to mouse
        if (dist < 200) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 * (1 - dist / 200)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mouse tracking for interactive glow
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Parallax background effect
    gsap.to(".bg-gradient-layer", {
      yPercent: 5,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
      },
    });

    // Animate sections on scroll
    const sections = gsap.utils.toArray<HTMLElement>(".animate-on-scroll");
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes gridMove {
          0% {
            transform: rotateX(60deg) translateY(-20%) translateY(0);
          }
          100% {
            transform: rotateX(60deg) translateY(-20%) translateY(60px);
          }
        }
      `}</style>
      <div ref={containerRef} className="min-h-screen flex flex-col relative overflow-x-hidden bg-[#faf9f7]">
      {/* Interactive particle network */}
      <InteractiveParticles />
      
      {/* Interactive animated gradient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#faf9f7]" />
        
        {/* 3D Perspective Grid */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d',
          }}
        >
          <div 
            className="absolute w-[300%] h-[120%] -left-full top-0"
            style={{
              transform: 'rotateX(60deg) translateZ(-50px) translateY(-30%)',
              backgroundImage: `
                linear-gradient(rgba(30, 58, 95, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(30, 58, 95, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              animation: 'gridMove 20s linear infinite',
            }}
          />
        </div>
        
        {/* Bottom fade overlay to hide grid - stronger coverage */}
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-[#faf9f7] via-[#faf9f7] via-60% to-transparent pointer-events-none" />

        {/* Animated orbs - warm professional tones */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#c9a962]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#1e3a5f]/8 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-[#b8954f]/10 rounded-full blur-[60px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
        
        {/* Interactive mouse-following glow - warm gold */}
        <div 
          className="mouse-glow absolute w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-transform duration-300 ease-out"
          style={{ 
            background: 'rgba(201, 169, 98, 0.12)',
            transform: 'translate(-50%, -50%)',
            left: 'var(--mouse-x, 50%)',
            top: 'var(--mouse-y, 50%)',
          }}
        />
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main ref={mainRef} className="flex-1 pt-24 pb-32">{children}</main>
        <Footer />
      </div>
    </div>
    </>
  );
}
