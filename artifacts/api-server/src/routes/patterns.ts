import { Router, type IRouter } from "express";
import { ListPatternsResponse } from "@workspace/api-zod";
import { listPatterns } from "../lib/aiforgeData";

const router: IRouter = Router();

router.get("/patterns", async (_req, res): Promise<void> => {
  res.json(ListPatternsResponse.parse(listPatterns()));
});

export default router;
