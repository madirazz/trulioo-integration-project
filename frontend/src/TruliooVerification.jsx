import { useState, useEffect } from "react";
import { Trulioo, event } from "@trulioo/docv";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TRULIOO_HOST = import.meta.env.VITE_TRULIOO_HOST;

const TruliooVerification = () => {
  const [message, setMessage] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shortCodeParam = urlParams.get("code");

    if (shortCodeParam) {
      setShortCode(shortCodeParam);
      // Initialize SDK for callbacks when redirected back
      initializeTruliooSDK(shortCodeParam);
    }
  }, []);

  const fetchTransaction = async () => {
    const response = await fetch(`${API_BASE_URL}/create-transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    
    if (data.success && data.transactionId) {
      setTransactionId(data.transactionId);
    }
    
    return data;
  };

  const fetchShortCode = async () => {
    const response = await fetch(`${API_BASE_URL}/generate-shortcode`);
    return response.json();
  };

  const handleStartVerification = async () => {
    setIsLoading(true);
    setMessage("");
    
    try {
      // Create transaction
      const transactionData = await fetchTransaction();
      if (!transactionData.success) throw new Error(transactionData.error);
      
      console.log(`Transaction created with ID: ${transactionData.transactionId}`);
      
      // Generate shortcode
      const shortCodeData = await fetchShortCode();
      if (!shortCodeData.success) throw new Error(shortCodeData.error);

      console.log(`Shortcode generated: ${shortCodeData.shortCode}`);
      setShortCode(shortCodeData.shortCode);
      
      // Open in new tab
      openVerificationInNewTab(shortCodeData.shortCode);
    } catch (error) {
      console.error("Error during verification setup:", error);
      setMessage(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };
  
  const openVerificationInNewTab = (code) => {
    const truliooUrl = `https://app.verification.trulioo.com/?locale=en-US&code=${code}`;
    console.log("Opening verification at:", truliooUrl);
    window.open(truliooUrl, '_blank');
    setMessage("Verification opened in a new tab. This page will update when complete.");
  };
  
  const initializeTruliooSDK = (code) => {
    const workflowOption = Trulioo.workflow()
      .setShortCode(code)
      .setRedirectUrl(TRULIOO_HOST);

    const callbacks = new event.adapters.ListenerCallback({
      onComplete: (success) => {
        console.info(`Verification Successful: ${success.transactionId}`);
        setMessage(
          `Verification completed successfully. Transaction ID: ${success.transactionId}`
        );
        setIsLoading(false);
      },
      onError: (error) => {
        console.error(
          `Verification Failed with Error Code: ${error.code}, TransactionID: ${error.transactionId}, Reason: ${error.message}`
        );
        setMessage(`Verification Failed: ${error.message}`);
        setIsLoading(false);
      },
      onException: (exception) => {
        console.error("Verification Failed with Exception:", exception);
        setMessage(`Verification Exception: ${exception}`);
        setIsLoading(false);
      },
    });

    const callbackOption = Trulioo.event().setCallbacks(callbacks);

    Trulioo.initialize(workflowOption)
      .then(() => {
        console.info("Trulioo SDK Initialization complete");
        return Trulioo.launch("trulioo-sdk", callbackOption);
      })
      .catch((error) => {
        console.error("Trulioo SDK Initialization Error:", error);
        setMessage(`Initialization Error: ${error.message}`);
        setIsLoading(false);
      });
  };

  return (
    <div className="container">
      <h1 className="mb-4">Trulioo Document Verification</h1>
      
      <div className="row mb-4">
        <div className="col">
          <button 
            className="btn btn-primary" 
            onClick={handleStartVerification} 
            disabled={isLoading}
          >
            {isLoading ? "Setting up..." : "Start Verification"}
          </button>
          
          {shortCode && (
            <button 
              className="btn btn-secondary ms-2" 
              onClick={() => openVerificationInNewTab(shortCode)}
            >
              Reopen Verification
            </button>
          )}
        </div>
      </div>
      
      <div id="trulioo-sdk" style={{ display: 'none' }}></div>
      
      {transactionId && (
        <div className="alert alert-info">
          Transaction ID: {transactionId}
        </div>
      )}
      
      {message && (
        <div className="alert alert-secondary">
          <p>{message}</p>
        </div>
      )}
      
      <div className="card mt-4">
        <div className="card-header">
          <h5>Implementation Notes</h5>
        </div>
        <div className="card-body">
          <p>This implementation includes both client-side callbacks and server-side webhooks:</p>
          <ul>
            <li>Client callbacks provide immediate feedback for users during the verification process</li>
            <li>Server webhooks allow your backend to receive verification results even if the user closes the browser</li>
            <li>The verification opens in a new tab for a better user experience</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TruliooVerification;