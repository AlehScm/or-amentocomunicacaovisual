
'use client';
import { useState, DragEvent, useEffect } from 'react';
import { useDeals, useDealStatuses } from '@/hooks/use-app-data';
import { Deal, DealStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Edit, MoreVertical, Lock, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';


const AddDealForm = ({ onFinished }: { onFinished: () => void }) => {
  const { addDeal } = useDeals();
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [value, setValue] = useState(0);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName || value <= 0) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos corretamente.",
      });
      return;
    }
    addDeal({ title, clientName, value });
    toast({
      title: "Negócio Adicionado",
      description: `"${title}" foi adicionado ao funil.`,
    });
    onFinished();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título do Negócio</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Novo Website para Empresa ABC" />
      </div>
      <div>
        <Label htmlFor="clientName">Nome do Cliente</Label>
        <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="ex: João da Silva" />
      </div>
      <div>
        <Label htmlFor="value">Valor (R$)</Label>
        <Input id="value" type="number" value={value} onChange={(e) => setValue(parseFloat(e.target.value))} />
      </div>
      <Button type="submit" className="w-full">Adicionar Negócio</Button>
    </form>
  );
};

const DealCard = ({ deal }: { deal: Deal }) => {
  const { deleteDeal } = useDeals();

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('dealId', deal.id);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  return (
    <Card 
      draggable={true}
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      className={`mb-4 bg-card shadow-sm hover:shadow-lg transition-all rounded-lg border cursor-grab active:cursor-grabbing`}
    >
      <CardHeader className="p-4 flex flex-row items-start justify-between">
        <CardTitle className="text-base font-semibold font-body">{deal.title}</CardTitle>
          <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente o negócio "{deal.title}".
                  </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteDeal(deal.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <span>{deal.clientName}</span>
        </div>
        <p className="text-lg font-bold text-primary">R$ {deal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </CardContent>
    </Card>
  );
};

const AddStatusForm = ({ onFinished }: { onFinished: () => void }) => {
    const { addDealStatus } = useDealStatuses();
    const { toast } = useToast();
    const [statusName, setStatusName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!statusName.trim()) {
            toast({ variant: "destructive", title: "O nome do status não pode estar vazio." });
            return;
        }
        addDealStatus(statusName.trim());
        toast({ title: "Coluna Adicionada!" });
        onFinished();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="statusName">Nome da Nova Coluna</Label>
                <Input id="statusName" value={statusName} onChange={e => setStatusName(e.target.value)} placeholder="ex: Em Negociação" />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Adicionar Coluna</Button>
            </DialogFooter>
        </form>
    )
};

const KanbanColumn = ({ status, dealsInColumn }: { status: DealStatus, dealsInColumn: Deal[] }) => {
    const { updateDealStatus } = useDeals();
    const { updateStatusDetails, deleteDealStatus } = useDealStatuses();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [newStatusName, setNewStatusName] = useState(status.name);
    const [newStatusColor, setNewStatusColor] = useState(status.color);
    const [isDragOver, setIsDragOver] = useState(false);
    const isLockedForEditing = status.name === "Orçamento";
    
    const colors = ["#8E8E8E", "#4A90E2", "#F5A623", "#50E3C2", "#D0021B", "#BD10E0", "#4A4A4A", "#9B9B9B"];


    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        setIsDragOver(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const dealId = e.dataTransfer.getData('dealId');
        if (dealId) {
            updateDealStatus(dealId, status.id);
        }
    };

    const handleDeleteStatus = () => {
        if (isLockedForEditing) return;
        if (dealsInColumn.length > 0) {
            toast({
                variant: 'destructive',
                title: 'Não é possível excluir a coluna',
                description: 'Mova ou exclua todos os cartões desta coluna antes de excluí-la.'
            });
            return;
        }
        deleteDealStatus(status.id);
        toast({ title: 'Coluna excluída!' });
    }

    const handleRenameStatus = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLockedForEditing) return;
        if (!newStatusName.trim()) {
            setIsEditing(false);
            setNewStatusName(status.name);
            return;
        }
        updateStatusDetails(status.id, { name: newStatusName.trim() });
        toast({ title: 'Coluna renomeada!' });
        setIsEditing(false);
    }
    
    const handleUpdateColor = (color: string) => {
        if (isLockedForEditing) return;
        setNewStatusColor(color);
        updateStatusDetails(status.id, { color });
        toast({ title: 'Cor da coluna atualizada!' });
    }


    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col w-full rounded-lg transition-colors bg-muted/50 ${isDragOver ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
        >
            <div className="flex items-center justify-between p-3 rounded-t-lg" style={{ backgroundColor: status.color }}>
                {isEditing && !isLockedForEditing ? (
                    <form onSubmit={handleRenameStatus} className="flex-grow">
                        <Input 
                            value={newStatusName}
                            onChange={(e) => setNewStatusName(e.target.value)}
                            onBlur={handleRenameStatus}
                            autoFocus
                            className="h-8 border-white/50 bg-white/20 text-white placeholder-white/80"
                        />
                    </form>
                ) : (
                     <h2 className={`font-headline text-lg font-semibold text-center flex-grow text-white flex items-center justify-center gap-2 ${!isLockedForEditing ? 'cursor-pointer' : ''}`} onClick={() => !isLockedForEditing && setIsEditing(true)}>
                        {status.name}
                        {isLockedForEditing && <Lock className="size-4 opacity-80" />}
                    </h2>
                )}
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 shrink-0 text-white hover:bg-white/20 hover:text-white" disabled={isLockedForEditing}>
                            <MoreVertical className="size-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setIsEditing(true)} disabled={isLockedForEditing}>
                            <Edit className="mr-2 size-4" /> Renomear
                        </DropdownMenuItem>
                        
                        <Popover>
                            <PopoverTrigger asChild>
                                <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                   <Palette className="mr-2 size-4" /> Alterar Cor
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                                <div className="grid grid-cols-4 gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            className={`w-8 h-8 rounded-full border-2 ${newStatusColor === color ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => handleUpdateColor(color)}
                                        />
                                    ))}
                                    <Input
                                        type="color"
                                        value={newStatusColor}
                                        onChange={(e) => handleUpdateColor(e.target.value)}
                                        className="w-8 h-8 p-0 border-none cursor-pointer"
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>


                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive" disabled={isLockedForEditing}>
                                    <Trash2 className="mr-2 size-4" /> Excluir
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir coluna "{status.name}"?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Você só pode excluir colunas que não contenham negócios.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteStatus} disabled={dealsInColumn.length > 0} className="bg-destructive hover:bg-destructive/90">
                                        Excluir Coluna
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="space-y-0 min-h-[200px] overflow-y-auto px-4 pt-4 pb-4">
                {dealsInColumn.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                ))}
            </div>
        </div>
    );
};


