

'use client';

import { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuotes, useMaterials } from '@/hooks/use-app-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Building, User, Phone, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QuotePdfDocument } from '@/components/quote-pdf-document';

export default function QuoteDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const { getQuoteById } = useQuotes();
    const { materials } = useMaterials();
    const id = params.id as string;
    const quote = getQuoteById(id);

    const pdfRef = useRef<HTMLDivElement>(null);

    const [isExporting, setIsExporting] = useState(false);

    const handleExportPdf = async () => {
        const contentElement = pdfRef.current;
        if (!contentElement) {
            toast({
                variant: 'destructive',
                title: 'Erro ao gerar PDF',
                description: 'Não foi possível encontrar o conteúdo para exportar.'
            });
            return;
        }
    
        setIsExporting(true);
    
        try {
            const canvas = await html2canvas(contentElement, { 
                scale: 3, // Aumenta a escala para melhor qualidade de imagem
                useCORS: true,
                logging: true,
                allowTaint: true,
             });
            const imgData = canvas.toDataURL('image/png');
    
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const imgHeight = canvasHeight / ratio;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
    
            pdf.save(`orcamento-${quote?.quoteNumber}.pdf`);
    
            toast({
                title: 'PDF Exportado',
                description: 'O orçamento foi exportado com sucesso.'
            });
    
        } catch(error) {
             toast({
                variant: 'destructive',
                title: 'Erro ao exportar PDF',
                description: 'Ocorreu um problema ao gerar o arquivo PDF.'
            });
            console.error("PDF Export Error: ", error);
        } finally {
            setIsExporting(false);
        }
    };

    if (!quote) {
        return (
            <div className="text-center">
                <p>Orçamento não encontrado.</p>
                <Button onClick={() => router.push('/quotes')} className="mt-4">Voltar para Orçamentos</Button>
            </div>
        );
    }

    const {
        quoteNumber,
        companyName,
        contactPerson,
        phone,
        items,
        subtotal,
        profitMultiplier,
        tax,
        total,
        createdAt
    } = quote;
    
    const costSubtotal = items.reduce((acc, item) => {
      const itemTotal = item.pricingType === 'per_m2'
        ? item.unitPrice * (item.width || 1) * (item.height || 1) * item.quantity
        : item.unitPrice * item.quantity;
      return acc + itemTotal;
    }, 0);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
             {/* Componente oculto para gerar o PDF */}
             <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
                 <QuotePdfDocument 
                    ref={pdfRef}
                    quote={quote} 
                    materials={materials} 
                 />
             </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Detalhes do Orçamento #{quoteNumber}</h1>
                    <p className="text-muted-foreground">Criado em: {format(new Date(createdAt), 'dd/MM/yyyy')}</p>
                </div>
                 <Button onClick={handleExportPdf} disabled={isExporting}>
                    <FileDown className="mr-2" />
                    {isExporting ? 'Exportando...' : 'Exportar PDF'}
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Informações do Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <Building className="size-4 text-muted-foreground" />
                            <span>{companyName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <User className="size-4 text-muted-foreground" />
                            <span>{contactPerson}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="size-4 text-muted-foreground" />
                            <span>{phone}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Resumo Financeiro</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal (Custo)</span>
                            <span>R$ {costSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Multiplicador de Lucro</span>
                            <span>x{profitMultiplier}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal (Com Lucro)</span>
                            <span>R$ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Juros (15%)</span>
                            <span>R$ {tax.toFixed(2)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>R$ {total.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Itens do Orçamento</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Material</TableHead>
                                    <TableHead>Dimensões (LxA)</TableHead>
                                    <TableHead>Qtd.</TableHead>
                                    <TableHead className="text-right">Preço Unit. (Custo)</TableHead>
                                    <TableHead className="text-right">Total do Item (Custo)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map(item => {
                                    const material = materials.find(m => m.id === item.materialId);
                                    const itemTotal = item.pricingType === 'per_m2'
                                        ? item.unitPrice * (item.width || 1) * (item.height || 1) * item.quantity
                                        : item.unitPrice * item.quantity;

                                    return (
                                        <TableRow key={item.itemId}>
                                            <TableCell className="font-medium">{material?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                                {item.pricingType === 'per_m2'
                                                    ? `${item.width || 0}m x ${item.height || 0}m`
                                                    : <span className="text-muted-foreground">-</span>}
                                            </TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell className="text-right">R$ {item.unitPrice.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">R$ {itemTotal.toFixed(2)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
