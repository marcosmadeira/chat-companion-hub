import { useState, useEffect, useMemo } from "react";
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
    ChevronRight,
    Loader2,
    CheckSquare
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

import { apiService } from '@/services/api';

import { Checkbox } from "@/components/ui/checkbox";

// Defina um tipo para a nota fiscal para melhor tipagem
interface Invoice {
    id: string;
    number: string;
    emission_date: string;
    taker: string;
    value: number;
    status: string;
}



// Adicione este mapeamento de meses fora do componente para reutilização
const monthOptions = [
    { value: 'jan', label: 'Jan' },
    { value: 'fev', label: 'Fev' },
    { value: 'mar', label: 'Mar' },
    // { value: 'abr', label: 'Abr' },
    // { value: 'mai', label: 'Mai' },
    // { value: 'jun', label: 'Jun' },
    // { value: 'jul', label: 'Jul' },
    // { value: 'ago', label: 'Ago' },
    // { value: 'set', label: 'Set' },
    // { value: 'out', label: 'Out' },
    // { value: 'nov', label: 'Nov' },
    // { value: 'dez', label: 'Dez' },
];

// Função para gerar anos dinamicamente
const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 0; i--) {
        years.push(i.toString());
    }
    return years;
};

const currentMonth = new Date().toLocaleString('default', { month: 'short' }).toLowerCase().slice(0, 3); // 'fev'
const currentYear = new Date().getFullYear().toString();