export const KanbanBoard = () => {
  const { deals } = useDeals();
  const { dealStatuses } = useDealStatuses();
  const [isAddDealOpen, setAddDealOpen] = useState(false);
  const [isAddStatusOpen, setAddStatusOpen] = useState(false);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient && dealStatuses.length === 0 && deals.length === 0) {
    return <div className="flex-grow p-4 sm:p-6 text-center">Carregando...</div>;
  }
  
  const showEmptyState = isClient && dealStatuses.length === 0;

  return (
    <div className="flex flex-col h-full -mx-4 -my-4 sm:-mx-6 sm:-my-6">
      <div className="flex justify-end gap-2 p-4 sm:p-6 border-b">
        <Dialog open={isAddDealOpen} onOpenChange={setAddDealOpen}>
          <DialogTrigger asChild>
            <Button disabled={showEmptyState}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Negócio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline">Criar um Novo Negócio</DialogTitle>
            </DialogHeader>
            <AddDealForm onFinished={() => setAddDealOpen(false)} />
          </DialogContent>
        </Dialog>
        <Dialog open={isAddStatusOpen} onOpenChange={setAddStatusOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Coluna</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline">Adicionar Nova Coluna</DialogTitle>
            </DialogHeader>
            <AddStatusForm onFinished={() => setAddStatusOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
       <div className="flex-grow grid grid-flow-col auto-cols-[320px] gap-6 overflow-x-auto p-4 sm:p-6">
        {dealStatuses.map((status) => (
            <KanbanColumn 
                key={status.id}
                status={status}
                dealsInColumn={deals.filter((deal) => deal.status === status.id)}
            />
        ))}
         {showEmptyState && (
          <div className="col-span-full flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 border-2 border-dashed rounded-lg bg-card">
            <h3 className="text-xl font-semibold text-muted-foreground">Seu quadro Kanban está vazio.</h3>
            <p className="text-muted-foreground mt-2">Comece adicionando uma coluna para organizar seus negócios.</p>
            <Dialog open={isAddStatusOpen} onOpenChange={setAddStatusOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Primeira Coluna</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-headline">Adicionar Nova Coluna</DialogTitle>
                </DialogHeader>
                <AddStatusForm onFinished={() => setAddStatusOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};
