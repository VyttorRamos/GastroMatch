const router = require("express").Router();
const controller = require("../controllers/favoriteController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, controller.mine);
router.post("/:recipeId", authenticate, controller.toggle);

module.exports = router;