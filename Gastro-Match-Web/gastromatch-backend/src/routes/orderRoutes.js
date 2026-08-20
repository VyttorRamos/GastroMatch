const router = require("express").Router();
const controller = require("../controllers/orderController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, controller.mine);
router.post("/", authenticate, controller.create);

module.exports = router;