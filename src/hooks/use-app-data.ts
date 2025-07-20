
"use client"

import { AppData, Deal, DealStatus, Material, Quote } from "@/lib/types"
import { createContext, useContext } from "react"
import useLocalStorage from "./use-local-storage"

export interface AppContextType {
  data: AppData;
  setData: (data: AppData | ((prevData: AppData) => AppData)) => void;
  // Deals
  addDeal: (deal: Omit<Deal, "id" | "status">) => void;
  updateDealStatus: (id: string, statusId: string) => void;
  deleteDeal: (id: string) => void;
  // Deal Statuses
  addDealStatus: (name: string) => void;
  updateStatusDetails: (id: string, newStatus: Partial<Omit<DealStatus, "id">>) => void;
  deleteDealStatus: (statusIdToDelete: string) => void;
  // Materials
  addMaterial: (material: Omit<Material, "id">) => void;
  updateMaterial: (id: string, updatedMaterial: Partial<Omit<Material, "id">>) => void;
  deleteMaterial: (id: string) => void;
  // Quotes
  addQuote: (quote: Omit<Quote, "id" | "quoteNumber" | "createdAt">) => void;
  deleteQuote: (id: string) => void;
  // Data Management
  exportData: () => void;
  importData: (data: any) => void;
  resetData: () => void;
  // Personalization
  setCompanyLogo: (logo: string) => void;
}

const defaultStatuses: DealStatus[] = [
    { id: "s1", name: "Orçamento", color: "#8E8E8E" },
];

export const initialData: AppData = {
  deals: [],
  materials: [],
  quotes: [],
  dealStatuses: defaultStatuses,
  companyLogo: undefined,
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export const useAppDataContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppDataContext must be used within an AppProvider")
  }
  return context
}

export const useDeals = () => {
  const { data, addDeal, updateDealStatus, deleteDeal } = useAppDataContext()
  const getDealsByStatus = (statusId: string) => data.deals.filter(d => d.status === statusId);
  return { deals: data.deals, addDeal, updateDealStatus, deleteDeal, getDealsByStatus }
}

export const useDealStatuses = () => {
  const {
    data,
    addDealStatus,
    updateStatusDetails,
    deleteDealStatus,
  } = useAppDataContext()
  return {
    dealStatuses: data.dealStatuses ?? [],
    deals: data.deals,
    addDealStatus,
    updateStatusDetails,
    deleteDealStatus,
  }
}

export const useMaterials = () => {
  const { data, addMaterial, updateMaterial, deleteMaterial } =
    useAppDataContext()
  return {
    materials: data.materials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
  }
}

export const useQuotes = () => {
  const { data, addQuote, deleteQuote } = useAppDataContext()
  const getQuoteById = (id: string) => data.quotes.find(q => q.id === id);
  return { quotes: data.quotes, addQuote, deleteQuote, getQuoteById }
}

export const useCompanyInfo = () => {
    const { data, setCompanyLogo } = useAppDataContext();
    return { companyLogo: data.companyLogo, setCompanyLogo };
}

export const useDataManagement = () => {
    const { data, setData, resetData } = useAppDataContext();

    const exportData = () => {
        const jsonString = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonString], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `acm_e_letras_backup_${new Date()
          .toISOString()
          .split("T")[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const importData = (importedData: any) => {
        const fullDefaultStatuses: DealStatus[] = [
            { id: "s1", name: "Orçamento", color: "#8E8E8E" },
            { id: "s2", name: "Prospecção", color: "#4A90E2" },
            { id: "s3", name: "Negociação", color: "#F5A623" },
            { id: "s4", name: "Fechado", color: "#50E3C2" },
            { id: "s5", name: "Perdido", color: "#D0021B" },
        ];
        // Check if imported data has legacy format (array of strings for statuses)
        const isLegacyFormat = importedData.dealStatuses && Array.isArray(importedData.dealStatuses) && typeof importedData.dealStatuses[0] === 'string';

        if (isLegacyFormat) {
            const statusNameMap: { [key: string]: DealStatus } = {};
            const newStatuses = importedData.dealStatuses.map((name: string, index: number) => {
                const newStatus = {
                    id: crypto.randomUUID(), // Ensure a unique ID
                    name: name,
                    color: fullDefaultStatuses[index]?.color || `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
                };
                statusNameMap[name] = newStatus;
                return newStatus;
            });

            // Ensure "Orçamento" exists and is first
            let orcamentoStatus = newStatuses.find(s => s.name === "Orçamento");
            if (!orcamentoStatus) {
                orcamentoStatus = { id: crypto.randomUUID(), name: "Orçamento", color: "#8E8E8E" };
                newStatuses.unshift(orcamentoStatus);
            } else {
                newStatuses.sort((a, b) => a.name === "Orçamento" ? -1 : b.name === "Orçamento" ? 1 : 0);
            }

            importedData.dealStatuses = newStatuses;
            
            if (importedData.deals) {
                importedData.deals.forEach((deal: Deal) => {
                    const foundStatus = statusNameMap[deal.status as any];
                    if (foundStatus) {
                        deal.status = foundStatus.id;
                    } else {
                        deal.status = newStatuses[0]?.id; // Fallback to the first status
                    }
                });
            }
        } else if (importedData.dealStatuses) {
            // For non-legacy formats, still ensure IDs are unique
            importedData.dealStatuses.forEach((s: DealStatus) => s.id = s.id || crypto.randomUUID());
        }


        const newAppData: AppData = {
          deals: importedData.deals || [],
          materials: importedData.materials || [],
          quotes: importedData.quotes || [],
          dealStatuses: importedData.dealStatuses || defaultStatuses,
          companyLogo: importedData.companyLogo || undefined,
        };
        setData(newAppData);
    }
    return { exportData, importData, resetData };
}
