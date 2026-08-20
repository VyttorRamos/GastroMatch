const router = require("express").Router();
const controller = require("../controllers/categoryController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", controller.list);
router.post("/", authenticate, authorize("ADMIN"), controller.create);

module.exports = router;