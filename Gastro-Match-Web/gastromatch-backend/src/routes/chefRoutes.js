const router = require("express").Router();
const controller = require("../controllers/chefController");
const { authenticate } = require("../middleware/auth");

router.get("/", controller.list);
router.post("/", authenticate, controller.create);

module.exports = router;