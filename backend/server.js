import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

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

app.post("/create-transaction", ensureAccessToken, async (req, res) => {
  try {
    const transactionData = {
      documentVerification: {
        enabled: true,
        documentsAccepted: [
          {
            documentType: "DRIVERS_LICENSE",
            documentOrigin: [{ countryCode: "US" }, { countryCode: "CA" }],
          },
          {
            documentType: "PASSPORT",
            documentOrigin: [{ countryCode: "US" }, { countryCode: "CA" }],
          },
        ],
      },
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

    res.json({ success: true, transactionId: response.data.transactionId });
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
