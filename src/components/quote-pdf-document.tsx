
"use client";

import React from 'react';
import type { Quote, Material } from '@/lib/types';
import Image from 'next/image';
import { useCompanyInfo } from '@/hooks/use-app-data';

interface QuotePdfDocumentProps {
    quote: Quote;
    materials: Material[];
}

export const QuotePdfDocument = React.forwardRef<HTMLDivElement, QuotePdfDocumentProps>(({ 
    quote, 
    materials,
}, ref) => {
    const { companyLogo } = useCompanyInfo();
    if (!quote) return null;
    
    const pageWidth = 794; 
    
    return (
        <div ref={ref} className="bg-white text-black font-sans" style={{ width: `${pageWidth}px`, minHeight: '1123px', padding: '40px', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header className="flex justify-between items-start mb-8">
                <div style={{width: '150px', height: '75px'}} className="relative">
                     <Image 
                        src={companyLogo || "https://placehold.co/150x75.png"}
                        alt="Company Logo"
                        fill
                        data-ai-hint="company logo"
                        style={{ objectFit: 'contain' }}
                    />
                </div>
                <div className="text-right">
                    <h1 className="text-2xl font-bold mb-1">ORÇAMENTO</h1>
                    <p className="text-gray-700">{quote.companyName}</p>
                </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-grow">
                <div className="text-sm leading-relaxed">
                     <p>
                        <strong className="font-bold">Fornecimento de mão de obra especializada para produção e instalação de:</strong> {quote.items.map(item => {
                            const material = materials.find(m => m.id === item.materialId);
                            if (!material) return '';

                            return material.pricingType === 'per_m2' 
                                ? `${material.name} ${item.width || 0}m x ${item.height || 0}m`
                                : material.name;
                        }).join(', ')}
                    </p>
                </div>
                
                <div className="my-12 text-sm">
                    <p className="font-bold text-base">
                        Valor total: R$ {quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="font-bold text-base">Prazo: a combinar</p>
                    <div className="text-gray-800">
                        <p>
                            Condições de pagamento: cartão de crédito em até 10x sem juros.
                            <br />
                            <span style={{ paddingLeft: '8em' }}>50% sinal e o restante na entrega.</span>
                            <br />
                            <span style={{ paddingLeft: '8em' }}>À vista com 10% de desconto.</span>
                        </p>
                    </div>
                </div>

                <div className="text-xs text-gray-700 space-y-4 leading-relaxed">
                    <div>
                        <h3 className="font-bold text-sm text-gray-800 mb-1">Observações adicionais:</h3>
                        <p>A Instalação de nossos produtos depende das condições climáticas. É necessário que o clima esteja estável para que a instalação ocorra. Em caso de mau tempo, reagendaremos a instalação conforme a disponibilidade da nossa agenda.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-800 mb-1">Garantia:</h3>
                        <p>Todos os produtos fabricados e instalados pela ACM e Letras, possuem garantia de 01 ano, exceto os componentes elétricos como Led, refletores, fontes, lâmpadas etc... estes possuem garantia de 3 meses.</p>
                        <p>A ACM e Letras declara nula e sem efeito de garantia, caso os materiais descritos nesta proposta venham a sofrer danos causados por agentes da natureza (sol, raios, inundações, desabamento, incêndio, vendavais etc...) e outros acidentes, vandalismo, colisão, manuseio de forma incorreta ou por pessoas não autorizadas.</p>
                        <p>Importante lembrar que para manter a segurança e vida útil das estruturas metálicas, o cliente deverá fazer a manutenção preventiva anualmente.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-800 mb-1">Importante:</h3>
                        <ul className="list-disc list-inside pl-4 space-y-1">
                            <li>Esta proposta não contempla documentações ou projetos técnicos para regulamentação junto à prefeitura ou demais órgãos competentes.</li>
                            <li>O fornecimento de Munck ou plataforma de elevação não está incluso neste orçamento.</li>
                            <li>A ACM e Letras Comunicação Visual se isenta de qualquer responsabilidade em relação.</li>
                        </ul>
                    </div>
                </div>
            </main>
            
            {/* Footer */}
            <footer className="mt-auto pt-10">
                <div className="flex justify-end items-end">
                    <div className="text-right text-xs text-gray-600 space-y-1">
                        <p className="font-bold text-gray-800">ACM e Letras Comunicação Visual Ltda.</p>
                        <p>CNPJ: 60.007.991/0001-66</p>
                        <p>Endereço: Avenida Santana, 1199</p>
                        <p>Email: acmletras@gmail.com</p>
                        <p>Telefone: (19) 99124-3112</p>
                        <p>Site: www.acmeletras.com.br</p>
                    </div>
                </div>
            </footer>
        </div>
    );
});

QuotePdfDocument.displayName = 'QuotePdfDocument';
