import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaWandMagicSparkles, FaUser } from "react-icons/fa6";
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
      <img src='/logo-black.png' width={85} alt='logo' className='cursor-pointer' />
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
          className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-secondary"
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
          Pack Smarter. Hike <br /> <span className='text-secondary'>Farther.</span>
        </h1>

       <div className="mt-8 px-4 w-full max-w-5xl mx-auto text-center">
  <p className="text-white text-lg sm:text-xl md:text-xl leading-relaxed">
    Set out on your next adventure with total confidence. <br className="hidden sm:block" />
    HikePack is your ultimate tool for organizing and managing your hiking gear,
    ensuring every ounce counts and every item has its place.
  </p>
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







<section className="bg-theme-bgGray py-20 px-4">
  <div className="text-center mb-12">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
      <span className="text-black">Why Choose </span>
      <span className="text-primary">HikePack</span>
    </h2>
    <p className="text-gray-600 text-sm sm:text-base mt-3 max-w-xl mx-auto">
      From AI-powered packing to community sharing — here's why HikePack stands out.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
    {[
      {
        title: "Pack Like a Pro",
        text: "Create custom gear lists, categorize your equipment, and track weight with precision. Whether you're a weekend warrior or thru-hiker, you’ll stay organized and light on your feet.",
        icon: "🎒",
      },
      {
        title: "Smarter Packing with Built-in AI",
        text: "HikePack’s intelligent assistant gives you helpful suggestions based on your trip type, pack weight, weather, and past gear. It’s like having an experienced guide — minus the judgment.",
        icon: "🤖",
      },
      {
        title: "Discover & Share",
        text: "Explore curated gear lists from fellow hikers around the world. Share your own setups and get inspired by how others tackle the trail.",
        icon: "🌍",
      },
      {
        title: "Tailored Trip Planning",
        text: "From a single-day hike to a month-long trek, HikePack adapts to your adventure. Add, organize, and tweak your gear list with ease.",
        icon: "🗺️",
      },
    ].map(({ title, text, icon }) => (
      <div
        key={title}
        className="border-2 border-secondary/20 bg-white rounded-2xl p-6 sm:p-8 flex flex-col "
      >
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">{title}</h3>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{text}</p>
      </div>
    ))}
  </div>
</section>






      <section className='bg-white py-12 text-center'>
        <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-12 px-4'>
          Features  <span className='text-primary'>You’ll Love</span>
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-10 place-items-center max-w-full md:w-[800px] m-auto'>

        {[
  {
    img: "weight-analysis",
    title: "Weight Tracking",
    text: "Know your total pack weight, item by item.",
  },
  {
    img: "custom-order",
    title: "Custom Gear Lists",
    text: "Build and manage detailed lists by category.",
  },
  {
    img: "navigation",
    title: "Smart AI Suggestions",
    text: "Get intelligent tips to optimize your load.",
  },
  {
    img: "community",
    title: "Community Sharing",
    text: "Tap into a global network of hikers.",
  },
].map(({ img, title, text }) => (
  <div
    key={img}
    className={`w-72 sm:w-80 md:w-96 bg-gray-100 rounded-lg overflow-hidden group relative cursor-pointer p-5 flex flex-col text-left`}
  >
    <h3 className='text-lg font-bold mb-1'>{title}</h3>
    <p className='text-sm text-gray-400 mb-4'>{text}</p>
    <img
      src={`/${img}.png`}
      alt={img}
      className='w-full h-72 object-contain transition-transform duration-700 ease-in-out group-hover:animate-float'
    />
  </div>
))}
        </div>
      </section>

    <section className="bg-primary text-white text-center py-20 px-4">
  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 drop-shadow-sm">
    🌄 Ready to Hike <span className="text-yellow-200">Smarter</span>?
  </h2>
  <p className="text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-10">
    Join thousands of hikers using HikePack to plan better, pack lighter, and hit the trail with confidence.
  </p>
  <button
    onClick={() => navigate('/register')}
    className="bg-white text-primary font-semibold text-sm sm:text-base px-8 py-3 rounded-md shadow-md transition-all duration-300 hover:scale-105"
  >
    Get Started Now
  </button>
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
          items: ["https://www.facebook.com/hikepack.io", "https://twitter.com", "https://instagram.com"],
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
                    className="hover:text-primary"
                  >
                    {section.names[i]}
                  </a>
                ) : (
                  <Link to={path} className="hover:text-primary">
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
