const router = require("express").Router();
const canvasCtrl = require("../controllers/canvasController");

router.post("/", canvasCtrl.saveData);
router.post('/changeFileName',canvasCtrl.changeTemplateName);

module.exports = router;
