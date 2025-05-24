import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { formatCurrency, formatHours } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { FilePlus, Download } from 'lucide-react';

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Número da fatura é obrigatório"),
  issueDate: z.string(),
  dueDate: z.string(),
  additionalNotes: z.string().optional()
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceGeneratorProps {
  projectId: string;
}

export function InvoiceGenerator({ projectId }: InvoiceGeneratorProps) {
  const [isPdfReady, setPdfReady] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<jsPDF | null>(null);
  
  const project = useProjectStore(state => state.getProject(projectId));
  const tasks = useTaskStore(state => state.getTasksByProject(projectId));
  const { toast } = useToast();
  
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      additionalNotes: ''
    }
  });

  const generatePDF = (data: InvoiceFormValues) => {
    if (!project) return;
    
    // Create PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add logo and header
    doc.setFillColor(131, 56, 236); // Purple color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('WorkFlowr', 15, 25);
    
    // Invoice details
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('FATURA', pageWidth - 15, 60, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fatura #: ${data.invoiceNumber}`, pageWidth - 15, 70, { align: 'right' });
    doc.text(`Data de Emissão: ${new Date(data.issueDate).toLocaleDateString('pt-BR')}`, pageWidth - 15, 75, { align: 'right' });
    doc.text(`Data de Vencimento: ${new Date(data.dueDate).toLocaleDateString('pt-BR')}`, pageWidth - 15, 80, { align: 'right' });
    
    // Client details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Cliente', 15, 70);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nome: ${project.clientName}`, 15, 75);
    doc.text(`Projeto: ${project.name}`, 15, 80);
    
    // Prepare tasks for table
    const tableData = tasks
      .filter(task => task.timeSpent > 0)
      .map(task => {
        const hours = task.timeSpent / 60;
        const amount = hours * project.rate;
        return [
          task.name, 
          `${formatHours(task.timeSpent)}`, 
          `R$ ${project.rate.toFixed(2)}`,
          `R$ ${amount.toFixed(2)}`
        ];
      });
    
    const totalAmount = tasks.reduce((acc, task) => {
      const hours = task.timeSpent / 60;
      const amount = hours * project.rate;
      return acc + amount;
    }, 0);
    
    // Add task table
    (doc as any).autoTable({
      startY: 95,
      head: [['Descrição', 'Tempo', 'Taxa Horária', 'Valor']],
      body: tableData,
      foot: [['', '', 'Total', `R$ ${totalAmount.toFixed(2)}`]],
      theme: 'grid',
      headStyles: {
        fillColor: [131, 56, 236],
        fontStyle: 'bold',
      },
      footStyles: {
        fillColor: [240, 240, 240],
        fontStyle: 'bold',
      }
    });
    
    // Add notes if provided
    if (data.additionalNotes) {
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Observações:', 15, finalY + 15);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(data.additionalNotes, 15, finalY + 20);
    }
    
    // Add footer
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Fatura gerada pelo WorkFlowr', pageWidth / 2, 280, { align: 'center' });
    
    setPdfDoc(doc);
    setPdfReady(true);
    
    toast({
      title: "Fatura gerada",
      description: "A fatura foi gerada com sucesso! Clique em Baixar PDF para salvar.",
    });
  };

  const downloadPDF = () => {
    if (!pdfDoc || !project) return;
    
    pdfDoc.save(`fatura_${project.name.replace(/\s+/g, '_')}_${form.getValues('invoiceNumber')}.pdf`);
  };

  if (!project) {
    return <div>Projeto não encontrado</div>;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Gerar Fatura</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(generatePDF)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Número da Fatura</Label>
                <Input id="invoiceNumber" {...form.register('invoiceNumber')} />
                {form.formState.errors.invoiceNumber && (
                  <p className="text-sm text-red-500">{form.formState.errors.invoiceNumber.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="issueDate">Data de Emissão</Label>
                <Input id="issueDate" type="date" {...form.register('issueDate')} />
                {form.formState.errors.issueDate && (
                  <p className="text-sm text-red-500">{form.formState.errors.issueDate.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Input id="dueDate" type="date" {...form.register('dueDate')} />
                {form.formState.errors.dueDate && (
                  <p className="text-sm text-red-500">{form.formState.errors.dueDate.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Observações Adicionais</Label>
              <textarea 
                id="additionalNotes"
                className="w-full min-h-[100px] p-2 border rounded-md"
                {...form.register('additionalNotes')}
              />
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Resumo de Valores</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Taxa Horária:</span>
                  <span className="font-medium">{formatCurrency(project.rate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tempo Total:</span>
                  <span className="font-medium">
                    {formatHours(tasks.reduce((acc, task) => acc + task.timeSpent, 0))}
                  </span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>
                    {formatCurrency(
                      tasks.reduce((acc, task) => {
                        const hours = task.timeSpent / 60;
                        return acc + (hours * project.rate);
                      }, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              {!isPdfReady ? (
                <Button type="submit">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Gerar Fatura
                </Button>
              ) : (
                <Button type="button" onClick={downloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}