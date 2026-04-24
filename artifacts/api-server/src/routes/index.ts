import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import logsRouter from "./logs";
import anomaliesRouter from "./anomalies";
import patternsRouter from "./patterns";
import alertsRouter from "./alerts";
import predictionsRouter from "./predictions";
import servicesRouter from "./services";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(logsRouter);
router.use(anomaliesRouter);
router.use(patternsRouter);
router.use(alertsRouter);
router.use(predictionsRouter);
router.use(servicesRouter);

export default router;
