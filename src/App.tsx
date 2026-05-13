/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Terminal, 
  Cpu, 
  Layout, 
  Globe, 
  Award, 
  Download,
  ChevronDown,
  Menu,
  X,
  Code2,
  Database,
  BrainCircuit,
  Settings2,
  Sun,
  Moon
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useInView } from 'react-intersection-observer';
import { cn } from './lib/utils';

// --- Custom Noise Overlay ---
const Noise = () => (
  <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
);
const InteractiveOrb = ({ scrollPersist = 1 }: { scrollPersist?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [localScroll, setLocalScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how far the component is from the top of the viewport
      // Hero section rect.top starts at 0 and goes negative as we scroll
      // We want to track this progress
      setLocalScroll(rect.top);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let w = canvas.width = 600;
    let h = canvas.height = 600;
    const cx = w / 2;
    const cy = h / 2;
    const isMobile = window.innerWidth < 768;

    const particleCount = isMobile ? 350 : 600;
    const particles: any[] = [];
    let mouse = { x: -1000, y: -1000, active: false };
    let scatterMode = false;
    let scatterTimeout: ReturnType<typeof setTimeout>;

    // Initialize Fibonacci sphere
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;

      particles.push({
        nx: r * Math.cos(theta),
        ny: y,
        nz: r * Math.sin(theta),
        x: (Math.random() - 0.5) * w + cx, 
        y: (Math.random() - 0.5) * h + cy,
        vx: (Math.random() - 0.5) * 2, 
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 2 + 0.5,
        color: i % 2 === 0 ? '#FF4D00' : '#5E2BFF',
        phase: Math.random() * Math.PI * 2
      });
    }

    const rotateX = (p: any, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const y = p.ny * cos - p.nz * sin;
      const z = p.ny * sin + p.nz * cos;
      return { ...p, ny: y, nz: z };
    };

    const rotateY = (p: any, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = p.nx * cos + p.nz * sin;
      const z = -p.nx * sin + p.nz * cos;
      return { ...p, nx: x, nz: z };
    };

    let angle = 0;
    const render = () => {
      ctx.clearRect(0, 0, w, h);
      angle += 0.0015;
      
      // Breathing effect calculation
      const breathingAmount = Math.sin(Date.now() * 0.001) * 20;
      const baseRadius = (w * 0.35) + breathingAmount;

      particles.forEach((p) => {
        let rotP = rotateY(p, angle);
        rotP = rotateX(rotP, angle * 0.3);

        const scale = 500 / (500 + rotP.nz * baseRadius);
        const targetX = cx + rotP.nx * baseRadius * scale;
        const targetY = cy + rotP.ny * baseRadius * scale;

        const dx = targetX - p.x;
        const dy = targetY - p.y;
        
        const springK = scatterMode ? 0.001 : 0.025;
        p.vx += dx * springK;
        p.vy += dy * springK;

        if (mouse.active && !scatterMode) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const dist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (dist < 100) {
            const force = (100 - dist) / 100;
            p.vx += (mdx / dist) * force * 2;
            p.vy += (mdy / dist) * force * 2;
          }
        }

        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, scale * (0.8 + Math.sin(Date.now() * 0.002 + p.phase) * 0.2));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    
    const handleScatter = () => {
      if (scatterMode) return;
      scatterMode = true;
      particles.forEach(p => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 10 + Math.random() * 20;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
      });
      
      clearTimeout(scatterTimeout);
      scatterTimeout = setTimeout(() => {
        scatterMode = false;
      }, 1200);
    };

    const handleMouseLeave = () => { mouse.active = false; };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleScatter);
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleScatter();
    }, { passive: false });
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleScatter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(scatterTimeout);
    };
  }, []);

  // How much the element has scrolled relative to the viewport top
  const scrollOffset = -localScroll;

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-[600px] aspect-square group will-change-transform"
      style={{
        transform: `translateY(${Math.max(0, scrollOffset * 0.7 * scrollPersist)}px) scale(${Math.max(0.7, 1 - Math.max(0, scrollOffset) / 3000)})`,
        opacity: Math.max(0.3, 1 - Math.max(0, scrollOffset) / 2000)
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] font-mono tracking-widest text-white uppercase whitespace-nowrap">
        Tap to Scatter
      </div>
    </div>
  );
};

