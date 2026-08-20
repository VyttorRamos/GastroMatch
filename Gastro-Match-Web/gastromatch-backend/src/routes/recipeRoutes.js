const router = require("express").Router();
const controller = require("../controllers/recipeController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", authenticate, authorize("CHEF", "ADMIN"), controller.create);
router.put("/:id", authenticate, authorize("CHEF", "ADMIN"), controller.update);
router.delete("/:id", authenticate, authorize("CHEF", "ADMIN"), controller.remove);

module.exports = router;