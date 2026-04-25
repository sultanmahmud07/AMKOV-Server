import express from "express";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { ProductController } from "./product.controller";
import {
    createProductZodSchema,
    updateProductZodSchema
} from "./product.validation";

const router = express.Router();
router.get("/", ProductController.getAllProducts);
router.get("/short-info", ProductController.getProductShortInfo);
router.get("/relative", ProductController.getRelativeProducts);

router.post(
    "/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.fields([
        { name: "images", maxCount: 100 },
        { name: "featureImages", maxCount: 100 },
        { name: "video", maxCount: 1 }
    ]),
    validateRequest(createProductZodSchema),
    ProductController.createProduct
);
// router.patch("/fix-order", ProductController.fixOrderDefaults);
router.get(
    "/:slug",
    ProductController.getSingleProduct
);
router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.fields([
        { name: "images", maxCount: 100 },
        { name: "featureImages", maxCount: 100 },
        { name: "video", maxCount: 1 }
    ]),
    validateRequest(updateProductZodSchema),
    ProductController.updateProduct
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ProductController.deleteProduct);




export const ProductRoutes = router