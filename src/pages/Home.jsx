import { useState } from 'react';
import Select from 'react-select';
import headerLogo from '../assets/headerlogo_1.png';
import bgImage from '../assets/wintel-lottery-bg-3.png';
import payImage from '../assets/pay.png';
import { Copyright } from 'lucide-react';
// API Configuration
const API_CONFIG = {
  baseUrl: 'https://demoapi.bdlotteryticket.com/',
  processPaymentEndpoint: '/api/v1/eps/process-payment',
  verifyPaymentEndpoint: '/api/v1/eps/payment-verification',
  token: 'y74VdLnmZoMCi+0EAkdRHwcdNnI3B/8+T9yuV0XQa3ZVBR5LU9lAUXewHmkBmLQ8X8eLzacw2/rEiKi/4OQ/uw==',
  merchantToken: 'U2FsdGVkX19enVsX0qbxzB8WOdKhJuGtqaYOe1oH4DQ='
};

// Bangladesh Districts Data
const districts = [
  { value: 'bagerhat', label: 'Bagerhat' },
  { value: 'bandarban', label: 'Bandarban' },
  { value: 'barguna', label: 'Barguna' },
  { value: 'barisal', label: 'Barisal' },
  { value: 'bhola', label: 'Bhola' },
  { value: 'bogra', label: 'Bogra' },
  { value: 'brahmanbaria', label: 'Brahmanbaria' },
  { value: 'chandpur', label: 'Chandpur' },
  { value: 'chapainawabganj', label: 'Chapai Nawabganj' },
  { value: 'chittagong', label: 'Chittagong' },
  { value: 'chuadanga', label: 'Chuadanga' },
  { value: 'comilla', label: 'Comilla' },
  { value: 'coxsbazar', label: "Cox's Bazar" },
  { value: 'dhaka', label: 'Dhaka' },
  { value: 'dinajpur', label: 'Dinajpur' },
  { value: 'faridpur', label: 'Faridpur' },
  { value: 'feni', label: 'Feni' },
  { value: 'gaibandha', label: 'Gaibandha' },
  { value: 'gazipur', label: 'Gazipur' },
  { value: 'gopalganj', label: 'Gopalganj' },
  { value: 'habiganj', label: 'Habiganj' },
  { value: 'jamalpur', label: 'Jamalpur' },
  { value: 'jessore', label: 'Jessore' },
  { value: 'jhalokati', label: 'Jhalokati' },
  { value: 'jhenaidah', label: 'Jhenaidah' },
  { value: 'joypurhat', label: 'Joypurhat' },
  { value: 'khagrachhari', label: 'Khagrachhari' },
  { value: 'khulna', label: 'Khulna' },
  { value: 'kishoreganj', label: 'Kishoreganj' },
  { value: 'kurigram', label: 'Kurigram' },
  { value: 'kushtia', label: 'Kushtia' },
  { value: 'lakshmipur', label: 'Lakshmipur' },
  { value: 'lalmonirhat', label: 'Lalmonirhat' },
  { value: 'madaripur', label: 'Madaripur' },
  { value: 'magura', label: 'Magura' },
  { value: 'manikganj', label: 'Manikganj' },
  { value: 'meherpur', label: 'Meherpur' },
  { value: 'moulvibazar', label: 'Moulvibazar' },
  { value: 'munshiganj', label: 'Munshiganj' },
  { value: 'mymensingh', label: 'Mymensingh' },
  { value: 'naogaon', label: 'Naogaon' },
  { value: 'narail', label: 'Narail' },
  { value: 'narayanganj', label: 'Narayanganj' },
  { value: 'narsingdi', label: 'Narsingdi' },
  { value: 'natore', label: 'Natore' },
  { value: 'netrokona', label: 'Netrokona' },
  { value: 'nilphamari', label: 'Nilphamari' },
  { value: 'noakhali', label: 'Noakhali' },
  { value: 'pabna', label: 'Pabna' },
  { value: 'panchagarh', label: 'Panchagarh' },
  { value: 'patuakhali', label: 'Patuakhali' },
  { value: 'pirojpur', label: 'Pirojpur' },
  { value: 'rajbari', label: 'Rajbari' },
  { value: 'rajshahi', label: 'Rajshahi' },
  { value: 'rangamati', label: 'Rangamati' },
  { value: 'rangpur', label: 'Rangpur' },
  { value: 'satkhira', label: 'Satkhira' },
  { value: 'shariatpur', label: 'Shariatpur' },
  { value: 'sherpur', label: 'Sherpur' },
  { value: 'sirajganj', label: 'Sirajganj' },
  { value: 'sunamganj', label: 'Sunamganj' },
  { value: 'sylhet', label: 'Sylhet' },
  { value: 'tangail', label: 'Tangail' },
  { value: 'thakurgaon', label: 'Thakurgaon' }
];

