const { renderHomePage } = require("../controllers/dashboard");
const router = require("express").Router();

router.get("/", renderHomePage);

module.exports = router;
