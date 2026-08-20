const router = require("express").Router();
const controller = require("../controllers/reviewController");
const { authenticate } = require("../middleware/auth");

router.get("/recipe/:recipeId", controller.list);
router.post("/recipe/:recipeId", authenticate, controller.createOrUpdate);

module.exports = router;