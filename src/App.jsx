import { useState } from 'react';
import Select from 'react-select';
import headerLogo from './assets/headerlogo_1.png';

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

const App = () => {
  const [formData, setFormData] = useState({
    mobileNo: '',
    name: '',
    district: null,
    quantity: 1
  });

  const [errors, setErrors] = useState({});

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
    setFormData(prev => ({
      ...prev,
      quantity: Math.min(10, Math.max(1, prev.quantity + delta))
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.mobileNo) {
      newErrors.mobileNo = 'Mobile number is required';
    } else if (!/^01[3-9]\d{8}$/.test(formData.mobileNo)) {
      newErrors.mobileNo = 'Enter valid Bangladesh mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert(`Payment gateway pending.\nMobile: ${formData.mobileNo}\nName: ${formData.name}\nDistrict: ${formData.district?.label || 'Not selected'}\nTickets: ${formData.quantity}`);
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
    <div className="min-h-screen overflow-auto bg-[#f9f9f9] flex items-center justify-center p-0">
      <div className="w-full max-w-lg">

        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6">

          {/* Header */}
          <div className="text-center mb-4">
            
            {/* Transparent Logo */}
            <div className="flex items-center justify-center mb-2">
              <img
                src={headerLogo}
                alt="Wintel Lottery Logo"
                className="w-20 h-auto sm:w-24 object-contain"
              />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Bangladesh Thalassaemia Samity & Hospital
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">Get your lucky ticket now!</p>
          </div>

          {/* Form */}
          <div className="space-y-3">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className={`w-full px-3 py-2 text-sm rounded-lg border-2 ${
                    errors.mobileNo ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {errors.mobileNo && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.mobileNo}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                District
              </label>
              <Select
                options={districts}
                value={formData.district}
                onChange={handleDistrictChange}
                placeholder="Select district"
                styles={customSelectStyles}
                isSearchable
              />
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tickets
                </label>
                <div className="flex items-center bg-gray-50 rounded-lg p-2 border-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={formData.quantity === 1}
                    className="w-8 h-8 flex items-center justify-center border rounded-md"
                  >
                    −
                  </button>
                  <div className="flex-1 text-center text-lg font-bold text-blue-600">{formData.quantity}</div>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={formData.quantity === 10}
                    className="w-8 h-8 flex items-center justify-center border rounded-md"
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

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 rounded-lg"
            >
              🎫 Pay Now
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 pt-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure Payment • Terms Apply</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
