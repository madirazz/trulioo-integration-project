import { useState, useEffect } from "react";
import { Trulioo, event } from "@trulioo/docv";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TRULIOO_HOST = import.meta.env.VITE_TRULIOO_HOST;

const TruliooVerification = () => {
  const [message, setMessage] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    const urlParams = new URLSearchParams(window.location.search);
    const shortCodeParam = urlParams.get("code");

    if (shortCodeParam) {
      setShortCode(shortCodeParam);
      startVerification(shortCodeParam);
    }
  }, []);

  const fetchTransaction = async () => {
    const response = await fetch(`${API_BASE_URL}/create-transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  };

  const fetchShortCode = async () => {
    const response = await fetch(`${API_BASE_URL}/generate-shortcode`);
    return response.json();
  };

  const handleStartVerification = async () => {
    setIsLoading(true);
    setMessage(""); 
    try {
      const transactionData = await fetchTransaction();
      if (!transactionData.success) throw new Error(transactionData.error);

      console.log(
        "Transaction created successfully:",
        transactionData.transactionId
      );

      const shortCodeData = await fetchShortCode();
      if (!shortCodeData.success) throw new Error(shortCodeData.error);

      setShortCode(shortCodeData.shortCode); 
      console.log("Obtained shortCode:", shortCodeData.shortCode);
    } catch (error) {
      console.error("Error during verification setup:", error);
      setMessage(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (shortCode) {
      startVerification(shortCode); 
    }
  }, [shortCode]);

  const startVerification = (fetchedShortCode) => {
    const host = `${TRULIOO_HOST}`; 

    const workflowOption = Trulioo.workflow()
      .setShortCode(fetchedShortCode)
      .setRedirectUrl(host);

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
      .then(() => {
        console.info("Trulioo SDK Launch successful");
      })
      .catch((error) => {
        console.error("Trulioo SDK Initialization Error:", error);
        setMessage(`Initialization Error: ${error.message}`);
        setIsLoading(false);
      });
  };

  return (
    <div>
      <h1>Trulioo Document Verification</h1>
      <button onClick={handleStartVerification} disabled={isLoading}>
        {isLoading ? "Setting up..." : "Start Verification"}
      </button>
      <div id="trulioo-sdk"></div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TruliooVerification;
