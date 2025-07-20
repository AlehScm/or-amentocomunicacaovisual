

'use client'

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import DashboardLayout from '@/components/dashboard-layout';
import React, { ReactNode } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { AppContext, AppContextType, initialData } from '@/hooks/use-app-data';
import { AppData, Deal, DealStatus, Material, Quote } from '@/lib/types';


export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useLocalStorage<AppData>("app-data", initialData);

  const updateData = (updater: (prevData: AppData) => AppData) => {
    setData(prevData => updater(prevData));
  };

  // Deal Logic
  const addDeal = (deal: Omit<Deal, "id" | "status">) => {
    updateData(prevData => {
      const defaultStatus = prevData.dealStatuses?.[0];
      if (!defaultStatus) return prevData;
      const newDeal: Deal = {
        ...deal,
        id: crypto.randomUUID(),
        status: defaultStatus.id,
      };
      return { ...prevData, deals: [...prevData.deals, newDeal] };
    });
  };

  const updateDealStatus = (id: string, statusId: string) => {
    updateData(prevData => ({
      ...prevData,
      deals: prevData.deals.map(d => (d.id === id ? { ...d, status: statusId } : d)),
    }));
  };

  const deleteDeal = (id: string) => {
    updateData(prevData => ({
      ...prevData,
      deals: prevData.deals.filter(d => d.id !== id),
    }));
  };

  // Deal Status Logic
  const addDealStatus = (name: string) => {
    updateData(prevData => {
      const newStatus: DealStatus = {
        id: crypto.randomUUID(),
        name,
        color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
      };
      if (prevData.dealStatuses?.some(s => s.name === name)) return prevData;
      return { ...prevData, dealStatuses: [...(prevData.dealStatuses ?? []), newStatus] };
    });
  };

  const updateStatusDetails = (id: string, newStatusData: Partial<Omit<DealStatus, "id">>) => {
    updateData(prevData => {
      // Prevent duplicate names if name is being changed
      if (newStatusData.name && prevData.dealStatuses.some(s => s.name === newStatusData.name && s.id !== id)) {
        console.error("Status name already exists.");
        return prevData;
      }
      return {
        ...prevData,
        dealStatuses: prevData.dealStatuses?.map(s => (s.id === id ? { ...s, ...newStatusData } : s)),
      };
    });
  };
  
  const deleteDealStatus = (statusIdToDelete: string) => {
    updateData(prevData => {
      const dealsInStatus = prevData.deals.filter(d => d.status === statusIdToDelete);
      if (dealsInStatus.length > 0) {
        console.error("Cannot delete status with deals in it.");
        return prevData;
      }
      return {
        ...prevData,
        dealStatuses: prevData.dealStatuses?.filter(s => s.id !== statusIdToDelete),
      };
    });
  };

  // Material Logic
  const addMaterial = (material: Omit<Material, "id">) => {
    updateData(prevData => {
      const newMaterial: Material = { ...material, id: crypto.randomUUID() };
      return { ...prevData, materials: [...prevData.materials, newMaterial] };
    });
  };

  const updateMaterial = (id: string, updatedMaterial: Partial<Omit<Material, "id">>) => {
    updateData(prevData => ({
      ...prevData,
      materials: prevData.materials.map(m =>
        m.id === id ? { ...m, ...updatedMaterial } : m
      ),
    }));
  };

  const deleteMaterial = (id: string) => {
    updateData(prevData => ({
      ...prevData,
      materials: prevData.materials.filter(m => m.id !== id),
    }));
  };

  // Quote Logic
  const addQuote = (quote: Omit<Quote, "id" | "quoteNumber" | "createdAt">) => {
    updateData(prevData => {
      // Create new quote
      const latestQuoteNumber = prevData.quotes.reduce((max, q) => {
        const num = parseInt(q.quoteNumber.split("-")[1]);
        return num > max ? num : max;
      }, 0);
      const newQuoteNumber = `ORC-${(latestQuoteNumber + 1).toString().padStart(4, "0")}`;
      const newQuote: Quote = {
        ...quote,
        id: crypto.randomUUID(),
        quoteNumber: newQuoteNumber,
        createdAt: new Date().toISOString(),
      };
      
      const budgetStatus = prevData.dealStatuses.find(s => s.name === "Orçamento");
      if (!budgetStatus) {
        console.error("Could not find 'Orçamento' status. Please create it.");
        return { ...prevData, quotes: [...prevData.quotes, newQuote] };
      }

      // Create corresponding deal
      const newDeal: Deal = {
        id: crypto.randomUUID(),
        title: `Orçamento #${newQuoteNumber}`,
        clientName: quote.companyName,
        value: quote.total,
        status: budgetStatus.id,
      };

      return { 
          ...prevData, 
          quotes: [...prevData.quotes, newQuote],
          deals: [...prevData.deals, newDeal],
      };
    });
  };

  const deleteQuote = (id: string) => {
    updateData(prevData => ({
      ...prevData,
      quotes: prevData.quotes.filter(q => q.id !== id),
    }));
  };
  
  // Data Management
  const exportData = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `acm_e_letras_backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (importedData: any) => {
    const defaultStatuses: DealStatus[] = [
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
                color: defaultStatuses[index]?.color || `#${Math.floor(Math.random()*16777215).toString(16)}`
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
  };
  
  const resetData = () => {
    setData(initialData);
  }

  // Company Logo
  const setCompanyLogo = (logo: string) => {
    updateData(prevData => ({ ...prevData, companyLogo: logo }));
  }

  const value: AppContextType = {
    data,
    setData,
    addDeal,
    updateDealStatus,
    deleteDeal,
    addDealStatus,
    updateStatusDetails,
    deleteDealStatus,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addQuote,
    deleteQuote,
    exportData,
    importData,
    setCompanyLogo,
    resetData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}


// export const metadata: Metadata = {
//   title: 'Acm E Letras',
//   description: 'Gestão de projetos e orçamentos',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Acm E Letras</title>
        <meta name="description" content="Gestão de projetos e orçamentos" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <DashboardLayout>{children}</DashboardLayout>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
