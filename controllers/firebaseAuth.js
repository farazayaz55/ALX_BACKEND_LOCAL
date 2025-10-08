const Tokens = require("../models/tokens");
const config = require("../config/config");

require("dotenv").config();

const firebaseAuthenticate = async (req, res) => {
  console.log(" POST authentication");
  const id = req.headers.authorization?.split("Bearer ")[1];

  const templateId = req.body.templateId;
  console.log(id);
  if (!id) {
    console.log("No token provided");
    return res.status(403).send("Unauthorized access");
  } else {
    const doc = new Tokens({
      templateId: templateId,
      userId: id,
    });
    console.log(doc);
    await doc.save();
    return res.status(200).send(`${config.SERVER_URL}/?templateId=${templateId}`);
    // req.url='/next'
  }
};

module.exports = {
  firebaseAuthenticate,
};
