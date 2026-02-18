
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";

export function CompanyStats() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Consumo de Notas
        </CardTitle>
        <Select defaultValue="fev2026">
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fev2026">Fevereiro/2026</SelectItem>
            <SelectItem value="jan2026">Janeiro/2026</SelectItem>
            <SelectItem value="dez2025">Dezembro/2025</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">0</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">100 rest.</span>
          </div>
          <Progress value={0} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
