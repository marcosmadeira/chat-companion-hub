//src/pages/CompaniesPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, LayoutGrid, List, Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanyCard, Company } from "@/components/companies/CompanyCard";
import { CompanyStats } from "@/components/companies/CompanyStats";
import { CreateCompanyDialog } from "@/components/companies/CreateCompanyDialog";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/services/api";
import { toast } from "sonner";


const DEMO_COMPANY: Company = {
    id: "1",
    name: "Empresa Demonstração Ltda",
    cnpj: "00.000.000/0001-91",
    status: "active",
    isDemo: true,
};

export default function CompaniesPage() {
    const navigate = useNavigate();

    // 5. Crie os estados para gerenciar a lista de empresas, carregamento e erros
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 6. Use o useEffect para buscar os dados quando o componente for montado
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await apiService.getCompanies();

                // 7. Mapeie os dados do backend para o formato que seu componente espera
                // O backend retorna 'razao_social', mas o seu tipo 'Company' espera 'name'
                const formattedData: Company[] = data.map((company: any) => ({
                    id: company.id,
                    name: company.name, // Mapeando o campo
                    cnpj: company.cnpj,
                    status: company.status || 'active', // Defina um status padrão se não vier
                    isDemo: false, // Nenhuma empresa real é demo
                }));

                setCompanies(formattedData);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Não foi possível carregar as empresas.");
                toast.error("Falha ao carregar as empresas.");
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []); // O array vazio [] garante que o efeito rode apenas uma vez
    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header & Stats Section */}
            <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">Minhas Empresas</h1>
                        <Badge variant="destructive" className="rounded-full text-xs">1/1</Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Gerencie suas empresas e notas fiscais
                    </p>
                </div>

                <div className="w-full md:w-auto min-w-[300px]">
                    <CompanyStats />
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar empresa (Nome ou CNPJ)..." className="pl-8" />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        Buscar
                    </Button>
                    <div className="flex items-center bg-muted rounded-md border p-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-background shadow-sm">
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <List className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                    <Button onClick={() => navigate("/companies/new")} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4" />
                        Nova Empresa
                    </Button>
                </div>
            </div>

            <div className="flex justify-end">
                <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                    Exportar XMLs
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 8. Renderize a lista de empresas ou o estado de carregamento/erro */}
                {loading && (
                    <div className="col-span-full flex justify-center items-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        <span className="ml-2 text-muted-foreground">Carregando empresas...</span>
                    </div>
                )}

                {error && (
                    <div className="col-span-full text-center p-12">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {!loading && !error && companies.map((company) => (
                    <CompanyCard key={company.name} company={company} />
                ))}

                {/* O card de "Nova Empresa" pode continuar como está */}
                {!loading && !error && (
                    <div
                        onClick={() => navigate("/companies/new")}
                        className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-4 min-h-[200px] text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                        <div className="h-10 w-10 rounded-full border-2 border-current flex items-center justify-center">
                            <Plus className="h-6 w-6" />
                        </div>
                        <span className="font-medium">Nova Empresa</span>
                    </div>
                )}
            </div>

        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}
