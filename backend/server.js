import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import WebhookHandler from './services/WebhookHandler.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const LICENSE_KEY = process.env.LICENSE_KEY;
let accessToken = null;
let tokenExpiryTime = null;

app.use(cors());
app.use(express.json());

const getAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://verification.trulioo.com/authorize/customer",
      { consent: true },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "2.5",
          Authorization: `Bearer ${LICENSE_KEY}`,
        },
      }
    );
    accessToken = response.data.accessToken;
    const expiresIn = response.data.expiresIn;
    tokenExpiryTime = Date.now() + expiresIn * 1000;
  } catch (error) {
    console.error(
      "Error obtaining access token:",
      error.response?.data || error
    );
    throw new Error("Failed to obtain access token");
  }
};

const isTokenExpired = () => {
  return !accessToken || Date.now() >= tokenExpiryTime;
};

const ensureAccessToken = async (req, res, next) => {
  try {
    if (isTokenExpired()) {
      console.log("Token expired or missing, fetching a new one");
      await getAccessToken();
    } else {
      console.log("Using cached access token");
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to obtain access token" });
  }

  next();
};

app.get("/get-access-token", ensureAccessToken, (req, res) => {
  res.json({ success: true });
});


// Update your existing create-transaction endpoint in server.js

app.post("/create-transaction", ensureAccessToken, async (req, res) => {
  try {
    // Define the base URL for webhooks (adjust based on your hosting environment)
    const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || "https://your-domain.com";
    
    // Create the transaction data with webhook configuration
    const transactionData = {
      "documentVerification": {
        "enabled": true,
        "documentsAccepted": [
          {
            "documentType": "DRIVERS_LICENSE",
            "documentOrigin": [
              {
                "countryCode": "US",
                "jurisdictions": [
                  {
                    "jurisdictionCode": "CO",
                    "years": []
                  }
                ]
              }
            ]
          }
        ],
        "acceptFrontImageOnly": false
      },
      "selfieVerification": {
        "enabled": true
      },
      "documentLivenessOptions": {
        "skipScreenUsed": false,
        "skipPrintout": false,
        "skipPortraitSubstitution": false,
        "skipAlreadyCropped": false
      },
      "matcherConfigs": [
        {
          "matchers": [
            {
              "token": "FIRST_NAME",
              "precision": "HIGH_PARTIAL_MATCH"
            },
            {
              "token": "LAST_NAME",
              "precision": "EXACT_MATCH"
            }
          ],
          "active": true
        },
        {
          "matchers": [
            {
              "token": "MIDDLE_NAME",
              "precision": "HIGH_PARTIAL_MATCH"
            }
          ],
          "active": false
        }
      ],
      "subjectInfo": {
        "firstName": "John",
        "middleName": "Smith",
        "lastName": "Doe",
        "fullName": "John Smith Doe",
        "dateOfBirth": "YYYY-MM-DD",
        "addressLine1": "123 Main Street",
        "stateProvince": "BC",
        "city": "Vancouver",
        "postalCode": "V5V 0A0",
        "country": "CA"
      },
      // Add webhook configuration
      "webhook": {
        "url": `${webhookBaseUrl}/webhook`,
        "headers": {
          "Content-Type": "application/json"
        },
        "events": [
          "TransactionCompleted",
          "TransactionFailed",
          "TransactionCancelled"
        ]
      }
    };

    const response = await axios.post(
      "https://verification.trulioo.com/customer/transactions",
      transactionData,
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "2.5",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Make sure to explicitly include the transaction ID in the response
    const transactionId = response.data.transactionId;
    console.log(`Created transaction with ID: ${transactionId}`);
    res.json({ 
      success: true, 
      transactionId: transactionId 
    });
  } catch (error) {
    console.error("Error creating transaction:", error.response?.data || error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create transaction" });
  }
});

app.post("/create-transaction", ensureAccessToken, async (req, res) => {
  try {
    // Define the base URL for webhooks (adjust based on your hosting environment)
    const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || "https://your-domain.com";
    
    // Create the transaction data with webhook configuration
    const transactionData = {
      "documentVerification": {
        "enabled": true,
        "documentsAccepted": [
          {
            "documentType": "DRIVERS_LICENSE",
            "documentOrigin": [
              {
                "countryCode": "US",
                "jurisdictions": [
                  {
                    "jurisdictionCode": "CO",
                    "years": []
                  }
                ]
              }
            ]
          }
        ],
        "acceptFrontImageOnly": false
      },
      "selfieVerification": {
        "enabled": true
      },
      "documentLivenessOptions": {
        "skipScreenUsed": false,
        "skipPrintout": false,
        "skipPortraitSubstitution": false,
        "skipAlreadyCropped": false
      },
      "matcherConfigs": [
        {
          "matchers": [
            {
              "token": "FIRST_NAME",
              "precision": "HIGH_PARTIAL_MATCH"
            },
            {
              "token": "LAST_NAME",
              "precision": "EXACT_MATCH"
            }
          ],
          "active": true
        },
        {
          "matchers": [
            {
              "token": "MIDDLE_NAME",
              "precision": "HIGH_PARTIAL_MATCH"
            }
          ],
          "active": false
        }
      ],
      "subjectInfo": {
        "firstName": "John",
        "middleName": "Smith",
        "lastName": "Doe",
        "fullName": "John Smith Doe",
        "dateOfBirth": "YYYY-MM-DD",
        "addressLine1": "123 Main Street",
        "stateProvince": "BC",
        "city": "Vancouver",
        "postalCode": "V5V 0A0",
        "country": "CA"
      },
      // Add webhook configuration
      "webhook": {
        "url": `${webhookBaseUrl}/webhook`,
        "headers": {
          "Content-Type": "application/json"
        },
        "events": [
          "TransactionCompleted",
          "TransactionFailed",
          "TransactionCancelled"
        ]
      }
    };

    const response = await axios.post(
      "https://verification.trulioo.com/customer/transactions",
      transactionData,
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "2.5",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Make sure to explicitly include the transaction ID in the response
    const transactionId = response.data.transactionId;
    console.log(`Created transaction with ID: ${transactionId}`);
    res.json({ 
      success: true, 
      transactionId: transactionId 
    });
  } catch (error) {
    console.error("Error creating transaction:", error.response?.data || error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create transaction" });
  }
});


app.get("/generate-shortcode", ensureAccessToken, async (req, res) => {
  try {
    const response = await axios.post(
      "https://verification.trulioo.com/customer/handoff",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "2.5",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const shortCode = response.data.shortCode;

    res.json({ success: true, shortCode });
  } catch (error) {
    console.error("Error generating shortCode:", error.response?.data || error);
    res
      .status(500)
      .json({ success: false, error: "Failed to generate shortCode" });
  }
});

// Webhook endpoint for Trulioo
app.post("/webhook", express.json(), async (req, res) => {
  try {
    // Extract the webhook data
    const webhookData = req.body;
    
    // Log the received webhook data
    console.log("Received webhook data:", JSON.stringify(webhookData, null, 2));
    
    // Process the webhook based on the event type
    switch (webhookData.event) {
      case "TransactionCompleted":
        console.log(`Transaction completed: ${webhookData.transactionId}`);
        // Here you could update your database with the transaction results
        break;
      
      case "TransactionFailed":
        console.log(`Transaction failed: ${webhookData.transactionId}`);
        // Handle failure case
        break;
        
      case "TransactionCancelled":
        console.log(`Transaction cancelled: ${webhookData.transactionId}`);
        // Handle cancellation
        break;
        
      default:
        console.log(`Unhandled webhook event type: ${webhookData.event}`);
    }
    
    // Respond with 200 OK to acknowledge receipt of the webhook
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ success: false, error: "Failed to process webhook" });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});