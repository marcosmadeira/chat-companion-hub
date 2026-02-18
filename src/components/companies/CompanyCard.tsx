
import { useNavigate } from "react-router-dom";
import { Building2, Info, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface Company {
    id: string;
    name: string;
    cnpj: string;
    status: "active" | "inactive";
    isDemo?: boolean;
}

interface CompanyCardProps {
    company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
    const navigate = useNavigate();
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div>
                    <h3 className="font-semibold leading-none tracking-tight">{company.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{company.cnpj}</p>
                </div>

                {company.isDemo && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="secondary" className="gap-1 cursor-help w-fit">
                                    <Info className="h-3 w-3" />
                                    Empresa Demonstração
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                Esta é uma empresa de demonstração pré-configurada.
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${company.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm font-medium">
                        {company.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    variant="outline"
                    onClick={() => navigate(`/companies/${company.id}`)}
                    className="w-full text-blue-500 hover:text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                    Acessar Hub &rarr;
                </Button>
            </CardFooter>
        </Card>
    );
}
