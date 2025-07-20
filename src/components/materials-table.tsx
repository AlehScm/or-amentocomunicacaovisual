"use client"

import { useState } from "react"
import { useMaterials } from "@/hooks/use-app-data"
import { Material, PricingType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"

const MaterialForm = ({
  onFinished,
  material,
}: {
  onFinished: () => void
  material?: Material
}) => {
  const { addMaterial, updateMaterial } = useMaterials()
  const { toast } = useToast()

  const [name, setName] = useState(material?.name || "")
  const [price, setPrice] = useState(material?.price || 0)
  const [pricingType, setPricingType] = useState<PricingType>(material?.pricingType || "per_m2")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || price <= 0) {
      toast({ variant: "destructive", title: "Por favor, preencha todos os campos." })
      return
    }

    if (material) {
      updateMaterial(material.id, { name, price, pricingType })
      toast({ title: "Material atualizado!" })
    } else {
      addMaterial({ name, price, pricingType })
      toast({ title: "Material adicionado!" })
    }
    onFinished()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Material</Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="ex: Chapa de Acm"
        />
      </div>
      <div>
        <Label htmlFor="price">Preço (R$)</Label>
        <Input
          id="price"
          type="number"
          value={price}
          onChange={e => setPrice(parseFloat(e.target.value) || 0)}
          step="0.01"
        />
      </div>
      <div>
        <Label>Tipo de Preço</Label>
        <RadioGroup
          value={pricingType}
          onValueChange={(value: string) => setPricingType(value as PricingType)}
          className="flex items-center space-x-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="per_m2" id="per_m2" />
            <Label htmlFor="per_m2">Por m²</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="per_unit" id="per_unit" />
            <Label htmlFor="per_unit">Por Unidade</Label>
          </div>
        </RadioGroup>
      </div>
      <DialogFooter>
        <Button type="submit">{material ? "Salvar Alterações" : "Adicionar Material"}</Button>
      </DialogFooter>
    </form>
  )
}

export function MaterialsTable() {
  const { materials, deleteMaterial } = useMaterials()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | undefined>(
    undefined
  )

  const handleAddNew = () => {
    setEditingMaterial(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    setDialogOpen(true)
  }
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingMaterial(undefined);
    }
    setDialogOpen(open);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Material
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Registro de Materiais</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Tipo de Preço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.length > 0 ? (
                  materials.map(material => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>R${material.price.toFixed(2)}</TableCell>
                      <TableCell>{material.pricingType === 'per_m2' ? 'Por m²' : 'Por Unidade'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(material)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMaterial(material.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Nenhum material registrado ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">
            {editingMaterial ? "Editar Material" : "Adicionar um Novo Material"}
          </DialogTitle>
          <DialogDescription>
            {editingMaterial
              ? "Atualize os detalhes deste material."
              : "Registre um novo material para uso em produtos e orçamentos."}
          </DialogDescription>
        </DialogHeader>
        <MaterialForm
          onFinished={() => setDialogOpen(false)}
          material={editingMaterial}
        />
      </DialogContent>
    </Dialog>
  )
}
