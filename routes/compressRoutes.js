const router = require("express").Router();
const compressionCtrl = require("../controllers/compressionController");

router.post("/getCompressedURL", compressionCtrl.getURL);
router.post("/getInfo", compressionCtrl.getInfo);
router.post("/delete", compressionCtrl.delete);

module.exports = router;
