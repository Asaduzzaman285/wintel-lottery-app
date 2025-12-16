import { useState } from 'react';
import Select from 'react-select';
import headerLogo from '../assets/headerlogo_1.png';
import bgImage from '../assets/wintel-lottery-bg-3.png';
import payImage from '../assets/pay.png';
import nagadPayImage from '../assets/nagad-pay.png';
// import termimage from '../assets/terms.jpg';
import { Copyright, Headset, FileText, X,Clock,Mail } from 'lucide-react';

const API_CONFIG = {
  baseUrl: import.meta.env.VITE_APP_API_BASE_URL,
  processPaymentEndpoint: import.meta.env.VITE_APP_PROCESS_PAYMENT,
  verifyPaymentEndpoint: import.meta.env.VITE_APP_VERIFY_PAYMENT,
  token: import.meta.env.VITE_APP_TOKEN,
  merchantToken: import.meta.env.VITE_APP_MERCHANT_TOKEN
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
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Check if merchant token is for NAGAD
  const isNagadPayment = API_CONFIG.merchantToken === 'a2fb89070bc29c0988dafa03f971af20176e1293a50d5';
  const paymentMethodName = isNagadPayment ? 'NAGAD' : 'EPS';

  const paymentMethodImage = isNagadPayment ? nagadPayImage : payImage;

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
      const newQuantity = Math.min(10, Math.max(1, prev.quantity + delta));
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
    // console.log('🚀 Pay Now button clicked!');
    
    if (!validateForm()) {
      // console.log('❌ Validation failed');
      return;
    }

    setIsLoading(true);
    // console.log('=== STARTING PAYMENT PROCESS ===');

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

      // console.log('📦 Payment Data:', paymentData);

      // Create FormData
      const formDataPayload = new FormData();
      Object.keys(paymentData).forEach(key => {
        formDataPayload.append(key, paymentData[key]);
      });

      const apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.processPaymentEndpoint}`;
      // console.log('🌐 API URL:', apiUrl);

      // Make API call
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formDataPayload
      });

      // console.log('📡 Response Status:', response.status);
      // console.log('📡 Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        // console.error('❌ Server Error Response:', errorText);
        
        setDebugInfo({
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // console.log('✅ API Response:', data);

      setDebugInfo({
        status: response.status,
        data: data
      });

      // Check for successful response and redirect URL
      if (data.status === 'success' && data.data?.InitializeResponse?.RedirectURL) {
        const redirectURL = data.data.InitializeResponse.RedirectURL;
        // console.log('✅ Payment Initialized Successfully!');
        // console.log('🎫 Transaction ID:', data.data.InitializeResponse.TransactionId);
        // console.log('🔗 Redirecting to:', redirectURL);

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
  const TermsModal = () => {
    if (!showTermsModal) return null;
  
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        onClick={() => setShowTermsModal(false)}
      >
        <div 
          className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
            <h2 className="text-base font-bold">নিয়মাবলী</h2>
            <button
              onClick={() => setShowTermsModal(false)}
              className="bg-white/20 hover:bg-white/30 p-1 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
  
          <div className="p-4">
  <div className="space-y-2 text-gray-800" style={{ fontFamily: 'Arial, sans-serif' }}>

    {/* 1 */}
    <div className="bg-blue-50 border-l-3 border-blue-600 p-2 rounded">
      <p className="text-[11px] leading-snug">
        <span className="font-bold text-blue-700">১.</span>
        অনুমোদিত ব্যাংক, প্রতিষ্ঠান ও এই পোর্টাল ব্যতীত অন্য কোনো মাধ্যম হতে টিকেট ক্রয় করলে সে টিকেটের জন্য বাংলাদেশ থ্যালাসামিয়া সমিতি ও সংশ্লিষ্ট কর্তৃপক্ষ দায়ী থাকবে না।
      </p>
    </div>

    {/* 2 */}
    <div className="bg-green-50 border-l-3 border-green-600 p-2 rounded">
      <p className="text-[11px] leading-snug">
        <span className="font-bold text-green-700">২.</span>
        ক্রয়কৃত লটারীর টিকেট নম্বর ও কনফার্মেশন কেবলমাত্র "BTS Lottery" আইডি থেকে এসএমএস এর মাধ্যমে পাঠানো হবে।
      </p>
    </div>

    {/* 3 */}
    <div className="bg-purple-50 border-l-3 border-purple-600 p-2 rounded">
      <p className="text-[11px] leading-snug">
        <span className="font-bold text-purple-700">৩.</span>
        নির্ধারিত তারিখে বাংলাদেশ থ্যালাসেমিয়া সমিতি কর্তৃপক্ষ ও বিশিষ্ট ব্যাক্তিদের উপস্থিতিতে ঢাকায় ড্র অনুষ্ঠিত হবে।
      </p>
    </div>

    {/* 4 */}
    <div className="bg-yellow-50 border-l-3 border-yellow-600 p-2 rounded">
      <p className="text-[11px] leading-snug">
        <span className="font-bold text-yellow-700">৪.</span>
        লটারীর ড্র এর নির্ধারিত তারিখ <strong>২৯ জানুয়ারী ২০২৬</strong>; বিজয়ীদের তালিকা সংবাদপত্রের মাধ্যমে প্রকাশ করা হবে। সেই সাথে বর্তমান ওয়েবসাইটেও (bdlotteryticket.com) বিজয়ীদের তালিকা প্রকাশ হবে।
      </p>
    </div>

    {/* 5 */}
    <div className="bg-red-50 border-l-3 border-red-600 p-2 rounded">
      <p className="text-[11px] leading-snug">
        <span className="font-bold text-red-700">৫.</span>
        ফলাফল প্রকাশের ৩০ দিনের মধ্যে বিজয়ীদের পুরষ্কারের জন্য নাম ঠিকানা, সত্যায়িত ছবি ও টিকেট প্রাপ্তির এসএমএস সহ লিখিত দাবী কর্তৃপক্ষের নিকট দাখিল করতে হবে। অনলাইন টিকেটের ক্ষেত্রে টিকেটহোল্ডারকে হেল্পলাইনে (09606541934) অথবা support@wintelbd.com এ যোগাযোগ করার জন্য অনুরোধ জানানো হচ্ছে।
      </p>
    </div>

    {/* 6 */}
    <div className="bg-indigo-50 border-l-3 border-indigo-600 p-2 rounded">
      <p className="text-[11px] leading-snug">
        <span className="font-bold text-indigo-700">৬.</span>
        ৬ষ্ঠ হতে ৮ম পুরস্কারের ক্ষেত্রে বিজয়ী নম্বর ক,খ,গ, ঘ,ঙ, চ, ছ, জ, ঝ, ঞ প্রত্যেক সিরিজের ক্ষেত্রে প্রযোজ্য হবে।
      </p>
    </div>

    {/* Final Statement */}
    <div className="bg-gray-100 border-2 border-gray-400 p-2 rounded">
      <p className="text-[11px] leading-snug font-semibold text-center text-gray-800">
        এই লটারী সংক্রান্ত যে কোন বিষয়ে বাংলাদেশ থ্যালাসেমিয়া সমিতি কর্তৃপক্ষের সিদ্ধান্তই চূড়ান্ত বলে বিবেচিত হবে।
      </p>
    </div>

  </div>
</div>


        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Terms Modal */}
      <TermsModal />

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
            
            <p className="sm:text-sm text-gray-500
                         [@media(max-width:440px)]:text-xs
                         [@media(max-width:360px)]:text-[10px]">
              Get your ticket now!
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
    {/* <p className="text-xs text-gray-600">ড্র: ২৯ জানুয়ারি ২০২৬ ইং</p> */}
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

  {/* Additional Info Below Grid */}
  <div className="mt-3 text-center space-y-1">
    <p className="text-xs text-gray-700 font-semibold">
      সর্বমোট ৫০ লক্ষ টাকার ৯৩৫ টি পুরষ্কার
    </p>
    <p className="text-xs text-white font-bold bg-red-600 inline-block px-3 py-1 rounded">
      ড্র: ২৩ জানুয়ারি ২০২৬ ইং
    </p>
  </div>
</div>

            {/* Terms & Conditions + Support Line */}
            <div className="mt-2 flex items-center justify-between gap-2">
              {/* Terms & Conditions Button (Left) */}
              <button
                onClick={() => setShowTermsModal(true)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors group"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium group-hover:underline">
                  Terms & Conditions
                </span>
              </button>

              {/* Support (Right) */}
              <div className="flex items-center gap-1 text-center leading-none">
                
                <Headset className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-medium text-gray-800">
                  Support :
                </span>
                <a
                  href="tel:09606549134"
                  className="text-[11px] font-semibold text-blue-700 hover:underline"
                >
                  09606549134 
                </a>
              </div>
            </div>
            <div className="mt-0 flex items-center justify-end gap-1 " style={{marginBottom:'-5px'}}>
            <Clock className="w-2.5 h-2.5 text-blue-600" />
                <span className="text-[9px] font-small text-gray-800">
                  Sunday to Thursday (10 AM to 6 PM) 
                </span>
              </div>

                 <div className="mt-0 flex items-center justify-end gap-1 " style={{marginBottom:'-5px'}}>
            <Mail className="w-2.5 h-2.5 text-blue-600" />
                <span className="text-[9px] font-small text-gray-800">
                 support@wintelbd.com
                </span>
              </div>
            {/* Submit Button */}
            <button
              onClick={handlePayNow}
              disabled={isLoading || isNagadPayment}
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
              ) : isNagadPayment ? (
                <>Coming Soon</>
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
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-gray-700">Secure Payment via {paymentMethodName}</span>
              </div>
              <div className="flex items-center justify-center">
                <img 
                  src={paymentMethodImage} 
                  alt="Payment Methods" 
                  className={isNagadPayment ? "w-[30%] h-auto object-contain" : "h-100 w-100 object-contain"}
                />
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-10 w-full bg-[#edf4ff] py-2 text-center rounded-lg text-sm text-gray-700">
              <Copyright className="mx-1.5 inline h-3.5 w-3.5 text-gray-600" />
              The site is developed & operated by{' '}
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