import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaWandMagicSparkles, FaUser } from "react-icons/fa6";
import { HiCheckCircle } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import TryItNowSection from './try-it-now';
import { useRef } from 'react';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Contact', path: '/contact' },
];

const Welcome = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShadow, setHasShadow] = useState(false);
  const navigate = useNavigate();
  const tryDemoRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setHasShadow(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className='w-full'>
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 w-full z-50 bg-white px-10 py-4 ${hasShadow ? 'shadow-airbnb' : ''}`}>
        <div className='flex justify-between items-center'>
          <div className='flex items-center'>
            <img src='/logo-black.png' width={75} alt='logo' className='cursor-pointer mr-10' />
            <button onClick={() => setIsOpen(!isOpen)} className='md:hidden text-black'>
              {isOpen ? '✖' : '☰'}
            </button>
            <div className={`absolute md:static top-16 left-0 w-full md:w-auto md:flex space-x-8 p-5 md:p-0 bg-white md:bg-transparent ${isOpen ? 'block' : 'hidden'} md:block`}>
              {navLinks.map(({ name, path }) => (
                <Link key={name} to={path} className='text-sm text-black hover:text-green-600'>{name}</Link>
              ))}
            </div>
          </div>
          <div className='flex items-center space-x-4 mt-4 md:mt-0'>
            <Link to='' onClick={() => {
    tryDemoRef.current?.scrollIntoView({ behavior: 'smooth' });
  }} className='flex items-center text-sm text-black hover:text-green-600'>
              Try Demo <FaWandMagicSparkles size={18} className='ml-2 text-gray-400' />
            </Link>
            <Link to='/login' className='flex items-center text-sm text-black hover:text-green-600'>
              Login <FaUser size={18} className='ml-2 text-gray-400' />
            </Link>
            <button className='bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-orange'  onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-16 bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/homepage-background.webp')" }}>
        <h1 className='text-white text-6xl font-bold text-center mt-16'>
          Elevate Your Hiking <br /> <span className='text-orange'>Experience</span>
        </h1>

        <div className='mt-8 flex flex-col md:flex-row justify-center items-center text-center space-y-4 md:space-x-8 md:space-y-0'>
          {["Discover the future of hiking", "Track your journey effortlessly", "Share your adventures globally"].map(text => (
            <div key={text} className='flex items-center space-x-2'>
              <HiCheckCircle className='text-secondary' size={22} />
              <p className='text-md text-white opacity-80'>{text}</p>
            </div>
          ))}
        </div>

        <div className='mt-12 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-x-4 md:space-y-0'>
          <div className='flex'>
            {["hiker-1", "hiker-2", "hiker-3"].map((img, idx) => (
              <img key={img} src={`/${img}.png`} alt={img} className={`w-10 h-10 rounded-full ${idx > 0 ? '-ml-3' : ''}`} />
            ))}
          </div>
          <p className='text-md text-white'>Join <span className='underline'>5000+</span> Active Hikers</p>
          <button className='bg-white font-semibold text-black px-6 py-2 rounded-md hover:bg-primary hover:text-white'  onClick={() => navigate('/register')}>Explore Now</button>
        </div>

        {/* Video Section */}
        <div className='mt-12 w-full max-w-5xl mx-auto'>
          <div onClick={() => setLightboxOpen(true)} className='relative h-[300px] md:h-[500px] cursor-pointer rounded-t-lg overflow-hidden'>
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
                <iframe className='w-full h-[300px] md:h-[500px] rounded-lg' src='https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1' title='Video' allowFullScreen></iframe>
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
  <h2 className='text-4xl font-bold mb-12'>
    Discover the <span className='text-primary'>Future of Hiking</span>
  </h2>
  <div className='grid sm:grid-cols-2 gap-12 place-items-center w-[800px] m-auto'>
    {["weight-analysis", "custom-order", "navigation", "community"].map((img) => (
      <div
        key={img}
        className='w-96 h-96 bg-gray-100 rounded-lg overflow-hidden group relative cursor-pointer'
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

      {/* Footer */}
      <footer className='container mx-auto flex flex-col md:flex-row justify-between p-10'>
        <div>
          <img src='/logo-black.png' width={75} alt='logo' className='mb-4' />
          <p className='text-sm text-gray-600'>&copy; {new Date().getFullYear()} Hikepack.io. All rights reserved.</p>
        </div>
        <div className='flex space-x-20 mt-6 md:mt-0'>
          {[
            { title: "Menu", items: ['/', '/products', '/services', '/contact'], names: ['Home', 'Products', 'Services', 'Contact'] },
            { title: "Company", items: ['/about', '/help-center', '/privacy-policy'], names: ['About Us', 'Help Center', 'Privacy Policy'] },
          ].map(section => (
            <div key={section.title}>
              <h4 className='font-semibold mb-2'>{section.title}</h4>
              <ul className='space-y-2 text-gray-600'>
                {section.items.map((path, idx) => (
                  <li key={path}><Link to={path} className='hover:text-orange text-sm'>{section.names[idx]}</Link></li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className='font-semibold mb-2'>Follow Us</h4>
            {['Facebook', 'Twitter', 'Instagram'].map(social => (
              <a key={social} href={`https://${social.toLowerCase()}.com`} target='_blank' rel='noopener noreferrer' className='block text-sm text-gray-600 hover:text-orange mb-3'>{social}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
