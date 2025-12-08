import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import headerLogo from '../assets/headerlogo_1.png';
import bgImage from '../assets/wintel-lottery-bg-3.png';
import { Copyright, Headset, Clock } from 'lucide-react';
const Fail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [failureData, setFailureData] = useState(null);

  // Extract EPS ID from malformed URL
  const extractEPSTransactionId = () => {
    const queryString = window.location.search;
    const match = queryString.match(/EPSTransactionId.*?(\w{10,})/);

    if (match && match[1]) return match[1].trim();
    const fallback = searchParams.get('EPSTransactionId');
    return fallback?.trim() || 'Not Provided';
  };

  useEffect(() => {
    const status = searchParams.get('Status') || 'Failed';
    const merchantTxnId = searchParams.get('MerchantTransactionId') || 'Not Provided';
    const epsTxnId = extractEPSTransactionId();
    const errorCode = searchParams.get('ErrorCode') || 'Not Provided';
    const errorMessage = searchParams.get('ErrorMessage') || 'Payment failed due to technical reasons.';

    setFailureData({
      status,
      merchantTxnId,
      epsTxnId,
      errorCode,
      errorMessage
    });
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

        <div className="text-center mb-4">
            <img
              src={headerLogo}
              alt="Bangladesh Thalassaemia Samity & Hospital"
              className="w-56 h-auto mx-auto mb-2 
                         [@media(max-width:440px)]:w-40 
                         [@media(max-width:360px)]:w-32"
            />
            
            <h1 className="text-xl font-bold text-purple-800
                          [@media(max-width:440px)]:text-sm
                          [@media(max-width:360px)]:text-xs">
              Bangladesh Thalassaemia Samity (BTS)
            </h1>
            
            <h1 className="text-xl font-bold text-[#026B39]
                          [@media(max-width:440px)]:text-sm
                          [@media(max-width:360px)]:text-xs
                          whitespace-nowrap">
                     Lottery 2025 (Govt. Approved)
            </h1>
            
            {/* <p className="sm:text-sm text-gray-500
                         [@media(max-width:440px)]:text-xs
                         [@media(max-width:360px)]:text-[10px]">
              Get your ticket now!
            </p> */}
          </div>

          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          {/* Failure Message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
            <p className="text-gray-600 text-sm mt-2">
              {failureData?.errorMessage}
            </p>
          </div>

          {/* Transaction Details */}
          {failureData && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 space-y-2">
              <h3 className="font-semibold text-red-800 text-center">
                Transaction Details
              </h3>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Reference ID:</span>
                <span className="text-gray-900 break-all">{failureData.merchantTxnId}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700">EPS ID:</span>
                <span className="text-gray-900 break-all">{failureData.epsTxnId}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Error Code:</span>
                <span className="text-gray-900 break-all">{failureData.errorCode}</span>
              </div>
            </div>
          )}


          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg"
          >
            Go Back to Home
          </button>
                       {/* Support */}
          <div className="mt-3 flex flex-col items-end leading-none space-y-1">

{/* Support Number */}
<div className="flex items-center gap-1">
  <Headset className="w-3.5 h-3.5 text-blue-600" />
  <span className="text-[11px] font-medium text-gray-800">Support :</span>
  <a
    href="tel:09606549134"
    className="text-[11px] font-semibold text-blue-700 hover:underline"
  >
    09606549134
  </a>
</div>

{/* Support Hours */}
<div className="flex items-center gap-1">
  <Clock className="w-2.5 h-2.5 text-blue-600" />
  <span className="text-[9px] text-gray-800">
    Sunday to Thursday (10 AM to 6 PM)
  </span>
</div>
</div>
          {/* Footer */}
          <div className="mt-4 w-full bg-[#edf4ff] py-3 text-center rounded-lg text-sm text-gray-700">
            <Copyright className="mx-1.5 inline h-3.5 w-3.5 text-gray-600" />
            The site is developed & operated by{" "}
            <a
              href="https://wintelbd.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Wintel Limited.
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Fail;
