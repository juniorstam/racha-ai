"use client";
import BottomSheet from "./BottomSheet";

export default function PrivacyPolicySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Política de Privacidade">
      <div className="px-5 pb-8 flex flex-col gap-4 text-sm text-[var(--muted)] leading-relaxed">
        <p>Última atualização: setembro de 2026.</p>

        <div>
          <p className="font-bold text-[var(--foreground)] mb-1">Seus dados ficam no seu aparelho</p>
          <p>
            O Racha Aí não exige cadastro e não tem servidor de contas. Os itens, pessoas, taxas e
            histórico de contas que você cria ficam salvos apenas no armazenamento local do seu
            navegador (localStorage), no seu próprio dispositivo.
          </p>
        </div>

        <div>
          <p className="font-bold text-[var(--foreground)] mb-1">Leitura de conta por foto</p>
          <p>
            Ao usar a opção &quot;Foto da Conta&quot;, a imagem é enviada de forma segura à API do
            Google Gemini apenas para extrair os itens e valores automaticamente. A imagem não é
            armazenada por nós após o processamento.
          </p>
        </div>

        <div>
          <p className="font-bold text-[var(--foreground)] mb-1">Anúncios</p>
          <p>
            Este site exibe anúncios do Google AdSense. O Google e seus parceiros podem usar cookies
            para veicular anúncios com base nas suas visitas anteriores a este e a outros sites. Você
            pode desativar a personalização de anúncios visitando{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--foreground)] font-semibold"
            >
              adssettings.google.com
            </a>
            . Mais informações em{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--foreground)] font-semibold"
            >
              policies.google.com/technologies/ads
            </a>
            .
          </p>
        </div>

        <div>
          <p className="font-bold text-[var(--foreground)] mb-1">Contato</p>
          <p>Dúvidas sobre privacidade: juniorstam@gmail.com</p>
        </div>
      </div>
    </BottomSheet>
  );
}
