import { Router, type IRouter } from "express";
import {
  GetDashboardSummaryResponse,
  GetLogVolumeTimeseriesResponse,
  GetLogVolumeTimeseriesQueryParams,
  GetAnomalyTrendResponse,
  GetMttdTrendResponse,
  GetSeverityDistributionResponse,
  GetTopServicesByErrorsResponse,
  GetIngestThroughputResponse,
} from "@workspace/api-zod";
import {
  buildSummary,
  buildLogVolume,
  buildAnomalyTrend,
  buildMttdTrend,
  buildSeverityDistribution,
  buildTopServices,
  buildIngestThroughput,
} from "../lib/aiforgeData";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  res.json(GetDashboardSummaryResponse.parse(buildSummary()));
});

router.get("/dashboard/log-volume", async (req, res): Promise<void> => {
  const parsed = GetLogVolumeTimeseriesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const window = parsed.data.window ?? "24h";
  res.json(GetLogVolumeTimeseriesResponse.parse(buildLogVolume(window)));
});

router.get("/dashboard/anomaly-trend", async (_req, res): Promise<void> => {
  res.json(GetAnomalyTrendResponse.parse(buildAnomalyTrend()));
});

router.get("/dashboard/mttd-trend", async (_req, res): Promise<void> => {
  res.json(GetMttdTrendResponse.parse(buildMttdTrend()));
});

router.get("/dashboard/severity-distribution", async (_req, res): Promise<void> => {
  res.json(GetSeverityDistributionResponse.parse(buildSeverityDistribution()));
});

router.get("/dashboard/top-services", async (_req, res): Promise<void> => {
  res.json(GetTopServicesByErrorsResponse.parse(buildTopServices()));
});

router.get("/dashboard/ingest-throughput", async (_req, res): Promise<void> => {
  res.json(GetIngestThroughputResponse.parse(buildIngestThroughput()));
});

export default router;
