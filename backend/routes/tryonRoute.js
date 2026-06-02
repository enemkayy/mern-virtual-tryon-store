import express from "express";
import { tryOn } from "../controllers/tryonController.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const tryonRouter = express.Router();

// POST /api/tryon
// IMPORTANT: upload.single() MUST come before authUser when using multipart/form-data.
// multer needs to parse the request body first so that req.body exists
// before authUser tries to write req.body.userId into it.
tryonRouter.post("/", upload.single("personImage"), authUser, tryOn);

export default tryonRouter;
