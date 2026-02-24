import { User } from '@/types';


// O Django está servindo em localhost:8001
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';

export interface LoginCredentials {
    username: string; // Changed from email to username
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface FileProcessingResponse {
    success: boolean;
    message: string;
    downloadUrl?: string;
    processedFiles?: {
        id: string;
        originalName: string;
        downloadUrl?: string;
    }[];
}

export interface TicketData {
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
}

class ApiService {
    private token: string | null = null;
    private refreshToken: string | null = null;

    constructor() {
        this.token = localStorage.getItem('auth_token');
        this.refreshToken = localStorage.getItem('refresh_token');
    }

    private getHeaders(isFormData = false): HeadersInit {
        const headers: HeadersInit = {};

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        return headers;
    }

    /**
     * Realiza o login do usuário (Endpoint: /auth/login/)
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            // 1. Obter Token
            const payload = {
                username: credentials.username,
                password: credentials.password
            };

            const response = await fetch(`${API_URL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // Backend retorna { error: "..." } em falhas
                throw new Error(errorData.detail || errorData.error || errorData.message || 'Falha na autenticação');
            }

            const data = await response.json();
            // console.log('Login response:', data);

            // Estrutura retornada pelo backend:
            // { user: {...}, tokens: { access_token: '...', refresh_token: '...' } }
            const accessToken = data.tokens?.access_token;
            const refreshToken = data.tokens?.refresh_token;

            if (!accessToken) {
                console.error('Falha ao extrair token. Resposta:', data);
                throw new Error('Token não recebido');
            }

            this.token = accessToken;
            localStorage.setItem('auth_token', accessToken);

            if (refreshToken) {
                this.refreshToken = refreshToken;
                localStorage.setItem('refresh_token', refreshToken);
            }

            // O backend já retorna os dados do usuário no login, não precisamos de outra chamada
            const userData = data.user;

            const user: User = {
                id: userData.id?.toString() || 'unknown',
                email: userData.email,
                name: [userData.first_name, userData.last_name].filter(Boolean).join(' ') || userData.username || 'User',
                avatar: undefined
            };

            return { user, token: accessToken };

        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    /**
     * Faz logout e limpa o token
     */
    logout() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
    }

