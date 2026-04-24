import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface"; // Adjust path if necessary
import { FaqController } from "./faq.controller";
import { createFaqSchema, updateFaqSchema } from "./faq.validation";

const router = Router();

// PUBLIC: Fetch all FAQs for the frontend accordion display
router.get("/", FaqController.getAllFaqs);
router.get("/:id", FaqController.getSingleFaq);

// ADMIN ONLY: Manage the FAQs
router.post(
    "/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createFaqSchema),
    FaqController.createFaq
);

router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(updateFaqSchema),
    FaqController.updateFaq
);

router.delete(
    "/:id", 
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN), 
    FaqController.deleteFaq
);

export const FaqRoutes = router;