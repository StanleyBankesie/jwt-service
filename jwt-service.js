const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 3000;

// ADD THIS ROOT ROUTE
app.get("/", (req, res) => {
  res.json({
    message: "JWT Token Generator Service",
    status: "running",
    endpoints: {
      health: "GET /health",
      generateToken: "POST /generate-token",
    },
    usage: {
      method: "POST",
      url: "/generate-token",
      body: {
        client_email:
          "firebase-adminsdk-fbsvc@doxa-church-notification-8b159.iam.gserviceaccount.com",
        private_key:
          "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCkai/9Cw5xPgyM\n3+ZFw9B03V+hu5K1MIyBrAc5oFJSGTE2E/nwGhCCLTuQz9zD1hvFcVDvLESGkCAu\nNx2Kz5ddCYcpQV8u1Zo8R05KaAG+h+5o/m50VZSs32i9chEyEwyciDZHz6dfjYGl\nc5KTNeNmRghf+Gdqps07VEoNi8WIUOi/4PUD35sPHKeO3zGPfPyO7oj6FOfuzGLW\naL9b3DKMIRe0GfTPZg4nJ4Xawhqa0ifdkRfFAtvjEFZujSlSlcRgmr8lK/d31Vqa\n14sPZ3HJT4qCyqcSc2KjhIQe7Vpc17+OswRnWyxtM2nx5gmg7/FyOMzJEw3BMWHn\n4xdhdI4FAgMBAAECggEAE2u0m+36qH81Ec3fwCVjYe6FPZAvweXIbwfAObsZhjeS\nE8pzxzv477uCkfYvpFVN5fpe3kWLGZ78IiFiBLPFNBjsRYACi4BxLcYZdhoHfLdH\nPtExAF5ch7gDAf+vjsvnvTSsvrpFUbjgE8hNS8S9hebnVdi8dIFb9DJeZe+450NA\nu1UnBWFX0DpAJX8wckwAxNrsxyZsnb8hZHi0v8GgB2KOLzxf17xB1fBi/b/K0/Ln\nxWRByhXlUVn9Ywm5PCmbONu4Ykrajl0Er4Dx1B1beTbIWA5VIcBW0orOEfKiJbCJ\nGGYe4Cc+JLly3+Zyba963JCNVMAHQepmawONJ/miiQKBgQDfJ1+SDf8dfHuRJhUo\n64malm6ltS8QUV59lEvGtMkqVxn3HosBYL7US+X/R5oOSPyMcgbNLyQKQcKGOC0t\nGLG/5Ijl7sFMIrn2jvs7i8YchO94fp29r9orErh8FTr9sFheeiTRrPjvgtXryiO4\nDrvK9zKVTc8WSFJJRUO3dDs1OQKBgQC8nXpbGNo+Arupwl80TQ/g1JJA5zi0sjJ0\n5IXglmUX1Qph4PahN7RtO1tr5lNK1ojz6aqtUeXh5oIpsqN4pV9DcSq7zhUfjGFf\nanXKyZMTwP1UtvoV87E7PYHLci6AiyyFrqcS7kyRSyxjskTIqrg2UcXXiV/T26lj\ncQcGlpjLLQKBgCc0iavlXZ7WkfcMU8deqkxIhaQDUwNw6ELz3ORKOtV/fAZYjV9u\nmdg+hWf2MnC0Dfq2xc8iqxhKOVzPXdCAeCoYgpyy967iov1YXXc2tVWpXVE0HY6H\n6LKMlXDnYffUFZJzryhPVWTu/ZpxZxkdLY0ZJP/qLanihuJsktsWRpixAoGAQFTy\nE7oxTe8+tNMQB9W08blvPOXgiHkzDn2XUBfb2ToXtXS2ihxm1M7nCrFffWoZAiCT\nz1PctaUahkBg01iMWoNx0Oake8M0vwefr4/7M0Si408Zk30v2QXMjGighcVyZRJB\n+AoBYZkjRcna/hqEhDp14WMApVEJwFofzFZ3PO0CgYEAob8gonq4GA5BtXHzsMb7\nsXFyRDJZYf8qOWnCCx8SY42dJrpf9W0sQ9rkM6px2/vE5dtcQYnEOd7u68VeazZS\nCpFZxN+FN9ohY+HrcGC6Q2jmEu4g3Pd8D//Eb5F+kmP454bcWzusZomZ5JqhVf9f\npEywC+9o1DouHA6UGheW4S0=\n-----END PRIVATE KEY-----\n",
        token_uri: "https://oauth2.googleapis.com/token",
      },
    },
  });
});

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
