import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { InstructionController } from "./Instruction.controller";
import { createInstructionSchema } from "./Instruction.validation";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
    "/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    // UPDATE: Accept both thumbnail and pdfFile fields
    multerUpload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "pdfFile", maxCount: 1 }
    ]),
    validateRequest(createInstructionSchema),
    InstructionController.createInstruction
);

router.get("/", InstructionController.getAllInstructions);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), InstructionController.deleteInstruction);

export const InstructionRoutes = router;