// Your JWT service code (the code you provided)
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 3000;

app.post("/generate-token", async (req, res) => {
  try {
    const { client_email, private_key, token_uri } = req.body;
    if (!client_email || !private_key || !token_uri) {
      return res.status(400).json({
        error: "Missing required fields: client_email, private_key, token_uri",
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const expires = now + 3600;
    const jwtToken = jwt.sign(
      {
        iss: client_email,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
        aud: token_uri,
        iat: now,
        exp: expires,
      },
      private_key,
      { algorithm: "RS256" }
    );

    const tokenResponse = await fetch(token_uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwtToken}`,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return res.status(tokenResponse.status).json({
        error: "Failed to get access token",
        details: errorText,
      });
    }

    const tokenData = await tokenResponse.json();
    res.json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      expires_at: new Date(
        Date.now() + tokenData.expires_in * 1000
      ).toISOString(),
    });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "JWT Token Generator" });
});

app.listen(PORT, () => {
  console.log(`JWT Token Service running on port ${PORT}`);
});
```

### **.gitignore** (optional but recommended)
```;