const Home = () => {
  const [formData, setFormData] = useState({
    mobileNo: '',
    name: '',
    district: null,
    quantity: 1
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDistrictChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, district: selectedOption }));
    if (errors.district) setErrors(prev => ({ ...prev, district: '' }));
  };

  const handleQuantityChange = (delta) => {
    setFormData(prev => {
      const newQuantity = Math.min(5, Math.max(1, prev.quantity + delta));
      return { ...prev, quantity: newQuantity };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.mobileNo) {
      newErrors.mobileNo = 'Mobile number is required';
    } else if (!/^01[3-9]\d{8}$/.test(formData.mobileNo)) {
      newErrors.mobileNo = 'Enter valid Bangladesh mobile number';
    }

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.district) {
      newErrors.district = 'Please select a district';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayNow = async () => {
    console.log('🚀 Pay Now button clicked!');
    
    if (!validateForm()) {
      console.log('❌ Validation failed');
      return;
    }

    setIsLoading(true);
    console.log('=== STARTING PAYMENT PROCESS ===');

    try {
      const totalPrice = formData.quantity * 20;

      const paymentData = {
        token: API_CONFIG.token,
        merchant_token: API_CONFIG.merchantToken,
        mobile: formData.mobileNo,
        name: formData.name,
        district: formData.district.value,
        ticket_qty: formData.quantity.toString(),
        total_price: totalPrice.toString(),
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
        cancelUrl: `${window.location.origin}/cancel`
      };

      console.log('📦 Payment Data:', paymentData);

      // Create FormData
      const formDataPayload = new FormData();
      Object.keys(paymentData).forEach(key => {
        formDataPayload.append(key, paymentData[key]);
      });

      const apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.processPaymentEndpoint}`;
      console.log('🌐 API URL:', apiUrl);

      // Make API call
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formDataPayload
      });

      console.log('📡 Response Status:', response.status);
      console.log('📡 Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server Error Response:', errorText);
        
        setDebugInfo({
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);

      setDebugInfo({
        status: response.status,
        data: data
      });

      // Check for successful response and redirect URL
      if (data.status === 'success' && data.data?.InitializeResponse?.RedirectURL) {
        const redirectURL = data.data.InitializeResponse.RedirectURL;
        console.log('✅ Payment Initialized Successfully!');
        console.log('🎫 Transaction ID:', data.data.InitializeResponse.TransactionId);
        console.log('🔗 Redirecting to:', redirectURL);

        // Small delay to ensure logs are visible
        setTimeout(() => {
          window.location.href = redirectURL;
        }, 500);
      } else {
        console.error('❌ Invalid response structure:', data);
        const errorMessage = data.data?.InitializeResponse?.ErrorMessage || 
                           data.message || 
                           'Payment initialization failed. Please try again.';
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('=== PAYMENT ERROR ===');
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      
      // Show user-friendly error
      alert(
        `Payment failed: ${error.message}\n\n` +
        `Please check:\n` +
        `• Your internet connection\n` +
        `• Try again in a few moments\n` +
        `• Contact support if the issue persists`
      );
      
      setIsLoading(false);
    }
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: errors.district ? '#ef4444' : state.isFocused ? '#3b82f6' : '#e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      padding: '2px',
      borderRadius: '8px',
      minHeight: '42px'
    })
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Fixed Background */}
      <div 
        className="fixed inset-0 w-full h-full"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)), url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6">
          
          {/* Header */}
          <div className="text-center mb-4">
            <img
              src={headerLogo}
              alt="Bangladesh Thalassaemia Samity & Hospital"
              className="w-20 sm:w-24 h-auto mx-auto mb-2"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Bangladesh Thalassaemia Samity & Hospital
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Get your lucky ticket now!
            </p>
          </div>
  
          {/* Form Fields */}
          <div className="space-y-3">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 text-sm rounded-lg border-2 ${
                    errors.mobileNo
                      ? "border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  } disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors`}
                />
                {errors.mobileNo && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.mobileNo}</p>
                )}
              </div>
  
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  disabled={isLoading}
                  className={`w-full px-3 py-2 text-sm rounded-lg border-2 ${
                    errors.name
                      ? "border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  } disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors`}
                />
                {errors.name && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.name}</p>
                )}
              </div>
            </div>
  
            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <Select
                options={districts}
                value={formData.district}
                onChange={handleDistrictChange}
                placeholder="Select district"
                styles={customSelectStyles}
                isDisabled={isLoading}
              />
              {errors.district && (
                <p className="mt-0.5 text-xs text-red-500">{errors.district}</p>
              )}
            </div>
  
            {/* Tickets + Total */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tickets
                </label>
                <div className="flex items-center bg-gray-50 rounded-lg p-2 border-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={formData.quantity === 1 || isLoading}
                    className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    −
                  </button>
                  <div className="flex-1 text-center text-lg font-bold text-blue-600">
                    {formData.quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={formData.quantity === 10 || isLoading}
                    className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
  
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Total
                </label>
                <div className="flex items-center justify-center h-[52px] bg-blue-50 rounded-lg border-2 border-blue-200">
                  <span className="text-2xl font-bold text-blue-600">
                    ৳{formData.quantity * 20}
                  </span>
                </div>
              </div>
            </div>

            {/* Prize Details */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 border-2 border-amber-200">
              <div className="text-center mb-2">
                <h3 className="text-sm font-bold text-gray-800">পুরস্কারের তালিকা</h3>
                <p className="text-xs text-gray-600">ড্র: ২৯ জানুয়ারি ২০২৬</p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div className="bg-white/80 rounded p-1.5">
                  <span className="font-semibold text-amber-700">১ম পুরস্কার:</span> (১টি) ফ্ল্যাট/নগদ ৩০ লক্ষ টাকা
                </div>
                <div className="bg-white/80 rounded p-1.5">
                  <span className="font-semibold text-amber-700">২য় পুরস্কার:</span> (১টি) গাড়ি/৭ লক্ষ টাকা
                </div>
                <div className="bg-white/80 rounded p-1.5">
                  <span className="font-semibold text-amber-700">৩য় পুরস্কার:</span> (১টি) মোটরসাইকেল/১ লক্ষ ৫০ হাজার টাকা
                </div>
                <div className="bg-white/80 rounded p-1.5">
                  <span className="font-semibold text-amber-700">৪র্থ পুরস্কার:</span> (১টি) নগদ ৫০ হাজার টাকা
                </div>
                <div className="bg-white/80 rounded p-1.5">
                  <span className="font-semibold text-amber-700">৫ম পুরস্কার:</span> (১টি) নগদ ৩০ হাজার টাকা
                </div>
                <div className="bg-white/80 rounded p-1.5">
                  <span className="font-semibold text-amber-700">৬ষ্ঠ পুরস্কার:</span> (১০টি) প্রতিটি ৫ হাজার টাকা
                </div>
                <div className="bg-white/80 rounded p-1.5">
                  <span className="font-semibold text-amber-700">৭ম পুরস্কার:</span> (১০০টি) প্রতিটি ২ হাজার টাকা
                </div>
                <div className="bg-white/80 rounded p-1.5">
                  <span className="font-semibold text-amber-700">৮ম পুরস্কার:</span> (৮২০টি) প্রতিটি  ১ হাজার টাকা
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePayNow}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Payment...
                </>
              ) : (
                <>Pay Now (৳)</>
              )}
            </button>

            {/* Debug Toggle */}
            {/* <button
              onClick={() => setDebugMode(!debugMode)}
              className="w-full text-xs text-gray-400 hover:text-gray-600 underline"
            >
              {debugMode ? 'Hide' : 'Show'} Debug Info
            </button> */}

            {/* Debug Info */}
            {debugMode && (
              <div className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs font-mono overflow-auto max-h-96">
                <div className="mb-2 font-bold text-yellow-400">🔧 Debug Information:</div>
                <div className="space-y-1">
                  <div><strong>API URL:</strong> {API_CONFIG.baseUrl}{API_CONFIG.processPaymentEndpoint}</div>
                  <div><strong>Verification URL:</strong> {API_CONFIG.baseUrl}{API_CONFIG.verifyPaymentEndpoint}</div>
                  <div><strong>Success URL:</strong> {window.location.origin}/success</div>
                  <div><strong>Fail URL:</strong> {window.location.origin}/fail</div>
                  <div><strong>Token:</strong> {API_CONFIG.token.substring(0, 20)}...</div>
                  <div><strong>Merchant Token:</strong> {API_CONFIG.merchantToken.substring(0, 20)}...</div>
                </div>
                
                {debugInfo && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="font-bold text-yellow-400 mb-2">Last API Response:</div>
                    <pre className="whitespace-pre-wrap break-words text-xs">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
  
  {/* Payment Methods */}
  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-gray-700">Secure Payment via EPS</span>
              </div>
              <div className="flex items-center justify-center">
                <img 
                  src={payImage} 
                  alt="Payment Methods" 
                  className="h-100 w-100 object-contain"
                />
              </div>
            </div>
            <div className="mt-10 w-full bg-[#edf4ff] py-4 text-center text-sm text-gray-700">
  Copyright
  <Copyright className="mx-1.5 inline h-3.5 w-3.5 text-gray-600" />
  {new Date().getFullYear()} All Rights Reserved By{' '}
  <a
    href="https://wintelbd.com/"
    target="_blank"
    rel="noopener noreferrer"
    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
  >
    Wintel Limited.
  </a>
</div>


  
          </div>
  
        </div>
      </div>
    </div>
  );
};

export default Home;