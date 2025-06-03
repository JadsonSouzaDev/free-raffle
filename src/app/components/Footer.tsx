'use client';

import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const faqs = [
  {
    pergunta: "Como acesso minhas compras?",
    resposta: "Para acessar suas compras, basta clicar no botão 'Minhas Compras' com o ícone de cesta no menu superior. Você será redirecionado para uma página onde poderá visualizar todos os seus pedidos e detalhes de cada compra através do seu WhatsApp."
  },
  {
    pergunta: "Como funciona o sorteio?",
    resposta: "O sorteio é realizado de forma automática e transparente através do nosso sistema. Cada cota possui um número único e, ao final do período de vendas, o sistema seleciona aleatoriamente os números premiados ou através de números da loteria."
  },
  {
    pergunta: "Como recebo meu prêmio?",
    resposta: "Após a confirmação do sorteio, entraremos em contato através do WhatsApp para combinar a entrega do prêmio. É importante manter seus dados atualizados para facilitar o contato."
  },
  {
    pergunta: "Posso cancelar minha compra?",
    resposta: "Após a compra e o pagamento, não é possível realizar o cancelamento."
  }
];

const Footer = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isFaqSectionExpanded, setIsFaqSectionExpanded] = useState(false);

  const isAdminRoute = usePathname().includes('/admin');

  const toggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <footer className="flex flex-col items-center justify-center pt-20 pb-5">
      {!isAdminRoute && (
      <div className="flex flex-col gap-2 cursor-pointer bg-white rounded-lg shadow-lg">
        <div className="border border-foreground/10 rounded-lg overflow-hidden cursor-pointer p-4">
          <button
            onClick={() => setIsFaqSectionExpanded(!isFaqSectionExpanded)}
            className="w-full cursor-pointer flex items-center justify-between p-2 text-left hover:bg-foreground/5 transition-colors"
          >
            <h2 className="font-bold text-sm">Perguntas Frequentes</h2>
            <span className={`transform transition-transform ${isFaqSectionExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-5 h-5" />
            </span>
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ${
            isFaqSectionExpanded ? 'max-h-[1000px]' : 'max-h-0'
          }`}>
            <div className="flex flex-col gap-3 p-2">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="border border-foreground/10 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full cursor-pointer flex items-center justify-between p-2 text-left hover:bg-foreground/5 transition-colors"
                  >
                    <h3 className="font-semibold text-xs">{faq.pergunta}</h3>
                    <span className={`transform transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5" />
                    </span>
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedIndex === index ? 'max-h-40' : 'max-h-0'
                    }`}
                  >
                    <p className=" text-foreground/80 p-2 pt-0 text-xs">
                      {faq.resposta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      )}
      <p className="text-sm text-foreground/50 mt-4">
        &copy; {new Date().getFullYear()} - Todos os direitos reservados
      </p>
    </footer>
  );
};

export default Footer;
