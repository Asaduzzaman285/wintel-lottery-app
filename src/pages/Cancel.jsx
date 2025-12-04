import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import headerLogo from '../assets/headerlogo_1.png';
import bgImage from '../assets/wintel-lottery-bg-3.png';

const Cancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [merchantTxnId, setMerchantTxnId] = useState('');

  const extractEPSTransactionId = () => {
    const queryString = window.location.search;
    const match = queryString.match(/EPSTransactionId.*?(\w{10,})/);
    if (match && match[1]) return match[1].trim();
    return searchParams.get("EPSTransactionId")?.trim() || '';
  };

  useEffect(() => {
    setMerchantTxnId(searchParams.get('MerchantTransactionId') || '');
  }, [searchParams]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div 
        className="fixed inset-0 w-full h-full"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)), url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <img
              src={headerLogo}
              alt="Bangladesh Thalassaemia Samity & Hospital"
              className="w-20 sm:w-24 mx-auto mb-3"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Bangladesh Thalassaemia Samity & Hospital
            </h1>
          </div>

          {/* Cancel Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-yellow-700 text-center mb-2">
            Payment Cancelled
          </h2>
          <p className="text-gray-600 text-sm text-center">
            You have cancelled the payment process.
          </p>

          {merchantTxnId && (
            <p className="text-xs text-gray-500 text-center mt-3">
              Reference ID: <span className="font-semibold">{merchantTxnId}</span>
            </p>
          )}

          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg"
          >
            Back to Home
          </button>

        </div>
      </div>
    </div>
  );
};

export default Cancel;
