const router = require("express").Router();
const controller = require("../controllers/orderController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, controller.mine);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.post("/:id/confirm-payment", controller.confirmPayment);

module.exports = router;