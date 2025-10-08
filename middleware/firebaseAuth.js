const admin = require("../firebase-admin");
const Tokens = require("../models/tokens");
const express = require("express");

// Middleware function
const firebaseAuth = async (req, res, next) => {
  const idToken = req.query.token;

  if (!req.query.templateId) {
    return res.status(403).send("Unauthorized access"); // Send error response and prevent calling next()
  }
  console.log("Checking authentication", req.query.templateId);

  const tokenDoc = await Tokens.findOne({
    templateId: req.query.templateId,
  });
  if (!tokenDoc) {
    console.log("No token provided");
    return res.status(403).send("Unauthorized access");
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
        console.log("dec",decodedToken)
      if (
        tokenDoc.userId == decodedToken.uid ||
        decodedToken.role == "Super Admin"
      )
        next(); // Proceed to the next middleware or route handler
      else {
        console.error("Error verifying token:", error);
        return res.status(403).send("Unauthorized access");
      }
    })
    .catch((error) => {
      console.error("Error verifying token:", error);
      return res.status(403).send("Unauthorized access"); // Send error response and prevent calling next()
    });
};

module.exports = {
  firebaseAuth,
};
