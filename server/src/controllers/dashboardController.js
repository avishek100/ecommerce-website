import { getDashboardSummary } from '../services/dashboardService.js';

export async function getDashboard(req, res) {
  const summary = await getDashboardSummary();
  return res.json(summary);
}
