
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Check, Copy, CreditCard, FileSpreadsheet, Lock, Search, Smartphone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { fetchCNPJData } from "@/services/cnpj-service";
import { useForm } from "react-hook-form";
import { apiService } from "@/services/api";
import { getCompanyData } from "@/lib/api";


export default function NewCompanyPage() {
    const navigate = useNavigate();
    const [loadingCNPJ, setLoadingCNPJ] = useState(false);
    const [authMethod, setAuthMethod] = useState("certificate");

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            cnpj: "",
            razaoSocial: "",
            cnae: "",
            inscricaoMunicipal: "",
            descricaoCnae: "",
            email: "",
            logradouro: "",
            numero: "",
            bairro: "",
            cidade: "",
            estado: "",
            cep: "",
            // Novos campos para telefone
            telefone: "",
            // Campos de autenticação...
            certificatePassword: "",
            username: "",
            password: "",
        }
    });

    // ... (função handleSearchCNPJ corrigida)
    const handleSearchCNPJ = async () => {
        const cnpj = watch("cnpj").replace(/\D/g, '');
        if (!cnpj || cnpj.length !== 14) {
            toast.error("Por favor, digite um CNPJ válido com 14 dígitos.");
            return;
        }
        setLoadingCNPJ(true);
        try {
            const data = await getCompanyData(cnpj);
            if (data && data.company) {
                setValue("razaoSocial", data.company.name || "");
                setValue("cnae", data.mainActivity?.id || "");
                setValue("descricaoCnae", data.mainActivity?.text || "");
                if (data.emails && data.emails.length > 0) {
                    setValue("email", data.emails[0].address || "");
                }
                // Preenchendo os campos de endereço
                setValue("logradouro", data.address?.street || "");
                setValue("numero", data.address?.number || "");
                setValue("bairro", data.address?.district || "");
                setValue("cidade", data.address?.city || "");
                setValue("estado", data.address?.state || "");
                setValue("cep", data.address?.zip || "");
                // Preenchendo o telefone
                if (data.phones && data.phones.length > 0) {
                    const phone = data.phones[0];
                    setValue("telefone", `(${phone.area}) ${phone.number}` || "");
                }
                toast.success("Dados da empresa encontrados e preenchidos!");
            } else {
                toast.error("CNPJ não encontrado. Verifique o número e tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao buscar CNPJ:", error);
            toast.error("Ocorreu um erro ao buscar os dados do CNPJ.");
        } finally {
            setLoadingCNPJ(false);
        }
    };

    const onSubmit = async (data: any) => {
        // A criação do FormData continua igual, pois os dados vêm do formulário
        const formData = new FormData();
        formData.append('cnpj', data.cnpj.replace(/\D/g, ''));
        formData.append('razaoSocial', data.razaoSocial);
        formData.append('cnae', data.cnae);
        formData.append('descricaoCnae', data.descricaoCnae);
        formData.append('inscricaoMunicipal', data.inscricaoMunicipal || '');
        formData.append('email', data.email || '');
        formData.append('logradouro', data.logradouro || '');
        formData.append('numero', data.numero || '');
        formData.append('bairro', data.bairro || '');
        formData.append('cidade', data.cidade || '');
        formData.append('estado', data.estado || '');
        formData.append('cep', data.cep || '');
        formData.append('telefone', data.telefone || '');
        formData.append('authMethod', authMethod);

        if (authMethod === 'certificate') {
            if (data.certificate && data.certificate.length > 0) {
                formData.append('certificate', data.certificate[0]);
            }
            formData.append('certificatePassword', data.certificatePassword || '');
        } else {
            formData.append('username', data.username || '');
            formData.append('password', data.password || '');
        }

        try {
            // 2. SUBSTITUA O FETCH DIRETO PELA CHAMADA AO MÉTODO DA API
            const result = await apiService.createCompany(formData);

            toast.success(`Empresa "${result.company.name}" cadastrada com sucesso!`);
            navigate("/companies");

        } catch (error: any) {
            console.error("Erro no submit:", error);
            // A mensagem de erro já vem formatada da sua ApiService
            toast.error(error.message || "Ocorreu um erro ao conectar com o servidor.");
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8 animate-fade-in max-w-5xl">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/companies")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Building2 className="h-8 w-8" />
                        Nova Empresa
                    </h1>
                    <p className="text-muted-foreground">
                        Preencha os dados abaixo para cadastrar um novo CNPJ
                    </p>
                </div>
            </div>


            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Identificação</CardTitle>
                        <CardDescription>Dados cadastrais da empresa</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        {/* ... Campos de CNPJ e Razão Social ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="cnpj">CNPJ (Somente números) *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="cnpj"
                                        placeholder="00.000.000/0000-00"
                                        {...register("cnpj", { required: true })}
                                    />
                                    <Button type="button" size="icon" onClick={handleSearchCNPJ} disabled={loadingCNPJ} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        {loadingCNPJ ? <span className="animate-spin">⌛</span> : <Search className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground">Digite o CNPJ e clique na lupa para buscar na Receita.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="razaoSocial">Razão Social *</Label>
                                <Input
                                    id="razaoSocial"
                                    placeholder="Nome da empresa"
                                    {...register("razaoSocial", { required: true })}
                                />
                            </div>
                        </div>

                        {/* ... Campos CNAE e Inscrição Municipal ... */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* ... inputs de cnae, descricaoCnae, inscricaoMunicipal ... */}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail para contato</Label>
                            <Input id="email" type="email" placeholder="contato@empresa.com.br" {...register("email")} />
                        </div>

                        <Separator className="my-4" />

                        {/* === NOVA SEÇÃO DE ENDEREÇO === */}
                        {/* <div className="space-y-2">
                            <h4 className="text-sm font-medium leading-none">Endereço</h4>
                        </div> */}
                        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="logradouro">Logradouro</Label>
                                <Input id="logradouro" placeholder="Rua, Avenida, etc." {...register("logradouro")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="numero">Número</Label>
                                <Input id="numero" placeholder="123" {...register("numero")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bairro">Bairro</Label>
                                <Input id="bairro" placeholder="Centro" {...register("bairro")} />
                            </div>
                        </div> */}

                        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cidade">Cidade</Label>
                                <Input id="cidade" placeholder="São Paulo" {...register("cidade")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado</Label>
                                <Input id="estado" placeholder="SP" {...register("estado")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cep">CEP</Label>
                                <Input id="cep" placeholder="00000-000" {...register("cep")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input id="telefone" placeholder="(11) 99999-9999" {...register("telefone")} />
                            </div>
                        </div> */}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-indigo-500" />
                            Autenticação
                        </CardTitle>
                        <CardDescription>Configure como o sistema irá acessar as notas fiscais</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Label>Método de Acesso</Label>
                            <Tabs defaultValue="certificate" onValueChange={setAuthMethod} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="certificate" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Certificado Digital
                                    </TabsTrigger>
                                    <TabsTrigger value="credentials" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                        <User className="mr-2 h-4 w-4" />
                                        Usuário e Senha
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="certificate" className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="certificate">Arquivo .pfx ou .p12 *</Label>
                                            <Input id="certificate" type="file" accept=".pfx,.p12" className="cursor-pointer file:cursor-pointer file:text-indigo-600 file:font-semibold" />
                                            <p className="text-[10px] text-muted-foreground">Certificado digital modelo A1.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="certPassword">Senha do Certificado *</Label>
                                            <Input id="certPassword" type="password" placeholder="Senha" {...register("certificatePassword")} />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="credentials" className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Usuário / CPF / CNPJ *</Label>
                                            <Input id="username" placeholder="Login de acesso" {...register("username")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Senha *</Label>
                                            <Input id="password" type="password" placeholder="Senha de acesso" {...register("password")} />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-4 items-center justify-center pt-4">
                    <Button type="submit" size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 text-md shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Check className="mr-2 h-5 w-5" />
                        Cadastrar Empresa
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        Precisa cadastrar várias empresas?
                    </div>

                    <Button variant="outline" type="button" className="gap-2 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700">
                        <FileSpreadsheet className="h-4 w-4" />
                        Importar em Massa (via Excel)
                    </Button>
                </div>
            </form>
        </div>
    );
}
