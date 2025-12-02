
import { useEffect, useState } from 'react';
import headerLogo from './assets/headerlogo_1.png';
import bgImage from './assets/wintel-lottery-bg-3.png';

const App = () => {
  const calculateTimeLeft = () => {
    const targetDate = new Date("January 23, 2026 00:00:00").getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl p-6 max-w-md w-full text-center shadow-2xl animate-fadeIn">

        {/* Logo */}
        <img
          src={headerLogo}
          alt="Wintel Lottery Logo"
          className="w-24 h-auto mx-auto mb-3 drop-shadow-md"
        />

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Coming Soon!
        </h1>
        <p className="text-sm text-gray-600">
          Online ticket purchase will be available shortly!
        </p>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-2 mt-5">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hrs", value: timeLeft.hours },
            { label: "Min", value: timeLeft.minutes },
            { label: "Sec", value: timeLeft.seconds },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-blue-600 text-white p-2 rounded-lg shadow-md"
            >
              <div className="text-xl font-bold">{item.value}</div>
              <div className="text-[10px] uppercase tracking-wide">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Draw Date */}
        <div className="mt-4 bg-yellow-50 border border-yellow-300 p-3 rounded-lg shadow-sm">
          <p className="text-yellow-700 text-sm font-semibold">
            🎯 Draw Date: ২৩ জানুয়ারি ২০২৬
          </p>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-gray-500 mt-5">
          Bangladesh Thalassaemia Samity & Hospital
        </p>
      </div>
    </div>
  );
};

export default App;
