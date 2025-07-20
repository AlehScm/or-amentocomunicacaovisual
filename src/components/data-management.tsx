
"use client"

import React, { useRef } from "react"
import { useDataManagement, useCompanyInfo } from "@/hooks/use-app-data"
import Image from "next/image"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "./ui/card"
import { Download, Upload, Image as ImageIcon, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DataManagement() {
  const { exportData, importData, resetData } = useDataManagement()
  const { companyLogo, setCompanyLogo } = useCompanyInfo();
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      exportData()
      toast({
        title: "Exportação Bem-sucedida",
        description: "Seus dados foram baixados como um arquivo JSON.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha na Exportação",
        description: "Ocorreu um erro ao exportar seus dados.",
      })
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = e => {
      try {
        const text = e.target?.result
        if (typeof text !== "string") {
            throw new Error("O arquivo não é um arquivo de texto válido.")
        }
        const data = JSON.parse(text)
        importData(data)
        toast({
            title: "Importação Bem-sucedida",
            description: "Seus dados foram restaurados.",
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Falha na Importação",
          description: "O arquivo selecionado não é válido ou está corrompido.",
        })
      }
    }
    reader.readAsText(file)
    if(event.target) {
        event.target.value = ''
    }
  }

  const handleLogoUploadClick = () => {
      logoInputRef.current?.click();
  }

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { // Limite de 1MB
      toast({
        variant: "destructive",
        title: "Arquivo Muito Grande",
        description: "Por favor, selecione um logo com menos de 1MB."
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setCompanyLogo(result);
        toast({
          title: "Logo Atualizado",
          description: "Seu novo logo foi salvo com sucesso."
        });
      }
    };
    reader.readAsDataURL(file);
  }
  
  const handleResetData = () => {
    resetData();
    toast({
        title: "Dados Resetados",
        description: "Todos os dados da aplicação foram restaurados para o padrão."
    });
  }

  return (
    <div className="max-w-2xl mx-auto grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Personalização da Empresa</CardTitle>
                <CardDescription>
                    Faça o upload do logo da sua empresa para que ele apareça nos orçamentos em PDF.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col items-center justify-center gap-4 p-4 border rounded-lg">
                    <p className="font-medium text-sm">Logo Atual</p>
                    <div className="h-24 w-48 relative">
                        {companyLogo ? (
                             <Image src={companyLogo} alt="Logo da Empresa" layout="fill" objectFit="contain" />
                        ) : (
                            <div className="h-full w-full bg-muted rounded-md flex items-center justify-center">
                                <ImageIcon className="text-muted-foreground" />
                            </div>
                        )}
                    </div>
                </div>
                 <div className="flex flex-col items-center justify-center gap-2">
                    <Button onClick={handleLogoUploadClick} variant="outline" className="w-full">
                        <Upload className="mr-2 h-4 w-4" /> Alterar Logo
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">Recomendado: .png com fundo transparente, máx 1MB.</p>
                 </div>
                 <input
                    type="file"
                    ref={logoInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleLogoFileChange}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Backup e Restauração de Dados</CardTitle>
                <CardDescription>
                Exporte os dados da sua aplicação como um arquivo JSON para backup. Você pode
                restaurar seus dados importando um arquivo previamente exportado.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Exportar Dados
                </Button>
                <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Importar Dados
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Confirmação de Importação de Dados</AlertDialogTitle>
                    <AlertDialogDescription>
                        A importação de dados substituirá todas as negociações, materiais,
                        e orçamentos existentes. Esta ação não pode ser desfeita. Tem certeza
                        que deseja continuar?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleImportClick}>
                        Continuar
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
                <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
                />
            </CardContent>
        </Card>
        
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="font-headline">Zona de Perigo</CardTitle>
                <CardDescription>
                    Esta ação é irreversível. Tenha certeza absoluta antes de prosseguir.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <RefreshCw className="mr-2 h-4 w-4" /> Resetar Todos os Dados
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Todos os seus negócios, materiais, orçamentos e configurações personalizadas serão permanentemente apagados.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetData} className="bg-destructive hover:bg-destructive/90">
                            Sim, resetar tudo
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    </div>
  )
}
