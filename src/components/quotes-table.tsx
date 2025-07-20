
"use client"

import { useQuotes } from "@/hooks/use-app-data"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PlusCircle, Trash2, Eye, MoreVertical } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useRouter } from "next/navigation"

export function QuotesTable() {
  const { quotes, deleteQuote } = useQuotes()
  const router = useRouter()

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/quotes/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Orçamento
          </Button>
        </Link>
      </div>
       <Card>
          <CardHeader>
            <CardTitle className="font-headline">Orçamentos</CardTitle>
            <CardDescription>Gerencie os orçamentos dos seus clientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Orçamento #</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Multiplicador</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {quotes.length > 0 ? (
                    quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(quote => (
                        <TableRow key={quote.id}>
                        <TableCell className="font-medium">
                            <Link href={`/quotes/${quote.id}`} className="hover:underline text-primary">
                                {quote.quoteNumber}
                            </Link>
                        </TableCell>
                        <TableCell>{quote.companyName}</TableCell>
                        <TableCell>{format(new Date(quote.createdAt), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>x{quote.profitMultiplier || 'N/A'}</TableCell>
                        <TableCell><Badge>R${quote.total.toFixed(2)}</Badge></TableCell>
                        <TableCell className="text-right">
                           <AlertDialog>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onSelect={() => router.push(`/quotes/${quote.id}`)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Visualizar
                                  </DropdownMenuItem>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Deletar
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. Isso excluirá permanentemente o orçamento "{quote.quoteNumber}".
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteQuote(quote.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center">
                        Nenhum orçamento criado ainda.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
