const { renderHomePage, verifyDocuments } = require("../controllers/dashboard");
const router = require("express").Router();

router.get("/", renderHomePage);
router.post("/verify-documents", verifyDocuments);

module.exports = router;