// --- Professional Robot Mascot ---
const ProfessionalMascot = () => (
  <motion.div 
    animate={{ y: [0, -15, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    className="relative"
  >
    <div className="w-64 h-64 bg-white dark:bg-gradient-to-br dark:from-violet-600/20 dark:to-indigo-600/5 rounded-[3rem] border border-black/5 dark:border-white/5 flex items-center justify-center relative overflow-hidden group shadow-xl dark:shadow-none">
      <Cpu size={120} className="text-slate-200 dark:text-violet-500/40 group-hover:text-orange-core group-hover:scale-110 transition-all duration-700" />
      <div className="absolute top-4 left-4 flex gap-1">
        <div className="w-2 h-2 rounded-full bg-orange-core animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">AMR_SYSTEM_v3</div>
      {/* Floating orbital rings */}
      <div className="absolute inset-0 border border-orange-core/5 rounded-full scale-150 animate-[spin_10s_linear_infinite]" />
    </div>
  </motion.div>
);


// --- Theme Toggle Component ---
const ThemeToggle = ({ theme, toggleTheme }: { theme: 'light' | 'dark', toggleTheme: () => void }) => (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        toggleTheme();
      }}
      type="button"
      className="relative w-14 h-8 rounded-full bg-slate-200 dark:bg-white/5 border border-black/5 dark:border-white/10 p-1 flex items-center transition-colors group cursor-pointer z-[100]"
      aria-label="Toggle theme"
    >
    <motion.div 
      animate={{ x: theme === 'dark' ? 24 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="w-6 h-6 rounded-full bg-white dark:bg-orange-core shadow-sm flex items-center justify-center"
    >
      {theme === 'dark' ? (
        <Moon size={14} className="text-white" />
      ) : (
        <Sun size={14} className="text-orange-500" />
      )}
    </motion.div>
  </button>
);

// --- Navbar Component ---
const Navbar = ({ theme, toggleTheme }: { theme: 'light' | 'dark', toggleTheme: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Works', href: '#projects' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 md:px-12",
      scrolled ? "bg-white/80 dark:bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 py-4 shadow-sm" : "bg-transparent py-8"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-full flex items-center justify-center steel-gradient border border-white/20 shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-slate-800 font-black text-sm text-center leading-none tracking-tighter">AMR</span>
          </div>
          <span className="text-lg tracking-[0.4em] font-black uppercase text-slate-800 dark:text-white/90 group-hover:tracking-[0.5em] transition-all duration-500">AMR</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-12">
          <div className="flex gap-8 text-[11px] uppercase tracking-[0.2em] font-medium text-slate-500 dark:text-white/50">
            {navLinks.map(link => (
              <a 
                key={link.name} 
                href={link.href}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-6 border-l border-black/5 dark:border-white/10 pl-8">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            
            <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-700 dark:text-white/80">Available</span>
            </div>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 lg:hidden">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button className="text-slate-800 dark:text-white" onClick={() => setIsOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 bg-white dark:bg-[#0A0A0B] z-[60] flex flex-col items-center justify-center gap-8 p-6"
          >
            <button className="absolute top-8 right-8 text-slate-900 dark:text-white" onClick={() => setIsOpen(false)}>
              <X size={32} />
            </button>
            {navLinks.map(link => (
              <a 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-4xl font-bold text-slate-900 dark:text-white font-display tracking-tight"
              >
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Sidebar Info for Hero ---
const HeroCard = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay: 0.5, duration: 0.8 }}
    className="relative group perspective-1000"
  >
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-[320px] shadow-2xl relative z-10 
      group-hover:rotate-x-1 group-hover:rotate-y-1 transition-transform duration-500">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center border border-violet-400/30 shadow-lg shadow-violet-500/20">
          <Terminal size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Mohammed Nadeem</h3>
          <p className="text-xs text-violet-400 font-mono">@amr_creative</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {['React', 'Python', 'ML', 'Django'].map(tag => (
            <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-medium text-slate-300 border border-white/5">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="pt-4 border-t border-white/5 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-glow shadow-emerald-500/50" />
          <span className="text-xs text-slate-400">Available for Freelance</span>
        </div>
      </div>
    </div>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-emerald-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
  </motion.div>
);

// --- Stats Section ---
const Stats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 mt-12 overflow-hidden rounded-2xl">
    {[
      { label: 'Experience', value: '04+ Years' },
      { label: 'Projects Shipped', value: '24 Complete' },
      { label: 'Performance Lift', value: '+40% Avg.', highlight: true }
    ].map((stat, i) => (
      <div key={i} className="flex flex-col justify-center px-8 py-8 bg-white dark:bg-[#0A0A0B] border-r last:border-r-0 border-black/5 dark:border-white/5">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/30 mb-1 font-mono">
          {stat.label}
        </span>
        <span className={cn(
          "text-2xl font-bold font-mono",
          stat.highlight ? "text-orange-core" : "text-slate-900 dark:text-white"
        )}>
          {stat.value}
        </span>
      </div>
    ))}
  </div>
);

// --- Contact Form ---
const ContactForm = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [honeypot, setHoneypot] = useState('');

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Security: Simple bot check
    if (honeypot) {
      console.log("Bot detected");
      setStatus('success'); // Fake success for bot
      return;
    }

    const form = e.currentTarget;
    
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS credentials missing. Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in your environment.");
      setStatus('error');
      return;
    }

    setStatus('sending');
    emailjs.sendForm(serviceId, templateId, form, publicKey)
    .then(() => {
      setStatus('success');
      form.reset();
    })
    .catch((err) => {
      console.error("EmailJS Error:", err);
      setStatus('error');
    });
  };

  return (
    <form className="space-y-6" onSubmit={sendEmail}>
      {/* Honeypot field for bot protection */}
      <input 
        type="text" 
        name="website" 
        style={{ display: 'none' }} 
        tabIndex={-1} 
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono ml-1">Full Name</label>
          <input 
            name="user_name"
            type="text" required 
            placeholder="John Doe"
            className="w-full bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-5 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-orange-core transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono ml-1">Email Address</label>
          <input 
            name="user_email"
            type="email" required 
            placeholder="john@example.com"
            className="w-full bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-5 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-orange-core transition-colors"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono ml-1">Message</label>
        <textarea 
          name="message"
          rows={5} required 
          placeholder="Tell me about your project..."
          className="w-full bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-5 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-orange-core transition-colors resize-none"
        />
      </div>
      <button 
        type="submit" 
        disabled={status === 'sending'}
        className={cn(
          "w-full md:w-auto px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-2xl transition-all shadow-xl disabled:opacity-50",
          status === 'success' && "bg-emerald-600 dark:bg-emerald-500 text-white"
        )}
      >
        {status === 'idle' ? 'Send Message →' : 
         status === 'sending' ? 'Sending...' : 
         status === 'success' ? 'Message Sent! ✓' : 'Error, try again ✗'}
      </button>
    </form>
  );
};

// --- Main Page ---
export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const { ref: skillRef, inView: skillInView } = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    
    // Immediate application to root
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Explicit application with transition support
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  const skills = [
    { category: 'Frontend', icon: <Layout />, items: ['React', 'TypeScript', 'Tailwind', 'Next.js'] },
    { category: 'Backend', icon: <Terminal />, items: ['Python', 'Node.js', 'Django', 'PostgreSQL'] },
    { category: 'Intelligence', icon: <BrainCircuit />, items: ['Scikit-Learn', 'Pandas', 'NumPy', 'TensorFlow'] },
    { category: 'Tools', icon: <Settings2 />, items: ['Git', 'Docker', 'AWS', 'Figma'] }
  ];

  return (
    <div className="bg-white dark:bg-[#0A0A0B] min-h-screen text-slate-800 dark:text-[#F5F5F7] selection:bg-orange-core/30 selection:text-white transition-colors duration-1000 overflow-x-hidden font-sans relative">
      <Noise />
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      {/* Hero Section */}
      <section id="hero" className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 md:px-12 pt-20 overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-orange-core rounded-full opacity-[0.08] blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-violet-core rounded-full opacity-[0.08] blur-[120px]" />
        </div>
        
        {/* The Main Interaction Orb (Background Layer) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl opacity-30 dark:opacity-50 z-0 pointer-events-auto">
          <InteractiveOrb />
        </div>

        <div className="max-w-5xl mx-auto w-full text-center relative z-10 space-y-16 pointer-events-none">
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-8xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.05] font-display"
            >
              Building <span className="font-serif italic text-orange-core">delightful</span> <br /> 
              digital experiences.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-500 dark:text-white/40 max-w-lg mx-auto leading-relaxed"
            >
              Full-stack architect & ML enthusiast dedicated to performance, 
              story-driven interfaces, and high-impact software solutions.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center gap-12"
          >
            <div className="flex flex-wrap justify-center gap-4 pointer-events-auto">
              <a href="#projects" className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-2xl hover:scale-105 transition-transform flex items-center gap-2">
                Explore <ChevronDown size={16} />
              </a>
             <a href="https://github.com/mohammed-nadeem8341-cmd" target="_blank" rel="noopener noreferrer" className="px-10 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                GitHub Repo
              </a>
            </div>
            
            <div className="pointer-events-auto w-full">
              <Stats />
            </div>
          </motion.div>
        </div>

        {/* Floating UI Elements */}
        <div className="absolute left-12 bottom-12 hidden xl:flex flex-col gap-1 text-[10px] uppercase tracking-widest font-bold">
          <div className="flex items-center gap-2">
            <span className="text-white/20">Location:</span>
            <span>Hyderabad, India</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/20">Role:</span>
            <span>Lead Fullstack</span>
          </div>
        </div>

        <div className="absolute right-12 bottom-12 hidden xl:block text-right">
          <span className="text-[10px] uppercase tracking-widest font-bold text-white/20 block mb-2 underline underline-offset-4">Featured Stack</span>
          <div className="flex gap-3">
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[9px] font-bold">NEXT.JS</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[9px] font-bold">PYTORCH</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[9px] font-bold">DJANGO</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 md:px-12 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative flex justify-center lg:justify-start">
            <ProfessionalMascot />
          </div>

          <div className="space-y-8">
            <div className="text-orange-core font-mono text-sm tracking-widest uppercase">01 // The Story</div>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">Crafting with <br/> purpose and logic.</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
              My journey began in Hyderabad's tech ecosystem during my BCA. I quickly realized 
              that code isn't just about syntax—it's about empathy. I build systems that solve 
              friction, whether it's through a Python-driven backend or a responsive React frontend.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold mb-2">Technical Philosophy</h4>
                <p className="text-sm text-slate-400 dark:text-slate-500">I prioritize performance and accessibility. Every extra 100ms of latency is a lost user.</p>
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold mb-2">Collaboration</h4>
                <p className="text-sm text-slate-400 dark:text-slate-500">I thrive in fast-paced environments where code reviews and knowledge sharing are standard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" ref={skillRef} className="py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 space-y-4">
            <div className="text-violet-core font-mono text-sm tracking-widest uppercase">02 // Stack</div>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">Technical Toolkit</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skills.map((skill, index) => (
              <motion.div 
                key={skill.category}
                initial={{ opacity: 0, y: 20 }}
                animate={skillInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="group p-8 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[2.5rem] hover:shadow-xl dark:hover:bg-white/10 transition-all"
              >
                <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-slate-600 dark:text-slate-300 group-hover:text-orange-core transition-all border border-black/5 dark:border-white/5">
                  {skill.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-display">{skill.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skill.items.map(item => (
                    <span key={item} className="px-3 py-1 bg-slate-50 dark:bg-slate-900/50 rounded-full text-[11px] font-medium text-slate-500 dark:text-slate-400 border border-black/5 dark:border-white/5">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section - Real Case Studies */}
      <section id="projects" className="py-24 px-6 md:px-12 bg-white dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="text-orange-core font-mono text-sm tracking-widest uppercase">03 // Featured Works</div>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">Selected Projects</h2>
            </div>
            <p className="text-slate-500 max-w-sm">From ML-driven APIs to design-heavy interfaces, here is a collection of my favorite builds.</p>
          </div>

          <div className="grid grid-cols-1 gap-24">
            {/* Project Card (Repeated Pattern) */}
            {[
              {
                title: 'SentimentAI Dashboard',
                desc: 'A full-stack sentiment analysis platform built with Python/Flask and React. Utilizes a custom Natural Language Processing model to categorize customer feedback in real-time.',
                tags: ['Python', 'React', 'ElasticSearch'],
                image: '🤖'
              },
              {
                title: 'NexGen E-Commerce',
                desc: 'Highly optimized fashion store featuring headless CMS integration, server-side rendering for SEO, and a custom stripe payment gateway flow.',
                tags: ['Next.js', 'PostgreSQL', 'Stripe'],
                image: '👜'
              }
            ].map((project, i) => (
              <div key={i} className={cn("grid grid-cols-1 lg:grid-cols-2 gap-16 items-center", i % 2 !== 0 && "lg:flex-row-reverse")}>
                <div className={cn("relative group overflow-hidden rounded-[3rem] aspect-video bg-white dark:bg-slate-800 flex items-center justify-center text-8xl border border-black/5 dark:border-white/5", i % 2 !== 0 && "lg:order-2")}>
                  {project.image}
                  <div className="absolute inset-0 bg-orange-core/0 group-hover:bg-orange-core/10 transition-all duration-700" />
                  <div className="absolute bottom-8 right-8 scale-0 group-hover:scale-100 transition-transform duration-500">
                     <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-950 shadow-xl">
                        <ExternalLink size={24} />
                     </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-4xl font-bold text-slate-900 dark:text-white font-display uppercase tracking-tight">{project.title}</h3>
                  <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">{project.desc}</p>
                  <div className="flex flex-wrap gap-3">
                    {project.tags.map(tag => (
                      <span key={tag} className="px-4 py-2 bg-slate-900 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-xs font-mono text-white dark:text-orange-core">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="pt-4 flex gap-6">
                    <a href="#" className="flex items-center gap-2 group text-slate-900 dark:text-white font-bold transition-all hover:text-orange-core">
                      View Case Study <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-12">
             <div className="space-y-4">
              <div className="text-violet-core font-mono text-sm tracking-widest uppercase">04 // Experience</div>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">The Career Path</h2>
            </div>
            
            <div className="space-y-4 pr-12">
              <p className="text-slate-500">I've worked on diverse projects ranging from startup MVPs to long-term enterprise maintenance.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20">
                <Layout size={14} /> Available for roles starting July 2026
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {[
              { role: 'Web Development Intern', company: 'TechFlow Solutions', period: 'June 2024 - Present', desc: 'Leading frontend refactoring of customer dashboard. Improved Lighthouse scores by 25 points.' },
              { role: 'Freelance Developer', company: 'Global Clients', period: '2022 - 2024', desc: 'Built and deployed 5+ high-conversion landing pages and custom internal tools using the React stack.' }
            ].map((exp, i) => (
              <div key={i} className="p-8 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[2rem] hover:border-orange-core/50 transition-colors shadow-sm dark:shadow-none">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{exp.role}</h3>
                    <p className="text-sm text-orange-core font-medium">{exp.company}</p>
                  </div>
                  <span className="text-[10px] uppercase font-mono text-slate-400">{exp.period}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="py-32 px-6 md:px-12 bg-slate-100/50 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 space-y-4 text-center md:text-left">
            <div className="text-orange-core font-mono text-sm tracking-widest uppercase">05 // Milestones</div>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white font-display uppercase tracking-tight">Wins &amp; Recognition</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Award />, title: 'Hackathon Winner', desc: '1st place at College Tech Fest — built a real-time disaster response app in 24 hours.' },
              { icon: <Globe />, title: 'Grand Hackathon Finalist', desc: 'Top 10 among 200+ teams by architecting a real-time supply chain optimizer.' },
              { icon: <Cpu />, title: 'AWS Cloud Certified', desc: 'Validated expertise in cloud-native architecture via AWS Practitioner certification.' }
            ].map((item, i) => (
              <div key={i} className="p-10 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[3rem] hover:shadow-xl dark:hover:bg-white/10 transition-all text-center group">
                 <div className="w-20 h-20 bg-orange-core/10 rounded-full flex items-center justify-center mx-auto mb-8 text-orange-core group-hover:scale-110 transition-transform">
                    {item.icon}
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{item.title}</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.05] dark:opacity-10 pointer-events-auto">
           <InteractiveOrb />
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12 relative z-10 pointer-events-none">
          <div className="space-y-6">
            <motion.div 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              className="w-20 h-20 bg-orange-core rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-orange-core/30"
            >
              <Mail className="text-white" size={32} />
            </motion.div>
            <h2 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white font-display tracking-tight uppercase">Let's Connect.</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
              Currently open to new roles and exciting freelance opportunities. 
              My inbox is always open.
            </p>
          </div>

          <div className="w-full max-w-3xl bg-white dark:bg-slate-900/50 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] border border-black/5 dark:border-white/10 shadow-2xl text-left relative z-10 pointer-events-auto">
            <ContactForm />
          </div>

          <div className="flex flex-wrap justify-center gap-10 pt-10 pointer-events-auto">
            {[
              { icon: <Github />, label: 'GitHub', href: 'https://github.com/mohammed-nadeem8341-cmd' },
              { icon: <Linkedin />, label: 'LinkedIn', href: 'https://www.linkedin.com/in/mohammed-nadeem-03/' },
              { icon: <Mail />, label: 'Email', href: 'mailto:manadeem4951@gmail.com' }
            ].map(social => (
              <a 
                key={social.label} 
                href={social.href} 
                target={social.label !== 'Email' ? "_blank" : undefined}
                rel={social.label !== 'Email' ? "noopener noreferrer" : undefined}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-14 h-14 rounded-full bg-white dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-orange-core group-hover:text-white transition-all border border-black/5 dark:border-white/5 shadow-sm dark:shadow-none">
                  {social.icon}
                </div>
                <span className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-600 group-hover:text-orange-core font-mono transition-colors">
                  {social.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-6 md:px-12 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0B] relative overflow-hidden transition-colors duration-500">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-16 text-center">
           <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="text-7xl md:text-9xl font-black tracking-tighter text-slate-900 dark:text-white leading-none font-display uppercase"
           >
             LET'S EVOLVE <br />
             <span className="font-serif italic text-orange-core">BEYOND.</span>
           </motion.h2>

           <div className="flex gap-4">
             <a href="https://github.com/mohammed-nadeem8341-cmd" target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                <Github size={24} />
             </a>
             <a href="https://www.linkedin.com/in/mohd-nadeem-19611b249" target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                <Linkedin size={24} />
             </a>
             <a href="mailto:manadeem4951@gmail.com" className="w-16 h-16 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                <Mail size={24} />
             </a>
           </div>

           <div className="w-full h-px bg-black/5 dark:bg-white/5" />
           
           <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 dark:text-white/40 mb-1">DESIGN BY NADEEM</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest font-mono">NOT A HUMAN [SYSTEM_AI]</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 dark:text-white/40 mb-1">Location</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Hyderabad, IN &bull; 2026</p>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
