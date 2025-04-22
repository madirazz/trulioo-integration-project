// frontend/src/services/VerificationService.js

/**
 * Service for handling Trulioo verification functionality
 */
class VerificationService {
    constructor(apiBaseUrl) {
      this.apiBaseUrl = apiBaseUrl;
    }
    
    /**
     * Create a new transaction with Trulioo
     * @returns {Promise<Object>} Transaction data with ID
     */
    async createTransaction() {
      try {
        const response = await fetch(`${this.apiBaseUrl}/create-transaction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to create transaction');
        }
        
        return data;
      } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
      }
    }
    
    /**
     * Generate a shortcode for verification
     * @returns {Promise<Object>} Shortcode data
     */
    async generateShortCode() {
      try {
        const response = await fetch(`${this.apiBaseUrl}/generate-shortcode`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to generate shortcode');
        }
        
        return data;
      } catch (error) {
        console.error('Error generating shortcode:', error);
        throw error;
      }
    }
    
    /**
     * Open Trulioo verification in a new tab
     * @param {string} shortCode - The shortcode for the verification
     * @param {string} redirectUrl - The URL to redirect to after verification
     * @returns {Window} The new window/tab reference
     */
    openVerificationInNewTab(shortCode, redirectUrl) {
      // Make sure both shortCode and redirectUrl are properly defined
      if (!shortCode || !redirectUrl) {
        console.error('Missing required parameters for verification URL');
        throw new Error('Invalid verification parameters');
      }
      
      // Ensure redirectUrl is properly encoded
      const encodedRedirectUrl = encodeURIComponent(redirectUrl);
      
      // Construct the Trulioo verification URL with proper formatting
      const truliooUrl = `https://app.verification.trulioo.com/?locale=en-US&code=${code}`;
      
      console.log('Opening verification URL:', truliooUrl);
      
      // Open in new tab
      return window.open(truliooUrl, '_blank');
    }
    
    /**
     * Initialize Trulioo SDK for handling redirects back to the application
     * @param {string} shortCode - The shortcode for the verification
     * @param {string} redirectUrl - The URL to redirect to after verification
     * @param {Object} callbacks - The callback functions for verification events
     * @returns {Promise<void>}
     */
    async initializeTruliooSDK(shortCode, redirectUrl, callbacks) {
      try {
        // Import Trulioo SDK dynamically to ensure it's only loaded when needed
        const { Trulioo, event } = await import('@trulioo/docv');
        
        const workflowOption = Trulioo.workflow()
          .setShortCode(shortCode)
          .setRedirectUrl(redirectUrl);
        
        // Create callback option from provided callbacks
        const listenerCallback = new event.adapters.ListenerCallback({
          onComplete: callbacks.onComplete || (() => {}),
          onError: callbacks.onError || (() => {}),
          onException: callbacks.onException || (() => {})
        });
        
        const callbackOption = Trulioo.event().setCallbacks(listenerCallback);
        
        // Initialize the Trulioo SDK
        await Trulioo.initialize(workflowOption);
        
        // We don't automatically launch the SDK in this method since
        // we're handling verification in a new tab
        return {
          Trulioo,
          callbackOption
        };
      } catch (error) {
        console.error('Error initializing Trulioo SDK:', error);
        throw error;
      }
    }
  }
  
  export default VerificationService;