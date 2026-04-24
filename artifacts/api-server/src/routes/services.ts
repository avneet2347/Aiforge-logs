import { Router, type IRouter } from "express";
import { ListServicesResponse } from "@workspace/api-zod";
import { listServices } from "../lib/aiforgeData";

const router: IRouter = Router();

router.get("/services", async (_req, res): Promise<void> => {
  res.json(ListServicesResponse.parse(listServices()));
});

export default router;
