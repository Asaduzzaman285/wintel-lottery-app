import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import headerLogo from '../assets/headerlogo_1.png';
import bgImage from '../assets/wintel-lottery-bg-3.png';

// API Configuration
const API_CONFIG = {
  baseUrl: 'https://demoapi.bdlotteryticket.com',
  verificationEndpoint: '/api/v1/eps/payment-verification',
  token: 'y74VdLnmZoMCi+0EAkdRHwcdNnI3B/8+T9yuV0XQa3ZVBR5LU9lAUXewHmkBmLQ8X8eLzacw2/rEiKi/4OQ/uw==',
  merchantToken: 'U2FsdGVkX19enVsX0qbxzB8WOdKhJuGtqaYOe1oH4DQ='
};

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationData, setVerificationData] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState(null);

  const extractEPSTransactionId = () => {
    const query = window.location.search;
    const match = query.match(/EPSTransactionId.*?(\w{10,})/);
    if (match && match[1]) return match[1].trim();
    const fallback = searchParams.get("EPSTransactionId");
    return fallback?.trim() || "Not Provided";
  };

  // Generate PDF Receipt
  const downloadPDFReceipt = async (dataOverride = null) => {
    const ticketData = dataOverride || verificationData;
    if (!ticketData?.data?.tickets) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [100, 210]
    });

    const pageWidth = 210;
    const pageHeight = 100;

    // Orange diagonal stripe pattern background
    doc.setFillColor(207, 121, 84);
    for (let i = -50; i < pageWidth + 50; i += 8) {
      doc.setDrawColor(207, 121, 84);
      doc.setLineWidth(4);
      doc.line(i, 0, i + 50, pageHeight);
      
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(4);
      doc.line(i + 4, 0, i + 54, pageHeight);
    }

    // Main white content area with rounded corners
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 3, 3, 'F');

    // Left orange border accent
    doc.setFillColor(207, 121, 84);
    doc.rect(10, 10, 8, pageHeight - 20, 'F');

    // Header Section
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Bangladesh Thalassaemia Samity (BTS)', 25, 25);
    
    doc.setFontSize(24);
    doc.setTextColor(207, 121, 84);
    doc.setFont(undefined, 'bold');
    doc.text('Ticket', 25, 35);

    // Get merchant ID for later use
    const merchantId = searchParams.get('MerchantTransactionId') || 'N/A';

    // Drawing Information
    // doc.setFontSize(8);
    // doc.setTextColor(100, 100, 100);
    // const currentDate = new Date().toLocaleString('en-US', { 
    //   month: 'long', 
    //   day: 'numeric',
    //   year: 'numeric',
    //   hour: '2-digit',
    //   minute: '2-digit'
    // });
    // doc.text(`DRAWING ON ${currentDate.toUpperCase()}`, 25, 42);

    // Divider line
    doc.setDrawColor(207, 121, 84);
    doc.setLineWidth(0.5);
    doc.line(25, 45, pageWidth - 15, 45);

    // Transaction Details
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    
    doc.text('Merchant Transaction ID:', 25, 52);
    doc.setFont(undefined, 'bold');
    doc.text(merchantId, 70, 52);
    
    doc.setFont(undefined, 'normal');
    doc.text('EPS Transaction ID:', 25, 58);
    doc.setFont(undefined, 'bold');
    doc.text(extractEPSTransactionId(), 70, 58);

    // Status
    doc.setTextColor(34, 139, 34);
    doc.setFont(undefined, 'bold');
    doc.text(' Payment Verified', 25, 64);

    // Tickets Section
    doc.setFontSize(9);
    doc.setTextColor(207, 121, 84);
    doc.setFont(undefined, 'bold');
    doc.text('YOUR TICKET INFORMATION', 25, 72);

    // Get all tickets
    let yPos = 77;
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    
    ticketData.data.tickets.forEach((ticket, index) => {
      doc.setFont(undefined, 'bold');
      doc.text(`Ticket ${index + 1}:`, 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(ticket.ticket_no, 45, yPos);
      doc.text(`Mobile: ${ticket.mobile || 'Not Provided'}`, 80, yPos);
      yPos += 5;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'bold');
    doc.text('Thank you for your support!', pageWidth / 2, pageHeight - 12, { align: 'center' });
    
    // doc.setFontSize(9);
    // doc.setTextColor(0, 0, 0);
    // doc.text('09606549134', pageWidth / 2, pageHeight - 7, { align: 'center' });
    
    // doc.setFontSize(7);
    // doc.setTextColor(100, 100, 100);
    // doc.setFont(undefined, 'normal');
    // doc.text('support center', pageWidth / 2, pageHeight - 3, { align: 'center' });

    // Save PDF
    doc.save('lottery-ticket-receipt.pdf');
  };

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const status = searchParams.get("Status");
        const merchantTxnId = searchParams.get("MerchantTransactionId");
        const epsTxnId = extractEPSTransactionId();

        if (status !== "Success" || !merchantTxnId) {
          throw new Error("Invalid payment parameters");
        }

        const formData = new FormData();
        formData.append('token', API_CONFIG.token);
        formData.append('merchant_token', API_CONFIG.merchantToken);
        formData.append('merchant_transaction_id', merchantTxnId);
        formData.append('eps_transaction_id', epsTxnId);

        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.verificationEndpoint}`,
          {
            method: "POST",
            headers: { "Accept": "application/json" },
            body: formData
          }
        );

        if (!response.ok) {
          const errorMsg = await response.text();
          throw new Error(errorMsg || "Payment verification failed");
        }

        const data = await response.json();
        setVerificationData(data);
        setIsVerifying(false);

        // Auto-download PDF after 1.5 seconds for illiterate users
        setTimeout(() => {
          if (data?.data?.tickets) {
            downloadPDFReceipt(data);
          }
        }, 1500);

      } catch (err) {
        setVerificationError(err.message);
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  // Load jsPDF library
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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

  if (verificationError) {
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
          <div className="w-full max-w-lg bg-white/95 rounded-2xl shadow-2xl p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
            <p className="text-gray-600 my-4">{verificationError}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:opacity-90"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

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

          <div className="text-center mb-6">
            <img src={headerLogo} alt="Logo" className="w-20 sm:w-24 mx-auto mb-3" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Bangladesh Thalassaemia Samity (BTS)            </h1>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-green-600">Payment Successful! 🎉</h2>
            <p className="text-gray-600 mt-2 text-sm">
              Your lottery ticket purchase is confirmed.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <h3 className="font-semibold text-gray-800 text-center mb-2">Transaction Details</h3>
            <p className="text-sm">
              <strong>Merchant Txn ID:</strong> {searchParams.get('MerchantTransactionId')}
            </p>
            <p className="text-sm">
              <strong>EPS Txn ID:</strong> {extractEPSTransactionId()}
            </p>
            <p className="text-sm text-green-600">
              ✓ Verified Successfully
            </p>
          </div>

          {verificationData?.data?.tickets && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-3 text-center">
                Your Ticket Information
              </h3>
              {verificationData.data.tickets.map((ticket, index) => (
                <div key={index} className="bg-white p-3 rounded-lg mb-2 shadow-sm">
                  <p className="text-sm font-semibold">Ticket No: {ticket.ticket_no}</p>
                  <p className="text-xs text-gray-500">
                    Mobile: {ticket.mobile || "Not Provided"}
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
              onClick={downloadPDFReceipt}
              className="flex-1 bg-white border-2 border-orange-500 text-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-50"
            >
              📄 Download PDF Receipt
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            Support: support@bdlotteryticket.com
          </p>

        </div>
      </div>
    </div>
  );
};

export default Success;