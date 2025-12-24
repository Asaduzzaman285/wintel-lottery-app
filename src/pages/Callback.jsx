import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import headerLogo from '../assets/headerlogo_1.png';
import bgImage from '../assets/wintel-lottery-bg-3.png';
import { Headset, Copyright, Clock, Mail } from 'lucide-react';

// API Configuration
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_APP_API_BASE_URL,
  processPaymentEndpoint: import.meta.env.VITE_APP_PROCESS_PAYMENT,
  verifyPaymentEndpoint: import.meta.env.VITE_APP_VERIFY_PAYMENT,
  token: import.meta.env.VITE_APP_TOKEN,
  merchantToken: import.meta.env.VITE_APP_MERCHANT_TOKEN
};

const Callback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [viewState, setViewState] = useState('VERIFYING'); // VERIFYING, SUCCESS, FAIL, CANCEL
  const [responseData, setResponseData] = useState(null);
  const [errorData, setErrorData] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Helper to get params from both searchParams and direct window.location for safety
  const getParam = (key) => {
    return searchParams.get(key) || new URLSearchParams(window.location.search).get(key);
  };

  const extractEPSTransactionId = () => {
    const query = window.location.search;
    const match = query.match(/EPSTransactionId.*?(\w{10,})/);
    if (match && match[1]) return match[1].trim();
    const fallback = getParam("EPSTransactionId");
    return fallback?.trim() || "Not Provided";
  };

  const determineStatusType = (status) => {
    if (!status) return 'FAIL';

    const s = status.toLowerCase();

    if (s === 'success') return 'SUCCESS';
    if (s === 'cancelled' || s === 'partialcancelled') return 'CANCEL';

    // Default to FAIL for: Failed, Aborted, Fraud, UnKnownFailed, etc.
    return 'FAIL';
  };

  const downloadPDFReceipt = async (dataOverride = null) => {
    const ticketData = dataOverride || responseData;
    if (!ticketData?.data?.purchase_log) return;

    const { jsPDF } = window.jspdf;
    const report = ticketData.data.purchase_log;

    const HEADER_HEIGHT = 75;
    const TICKET_ROW_HEIGHT = 5;
    const BOTTOM_MARGIN = 15;

    const tickets = report.ticket_numbers ? report.ticket_numbers.split(',').map(t => t.trim()) : [];

    let pageHeight = HEADER_HEIGHT + tickets.length * TICKET_ROW_HEIGHT + BOTTOM_MARGIN;
    pageHeight = Math.max(pageHeight, 110);

    const pageWidth = 210;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [pageHeight, pageWidth],
    });

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Logo
    try {
      doc.addImage(headerLogo, 'PNG', 15, 15, 35, 18);
    } catch { }

    // Header text
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(128, 0, 128);
    doc.text('Bangladesh Thalassaemia Samity (BTS)', 53, 22);

    doc.setTextColor(2, 107, 57);
    doc.text('Lottery 2025 (Govt. Approved)', 53, 28);

    // Format date helper
    const formatForPDF = (date) => date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const generatedTime = formatForPDF(new Date());

    let verifiedTime = 'N/A';
    if (report.verification_time) {
      const verifiedDate = new Date(report.verification_time.replace(' ', 'T'));
      if (!isNaN(verifiedDate)) {
        verifiedTime = formatForPDF(verifiedDate);
      }
    }

    // Timestamps
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated at: ${generatedTime}`, 15, 38);

    // Payment Verified (above "Verified at")
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text('Payment Verified', pageWidth - 70, 33);

    // Verified at timestamp
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Verified at: ${verifiedTime}`, pageWidth - 70, 38);

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 47, pageWidth - 15, 47);

    // LEFT SIDE - Customer Information
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    doc.setFont(undefined, 'normal');
    doc.text('Name:', 15, 52);
    doc.setFont(undefined, 'bold');
    doc.text(report.customer_name || 'N/A', 45, 52);

    doc.setFont(undefined, 'normal');
    doc.text('Mobile:', 15, 57);
    doc.setFont(undefined, 'bold');
    doc.text(report.customer_mobile || 'N/A', 45, 57);

    doc.setFont(undefined, 'normal');
    doc.text('District:', 15, 62);
    doc.setFont(undefined, 'bold');
    doc.text(report.customer_district || 'N/A', 45, 62);

    // RIGHT SIDE - Transaction IDs
    const rightColX = pageWidth - 95;

    doc.setFont(undefined, 'normal');
    doc.text('Merchant Transaction ID:', rightColX, 52);
    doc.setFont(undefined, 'bold');
    doc.text(report.merchant_transaction_id || 'N/A', rightColX + 50, 52);

    doc.setFont(undefined, 'normal');
    doc.text('EPS Transaction ID:', rightColX, 57);
    doc.setFont(undefined, 'bold');
    doc.text(report.eps_transaction_id || 'N/A', rightColX + 50, 57);

    // Ticket section header
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('YOUR TICKET INFORMATION', 15, 70);

    doc.setDrawColor(200, 200, 200);
    doc.line(15, 72, pageWidth - 15, 72);

    // Tickets list
    let yPos = 77;
    doc.setFontSize(8);

    tickets.forEach((ticket, index) => {
      doc.setFont(undefined, 'bold');
      doc.text(`Ticket ${index + 1}:`, 15, yPos);

      doc.setFont(undefined, 'normal');
      doc.text(ticket, 35, yPos);

      yPos += TICKET_ROW_HEIGHT;
    });

    // Save File
    doc.save('lottery-ticket-receipt.pdf');
  };

  useEffect(() => {
    const processCallback = async () => {
      try {
        const rawStatus = getParam("Status") || getParam("status");
        const rawMerchantId = getParam("MerchantTransactionId") || getParam("merchant") || getParam("merchant_id");
        const epsTxnId = extractEPSTransactionId();

        // Error/Message Params
        const errorCode = getParam("ErrorCode") || getParam("status_code");
        const errorMessage = getParam("ErrorMessage") || getParam("message") || "Payment transaction issue.";

        const targetState = determineStatusType(rawStatus);

        // -- Setup Initial Error/Cancel Data from URL --
        if (targetState === 'FAIL') {
          setErrorData({
            status: rawStatus,
            merchantTxnId: rawMerchantId || 'Not Provided',
            epsTxnId: epsTxnId,
            errorCode: errorCode || 'Not Provided',
            errorMessage: errorMessage
          });
        } else if (targetState === 'CANCEL') {
          setResponseData({ merchantTxnId: rawMerchantId });
        }

        // If Success but missing merchantId, technically we can't verify.
        if (targetState === 'SUCCESS' && !rawMerchantId) {
          throw new Error("Invalid payment parameters: Missing Merchant ID");
        }

        // -- APIs Verification --
        const formData = new FormData();
        formData.append('token', API_CONFIG.token);
        formData.append('merchant_token', API_CONFIG.merchantToken);
        formData.append('merchant_transaction_id', rawMerchantId || '');
        formData.append('eps_transaction_id', epsTxnId || '');

        let apiResult = null;
        let apiSuccess = false;

        try {
          const response = await fetch(
            `${API_CONFIG.baseUrl}${API_CONFIG.verifyPaymentEndpoint}`,
            {
              method: "POST",
              headers: { "Accept": "application/json" },
              body: formData
            }
          );

          apiResult = await response.json().catch(() => null);

          // "Verification already done" -> Redirect
          if (response.status === 422 || apiResult?.message?.[0] === "Verification already done!") {
            navigate('/');
            return;
          }

          if (response.ok) {
            apiSuccess = true;
          } else {
            if (targetState === 'SUCCESS') {
              throw new Error(apiResult?.message?.[0] || "Payment verification failed");
            }
          }

        } catch (apiErr) {
          if (targetState === 'SUCCESS') throw apiErr;
          // Ignore for Fail/Cancel
        }

        // -- Finalize State --
        if (targetState === 'SUCCESS') {
          setResponseData(apiResult);
          setViewState('SUCCESS');

          // Auto PDF
          setTimeout(() => {
            if (apiResult?.data?.purchase_log) {
              downloadPDFReceipt(apiResult);
            }
          }, 500);

        } else if (targetState === 'CANCEL') {
          setViewState('CANCEL');
        } else {
          setViewState('FAIL');
        }

      } catch (err) {
        setViewState('FAIL');
        setErrorData({
          errorMessage: err.message || "An unexpected error occurred",
          merchantTxnId: getParam("MerchantTransactionId") || "N/A",
          epsTxnId: extractEPSTransactionId(),
          errorCode: "SYS_ERR_001"
        });
      } finally {
        setIsVerifying(false);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  // Load jsPDF library
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // --- RENDERING ---

  // 1. LOADING
  if (isVerifying) {
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
          <div className="bg-white/95 rounded-2xl shadow-2xl p-8 text-center">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800">Verifying Payment...</h2>
            <p className="text-sm text-gray-600 mt-2">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. SUCCESS VIEW
  if (viewState === 'SUCCESS') {
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
          <div className="w-full max-w-lg bg-white/95 rounded-2xl shadow-2xl p-6 sm:p-8">
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
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Your lottery ticket purchase is confirmed.
              </p>
              <p className="text-gray-600 mt-2 text-sm">
                You will get your ticket numbers via SMS.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <h3 className="font-semibold text-gray-800 text-center mb-2">Transaction Details</h3>
              <p className="text-sm">
                <strong>Merchant Txn ID:</strong> {responseData?.data?.purchase_log?.merchant_transaction_id || getParam('MerchantTransactionId') || 'N/A'}
              </p>
              <p className="text-sm text-green-600">
                ✓ Payment Verified Successfully
              </p>
            </div>

            {responseData?.data?.purchase_log && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-3 text-center">
                  Your Ticket Information
                </h3>
                {responseData.data.purchase_log.ticket_numbers.split(',').map((ticketNo, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg mb-2 shadow-sm">
                    <p className="text-sm font-semibold">Ticket No: {ticketNo.trim()}</p>
                    <p className="text-xs text-gray-500">
                      Mobile: {responseData.data.purchase_log.customer_mobile || "Not Provided"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-semibold"
              >
                Buy More Tickets
              </button>

              <button
                onClick={() => downloadPDFReceipt()}
                className="flex-1 bg-white border-2 border-orange-500 text-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-50"
              >
                📄 Download PDF Receipt
              </button>
            </div>

            <div className="mt-3 flex items-end gap-1 justify-end text-center leading-none">
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

            <div className="mt-0 flex items-center justify-end gap-1" style={{ marginBottom: '-5px' }}>
              <Clock className="w-2.5 h-2.5 text-blue-600" />
              <span className="text-[9px] font-small text-gray-800">
                Sunday to Thursday (10 AM to 6 PM)
              </span>
            </div>
            <div className="mt-0 flex items-center justify-end gap-1" style={{ marginBottom: '-5px' }}>
              <Mail className="w-2.5 h-2.5 text-blue-600" />
              <span className="text-[9px] font-small text-gray-800">
                support@wintelbd.com
              </span>
            </div>

            <div className="mt-3 w-full bg-[#edf4ff] py-2 text-center rounded-lg text-sm text-gray-700">
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
    );
  }

  // 3. CANCEL VIEW
  if (viewState === 'CANCEL') {
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

            {responseData?.merchantTxnId && (
              <p className="text-xs text-gray-500 text-center mt-3">
                Reference ID: <span className="font-semibold">{responseData.merchantTxnId}</span>
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
              <div className="mt-0 flex items-center justify-end gap-1" style={{ marginBottom: '-5px' }}>
                <Mail className="w-2.5 h-2.5 text-blue-600" />
                <span className="text-[9px] font-small text-gray-800">
                  support@wintelbd.com
                </span>
              </div>
            </div>

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
  }

  // 4. FAIL VIEW (Default fallback)
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
              className="w-56 mx-auto mb-2
                         [@media(max-width:440px)]:w-40 
                         [@media(max-width:360px)]:w-32"
            />
            <h1 className="text-xl font-bold text-purple-800">Bangladesh Thalassaemia Samity (BTS)</h1>
            <h1 className="text-xl font-bold text-[#026B39] whitespace-nowrap">Lottery 2025 (Govt. Approved)</h1>
          </div>

          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
            <p className="text-gray-600 text-sm mt-2">
              {errorData?.errorMessage || 'Payment transaction failed.'}
            </p>
          </div>

          {errorData && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 space-y-2">
              <h3 className="font-semibold text-red-800 text-center">Transaction Details</h3>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Reference ID:</span>
                <span className="text-gray-900 break-all">{errorData.merchantTxnId}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700">EPS ID:</span>
                <span className="text-gray-900 break-all">{errorData.epsTxnId}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Error Code:</span>
                <span className="text-gray-900 break-all">{errorData.errorCode}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-lg"
          >
            Go Back to Home
          </button>

          <div className="mt-3 flex flex-col items-end leading-none space-y-1">
            <div className="flex items-center gap-1">
              <Headset className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-medium text-gray-800">Support :</span>
              <a href="tel:09606549134" className="text-[11px] font-semibold text-blue-700 hover:underline">
                09606549134
              </a>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-blue-600" />
              <span className="text-[9px] text-gray-800">
                Sunday to Thursday (10 AM to 6 PM)
              </span>
            </div>
            <div className="mt-0 flex items-center justify-end gap-1" style={{ marginBottom: '-5px' }}>
              <Mail className="w-2.5 h-2.5 text-blue-600" />
              <span className="text-[9px] font-small text-gray-800">
                support@wintelbd.com
              </span>
            </div>
          </div>

          <div className="mt-4 w-full bg-[#edf4ff] py-3 text-center rounded-lg text-sm text-gray-700">
            <Copyright className="mx-1.5 inline h-3.5 w-3.5 text-gray-600" />
            The site is developed & operated by{" "}
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

export default Callback;