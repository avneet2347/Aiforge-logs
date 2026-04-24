import { Router, type IRouter } from "express";
import {
  ListAnomaliesResponse,
  GetAnomalyResponse,
  GetAnomalyParams,
} from "@workspace/api-zod";
import { listAnomalies, buildAnomalyDetail } from "../lib/aiforgeData";

const router: IRouter = Router();

router.get("/anomalies", async (_req, res): Promise<void> => {
  res.json(ListAnomaliesResponse.parse(listAnomalies()));
});

router.get("/anomalies/:id", async (req, res): Promise<void> => {
  const parsed = GetAnomalyParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const detail = buildAnomalyDetail(parsed.data.id);
  if (!detail) {
    res.status(404).json({ error: "Anomaly not found" });
    return;
  }
  res.json(GetAnomalyResponse.parse(detail));
});

export default router;
