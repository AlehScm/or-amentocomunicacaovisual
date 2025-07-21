

'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuotes, useMaterials } from '@/hooks/use-app-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Building, User, Phone, FileDown, Edit, X, Save, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QuotePdfDocument } from '@/components/quote-pdf-document';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Quote, QuoteItem } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const INTEREST_RATE = 0.15; // 15% de taxa de juros

export default function QuoteDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const { getQuoteById, updateQuote } = useQuotes();
    const { materials } = useMaterials();
    const id = params.id as string;
    
    const originalQuote = getQuoteById(id);

    const [isEditing, setIsEditing] = useState(false);
    const [editedQuote, setEditedQuote] = useState<Quote | null>(null);
    const [selectedMaterial, setSelectedMaterial] = useState('');

    useEffect(() => {
        if (originalQuote) {
            setEditedQuote(JSON.parse(JSON.stringify(originalQuote)));
        }
    }, [originalQuote]);
    

    const costSubtotal = useMemo(() => {
        if (!editedQuote) return 0;
        return editedQuote.items.reduce((acc, item) => {
            const itemTotal = item.pricingType === 'per_m2'
                ? item.unitPrice * (item.width || 1) * (item.height || 1) * item.quantity
                : item.unitPrice * item.quantity;
            return acc + itemTotal;
        }, 0);
    }, [editedQuote]);

    const subtotalWithProfit = useMemo(() => {
        if (!editedQuote) return 0;
        return costSubtotal * editedQuote.profitMultiplier;
    }, [costSubtotal, editedQuote]);

    const interest = useMemo(() => subtotalWithProfit * INTEREST_RATE, [subtotalWithProfit]);
    const total = useMemo(() => subtotalWithProfit + interest, [subtotalWithProfit, interest]);
    
    useEffect(() => {
        if (isEditing && editedQuote) {
            setEditedQuote(q => q ? ({
                ...q,
                subtotal: subtotalWithProfit,
                tax: interest,
                total: total
            }) : null);
        }
    }, [subtotalWithProfit, interest, total, isEditing, editedQuote?.items.length, editedQuote?.profitMultiplier]);


    const pdfRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPdf = async () => {
        const contentElement = pdfRef.current;
        if (!contentElement) {
            toast({ variant: 'destructive', title: 'Erro ao gerar PDF' });
            return;
        }
        setIsExporting(true);
        try {
            const canvas = await html2canvas(contentElement, { scale: 3, useCORS: true, logging: true, allowTaint: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const ratio = canvas.width / pdfWidth;
            const imgHeight = canvas.height / ratio;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`orcamento-${originalQuote?.quoteNumber}.pdf`);
            toast({ title: 'PDF Exportado' });
        } catch(error) {
             toast({ variant: 'destructive', title: 'Erro ao exportar PDF' });
            console.error("PDF Export Error: ", error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (originalQuote) {
            setEditedQuote(JSON.parse(JSON.stringify(originalQuote)));
        }
    }

    const handleSave = () => {
        if (editedQuote) {
            updateQuote(id, editedQuote);
            toast({ title: 'Orçamento atualizado com sucesso!' });
            setIsEditing(false);
        }
    };

    const handleUpdateField = (field: keyof Quote, value: any) => {
        if (editedQuote) {
            setEditedQuote({ ...editedQuote, [field]: value });
        }
    };

    const handleUpdateItem = (itemId: string, field: 'quantity' | 'width' | 'height', value: number) => {
        if (!editedQuote) return;
        const numericValue = isNaN(value) ? 0 : value;
        setEditedQuote({
            ...editedQuote,
            items: editedQuote.items.map(item =>
                item.itemId === itemId ? { ...item, [field]: Math.max(field === 'quantity' ? 1 : 0.01, numericValue) } : item
            ),
        });
    };
    
    const handleAddMaterial = () => {
        const material = materials.find(m => m.id === selectedMaterial);
        if (material && editedQuote) {
          const newItem: QuoteItem = {
            itemId: crypto.randomUUID(),
            materialId: material.id,
            quantity: 1,
            unitPrice: material.price,
            width: material.pricingType === 'per_m2' ? 1 : undefined,
            height: material.pricingType === 'per_m2' ? 1 : undefined,
            pricingType: material.pricingType,
          };
          setEditedQuote({ ...editedQuote, items: [...editedQuote.items, newItem] });
        }
    };

    const handleRemoveItem = (itemId: string) => {
        if (editedQuote) {
            setEditedQuote({ ...editedQuote, items: editedQuote.items.filter(item => item.itemId !== itemId) });
        }
    };

    if (!originalQuote || !editedQuote) {
        return (
            <div className="text-center">
                <p>Orçamento não encontrado.</p>
                <Button onClick={() => router.push('/quotes')} className="mt-4">Voltar para Orçamentos</Button>
            </div>
        );
    }
    
    const quoteToDisplay = isEditing ? editedQuote : originalQuote;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
             <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
                 <QuotePdfDocument 
                    ref={pdfRef}
                    quote={originalQuote} 
                    materials={materials} 
                 />
             </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-headline">
                        {isEditing ? `Editando Orçamento #${quoteToDisplay.quoteNumber}` : `Detalhes do Orçamento #${quoteToDisplay.quoteNumber}`}
                    </h1>
                    <p className="text-muted-foreground">Criado em: {format(new Date(quoteToDisplay.createdAt), 'dd/MM/yyyy')}</p>
                </div>
                 <div className="flex gap-2">
                     {isEditing ? (
                        <>
                            <Button onClick={handleSave}><Save className="mr-2" />Salvar Alterações</Button>
                            <Button variant="outline" onClick={handleCancelEdit}><X className="mr-2" />Cancelar</Button>
                        </>
                     ) : (
                        <>
                            <Button onClick={() => setIsEditing(true)}><Edit className="mr-2" />Editar</Button>
                            <Button onClick={handleExportPdf} disabled={isExporting} variant="outline">
                                <FileDown className="mr-2" />
                                {isExporting ? 'Exportando...' : 'Exportar PDF'}
                            </Button>
                        </>
                     )}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Informações do Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {isEditing ? (
                            <>
                                <div className="space-y-1">
                                    <Label htmlFor="companyName">Empresa</Label>
                                    <Input id="companyName" value={editedQuote.companyName} onChange={e => handleUpdateField('companyName', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="contactPerson">Contato</Label>
                                    <Input id="contactPerson" value={editedQuote.contactPerson} onChange={e => handleUpdateField('contactPerson', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input id="phone" value={editedQuote.phone} onChange={e => handleUpdateField('phone', e.target.value)} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <Building className="size-4 text-muted-foreground" />
                                    <span>{quoteToDisplay.companyName}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User className="size-4 text-muted-foreground" />
                                    <span>{quoteToDisplay.contactPerson}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="size-4 text-muted-foreground" />
                                    <span>{quoteToDisplay.phone}</span>
                                </div>
                            </>
                        )}
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
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Multiplicador de Lucro</span>
                            {isEditing ? (
                                <Input 
                                    type="number" 
                                    value={editedQuote.profitMultiplier}
                                    onChange={e => handleUpdateField('profitMultiplier', parseFloat(e.target.value) || 0)}
                                    className="w-20 h-8"
                                    min="1"
                                    step="0.1"
                                />
                            ) : (
                                <span>x{quoteToDisplay.profitMultiplier}</span>
                            )}
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal (Com Lucro)</span>
                            <span>R$ {subtotalWithProfit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Juros (15%)</span>
                            <span>R$ {interest.toFixed(2)}</span>
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
                    {isEditing && (
                        <div className="flex items-center gap-2 mb-4">
                            <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                                <SelectTrigger className="flex-grow">
                                    <SelectValue placeholder="Selecione um material para adicionar" />
                                </SelectTrigger>
                                <SelectContent>
                                {materials.map(m => (
                                    <SelectItem key={m.id} value={m.id}>
                                    {m.name} ({m.pricingType === 'per_m2' ? 'por m²' : 'por unidade'})
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAddMaterial} disabled={!selectedMaterial}><Plus className="mr-2"/>Adicionar Item</Button>
                        </div>
                    )}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Material</TableHead>
                                    <TableHead className="w-[110px]">Dimensões (LxA)</TableHead>
                                    <TableHead className="w-[100px]">Qtd.</TableHead>
                                    <TableHead>Preço Unit. (Custo)</TableHead>
                                    <TableHead className="text-right">Total do Item (Custo)</TableHead>
                                    {isEditing && <TableHead className="w-[50px]"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quoteToDisplay.items.map(item => {
                                    const material = materials.find(m => m.id === item.materialId);
                                    const itemTotalCost = item.pricingType === 'per_m2'
                                        ? item.unitPrice * (item.width || 1) * (item.height || 1) * item.quantity
                                        : item.unitPrice * item.quantity;

                                    return (
                                        <TableRow key={item.itemId}>
                                            <TableCell className="font-medium">{material?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                                {item.pricingType === 'per_m2' ? (
                                                    isEditing ? (
                                                        <div className="flex gap-1">
                                                            <Input type="number" value={item.width || ''} onChange={e => handleUpdateItem(item.itemId, 'width', parseFloat(e.target.value))} min="0.01" step="0.01" className="w-20 h-8" />
                                                            <Input type="number" value={item.height || ''} onChange={e => handleUpdateItem(item.itemId, 'height', parseFloat(e.target.value))} min="0.01" step="0.01" className="w-20 h-8" />
                                                        </div>
                                                    ) : (
                                                        `${item.width || 0}m x ${item.height || 0}m`
                                                    )
                                                ) : <span className="text-muted-foreground">-</span>}
                                            </TableCell>
                                            <TableCell>
                                                {isEditing ? (
                                                    <Input type="number" value={item.quantity || ''} onChange={e => handleUpdateItem(item.itemId, 'quantity', parseInt(e.target.value, 10))} min="1" className="w-20 h-8" />
                                                ) : (
                                                    item.quantity
                                                )}
                                            </TableCell>
                                            <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">R$ {itemTotalCost.toFixed(2)}</TableCell>
                                            {isEditing && (
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.itemId)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            )}
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
