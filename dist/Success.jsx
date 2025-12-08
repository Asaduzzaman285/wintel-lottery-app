import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import headerLogo from '../assets/headerlogo_1.png';
import bgImage from '../assets/wintel-lottery-bg-3.png';
import { Headset,Copyright,Clock } from 'lucide-react';
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

  const downloadPDFReceipt = async (dataOverride = null) => {
    const ticketData = dataOverride || verificationData;
    if (!ticketData?.data?.tickets) return;
  
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [100, 210],
    });
  
    const pageWidth = 210;
    const pageHeight = 100;
  
    // Simple white background (no diagonal stripes)
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
    // Optional: Add a subtle border (remove if you want completely plain)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
    // ✅ Header Logo - LEFT ALIGNED
    try {
      const imgWidth = 35;
      const imgHeight = 18;
      doc.addImage(headerLogo, 'PNG', 15, 15, imgWidth, imgHeight);
    } catch (err) {
      console.warn("Header logo not loaded:", err);
    }
  
    // Header Text - LEFT ALIGNED next to logo
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(128, 0, 128); // purple
    doc.text('Bangladesh Thalassaemia Samity (BTS)', 53, 22);
  
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(2, 107, 57); // green
    doc.text('Lottery 2025 (Govt. Approved)', 53, 28);
  
    // Current Time Block
    const now = new Date();
    const formattedTime = now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${formattedTime}`, 15, 38);
  
    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(15, 41, pageWidth - 15, 41);
  
    // Merchant / EPS Data
    const merchantId = searchParams.get('MerchantTransactionId') || 'N/A';
  
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'normal');
    doc.text('Merchant Transaction ID:', 15, 46);
    doc.setFont(undefined, 'bold');
    doc.text(merchantId, 65, 46);
  
    doc.setFont(undefined, 'normal');
    doc.text('EPS Transaction ID:', 15, 51);
    doc.setFont(undefined, 'bold');
    doc.text(extractEPSTransactionId(), 65, 51);
  
    // Payment Status
    doc.setTextColor(34, 139, 34);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Verified', 15, 56);
  
    // Ticket Section Header
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('YOUR TICKET INFORMATION', 15, 62);
  
    // Divider below header
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(15, 64, pageWidth - 15, 64);
  
    // Ticket List
    let yPos = 69;
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
  
    ticketData.data.tickets.forEach((ticket, index) => {
      if (yPos > pageHeight - 15) return;
      
      doc.setFont(undefined, 'bold');
      doc.text(`Ticket ${index + 1}:`, 15, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(ticket.ticket_no, 35, yPos);
      doc.text(`Mobile: ${ticket.mobile || 'Not Provided'}`, 85, yPos);
      yPos += 5;
    });
  

  
    // Save File
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
  
        // ✅ Read JSON only once
        const result = await response.json().catch(() => null);
  
        // ✅ Refresh case → 422 OR message
        if (response.status === 422 || result?.message?.[0] === "Verification already done!") {
          navigate('/');
          return; // stop execution
        }
  
        // ❌ Other errors
        if (!response.ok) {
          const errorMsg = result?.message?.[0] || "Payment verification failed";
          throw new Error(errorMsg);
        }
  
        // ✅ Success
        setVerificationData(result);
        setIsVerifying(false);
  
        // Auto PDF download
        setTimeout(() => {
          if (result?.data?.tickets) {
            downloadPDFReceipt(result);
          }
        }, 500);
  
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
              <strong>Merchant Txn ID:</strong> {searchParams.get('MerchantTransactionId')}
            </p>
            {/* <p className="text-sm">
              <strong>EPS Txn ID:</strong> {extractEPSTransactionId()}
            </p> */}
            <p className="text-sm text-green-600">
              ✓ Payment Verified Successfully
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
          <div className=" mt-3 flex items-end gap-1 justify-end text-center leading-none">

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
          <div className="mt-0 flex items-center justify-end gap-1 " style={{marginBottom:'-5px'}}>
            <Clock className="w-2.5 h-2.5 text-blue-600" />
                <span className="text-[9px] font-small text-gray-800">
                  Sunday to Thursday (10 AM to 6 PM) 
                </span>
              </div>

          {/* Copyright */}
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
};

export default Success;