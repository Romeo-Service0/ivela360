import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    // Fallback timer in case video doesn't load or end event doesn't fire
    const timer = setTimeout(() => {
      navigate('/auth');
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setTimeout(() => {
      navigate('/auth');
    }, 500);
  };

  const handleSkip = () => {
    navigate('/auth');
  };

  return (
    <div className="fixed inset-0 bg-ivela-navy flex items-center justify-center overflow-hidden">
      <video
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          videoEnded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <source src="/videos/splash.mp4" type="video/mp4" />
      </video>
      
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 px-6 py-2 bg-primary/20 backdrop-blur-sm 
                   text-primary-foreground rounded-full text-sm font-medium
                   hover:bg-primary/30 transition-colors no-print"
      >
        Passer →
      </button>

      {/* Logo overlay */}
      <div className="absolute top-8 left-8 text-primary-foreground">
        <h1 className="text-3xl font-bold tracking-tight">
          IVELA <span className="text-accent">360°</span>
        </h1>
        <p className="text-sm text-primary-foreground/70 mt-1">
          Performance Management System
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
