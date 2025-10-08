const { psdSave,deletePSDMedia } = require("../services/psdService");

//either send existing doc, or new doc , or don't compress video if it's less than 100mb send null
const psdCTRL = {
  psdSave: (req, res) => {
    /*let rawData = Buffer.alloc(0);

    req.on("data", (chunk) => {
      rawData = Buffer.concat([rawData, chunk]);
    });

    req.on("end", () => {
      // Extract JSON data from the first 2000 bytes
      const msg = psdSave(
        rawData,
        req.query.id,
        req.query.companyId,
        req.query.userId
      );
      res.status(200).send(msg);
    });*/
console.log(req.query,req.body);
      const msg = psdSave(
        req.body,
        req.query.id,
        req.query.companyId,
        req.query.userId
      );
      res.status(200).send(msg);
  },
  psdDelete:async (req,res)=>{
    console.log("Deleting PSD");
    const {msg,status}=await deletePSDMedia(req.body.companyId,req.body.userId,req.body.mediaId);
    return res.status(status).send(msg);
  }
};

module.exports = psdCTRL;