export default function CompanyHubPage() {

    const { id: companyId } = useParams<{ id: string }>(); // 4. Pegar o ID da empresa da URL
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("emitted");

    // 5. Estados para gerenciar os dados e o carregamento
    const [emittedInvoices, setEmittedInvoices] = useState<Invoice[]>([]);
    const [receivedInvoices, setReceivedInvoices] = useState<Invoice[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);

    // Estados para os filtros
    const [selectedMonth, setSelectedMonth] = useState(currentMonth); // MUDANÇA: Usa o mês atual
    const [selectedYear, setSelectedYear] = useState(currentYear);     // MUDANÇA: Usa o ano atual
    const [isScraping, setIsScraping] = useState(false);
    const [filterType, setFilterType] = useState<"emission" | "competence">("competence");

    // --- INÍCIO DA NOVA LÓGICA DE PAGINAÇÃO ---
    // Estado para a página atual e itens por página
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Quantidade de itens por página

    // UseEffect para resetar a página para 1 sempre que os filtros mudarem
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedMonth, selectedYear, activeTab, filterType]); // Adicione aqui qualquer variável que altere a lista de notas
    // --- FIM DA NOVA LÓGICA DE PAGINAÇÃO ---


    // UseMemo para calcular o intervalo de datas exibido (sem mudanças)
    const displayDateRange = useMemo(() => {
        const monthIndex = monthOptions.findIndex(m => m.value === selectedMonth);
        const yearInt = parseInt(selectedYear);
        const firstDay = new Date(yearInt, monthIndex, 1);
        const lastDay = new Date(yearInt, monthIndex + 1, 0);
        const formatDate = (date: Date) => {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            return `${day}/${month}/${date.getFullYear()}`;
        };
        return { start: formatDate(firstDay), end: formatDate(lastDay) };
    }, [selectedMonth, selectedYear]);

    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

    // useEffect para carregar TODAS as notas quando o componente montar ou o ID mudar
    useEffect(() => {
        if (!companyId) return;

        const fetchInvoices = async () => {
            setIsLoadingInvoices(true);
            try {
                // Busca ambos os tipos de nota em paralelo
                const [emitted, received] = await Promise.all([
                    apiService.getInvoices(companyId, 'emitted'),
                    apiService.getInvoices(companyId, 'received')
                ]);
                setEmittedInvoices(emitted);
                setReceivedInvoices(received);
            } catch (error: any) {
                console.error(error);
                toast.error(error.message || "Não foi possível carregar as notas.");
            } finally {
                setIsLoadingInvoices(false);
            }
        };

        fetchInvoices();
    }, [companyId]);

    // Auto atualização

    useEffect(() => {
        if (!companyId) return;

        // Configura um intervalo para atualizar os dados a cada 5 minutos
        // const intervalId = setInterval(() => { refreshInvoices(); }, 5 * 60 * 1000);
        const intervalId = setInterval(refreshInvoices, 60000);

        return () => clearInterval(intervalId);
    }, [companyId]);

    // NOVO: useMemo para filtrar as notas com base no período selecionado
    const filteredEmittedInvoices = useMemo(() => {
        if (!emittedInvoices.length) return [];
        // Aqui você precisa converter a data da nota para comparar com displayDateRange
        // Supondo que `emission_date` vem como 'YYYY-MM-DD' ou 'DD/MM/YYYY'

        console.log('--- Debug de Filtragem ---');
        console.log('Período Selecionado:', displayDateRange);

        return emittedInvoices.filter(invoice => {
            // Lógica de conversão e comparação de datas (exemplo simplificado)
            // Você pode precisar de uma biblioteca como `date-fns` para isso

            // Adicione este log para ver o que está acontecendo
            const rawDate = invoice.emission_date;
            const parsedDate = new Date(rawDate.split('/').reverse().join('-'));
            console.log(`Nota ${invoice.number}: Data Bruta="${rawDate}", Data Parseada="${parsedDate.toISOString()}" (Inválida? ${isNaN(parsedDate.getTime())})`);

            if (isNaN(parsedDate.getTime())) {
                return false; // Se a data for inválida, não inclua no filtro
            }

            const invoiceDate = new Date(invoice.emission_date.split('/').reverse().join('-'));
            const startDate = new Date(displayDateRange.start.split('/').reverse().join('-'));
            const endDate = new Date(displayDateRange.end.split('/').reverse().join('-'));

            const isInRange = parsedDate >= startDate && parsedDate <= endDate;
            console.log(`  -> Está no intervalo? ${isInRange}`);
            return isInRange;

            // return invoiceDate >= startDate && invoiceDate <= endDate;
        });
    }, [emittedInvoices, displayDateRange]);

    const filteredReceivedInvoices = useMemo(() => {
        if (!receivedInvoices.length) return [];
        return receivedInvoices.filter(invoice => {
            const invoiceDate = new Date(invoice.emission_date.split('/').reverse().join('-'));
            const startDate = new Date(displayDateRange.start.split('/').reverse().join('-'));
            const endDate = new Date(displayDateRange.end.split('/').reverse().join('-'));
            return invoiceDate >= startDate && invoiceDate <= endDate;
        });
    }, [receivedInvoices, displayDateRange]);



    // NOVO: useMemo para calcular as estatísticas dinamicamente
    const statsData = useMemo(() => {
        const totalEmitted = filteredEmittedInvoices.length;
        const canceledCount = [...filteredEmittedInvoices, ...filteredReceivedInvoices].filter(inv => inv.status.toLowerCase() === 'cancelada').length;

        const totalValue = filteredEmittedInvoices
            .filter(inv => inv.status.toLowerCase() === 'autorizada') // Supondo que o status seja 'autorizada'
            .reduce((sum, inv) => sum + inv.value, 0);

        return {
            totalEmitted,
            totalValue: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue),
            canceledCount,
            periodRange: `${displayDateRange.start} até ${displayDateRange.end}`,
        };
    }, [filteredEmittedInvoices, filteredReceivedInvoices, displayDateRange]);



    // 7. Função para lidar com o clique no botão "Buscar Notas"
    const handleScrapeInvoices = async () => {
        if (!companyId) return;

        setIsScraping(true);
        toast.info("Iniciando busca de notas. Isso pode levar alguns minutos...");

        try {
            // Lógica para converter mês/ano para datas de início e fim
            const monthMap: { [key: string]: string } = {
                jan: "01", fev: "02", mar: "03", abr: "04",
                mai: "05", jun: "06", jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12"
            };

            const monthNum = monthMap[selectedMonth];
            const year = selectedYear;
            const lastDayOfMonth = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
            const startDate = `01/${monthNum}/${year}`;
            const endDate = `${lastDayOfMonth}/${monthNum}/${year}`;

            const scrapeId = await apiService.triggerScrape(companyId, startDate, endDate, activeTab as 'emitted' | 'received');

            if (!scrapeId) {
                throw new Error('ID da tarefa não retornado');
            }
            toast.success("Busca de notas iniciada com sucesso! Acompanhe o progresso.");

            // Opcional: buscar notas novamente após um tempo
            // setTimeout(() => {
            //     // recarregar notas
            // }, 30000);

            // Inicia o polling para verificar o status
            checkScrapingStatus(scrapeId);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Falha ao iniciar a busca de notas.");
        } finally {
            setIsScraping(false);
        }
    };



    // Lógica para decidir qual lista de notas mostrar
    const currentInvoices = activeTab === 'emitted' ? filteredEmittedInvoices : filteredReceivedInvoices;

    // --- INÍCIO DA NOVA LÓGICA DE PAGINAÇÃO (CÁLCULOS) ---
    // useMemo para calcular as notas paginadas e o total de páginas
    const { paginatedInvoices, totalPages } = useMemo(() => {
        const totalItems = currentInvoices.length;
        const pagesCount = Math.ceil(totalItems / itemsPerPage);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginated = currentInvoices.slice(startIndex, endIndex);

        return {
            paginatedInvoices: paginated,
            totalPages: pagesCount,
        };
    }, [currentInvoices, currentPage, itemsPerPage]);
    // --- FIM DA NOVA LÓGICA DE PAGINAÇÃO (CÁLCULOS) ---

    // <<< ADICIONE ESTAS FUNÇÕES DE MANIPULAÇÃO
    const handleToggleSelection = (invoiceId: string) => {
        setSelectedInvoiceIds(prev =>
            prev.includes(invoiceId)
                ? prev.filter(id => id !== invoiceId)
                : [...prev, invoiceId]
        );
    };

    const handleSelectAll = () => {
        const currentIds = currentInvoices.map(inv => inv.id);
        setSelectedInvoiceIds(
            currentIds.length === selectedInvoiceIds.length &&
                currentIds.every(id => selectedInvoiceIds.includes(id))
                ? []
                : currentIds
        );
    };

    // NOVA FUNÇÃO PARA LIDAR COM O DOWNLOAD DO XML
    // FUNÇÃO PARA DOWNLOAD INDIVIDUAL (no menu de ações)
    const handleSingleDownloadXml = async (documentId: string, invoiceNumber: string) => {
        const toastId = toast.loading(`Baixando XML da nota ${invoiceNumber}...`);
        try {
            const blob = await apiService.downloadDocumentXml(documentId); // Usando a função de download individual

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `nfse-${invoiceNumber}.xml`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`XML da nota ${invoiceNumber} baixado com sucesso!`, { id: toastId });
        } catch (error: any) {
            console.error("Erro ao baixar XML:", error);
            toast.error(error.message || "Falha ao baixar o arquivo XML.", { id: toastId });
        }
    };

    // FUNÇÃO PARA DOWNLOAD EM LOTE (no botão superior)
    const handleBulkDownloadXml = async () => {
        if (selectedInvoiceIds.length === 0) {
            toast.error("Nenhuma nota selecionada para download.");
            return;
        }

        const toastId = toast.loading(`Baixando ${selectedInvoiceIds.length} arquivo(s) XML...`);
        try {
            const blob = await apiService.bulkDownloadXml(selectedInvoiceIds);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `nfse-selecionadas.zip`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`${selectedInvoiceIds.length} arquivo(s) baixado(s) com sucesso!`, { id: toastId });
        } catch (error: any) {
            console.error("Erro ao baixar XMLs em lote:", error);
            toast.error(error.message || "Falha ao baixar os arquivos XML.", { id: toastId });
        }
    };

    const [scrapingStatus, setScrapingStatus] = useState(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    // Nova função para verificar o status do scraping
    const checkScrapingStatus = async (scrapeId) => {
        setIsCheckingStatus(true);

        const checkStatus = async () => {
            try {
                const status = await apiService.getScrapingStatus(scrapeId);
                setScrapingStatus(status);

                if (status.status === "SUCCESS") {
                    // Se o scraping foi concluído, recarrega os dados
                    toast.success("Busca de notas concluída! Atualizando dados...");
                    await refreshInvoices();
                    setIsScraping(false);
                    setIsCheckingStatus(false);
                    setScrapingStatus(null);
                } else if (status.status === "FAILURE") {
                    // Se houve erro no scraping
                    toast.error("Ocorreu um erro durante a busca de notas. Tente novamente.");
                    setIsScraping(false);
                    setIsCheckingStatus(false);
                    setScrapingStatus(null);
                } else {
                    // Se ainda está em andamento, verifica novamente após 5 segundos
                    setTimeout(checkStatus, 5000);
                }
            } catch (error) {
                console.error("Erro ao verificar status:", error);
                // Continua verificando mesmo se houver erro
                setTimeout(checkStatus, 5000);
            }
        };

        // Inicia a verificação após um pequeno delay
        setTimeout(checkStatus, 3000);
    };

    // Função para recarregar as notas
    const refreshInvoices = async () => {
        if (!companyId) return;

        setIsLoadingInvoices(true);
        try {
            const [emitted, received] = await Promise.all([
                apiService.getInvoices(companyId, 'emitted'),
                apiService.getInvoices(companyId, 'received')
            ]);
            setEmittedInvoices(emitted);
            setReceivedInvoices(received);
            toast.success("Dados atualizados com sucesso!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Não foi possível atualizar as notas.");
        } finally {
            setIsLoadingInvoices(false);
        }
    };





    return (
        <div className="container mx-auto p-6 space-y-6 animate-fade-in">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/companies")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Hubs da Empresa</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleScrapeInvoices} disabled={isScraping} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                        {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                        {isScraping ? "Buscando..." : "Buscar Notas"}
                    </Button>
                    <Button onClick={refreshInvoices} disabled={isLoadingInvoices} variant="outline" className="gap-2">
                        {isLoadingInvoices ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                        {isLoadingInvoices ? "Atualizando..." : "Atualizar"}
                    </Button>
                </div>
            </div>

            {/* Seção de Estatísticas Dinâmicas */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div> */}

            {isScraping && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Buscando notas fiscais...</span>
                            </div>
                            {scrapingStatus && <span className="text-xs text-blue-600">Progresso: {scrapingStatus.progress || 0}%</span>}
                        </div>
                        {scrapingStatus && <div className="mt-2 w-full bg-blue-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${scrapingStatus.progress || 0}%` }}></div></div>}
                    </CardContent>
                </Card>
            )}

            {selectedInvoiceIds.length > 0 && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{selectedInvoiceIds.length} nota(s) selecionada(s)</span>
                        </div>
                        <Button onClick={handleBulkDownloadXml} size="sm" className="gap-2"><Download className="h-4 w-4" /> Baixar Selecionadas ({selectedInvoiceIds.length})</Button>
                    </CardContent>
                </Card>
            )}

            {/* Tabs & Navigation */}
            <Tabs defaultValue="emitted" onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 gap-8">
                    <TabsTrigger value="emitted" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 h-10 font-semibold transition-all">Notas Emitidas</TabsTrigger>
                    <TabsTrigger value="received" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 h-10 font-semibold transition-all">Notas Recebidas</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Filter Section */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex rounded-lg border p-1 bg-muted/50">
                            <Button variant={filterType === "emission" ? "default" : "ghost"} size="sm" onClick={() => setFilterType("emission")} className="h-8 shadow-none">Emissão</Button>
                            <Button variant={filterType === "competence" ? "default" : "ghost"} size="sm" onClick={() => setFilterType("competence")} className="h-8 shadow-none">Competência</Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-[100px] h-9"><SelectValue placeholder="Mês" /></SelectTrigger>
                                <SelectContent>{monthOptions.map(month => (<SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>))}</SelectContent>
                            </Select>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[100px] h-9"><SelectValue placeholder="Ano" /></SelectTrigger>
                                <SelectContent>{generateYearOptions().map(year => (<SelectItem key={year} value={year}>{year}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center border rounded-lg px-3 h-9 bg-background/50">
                            <span className="text-xs text-muted-foreground">{displayDateRange.start}</span>
                            <span className="mx-2 text-muted-foreground">→</span>
                            <span className="text-xs text-muted-foreground">{displayDateRange.end}</span>
                        </div>
                        <Select defaultValue="all"><SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Status: Todos</SelectItem><SelectItem value="auth">Autorizadas</SelectItem><SelectItem value="canc">Canceladas</SelectItem></SelectContent></Select>
                        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por número, tomador..." className="pl-9 h-9" /></div>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 h-9 px-6"><Filter className="mr-2 h-4 w-4" />Filtrar</Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md border border-blue-100 dark:border-blue-900/30">
                        <span className="p-0.5 bg-blue-500 text-white rounded"><Calendar className="h-3 w-3" /></span>
                        <span>Filtrando por <strong>{filterType === "competence" ? "Competência" : "Emissão"}: {monthOptions.find(m => m.value === selectedMonth)?.label}</strong> ({displayDateRange.start} até {displayDateRange.end}).</span>
                    </div>
                </CardContent>
            </Card>

            {/* Table Section */}
            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="w-[50px]"><Checkbox onCheckedChange={handleSelectAll} checked={paginatedInvoices.length > 0 && paginatedInvoices.every(invoice => selectedInvoiceIds.includes(invoice.id))} /></TableHead>
                            <TableHead>Número</TableHead><TableHead>Data de Emissão</TableHead><TableHead>Tomador</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingInvoices ? (<TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /><p className="text-muted-foreground mt-2">Carregando notas...</p></TableCell></TableRow>) : paginatedInvoices.length > 0 ? (paginatedInvoices.map((invoice) => (<TableRow key={invoice.id}>
                            <TableCell><Checkbox checked={selectedInvoiceIds.includes(invoice.id)} onCheckedChange={() => handleToggleSelection(invoice.id)} /></TableCell>
                            <TableCell className="font-medium">{invoice.number}</TableCell><TableCell>{invoice.emission_date}</TableCell><TableCell>{invoice.taker}</TableCell><TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.value)}</TableCell>
                            <TableCell><Badge variant={invoice.status === 'Autorizada' ? 'default' : 'destructive'}>{invoice.status}</Badge></TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menu</span><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleSingleDownloadXml(invoice.id, invoice.number)}><FileText className="mr-2 h-4 w-4" />Baixar XML</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>))) : (<TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma nota fiscal encontrada para o período selecionado.</TableCell></TableRow>)}
                    </TableBody>
                </Table>
                {/* Paginação */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-2 py-4">
                        <div className="text-sm text-muted-foreground">Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, currentInvoices.length)} de {currentInvoices.length} notas</div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /> <span className="sr-only">Página anterior</span></Button>
                            <div className="flex items-center space-x-1">
                                {[...Array(totalPages)].map((_, i) => i + 1).map(page => (<Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="w-8 h-8 p-0" onClick={() => setCurrentPage(page)}>{page}</Button>))}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /> <span className="sr-only">Próxima página</span></Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );



}