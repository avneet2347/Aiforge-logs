import { Router, type IRouter } from "express";
import {
  ListAlertsResponse,
  GetAlertResponse,
  GetAlertParams,
} from "@workspace/api-zod";
import { listAlerts, buildAlertDetail } from "../lib/aiforgeData";

const router: IRouter = Router();

router.get("/alerts", async (_req, res): Promise<void> => {
  res.json(ListAlertsResponse.parse(listAlerts()));
});

router.get("/alerts/:id", async (req, res): Promise<void> => {
  const parsed = GetAlertParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const detail = buildAlertDetail(parsed.data.id);
  if (!detail) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  res.json(GetAlertResponse.parse(detail));
});

export default router;
