const router = require("express").Router();
const psdCtrl = require("../controllers/psdController");

router.post("/psdCREATE", psdCtrl.psdSave);
router.post("/psdDelete",psdCtrl.psdDelete);

module.exports = router;
