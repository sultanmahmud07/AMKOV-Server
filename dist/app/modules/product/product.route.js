"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoutes = void 0;
const express_1 = __importDefault(require("express"));
const multer_config_1 = require("../../config/multer.config");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_interface_1 = require("../user/user.interface");
const product_controller_1 = require("./product.controller");
const product_validation_1 = require("./product.validation");
const router = express_1.default.Router();
router.get("/", product_controller_1.ProductController.getAllProducts);
router.get("/short-info", product_controller_1.ProductController.getProductShortInfo);
router.get("/relative", product_controller_1.ProductController.getRelativeProducts);
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), multer_config_1.multerUpload.fields([
    { name: "images", maxCount: 10 },
    { name: "featureImages", maxCount: 10 },
    { name: "video", maxCount: 1 }
]), (0, validateRequest_1.validateRequest)(product_validation_1.createProductZodSchema), product_controller_1.ProductController.createProduct);
router.get("/:slug", product_controller_1.ProductController.getSingleProduct);
router.patch("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), multer_config_1.multerUpload.fields([
    { name: "images", maxCount: 10 },
    { name: "featureImages", maxCount: 10 },
    { name: "video", maxCount: 1 }
]), (0, validateRequest_1.validateRequest)(product_validation_1.updateProductZodSchema), product_controller_1.ProductController.updateProduct);
router.delete("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), product_controller_1.ProductController.deleteProduct);
exports.ProductRoutes = router;
