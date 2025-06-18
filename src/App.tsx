import { useState, useEffect, useRef } from 'react'
import './App.css'
import ProjectSlideshow from './components/ProjectSlideshow'
import profileImage from './assets/prof.jpg'

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
  const animationRef = useRef<number>();

  // Auto-scroll functionality
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isHovered || isDragging) return;

    const scroll = () => {
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += 0.5; // Slow auto-scroll speed
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
    const walk = (x - startX) * 2; // Scroll speed multiplier
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
      <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-gray-900 via-purple-900 to-transparent pointer-events-none z-10"></div>
      <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-gray-900 via-purple-900 to-transparent pointer-events-none z-10"></div>
    </div>
  );
}

function App() {
  const projects = [
    { id: 'GOJO', name: 'GOJO', description: 'pending_properties', extra: "Booking and Accomodation System" },
    { id: 'Movie Chief', name: 'Movie Chief', description: 'Home Page', extra: "Movie and TV Shows Trailers and Information Site" },
    { id: 'E-Commerce', name: 'E-commerce', description: 'Landing Page', extra: "E-commerce Site" },
    { id: 'Notes', name: 'Notes', description: 'home_page', extra: "Note Taking Application" },
    { id: 'Poker', name: 'Poker', description: 'starting screen', extra: "Poker Game (Texas Hold'em)" },
    { id: 'Calorie Tracker', name: 'Calorie Tracker', description: 'Added Items', extra: "Calorie Tracking Application (AI Integrated)" },
    { id: 'Web Scraper', name: 'Web Scraper', description: 'dashboard', extra: "Web Scraping Application (AI Integrated)" }
  ];

  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState<number[]>([0, 1, 2, 3]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0')
          if (entry.isIntersecting) {
            setVisibleSections((prev) => [...new Set([...prev, index])])
          } else {
            setVisibleSections((prev) => prev.filter(i => i !== index))
          }
        })
      },
      { threshold: 0.3 }
    )

    document.querySelectorAll('[data-index]').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
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
      period: 'June, 2021 - August, 2021',
      description: 'Internship',
      skills: ['Angular', '.NET', 'MySQL', 'Clean Architecture']
    },
    {
      title: 'Full Stack Developer',
      company: 'AppDiv System Development',
      period: 'August, 2021 - February, 2022',
      description: 'Remote Part-time. Worked on Inventory Management System and Time Tracking System.',
      skills: ['Angular', '.NET', 'MySQL', 'Clean Architecture']
    },
    {
      title: 'Backend Developer',
      company: 'Bithio ICT Systems',
      period: 'May, 2023 - September, 2023',
      description: 'Developed a Real-time Collaborative System for a client.',
      skills: ['Node.js', 'PostgreSQL']
    },
    {
      title: 'Full Stack Developer',
      company: 'TapToSign',
      period: 'September, 2024 - May, 2025',
      description: 'US based Car Dealeship website. Worked on creating new features, optimizing and fixing bugs.',
      skills: ['Preact', 'GoLang', 'MongoDB']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/50 shadow-lg shadow-blue-500/20">
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 animate-text">
            Franol Fekadu
          </h1>
          <h2 className="text-2xl font-semibold text-blue-300">Full-Stack Developer</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto animate-fade-in">
            Hi there, I'm Franol. I'm a Computer Science graduate from Addis Ababa University. 
            I've been coding since before I even got into college—started out with vanilla JavaScript 
            and eventually moved into frameworks like Angular.js, React.js, and Node.js. 
            Over the past 5+ years, I've worked on full-stack web projects using tools like React, 
            Next.js, Django, C#, and more. I enjoy building scalable web apps, tweaking algorithms 
            for performance, and managing databases efficiently.
            <br></br>
            In my free time, I enjoy reading books and working out.
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 px-8" id="projects">
        <h2 className="text-4xl font-bold text-center mb-12">Projects</h2>
        <ProjectCarousel projects={projects} onProjectSelect={setSelectedProject} />
      </section>

      {/* Skills Section */}
      <section className="py-20 px-8 bg-black/20" id="skills">
        <h2 className="text-4xl font-bold text-center mb-12">Skills</h2>
        <div className="max-w-4xl mx-auto grid gap-8 place-items-center">
          <div className="w-full space-y-6">
            <h3 className="text-2xl font-semibold mb-4 text-center">Frontend Frameworks</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {skills.frontend.map((skill) => (
                <span key={skill} className="px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/50 hover:bg-blue-500/30 transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="w-full space-y-6">
            <h3 className="text-2xl font-semibold mb-4 text-center">Backend & DevOps</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {skills.backend.map((skill) => (
                <span key={skill} className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30 transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="w-full space-y-6">
            <h3 className="text-2xl font-semibold mb-4 text-center">Mobile & Testing</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {skills.mobile.map((skill) => (
                <span key={skill} className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/50 hover:bg-green-500/30 transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="w-full space-y-6">
            <h3 className="text-2xl font-semibold mb-4 text-center">Architecture</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {skills.architecture.map((skill) => (
                <span key={skill} className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="w-full space-y-6">
            <h3 className="text-2xl font-semibold mb-4 text-center">Databases</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {skills.databases.map((skill) => (
                <span key={skill} className="px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500/30 transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="w-full space-y-6">
            <h3 className="text-2xl font-semibold mb-4 text-center">Version Control & Other Tools</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {skills.versionControlOtherTools.map((skill) => (
                <span key={skill} className="px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/50 hover:bg-indigo-500/30 transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="py-20 px-8" id="experience">
        <h2 className="text-4xl font-bold text-center mb-12">Experience</h2>
        <div className="max-w-4xl mx-auto relative pb-20">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
          
          {experiences.map((experience, index) => (
            <div 
              key={index}
              data-index={index}
              className={`relative mb-12 ${index % 2 === 0 ? 'pr-8 lg:ml-auto lg:pl-32 lg:pr-0 lg:w-1/2' : 'pl-8 lg:mr-auto lg:pl-32 lg:pl-0 lg:w-1/2'} transition-all duration-500 ${visibleSections.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
            >
              <div className="absolute top-0 w-4 h-4 rounded-full bg-purple-500 transition-transform duration-300 hover:scale-150 hover:bg-blue-500"
                   style={{ [index % 2 === 0 ? 'left' : 'right']: '-8px' }}></div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg hover:bg-gray-800/70 transition-colors">
                <h3 className="text-xl font-semibold text-blue-400">{experience.title}</h3>
                <h4 className="text-lg text-purple-300">{experience.company}</h4>
                <p className="text-gray-400">{experience.period}</p>
                <p className="mt-2">{experience.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {experience.skills.map((skill, skillIndex) => (
                    <span key={skillIndex} className="text-sm px-2 py-1 rounded bg-blue-500/20">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Hourglass Icon */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 mt-16">
            <div className="animate-pulse text-purple-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 bg-black/30">
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-6">
          <div className="flex space-x-6">
            <a href="https://linkedin.com/in/franol-fekadu-583882262/" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="https://github.com/firaeholic" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://www.upwork.com/freelancers/~01613c8cda824e9c15" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Upwork</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892h-2.74v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546v-7.112h-2.734v7.112c0 2.917 2.374 5.292 5.291 5.292 2.918 0 5.293-2.375 5.293-5.292v-1.192c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z"/>
              </svg>
            </a>
            <a href="mailto:franolfekadublas@gmail.com" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Email</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
          </div>
          <p className="text-gray-500 text-sm">&copy; 2024 Franol Fekadu. All rights reserved.</p>
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
