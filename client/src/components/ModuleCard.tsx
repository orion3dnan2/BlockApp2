import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ModuleCardProps {
  title: string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: "default" | "danger";
}

export default function ModuleCard({ title, icon: Icon, onClick, variant = "default" }: ModuleCardProps) {
  return (
    <Card
      className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 p-6 transition-all hover-elevate active-elevate-2 ${
        variant === "danger" ? "border-destructive/50" : ""
      }`}
      onClick={onClick}
      data-testid={`card-module-${title}`}
    >
      <Icon className={`h-10 w-10 ${variant === "danger" ? "text-destructive" : "text-primary"}`} />
      <h3 className="text-center text-base font-medium">{title}</h3>
    </Card>
  );
}
