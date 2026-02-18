// Vamos criar uma API para buscar dados dos cnpj na API CNPJA e popular na tela
// para facilitar o cadastro da empresa.

import { CompanyCard } from "@/components/companies/CompanyCard"


export const getCompanyData = async (cnpj: string) => {
    const apiKey = import.meta.env.VITE_CNPJA_API_KEY;

    if (!apiKey) {
        throw new Error("A chave da API (VITE_CNPJA_API_KEY) não foi encontrada.");
    }

    const response = await fetch(`https://api.cnpja.com/office/${cnpj}`, {
        headers: {
            'Authorization': apiKey,
        },
    });

    if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
    }

    return response.json();
};