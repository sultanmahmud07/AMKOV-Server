"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_interface_1 = require("../user/user.interface");
const Instruction_controller_1 = require("./Instruction.controller");
const Instruction_validation_1 = require("./Instruction.validation");
const multer_config_1 = require("../../config/multer.config");
const router = (0, express_1.Router)();
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), 
// UPDATE: Accept both thumbnail and pdfFile fields
multer_config_1.multerUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "pdfFile", maxCount: 1 }
]), (0, validateRequest_1.validateRequest)(Instruction_validation_1.createInstructionSchema), Instruction_controller_1.InstructionController.createInstruction);
router.get("/", Instruction_controller_1.InstructionController.getAllInstructions);
router.delete("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), Instruction_controller_1.InstructionController.deleteInstruction);
exports.InstructionRoutes = router;
