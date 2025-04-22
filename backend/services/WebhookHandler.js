class WebhookHandler {
  static processWebhook(webhookData) {
    const { event, transactionId, data } = webhookData;
    console.log(`Processing webhook event: ${event} for transaction: ${transactionId}`);
    switch (event) {
      case "TransactionCompleted":
        return this.handleTransactionCompleted(transactionId, data);
      case "TransactionFailed":
        return this.handleTransactionFailed(transactionId, data);
      case "TransactionCancelled":
        return this.handleTransactionCancelled(transactionId, data);
      default:
        console.warn(`Unhandled webhook event type: ${event}`);
        return {
          success: false,
          message: `Unhandled webhook event: ${event}`,
          transactionId,
        };
    }
  }

  static handleTransactionCompleted(transactionId, data) {
    console.log(`Transaction ${transactionId} completed`);
    const documentStatus = data?.documentVerification?.status;
    const selfieStatus = data?.selfieVerification?.status;
    const isSuccessful = documentStatus === "APPROVED" && selfieStatus === "APPROVED";
    return {
      success: true,
      message: isSuccessful
        ? "Verification completed successfully"
        : "Verification completed but not approved",
      transactionId,
      status: isSuccessful ? "approved" : "rejected",
      documentStatus,
      selfieStatus,
      timestamp: new Date().toISOString(),
    };
  }

  static handleTransactionFailed(transactionId, data) {
    console.error(`Transaction ${transactionId} failed:`, data?.error?.message || "Unknown error");
    return {
      success: false,
      message: "Verification failed",
      transactionId,
      status: "failed",
      error: data?.error || { message: "Unknown error" },
      timestamp: new Date().toISOString(),
    };
  }

  static handleTransactionCancelled(transactionId, data) {
    console.log(`Transaction ${transactionId} cancelled`);
    return {
      success: true,
      message: "Verification cancelled by user",
      transactionId,
      status: "cancelled",
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = WebhookHandler;