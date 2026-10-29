const router = require("express").Router();
const controller = require("./../controllers/chefController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", controller.list);
router.post("/", authenticate, controller.create);
router.post("/apply", controller.apply);
router.get("/admin/applications", authenticate, authorize("ADMIN"), controller.listAllForAdmin);
router.patch("/admin/:id/status", authenticate, authorize("ADMIN"), controller.updateStatus);

module.exports = router;
