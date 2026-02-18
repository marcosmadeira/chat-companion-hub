
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Download,
    RefreshCcw,
    FileText,
    DollarSign,
    XOctagon,
    Calendar,
    Search,
    Filter,
    MoreVertical,
    ChevronDown,
    ExternalLink,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";


export default function CompanyHubPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("emitted");
    const [filterType, setFilterType] = useState("competence");

    const stats = [
        { title: "NOTAS EMITIDAS", value: "0", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "VALORES (AUTORIZADOS)", value: "R$ 0,00", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { title: "CANCELADAS", value: "0", icon: XOctagon, color: "text-rose-500", bg: "bg-rose-500/10" },
        { title: "PERÍODO (COMPETÊNCIA)", value: "01/02/2026 até 28/02/2026", icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10" },
    ];

    return (
        <div className="container mx-auto p-6 space-y-6 animate-fade-in">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/companies")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Hub da Empresa</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => toast.info("Sincronizando notas...")} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Buscar Notas
                    </Button>
                    <Button variant="outline" className="gap-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                        <Download className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                                    <p className="text-xl font-bold">{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs & Navigation */}
            <Tabs defaultValue="emitted" onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 gap-8">
                    <TabsTrigger
                        value="emitted"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 h-10 font-semibold transition-all"
                    >
                        Notas Emitidas
                    </TabsTrigger>
                    <TabsTrigger
                        value="received"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 h-10 font-semibold transition-all"
                    >
                        Notas Recebidas
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Filter Section */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex rounded-lg border p-1 bg-muted/50">
                            <Button
                                variant={filterType === "emission" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setFilterType("emission")}
                                className="h-8 shadow-none"
                            >
                                Emissão
                            </Button>
                            <Button
                                variant={filterType === "competence" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setFilterType("competence")}
                                className="h-8 shadow-none"
                            >
                                Competência
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Select defaultValue="feb">
                                <SelectTrigger className="w-[100px] h-9">
                                    <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="jan">Jan</SelectItem>
                                    <SelectItem value="feb">Fev</SelectItem>
                                    <SelectItem value="mar">Mar</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select defaultValue="2026">
                                <SelectTrigger className="w-[100px] h-9">
                                    <SelectValue placeholder="Ano" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2025">2025</SelectItem>
                                    <SelectItem value="2026">2026</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center border rounded-lg px-3 h-9 bg-background/50">
                            <span className="text-xs text-muted-foreground">01/02/2026</span>
                            <span className="mx-2 text-muted-foreground">→</span>
                            <span className="text-xs text-muted-foreground">28/02/2026</span>
                        </div>

                        <Select defaultValue="all">
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Status: Todos</SelectItem>
                                <SelectItem value="auth">Autorizadas</SelectItem>
                                <SelectItem value="canc">Canceladas</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar por número, tomador..." className="pl-9 h-9" />
                        </div>

                        <Button className="bg-indigo-600 hover:bg-indigo-700 h-9 px-6">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtrar
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md border border-blue-100 dark:border-blue-900/30">
                        <span className="p-0.5 bg-blue-500 text-white rounded">
                            <Calendar className="h-3 w-3" />
                        </span>
                        <span>Filtrando por <strong>Competência: Fevereiro</strong> (01/02/2026 até 28/02/2026).</span>
                    </div>
                </CardContent>
            </Card>

            {/* Table Section */}
            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="w-[120px]">NÚMERO</TableHead>
                            <TableHead>EMISSÃO</TableHead>
                            <TableHead>TOMADOR</TableHead>
                            <TableHead>VALOR</TableHead>
                            <TableHead>STATUS</TableHead>
                            <TableHead className="text-right">AÇÕES</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Empty state for demonstration */}
                        <TableRow>
                            <TableCell colSpan={6} className="h-[300px] text-center">
                                <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                        <FileText className="h-8 w-8 opacity-20" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">Nenhuma nota encontrada</p>
                                        <p className="text-sm">Esta empresa ainda não possui notas emitidas.</p>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                {/* Pagination placeholder */}
                <div className="p-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <span>Mostrando 0 de 0 resultados</span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
