import { User } from '@/types';

// O Django está servindo em localhost:8001
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api';

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

    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated(): boolean {
        return !!this.token;
    }
}

export const apiService = new ApiService();
