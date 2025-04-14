import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaWandMagicSparkles, FaUser } from "react-icons/fa6";
import { HiCheckCircle } from 'react-icons/hi';
import TryItNowSection from './try-it-now';
import { AlignJustify } from 'lucide-react';
import { X } from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Contact', path: '/contact' },
];

const Welcome = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShadow, setHasShadow] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const navigate = useNavigate();
  const tryDemoRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setHasShadow(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='w-full'>
     <nav className={`fixed top-0 left-0 w-full z-50 bg-white px-4 md:px-10 py-4 ${hasShadow ? 'shadow-airbnb' : ''}`}>
  <div className='flex items-center justify-between w-full'>
    {/* Left side on desktop: logo + navLinks */}
    <div className="flex items-center space-x-12">
      <img src='/logo-black.png' width={75} alt='logo' className='cursor-pointer' />
      <div className='hidden md:flex space-x-6'>
        {navLinks.map(({ name, path }) => (
          <Link key={name} to={path} className='text-sm text-black hover:text-green-600'>
            {name}
          </Link>
        ))}
      </div>
    </div>

    {/* Right side: desktop buttons / mobile hamburger */}
    <div className='flex items-center space-x-4'>
      {/* Desktop right buttons */}
      <div className='hidden md:flex items-center space-x-4'>
        <Link
          to=""
          onClick={() => tryDemoRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center text-sm text-black hover:text-green-600"
        >
          Try Demo <FaWandMagicSparkles size={18} className="ml-2 text-gray-400" />
        </Link>
        <Link
          to="/login"
          className="flex items-center text-sm text-black hover:text-green-600"
        >
          Login <FaUser size={18} className="ml-2 text-gray-400" />
        </Link>
        <button
          className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-orange"
          onClick={() => navigate('/register')}
        >
          Get Started
        </button>
      </div>

      {/* Hamburger (mobile + tablet only) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='md:hidden text-black text-1xl'
      >
        {isOpen ? <X /> : <AlignJustify />}
      </button>
    </div>
  </div>

  {/* Mobile Dropdown Menu */}
  <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} mt-4`}>
    <div className='flex flex-col space-y-4 p-4 bg-white'>
      {navLinks.map(({ name, path }) => (
        <Link key={name} to={path} onClick={() => setIsOpen(false)} className='text-sm text-black hover:text-green-600'>
          {name}
        </Link>
      ))}
      <Link
        to=""
        onClick={() => {
          tryDemoRef.current?.scrollIntoView({ behavior: 'smooth' });
          setIsOpen(false);
        }}
        className="flex items-center text-sm text-black hover:text-green-600"
      >
        Try Demo <FaWandMagicSparkles size={18} className="ml-2 text-gray-400" />
      </Link>
      <Link
        to="/login"
        onClick={() => setIsOpen(false)}
        className="flex items-center text-sm text-black hover:text-green-600"
      >
        Login <FaUser size={18} className="ml-2 text-gray-400" />
      </Link>
      <button
        className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-orange"
        onClick={() => {
          navigate('/register');
          setIsOpen(false);
        }}
      >
        Get Started
      </button>
    </div>
  </div>
</nav>



      {/* Hero Section */}
      <main className="pt-16 bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/homepage-background.webp')" }}>
        <h1 className='text-white text-4xl sm:text-5xl md:text-6xl font-bold text-center mt-16 px-4'>
          Elevate Your Hiking <br /> <span className='text-orange'>Experience</span>
        </h1>

        <div className='mt-8 flex flex-col md:flex-row justify-center items-center text-center space-y-4 md:space-x-8 md:space-y-0 px-4'>
          {["Discover the future of hiking", "Track your journey effortlessly", "Share your adventures globally"].map(text => (
            <div key={text} className='flex items-center space-x-2'>
              <HiCheckCircle className='text-secondary' size={22} />
              <p className='text-md text-white opacity-80'>{text}</p>
            </div>
          ))}
        </div>

        <div className='mt-12 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-x-4 md:space-y-0 px-4 text-center'>
          <div className='flex'>
            {["hiker-1", "hiker-2", "hiker-3"].map((img, idx) => (
              <img key={img} src={`/${img}.png`} alt={img} className={`w-10 h-10 rounded-full ${idx > 0 ? '-ml-3' : ''}`} />
            ))}
          </div>
          <p className='text-md text-white'>Join <span className='underline'>5000+</span> Active Hikers</p>
          <button className='bg-white font-semibold text-black px-6 py-2 rounded-md hover:bg-primary hover:text-white' onClick={() => navigate('/register')}>
            Explore Now
          </button>
        </div>

        {/* Video Section */}
        <div className='mt-12 w-full max-w-5xl mx-auto px-4'>
          <div onClick={() => setLightboxOpen(true)} className='relative h-[200px] sm:h-[300px] md:h-[500px] cursor-pointer rounded-t-lg overflow-hidden'>
            <img src='/placeholder-video.png' alt='Video' className='w-full h-full object-cover' />
            <div className='absolute inset-0 flex justify-center items-center bg-opacity-50'>
              <div className='bg-white p-4 rounded-full shadow-lg'>
                <svg className='w-12 h-12 text-orange' fill='currentColor' viewBox='0 0 24 24'><path d='M8 5v14l11-7z' /></svg>
              </div>
            </div>
          </div>
          {lightboxOpen && (
            <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50' onClick={() => setLightboxOpen(false)}>
              <div className='relative w-full max-w-4xl p-4'>
                <button className='absolute top-4 right-4 text-white text-3xl'>&times;</button>
                <iframe className='w-full h-[200px] sm:h-[300px] md:h-[500px] rounded-lg' src='https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1' title='Video' allowFullScreen></iframe>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Features Section */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>

      <section className='bg-white py-12 text-center'>
        <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-12 px-4'>
          Discover the <span className='text-primary'>Future of Hiking</span>
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-12 place-items-center max-w-full md:w-[800px] m-auto px-4'>
          {["weight-analysis", "custom-order", "navigation", "community"].map((img) => (
            <div
              key={img}
              className='w-72 sm:w-80 md:w-96 h-72 sm:h-80 md:h-96 bg-gray-100 rounded-lg overflow-hidden group relative cursor-pointer'
            >
              <img
                src={`/${img}.png`}
                alt={img}
                className='w-full h-full object-contain transition-transform duration-700 ease-in-out group-hover:animate-float'
              />
            </div>
          ))}
        </div>
      </section>

      {/* TryItNowSection */}
      <section ref={tryDemoRef} className='bg-theme-bgGray py-12 text-center'>
        <TryItNowSection />
      </section>

      <footer className="w-full bg-white px-4 sm:px-10 py-12">
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-start gap-10">
    {/* Left: Logo and copyright */}
    <div className="flex flex-col items-center md:items-start text-center md:text-left">
      <img src="/logo-black.png" width={75} alt="logo" className="mb-4" />
      <p className="text-xs text-gray-500 mt-2 md:mt-auto">
        &copy; {new Date().getFullYear()} Hikepack.io. All rights reserved.
      </p>
    </div>

    {/* Middle/Right: Link Columns */}
    <div className="flex flex-col sm:flex-row gap-10 justify-center md:justify-end text-sm text-gray-600 text-center md:text-left w-full md:w-auto">
      {[
        {
          title: "Menu",
          items: ["/", "/products", "/services", "/contact"],
          names: ["Home", "Products", "Services", "Contact"],
        },
        {
          title: "Company",
          items: ["/about", "/help-center", "/privacy-policy"],
          names: ["About Us", "Help Center", "Privacy Policy"],
        },
        {
          title: "Follow Us",
          items: ["https://facebook.com", "https://twitter.com", "https://instagram.com"],
          names: ["Facebook", "Twitter", "Instagram"],
        },
      ].map((section) => (
        <div key={section.title}>
          <h4 className="font-semibold mb-2">{section.title}</h4>
          <ul className="space-y-2">
            {section.items.map((path, i) => (
              <li key={path}>
                {section.title === "Follow Us" ? (
                  <a
                    href={path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-orange"
                  >
                    {section.names[i]}
                  </a>
                ) : (
                  <Link to={path} className="hover:text-orange">
                    {section.names[i]}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
</footer>

    </div>
  );
};

export default Welcome;
