import { Router, type IRouter } from "express";
import { ListLogsResponse, ListLogsQueryParams } from "@workspace/api-zod";
import { buildLogs } from "../lib/aiforgeData";

const router: IRouter = Router();

router.get("/logs", async (req, res): Promise<void> => {
  const parsed = ListLogsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const logs = buildLogs({
    level: parsed.data.level ?? "all",
    service: parsed.data.service,
    search: parsed.data.search,
    limit: parsed.data.limit ?? 100,
  });
  res.json(ListLogsResponse.parse(logs));
});

export default router;
