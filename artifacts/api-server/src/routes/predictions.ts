import { Router, type IRouter } from "express";
import { ListPredictionsResponse } from "@workspace/api-zod";
import { listPredictions } from "../lib/aiforgeData";

const router: IRouter = Router();

router.get("/predictions", async (_req, res): Promise<void> => {
  res.json(ListPredictionsResponse.parse(listPredictions()));
});

export default router;
