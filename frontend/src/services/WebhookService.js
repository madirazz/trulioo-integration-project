// frontend/src/services/WebhookService.js

/**
 * This service handles the webhook-related functionality for Trulioo verification
 * It provides methods for configuring, checking, and handling webhook events
 */

class WebhookService {
    /**
     * Creates a webhook configuration for Trulioo transaction
     * @param {string} baseUrl - The base URL for the webhook (e.g., https://your-domain.com)
     * @returns {Object} A webhook configuration object to include in transaction requests
     */
    static createWebhookConfig(baseUrl) {
      return {
        url: `${baseUrl}/webhook`,
        headers: {
          "Content-Type": "application/json"
        },
        events: [
          "TransactionCompleted",
          "TransactionFailed",
          "TransactionCancelled"
        ]
      };
    }
  
    /**
     * Formats transaction data with webhook configuration
     * @param {Object} transactionData - The base transaction data
     * @param {string} webhookBaseUrl - The base URL for the webhook
     * @returns {Object} Transaction data with webhook configuration
     */
    static formatTransactionWithWebhook(transactionData, webhookBaseUrl) {
      return {
        ...transactionData,
        webhook: this.createWebhookConfig(webhookBaseUrl)
      };
    }
  
    /**
     * Handles incoming webhook data (for future WebSocket implementation)
     * @param {Object} webhookData - The data received from the webhook
     * @returns {Object} Processed webhook result
     */
    static processWebhookData(webhookData) {
      // Extract relevant information from the webhook data
      const { event, transactionId, data } = webhookData;
      
      let status, message;
      
      switch (event) {
        case "TransactionCompleted":
          // Determine if verification was successful based on data
          const isDocumentApproved = 
            data?.documentVerification?.status === "APPROVED";
          const isSelfieApproved = 
            data?.selfieVerification?.status === "APPROVED";
          
          if (isDocumentApproved && isSelfieApproved) {
            status = "completed";
            message = "Verification completed successfully";
          } else {
            status = "failed";
            message = "Verification was not approved";
          }
          break;
          
        case "TransactionFailed":
          status = "failed";
          message = data?.error?.message || "Verification failed";
          break;
          
        case "TransactionCancelled":
          status = "cancelled";
          message = "Verification was cancelled";
          break;
          
        default:
          status = "unknown";
          message = `Unhandled webhook event: ${event}`;
      }
      
      return {
        status,
        message,
        transactionId,
        receivedAt: new Date().toISOString(),
        rawData: webhookData
      };
    }
  }
  
  export default WebhookService;