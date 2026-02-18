
export interface CNPJData {
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
    email: string;
    telefone: string;
}

export const fetchCNPJData = async (cnpj: string): Promise<CNPJData | null> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock data for testing
    if (cnpj.replace(/\D/g, '') === '00000000000191') {
        return {
            cnpj: '00.000.000/0001-91',
            razao_social: 'Banco do Brasil S.A.',
            nome_fantasia: 'Banco do Brasil',
            logradouro: 'Rua Setor Bancario Sul',
            numero: 'S/N',
            complemento: '',
            bairro: 'Asa Sul',
            municipio: 'Brasília',
            uf: 'DF',
            cep: '70090-001',
            email: 'contato@bb.com.br',
            telefone: '(61) 4004-0001',
        };
    }

    return null;
};
