
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuotes, useMaterials } from '@/hooks/use-app-data';
import { QuoteItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const INTEREST_RATE = 0.15; // 15% de taxa de juros

export default function NewQuotePage() {
  const router = useRouter();
  const { addQuote } = useQuotes();
  const { materials } = useMaterials();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [profitMultiplier, setProfitMultiplier] = useState(3);

  const costSubtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const itemTotal = item.pricingType === 'per_m2'
        ? item.unitPrice * (item.width || 1) * (item.height || 1) * item.quantity
        : item.unitPrice * item.quantity;
      return acc + itemTotal;
    }, 0);
  }, [items]);

  const subtotalWithProfit = useMemo(() => costSubtotal * profitMultiplier, [costSubtotal, profitMultiplier]);
  const interest = useMemo(() => subtotalWithProfit * INTEREST_RATE, [subtotalWithProfit]);
  const total = useMemo(() => subtotalWithProfit + interest, [subtotalWithProfit, interest]);

  const handleAddMaterial = () => {
    const material = materials.find(m => m.id === selectedMaterial);
    if (material) {
      const newItem: QuoteItem = {
        itemId: crypto.randomUUID(),
        materialId: material.id,
        quantity: 1,
        unitPrice: material.price,
        width: material.pricingType === 'per_m2' ? 1 : undefined,
        height: material.pricingType === 'per_m2' ? 1 : undefined,
        pricingType: material.pricingType,
      };
      setItems([...items, newItem]);
    }
  };
  
  const handleUpdateItem = (itemId: string, field: 'quantity' | 'width' | 'height', value: number) => {
    const numericValue = isNaN(value) ? 0 : value;
    
    setItems(items.map(item => {
        if (item.itemId === itemId) {
            const finalValue = Math.max(field === 'quantity' ? 1 : 0.01, numericValue);
            return { ...item, [field]: finalValue };
        }
        return item;
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.itemId !== itemId));
  };
  
  const handleSaveQuote = () => {
    if (!companyName || !contactPerson || items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro de Validação',
        description: 'Por favor, preencha as informações do cliente e adicione pelo menos um item.',
      });
      return;
    }
    const finalItems = items.map(item => ({
        ...item,
        quantity: Math.max(1, item.quantity),
        width: item.width ? Math.max(0.01, item.width) : undefined,
        height: item.height ? Math.max(0.01, item.height) : undefined
    }));

    addQuote({ 
      companyName,
      contactPerson,
      phone,
      items: finalItems, 
      subtotal: subtotalWithProfit, 
      tax: interest, 
      total,
      profitMultiplier,
    });
    toast({
      title: 'Orçamento Salvo!',
      description: 'O novo orçamento foi criado com sucesso.',
    });
    router.push('/quotes');
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nome da empresa do cliente" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="contactPerson">Nome do Responsável</Label>
                <Input id="contactPerson" value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Quem é o contato principal" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Itens do Orçamento</CardTitle>
            <CardDescription>Adicione materiais para montar o orçamento.</CardDescription>
          </CardHeader>
          <CardContent>
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
              <Button onClick={handleAddMaterial} disabled={!selectedMaterial}>Adicionar Item</Button>
            </div>
            <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead className="w-[110px]">Largura (m)</TableHead>
                  <TableHead className="w-[110px]">Altura (m)</TableHead>
                  <TableHead className="w-[100px]">Qtd.</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? items.map(item => {
                  const material = materials.find(m => m.id === item.materialId);
                  const itemTotal = item.pricingType === 'per_m2'
                    ? item.unitPrice * (item.width || 1) * (item.height || 1) * item.quantity
                    : item.unitPrice * item.quantity;
                  return (
                    <TableRow key={item.itemId}>
                      <TableCell className="font-medium">{material?.name || 'N/A'}</TableCell>
                       <TableCell>
                        {item.pricingType === 'per_m2' ? (
                          <Input type="number" value={item.width || ''} onChange={e => handleUpdateItem(item.itemId, 'width', parseFloat(e.target.value))} min="0.01" step="0.01" className="w-24" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                       <TableCell>
                       {item.pricingType === 'per_m2' ? (
                        <Input type="number" value={item.height || ''} onChange={e => handleUpdateItem(item.itemId, 'height', parseFloat(e.target.value))} min="0.01" step="0.01" className="w-24" />
                       ) : (
                        <span className="text-muted-foreground">-</span>
                       )}
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={item.quantity || ''} onChange={e => handleUpdateItem(item.itemId, 'quantity', parseInt(e.target.value, 10))} min="1" className="w-20" />
                      </TableCell>
                      <TableCell className="text-right">R${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">R${itemTotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.itemId)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">Nenhum item adicionado ainda.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1">
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle className="font-headline">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal (Custo)</span>
              <span>R${costSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <Label htmlFor="profitMultiplier" className="text-muted-foreground">Multiplicador de Lucro</Label>
              <Input 
                id="profitMultiplier" 
                type="number" 
                value={profitMultiplier}
                onChange={e => setProfitMultiplier(parseFloat(e.target.value) || 0)}
                className="w-24"
                min="1"
                step="0.1"
              />
            </div>
             <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal (Com Lucro)</span>
              <span>R${subtotalWithProfit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Juros ({(INTEREST_RATE * 100).toFixed(0)}%)</span>
              <span>R${interest.toFixed(2)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>R${total.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" onClick={handleSaveQuote}>Salvar Orçamento</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