    /**
     * Envia arquivos para processamento no backend e aguarda conclusão
     * Endpoint upload: /upload-e-processar-pdf/
     * Endpoint status: /task-status/<task_id>/
     * Endpoint download: /download-zip/<zip_id>/
     */
    async processFiles(files: File[], onProgress?: (status: string) => void): Promise<FileProcessingResponse> {
        if (!this.token) {
            throw new Error('Usuário não autenticado');
        }

        const formData = new FormData();
        files.forEach((file) => {
            // Backend espera 'files[]' conforme verificado no código:
            // files = request.FILES.getlist('files[]')
            formData.append('files[]', file);
        });

        try {
            // 1. Upload e início do processamento (NOTE: endpoint relativo a /api no backend)
            const response = await fetch(`${API_URL}/upload-e-processar-pdf/`, {
                method: 'POST',
                headers: this.getHeaders(true),
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Upload Error Data:', errorData); // Debug log
                throw new Error(errorData.detail || errorData.error || errorData.message || 'Erro ao iniciar processamento');
            }

            const { task_id } = await response.json();

            if (!task_id) {
                throw new Error('ID da tarefa não retornado');
            }

            // 2. Polling do status da tarefa
            return new Promise((resolve, reject) => {
                const pollStatus = async () => {
                    try {
                        if (onProgress) onProgress('processing');

                        const statusResponse = await fetch(`${API_URL}/task-status/${task_id}/`, {
                            headers: this.getHeaders(),
                        });

                        if (!statusResponse.ok) {
                            // Em caso de erro de rede ou 500, talvez queira tentar de novo ou falhar
                            // Se for 404, tarefa não existe
                            if (statusResponse.status === 404) {
                                reject(new Error('Tarefa não encontrada'));
                                return;
                            }
                            // Tenta novamente em breve em caso de erro transiente
                            setTimeout(pollStatus, 3000);
                            return;
                        }

                        const statusData = await statusResponse.json();

                        if (statusData.state === 'SUCCESS') {
                            const zipId = statusData.meta?.zip_id;
                            // Ajuste: usando zipId na url conforme padrão do backend
                            const downloadUrl = zipId ? `${API_URL}/download-zip/${zipId}/` : undefined;

                            resolve({
                                success: true,
                                message: 'Processamento concluído com sucesso',
                                downloadUrl,
                            });
                        } else if (statusData.state === 'FAILURE') {
                            reject(new Error('Erro no processamento da tarefa'));
                        } else {
                            // Continua verificando
                            setTimeout(pollStatus, 2000);
                        }
                    } catch (error) {
                        // Se der erro de conexão, tenta de novo
                        console.warn("Erro no polling:", error);
                        setTimeout(pollStatus, 3000);
                    }
                };

                pollStatus();
            });

        } catch (error) {
            console.error('Erro ao processar arquivos:', error);
            throw error;
        }
    }

    /**
     * Cria um novo ticket de suporte
     * Endpoint: /support/tickets/
     */
    async createTicket(data: TicketData): Promise<any> {
        if (!this.token) {
            throw new Error('Usuário não autenticado');
        }

        try {
            const response = await fetch(`${API_URL}/support/tickets/`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.message || 'Erro ao criar ticket');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao criar ticket:', error);
            throw error;
        }
    }

    async createCompany(formData: FormData): Promise<any> {
        if (!this.token) {
            throw new Error('Usuário não autenticado. Faça login para cadastrar uma empresa.');
        }

        try {
            // A URL base é API_URL + '/portal_nfse/companies/'
            const response = await fetch(`${API_URL}/portal_nfse/companies/`, {
                method: 'POST',
                headers: this.getHeaders(true), // `true` para indicar que é FormData, para não adicionar 'Content-Type': 'application/json'
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // O seu backend retorna { error: "..." } em falhas
                throw new Error(errorData.error || errorData.detail || 'Falha ao cadastrar a empresa.');
            }

            return await response.json();

        } catch (error) {
            console.error('Erro ao cadastrar empresa:', error);
            throw error; // Propaga o erro para ser tratado no componente
        }
    }

    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated(): boolean {
        return !!this.token;
    };


    async getCompanies(): Promise<any[]> {
        if (!this.token) {
            throw new Error('Usuário não autenticado.');
        }

        try {
            const response = await fetch(`${API_URL}/portal_nfse/companies/`, {
                method: 'GET',
                headers: this.getHeaders(), // Para GET, o header padrão com JSON é suficiente
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.detail || 'Falha ao buscar as empresas.');
            }

            // A sua API Django retorna uma lista de objetos
            return await response.json();

        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
            throw error;
        }
    };

    /**
     * Dispara o processo de scraping de NFSe para uma empresa específica.
     * @param companyId - O ID da empresa.
     * @param startDate - Data de início (formato DD/MM/YYYY).
     * @param endDate - Data de fim (formato DD/MM/YYYY).
     */
    // 7. Função para lidar com o clique no botão "Buscar Notas"
    async triggerScrape(companyId: string, startDate: string, endDate: string): Promise<void> {
        if (!this.token) {
            throw new Error('Usuário não autenticado.');
        }

        // A URL agora é simples, sem parâmetros
        const url = `${API_URL}/portal_nfse/scrape/trigger/`;

        // Crie o objeto com os dados que serão enviados
        const bodyData = {
            company_id: companyId,
            start_date: startDate,
            end_date: endDate,
        };

        try {
            const response = await fetch(url, {
                method: 'POST', // Mantém o método POST
                headers: {
                    // É CRUCIAL informar que o corpo é JSON
                    'Content-Type': 'application/json',
                    // Adiciona o cabeçalho de autorização
                    'Authorization': `Bearer ${this.token}`,
                },
                // Converte o objeto em uma string JSON e o coloca no corpo da requisição
                body: JSON.stringify(bodyData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.detail || 'Falha ao iniciar a busca de notas.');
            }

            const result = await response.json();
            console.log('Scraping iniciado:', result.message);

        } catch (error) {
            console.error('Erro ao trigger scraping:', error);
            throw error;
        }
    }

    /**
     * Busca as notas (emitidas ou recebidas) de uma empresa específica.
     * @param companyId - O ID da empresa.
     * @param type - 'emitted' ou 'received'.
     * @param filters - Objeto com filtros (datas, status, etc.).
     */
    async getInvoices(companyId: string, type: 'emitted' | 'received', filters: any = {}): Promise<any[]> {
        if (!this.token) {
            throw new Error('Usuário não autenticado.');
        }

        // **IMPORTANTE**: Você precisará criar este endpoint no seu backend Django.
        // Ex: GET /api/portal_nfse/invoices/?company_id=...&type=emitted
        const url = new URL(`${API_URL}/portal_nfse/invoices/`);
        url.searchParams.append('company_id', companyId);
        url.searchParams.append('type', type);

        // Adicionar outros filtros se existirem
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                url.searchParams.append(key, filters[key]);
            }
        });

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.detail || 'Falha ao buscar as notas.');
            }

            return await response.json();

        } catch (error) {
            console.error(`Erro ao buscar notas ${type}:`, error);
            throw error;
        }
    };

    // NOVO MÉTODO PARA BAIXAR O XML
    async downloadDocumentXml(documentId: string): Promise<Blob> {
        if (!this.token) {
            throw new Error('Usuário não autenticado.');
        }

        // A URL foi corrigida. Como API_URL já termina em /api, não precisamos repetir.
        const url = `${API_URL}/portal_nfse/documents/${documentId}/download-xml/`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders(), // Adiciona o cabeçalho de autorização
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.error || 'Falha ao baixar o arquivo XML.');
            }

            // Converte a resposta para um Blob, que é o tipo de dado necessário para o download no navegador.
            return await response.blob();

        } catch (error) {
            console.error('Erro ao baixar XML:', error);
            throw error; // Propaga o erro para ser tratado no componente
        }
    };

    private getCookie(name: string): string | null {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Verifica se o cookie começa com o nome que procuramos
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    async bulkDownloadXml(documentIds: string[]): Promise<Blob> {
        if (!this.token) {
            throw new Error('Usuário não autenticado.');
        }

        const url = `${API_URL}/portal_nfse/documents/bulk-download-xml/`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    ...this.getHeaders(), // Apenas o Authorization: Bearer <token>
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: documentIds }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // Agora você pode receber um erro 401 mais claro do DRF
                throw new Error(errorData.detail || errorData.error || 'Falha ao baixar os arquivos XML.');
            }

            return await response.blob();

        } catch (error) {
            console.error('Erro ao baixar XMLs em lote:', error);
            throw error;
        }
    };

}

export const apiService = new ApiService();
