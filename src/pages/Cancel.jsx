import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import headerLogo from '../assets/headerlogo_1.png';
import bgImage from '../assets/wintel-lottery-bg-3.png';
import { Clock, Headset, Copyright } from 'lucide-react';

// SAME API CONFIG AS SUCCESS PAGE
const API_CONFIG = {
  baseUrl: 'https://prodapi.bdlotteryticket.com',
  verificationEndpoint: '/api/v1/eps/payment-verification',
  token: 'yNGRx3PdjsTfOsaj2BasPWf8gYhLhmJn6lDCj5bc1d7+2Y0PN5+6OIku1mcwAnsY5idarCv5XSqBvGL7lYV+/g==',
  merchantToken: 'U2FsdGVkX19enVsX0qbxzB8WOdKhJuGtqaYOe1oH4DQ='
};

const Cancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isCallingAPI, setIsCallingAPI] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [merchantTxnId, setMerchantTxnId] = useState('');

  // Extract EPS Transaction ID
  const extractEPSTransactionId = () => {
    const queryString = window.location.search;
    const match = queryString.match(/EPSTransactionId.*?(\w{10,})/);
    if (match && match[1]) return match[1].trim();
    return searchParams.get("EPSTransactionId")?.trim() || '';
  };

  // Hit API even on Cancel page
  useEffect(() => {
    const hitVerificationAPI = async () => {
      try {
        const merchantId = searchParams.get("MerchantTransactionId");
        const epsId = extractEPSTransactionId();

        setMerchantTxnId(merchantId || '');

        if (!merchantId) {
          throw new Error("Missing Merchant Transaction ID");
        }

        const formData = new FormData();
        formData.append('token', API_CONFIG.token);
        formData.append('merchant_token', API_CONFIG.merchantToken);
        formData.append('merchant_transaction_id', merchantId);
        formData.append('eps_transaction_id', epsId);

        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.verificationEndpoint}`,
          {
            method: "POST",
            headers: { Accept: "application/json" },
            body: formData
          }
        );

        const result = await response.json().catch(() => null);

        // If verification already done → redirect home
        if (response.status === 422 || result?.message?.[0] === "Verification already done!") {
          navigate('/');
          return;
        }

        if (!response.ok) {
          const errMsg = result?.message?.[0] || "Verification failed!";
          throw new Error(errMsg);
        }

        setIsCallingAPI(false);

      } catch (error) {
        setApiError(error.message);
        setIsCallingAPI(false);
      }
    };

    hitVerificationAPI();
  }, [searchParams]);


  // 🌀 Loading state during API hit
  if (isCallingAPI) {
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

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/95 rounded-2xl shadow-xl p-6 text-center">
            <div className="animate-spin w-14 h-14 border-4 border-yellow-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-lg font-bold text-gray-800">Processing Cancellation...</h2>
            <p className="text-sm mt-1 text-gray-600">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  // ❌ Error in API call
  if (apiError) {
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

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/95 rounded-2xl shadow-xl p-6 text-center max-w-md">
            <h2 className="text-xl font-bold text-red-600">Error Processing Cancellation</h2>
            <p className="mt-2 text-gray-600">{apiError}</p>

            <button
              onClick={() => navigate('/')}
              className="mt-5 w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-lg font-semibold"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Final Cancel UI
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
          <div className="text-center mb-4">
            <img
              src={headerLogo}
              alt="Bangladesh Thalassaemia Samity & Hospital"
              className="w-56 mx-auto mb-2
                        [@media(max-width:440px)]:w-40 
                        [@media(max-width:360px)]:w-32"
            />
            <h1 className="text-xl font-bold text-purple-800">Bangladesh Thalassaemia Samity (BTS)</h1>
            <h1 className="text-xl font-bold text-[#026B39] whitespace-nowrap">
              Lottery 2025 (Govt. Approved)
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
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-lg font-semibold"
          >
            Back to Home
          </button>

          {/* Support */}
          <div className="mt-4 flex flex-col items-end leading-none space-y-1">
            <div className="flex items-center gap-1">
              <Headset className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-medium text-gray-800">Support :</span>
              <a href="tel:09606549134" className="text-[11px] font-semibold text-blue-700 hover:underline">
                09606549134
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-blue-600" />
              <span className="text-[9px] text-gray-800">Sunday to Thursday (10 AM to 6 PM)</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 w-full bg-[#edf4ff] py-3 text-center rounded-lg text-sm text-gray-700">
            <Copyright className="mx-1.5 inline h-3.5 w-3.5 text-gray-600" />
            The site is developed & operated by{' '}
            <a
              href="https://wintelbd.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Wintel Limited.
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cancel;
