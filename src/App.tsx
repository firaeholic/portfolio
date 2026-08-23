import { useState, useEffect, useRef } from 'react'
import './App.css'
import ProjectSlideshow from './components/ProjectSlideshow'
import profileImage from './assets/prof.jpg'

// Animated Background Component – canvas constellation (scroll-immune)
function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    type Particle = { x: number; y: number; vx: number; vy: number; r: number }
    const COUNT = 90
    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.4,
      vy: (Math.random() - 0.5) * 1.4,
      r: Math.random() * 2.5 + 0.8,
    }))

    const MAX_DIST = 200

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Move & wrap
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      }

      // Draw edges
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < MAX_DIST) {
            const alpha = (1 - d / MAX_DIST) * 0.18
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(56,189,248,${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(56,189,248,0.55)'
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}


// Scroll Progress Indicator
function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-800/50 z-50">
      <div
        className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}

interface Project {
  id: string;
  name: string;
  description: string;
  extra: string;
}

interface ProjectCarouselProps {
  projects: Project[];
  onProjectSelect: (projectId: string) => void;
}

function ProjectCarousel({ projects, onProjectSelect }: ProjectCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);

  // Auto-scroll functionality
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isHovered || isDragging) return;

    const scroll = () => {
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += 0.5;
      }
      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovered, isDragging]);

  // Mouse drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  // Touch drag functionality for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={containerRef}
        className={`flex gap-6 overflow-x-auto scrollbar-hide pb-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Duplicate projects for seamless loop */}
        {[...projects, ...projects].map((project, index) => (
          <div
            key={`${project.id}-${index}`}
            onClick={() => !isDragging && onProjectSelect(project.id)}
            className="group relative flex-shrink-0 w-80 overflow-hidden rounded-lg bg-gray-800/50 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gray-800/70 cursor-pointer select-none"
          >
            <div className="aspect-video w-full rounded-lg bg-gray-700 overflow-hidden flex items-center justify-center">
              <img
                src={`/projects/${project.id}/${project.description}.png`}
                alt={`${project.name} - ${project.description}`}
                className="w-full h-full object-contain bg-gray-800 pointer-events-none"
                draggable={false}
              />
            </div>
            <h3 className="mt-4 text-xl font-semibold">{project.name}</h3>
            <p className="text-gray-400">{project.extra}</p>
          </div>
        ))}
      </div>

      {/* Gradient overlays for visual effect */}
      <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent pointer-events-none z-10"></div>
      <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-gray-900 via-gray-900/80 to-transparent pointer-events-none z-10"></div>
    </div>
  );
}

function App() {
  const projects = [
    { id: 'GOJO', name: 'GOJO', description: 'pending_properties', extra: "Booking and Accomodation System" },
    { id: 'Movie Chief', name: 'Movie Chief', description: 'Home Page', extra: "Movie and TV Shows Trailers and Information Site" },
    { id: 'E-Commerce', name: 'E-commerce', description: 'Landing Page', extra: "Ecommerce Solution for Wholesalers and Retailers" },
    { id: 'Notes', name: 'Notes', description: 'home_page', extra: "Note Taking Application" },
    { id: 'Poker', name: 'Poker', description: 'starting screen', extra: "Poker Game (Texas Hold'em)" },
    { id: 'Calorie Tracker', name: 'Calorie Tracker', description: 'Added Items', extra: "Calorie Tracking Application (AI Integrated)" },
    { id: 'Web Scraper', name: 'Web Scraper', description: 'dashboard', extra: "Web Scraping Application (AI Integrated)" },
    { id: 'Email Filter TG Bot', name: 'Email Filter TG Bot', description: 'start', extra: "Telegram Bot for Email Filtering" },
    { id: 'StoreSphere', name: 'StoreSphere', description: 'landing', extra: "Multi-vendor E-commerce Platform" },
    { id: 'LegalLens', name: 'LegalLens', description: 'home', extra: "Legal Document Analysis Platform (AI Powered)" },
    { id: 'MuseMap AI', name: 'MuseMap AI', description: 'home', extra: "AI-Powered Music and Lyrics Generation Platform" }
  ];

  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState<number[]>([0, 1, 2, 3]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0')
          if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
            setVisibleSections((prev) => {
              if (!prev.includes(index)) {
                return [...prev, index]
              }
              return prev
            })
          } else if (!entry.isIntersecting || entry.intersectionRatio < 0.05) {
            setVisibleSections((prev) => prev.filter(i => i !== index))
          }
        })
      },
      {
        threshold: [0, 0.05, 0.1, 0.5],
        rootMargin: '50px 0px -50px 0px'
      }
    )

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      document.querySelectorAll('[data-index]').forEach((el) => observer.observe(el))
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [])

  const skills = {
    frontend: ['React.js', 'Vue.js', 'Angular.js', 'Next.js', 'Vite.js', "Tailwind CSS"],
    backend: ['Node.js', '.NET', 'GoLang', 'Python', 'Docker', 'Kubernetes'],
    mobile: ['Flutter', 'Cypress', 'Storybook'],
    architecture: ['Clean Architecture', 'Model-View-Controller (MVC)'],
    databases: ['MySQL', 'PostgreSQL', 'MongoDB'],
    versionControlOtherTools: ['Git', 'Figma']
  }

  const experiences = [
    {
      title: 'Full Stack Developer',
      company: 'AppDiv System Development',
      period: 'May, 2022 - July, 2022',
      description: 'Internship',
      skills: ['Angular', '.NET', 'MySQL', 'Clean Architecture']
    },
    {
      title: 'Full Stack Developer',
      company: 'AppDiv System Development',
      period: 'September, 2022 - February, 2023',
      description: 'Remote Part-time. Worked on Inventory Management System and Time Tracking System.',
      skills: ['Angular', '.NET', 'MySQL', 'Clean Architecture']
    },
    {
      title: 'Backend Developer',
      company: 'Bithio ICT Systems',
      period: 'March, 2023 - July, 2023',
      description: 'Developed a Real-time Collaborative System for a client.',
      skills: ['Node.js', 'PostgreSQL']
    },
    {
      title: 'Full Stack Developer',
      company: 'TapToSign',
      period: 'November, 2024 - July, 2025',
      description: 'US based Car Dealeship website. Worked on creating new features, optimizing and fixing bugs.',
      skills: ['Preact', 'GoLang', 'MongoDB']
    },
    {
      title: 'AI Engineer',
      company: 'AfterQuery',
      period: 'November, 2025 - Present',
      description: 'AI Evaluation & coding benchmarks. Work on multiple projects, given a private codebase, author tasks from it and evaluate whether they are challenging enough to train frontier AI models.',
      skills: ['AI Evaluation', 'Coding Benchmarks', 'Python', 'LLMs']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white relative overflow-x-hidden">
      <AnimatedBackground />
      <ScrollProgress />
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center p-8 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-sky-400/50 shadow-lg shadow-sky-400/20 group-hover:border-cyan-400/70 transition-all duration-500 group-hover:scale-110">
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-sky-300 to-cyan-400 animate-text hover:scale-105 transition-transform duration-300">
              Franol Fekadu
            </h1>
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-semibold text-sky-300 animate-fade-in-up">Full-Stack Developer</h2>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto animate-fade-in leading-relaxed">
            Hi there, I'm Franol. I'm a Computer Science graduate from Addis Ababa University.
            I've been coding since before I even got into college—started out with vanilla JavaScript
            and eventually moved into frameworks like Angular.js, React.js, and Node.js.
            Over the past 5+ years, I've worked on full-stack web projects using tools like React,
            Next.js, Django, C#, and more. I enjoy building scalable web apps, tweaking algorithms
            for performance, and managing databases efficiently.
            <br></br>
            In my free time, I enjoy reading books and working out.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <a href="#projects" className="group px-8 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full font-semibold hover:from-sky-400 hover:to-cyan-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-sky-500/25">
              <span className="flex items-center gap-2">
                View My Work
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
            <a href="#experience" className="px-8 py-3 border-2 border-sky-400/50 rounded-full font-semibold hover:bg-sky-400/10 transition-all duration-300 transform hover:scale-105">
              My Experience
            </a>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-1/4 left-10 w-4 h-4 bg-sky-400/30 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-16 w-3 h-3 bg-cyan-400/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-sky-300/30 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Projects Section */}
      <section className="py-20 px-1 relative" id="projects">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent"></div>
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-cyan-400">Featured Projects</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">A showcase of my recent work spanning web applications, mobile apps, and full-stack solutions</p>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-cyan-400 mx-auto mt-4 rounded-full"></div>
          </div>
          <ProjectCarousel projects={projects} onProjectSelect={setSelectedProject} />
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 px-8 bg-black/20 relative" id="skills">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-900/10 via-cyan-900/10 to-sky-900/10"></div>
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-cyan-400">Technical Skills</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Technologies and tools I use to bring ideas to life</p>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-cyan-400 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="group bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-sky-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-sky-400 rounded-full mr-3 animate-pulse"></div>
                <h3 className="text-xl font-semibold text-sky-300">Frontend Frameworks</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.frontend.map((skill, index) => (
                  <span key={skill} className="px-3 py-1 text-sm rounded-full bg-sky-400/20 border border-sky-400/30 hover:bg-sky-400/30 hover:border-sky-300 transition-all duration-300 hover:scale-110 cursor-default"
                    style={{ animationDelay: `${index * 0.1}s` }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="group bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
                <h3 className="text-xl font-semibold text-cyan-300">Backend &amp; DevOps</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.backend.map((skill, index) => (
                  <span key={skill} className="px-3 py-1 text-sm rounded-full bg-cyan-400/20 border border-cyan-400/30 hover:bg-cyan-400/30 hover:border-cyan-300 transition-all duration-300 hover:scale-110 cursor-default"
                    style={{ animationDelay: `${index * 0.1}s` }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="group bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <h3 className="text-xl font-semibold text-green-400">Mobile &amp; Testing</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.mobile.map((skill, index) => (
                  <span key={skill} className="px-3 py-1 text-sm rounded-full bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 hover:border-green-400 transition-all duration-300 hover:scale-110 cursor-default"
                    style={{ animationDelay: `${index * 0.1}s` }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="group bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-white/30 transition-all duration-300 hover:transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-white/70 rounded-full mr-3 animate-pulse"></div>
                <h3 className="text-xl font-semibold text-white/80">Architecture</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.architecture.map((skill, index) => (
                  <span key={skill} className="px-3 py-1 text-sm rounded-full bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110 cursor-default"
                    style={{ animationDelay: `${index * 0.1}s` }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="group bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                <h3 className="text-xl font-semibold text-yellow-400">Databases</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.databases.map((skill, index) => (
                  <span key={skill} className="px-3 py-1 text-sm rounded-full bg-yellow-500/20 border border-yellow-500/30 hover:bg-yellow-500/30 hover:border-yellow-400 transition-all duration-300 hover:scale-110 cursor-default"
                    style={{ animationDelay: `${index * 0.1}s` }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="group bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-sky-300/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-sky-300 rounded-full mr-3 animate-pulse"></div>
                <h3 className="text-xl font-semibold text-sky-200">Tools &amp; Others</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.versionControlOtherTools.map((skill, index) => (
                  <span key={skill} className="px-3 py-1 text-sm rounded-full bg-sky-300/20 border border-sky-300/30 hover:bg-sky-300/30 hover:border-sky-200 transition-all duration-300 hover:scale-110 cursor-default"
                    style={{ animationDelay: `${index * 0.1}s` }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="py-20 px-8 relative" id="experience">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-900/5 to-transparent"></div>
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-cyan-400">Professional Journey</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">My career progression and key milestones in software development</p>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-cyan-400 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="max-w-4xl mx-auto relative pb-20">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-sky-400 via-cyan-400 to-sky-300 shadow-lg shadow-sky-400/20"></div>

            {experiences.map((experience, index) => (
              <div
                key={index}
                data-index={index}
                className={`relative mb-12 ${index % 2 === 0 ? 'pr-8 lg:ml-auto lg:pl-32 lg:pr-0 lg:w-1/2' : 'pl-8 lg:mr-auto lg:pl-32 lg:pl-0 lg:w-1/2'} transition-all duration-700 ${visibleSections.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              >
                <div className="absolute top-0 w-6 h-6 rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-300 hover:scale-125 hover:shadow-lg hover:shadow-sky-400/50 border-4 border-gray-900 z-10"
                  style={{ [index % 2 === 0 ? 'left' : 'right']: '-12px' }}>
                  <div className="absolute inset-1 rounded-full bg-gradient-to-r from-sky-300 to-cyan-300 animate-pulse"></div>
                </div>

                <div className="group bg-gray-800/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-sky-400/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-sky-400/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-400/5 to-cyan-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-sky-300 group-hover:text-sky-200 transition-colors">{experience.title}</h3>
                        <h4 className="text-lg text-cyan-300 font-medium">{experience.company}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">{experience.period}</p>
                      </div>
                    </div>

                    <p className="text-gray-300 leading-relaxed mb-4">{experience.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {experience.skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className="text-sm px-3 py-1 rounded-full bg-gradient-to-r from-sky-400/20 to-cyan-400/20 border border-sky-400/30 hover:border-cyan-300/50 transition-all duration-300 hover:scale-110">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Timeline End Icon */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 mt-16">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 flex items-center justify-center animate-pulse shadow-lg shadow-sky-400/30">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-8 bg-gradient-to-t from-black/50 to-transparent relative">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-900/5 via-cyan-900/5 to-sky-900/5"></div>
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-8 relative z-10">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-cyan-400">Let's Connect</h3>
            <p className="text-gray-400">Feel free to reach out for collaborations or just a friendly hello</p>
          </div>

          <div className="flex space-x-8">
            <a href="https://linkedin.com/in/franol-fekadu-583882262/" className="group p-3 rounded-full bg-gray-800/50 border border-gray-700/50 hover:border-sky-400/50 text-gray-400 hover:text-sky-400 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-sky-400/20">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a href="https://github.com/firaeholic" className="group p-3 rounded-full bg-gray-800/50 border border-gray-700/50 hover:border-cyan-400/50 text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-400/20">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a href="https://www.upwork.com/freelancers/~01613c8cda824e9c15" className="group p-3 rounded-full bg-gray-800/50 border border-gray-700/50 hover:border-green-500/50 text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/20">
              <span className="sr-only">Upwork</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892h-2.74v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546v-7.112h-2.734v7.112c0 2.917 2.374 5.292 5.291 5.292 2.918 0 5.293-2.375 5.293-5.292v-1.192c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z" />
              </svg>
            </a>
            <a href="mailto:franolfekadublas@gmail.com" className="group p-3 rounded-full bg-gray-800/50 border border-gray-700/50 hover:border-sky-300/50 text-gray-400 hover:text-sky-300 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-sky-300/20">
              <span className="sr-only">Email</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </a>
          </div>

          <div className="text-center space-y-2">
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent"></div>
            <p className="text-gray-500 text-sm">Designed by Franol Fekadu</p>
          </div>
        </div>
      </footer>

      {/* Project Slideshow */}
      {selectedProject && (
        <ProjectSlideshow
          projectId={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  )
}

export default App
