// Vamos criar uma API para buscar dados dos cnpj na API CNPJA e popular na tela
// para facilitar o cadastro da empresa.

import { CompanyCard } from "@/components/companies/CompanyCard"

// Abaixo o exemplo de retorno de um json da api que usaremos. Precisaremos dos seguintes
// dados das empresa: company.name, mainActivity.id, mainActivity.text 

// {
//   "updated": "2026-01-10T00:00:00.000Z",
//   "taxId": "22904355000148",
//   "company": {
//     "id": 22904355,
//     "name": "MARCOS VINICIUS MADEIRA DA SILVA",
//     "equity": 12000,
//     "nature": {
//       "id": 2135,
//       "text": "Empresário (Individual)"
//     },
//     "size": {
//       "id": 1,
//       "acronym": "ME",
//       "text": "Microempresa"
//     },
//     "members": []
//   },
//   "alias": "3mx Consultoria de Tecnologia da Informacao",
//   "founded": "2015-07-22",
//   "head": true,
//   "statusDate": "2024-07-12",
//   "status": {
//     "id": 2,
//     "text": "Ativa"
//   },
//   "address": {
//     "municipality": 3525003,
//     "street": "Rua Paulo de Campos",
//     "number": "29",
//     "details": null,
//     "district": "Vila Esmeralda",
//     "city": "Jandira",
//     "state": "SP",
//     "zip": "06602240",
//     "country": {
//       "id": 76,
//       "name": "Brasil"
//     }
//   },
//   "phones": [
//     {
//       "type": "LANDLINE",
//       "area": "11",
//       "number": "46197751"
//     }
//   ],
//   "emails": [
//     {
//       "ownership": "PERSONAL",
//       "address": "mmadeirasilva5@gmail.com",
//       "domain": "gmail.com"
//     }
//   ],
//   "mainActivity": {
//     "id": 6204000,
//     "text": "Consultoria em tecnologia da informação"
//   },
//   "sideActivities": [
//     {
//       "id": 8211300,
//       "text": "Serviços combinados de escritório e apoio administrativo"
//     }
//   ]
// }

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