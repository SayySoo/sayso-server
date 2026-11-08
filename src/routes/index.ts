import { Router } from "express";
import complaintRoutes from "./complaints/complaints.routes";
import categoriesRoutes from "./categories/categories.routes";
import tagsRoutes from "./tags/tags.routes"
import reportRoutes from "./reports/reports.routes";
import authRoutes from "./auth/auth.routes";
import profileRoutes from "./student/student.routes";
import departmentRoutes from "./department/departments.routes";
import staffRoutes from "./staff/staff.routes"
import publicRoutes from "./public.routes";
import chatRoutes from "./chat/chat.routes";
const router = Router();

router.use("/complaints", complaintRoutes);
router.use("/categories", categoriesRoutes);
router.use("/tags", tagsRoutes);
router.use("/reports", reportRoutes);
router.use("/auth", authRoutes);
router.use("/student",profileRoutes);
router.use("/departments", departmentRoutes);
router.use("/staff",staffRoutes);
router.use("/public", publicRoutes);
router.use("/chat",chatRoutes);

export default router;