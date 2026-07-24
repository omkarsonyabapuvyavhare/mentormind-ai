import { Badge } from "@/components/ui/badge";
import { theme } from "@/constants/theme";
import type { DropoutRiskLevel } from "@/stores/selectors";

const labels: Record<DropoutRiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function RiskBadge({ level, score }: { level: DropoutRiskLevel; score: number }) {
  return (
    <Badge className={theme.badges.risk[level]}>
      {labels[level]} · {score}
    </Badge>
  );
}
