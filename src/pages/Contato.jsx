import { useState } from 'react';
import { MapPin, Phone, Clock, MessageCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar/Navbar';
import { SiteFooter } from '../components/SiteFooter';
import { usePageContent } from '../hooks/usePageContent';
import { submitContactMessage } from '../services/contactMessageService';

const initialForm = { nome: '', email: '', mensagem: '' };

const getHttpUrl = (value) => {
  if (!value) return '';

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
};

export const Contato = () => {
  const { content: contactContent } = usePageContent('contato');
  const { content: site } = usePageContent('site');
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);

    try {
      await submitContactMessage({
        nome: form.nome.trim(),
        email: form.email.trim(),
        mensagem: form.mensagem.trim(),
      });

      toast.success('Mensagem enviada com sucesso!');
      setForm(initialForm);
    } catch (error) {
      console.error('Erro ao enviar mensagem de contato:', error);
      toast.error(`Não foi possível enviar a mensagem: ${error.message || 'erro inesperado.'}`);
    } finally {
      setSending(false);
    }
  };

  const phoneDigits = site?.phone?.replace(/\D/g, '') || '';
  const whatsappNumber = phoneDigits.length === 10 || phoneDigits.length === 11
    ? `55${phoneDigits}`
    : phoneDigits;
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(contactContent?.whatsapp_mensagem || '')}`
    : null;
  const mapUrl = getHttpUrl(contactContent?.mapa_embed_url);
  const parsedMapUrl = mapUrl ? new URL(mapUrl) : null;
  const isMapEmbed = Boolean(
    parsedMapUrl &&
    (/\/maps\/embed(?:\/|$)/i.test(parsedMapUrl.pathname) || parsedMapUrl.searchParams.get('output') === 'embed')
  );

  return (
    <div className="min-h-screen bg-[#0f0a07] text-[#f3e5ab]">
      <Navbar />

      <main className="py-16 px-6 container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-[0.3em] text-[#d4af37] uppercase mb-3 block" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Fale Conosco
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#f9e7b2] via-[#d4af37] to-[#9c752b] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" style={{ fontFamily: "'Cinzel Decorative', 'Pirata One', serif" }}>
            {contactContent?.contato_title}
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-base md:text-lg">{contactContent?.contato_subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-[#1b100b] border-2 border-[#5a371c] rounded-2xl p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-[#d4af37]" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                Informações
              </h2>
              <ul className="space-y-6 text-gray-300">
                {site?.address && (
                  <li className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 mt-1 text-[#d4af37] flex-shrink-0" />
                    <div><strong className="block text-[#f3e5ab] mb-0.5">Endereço</strong><span className="text-sm text-gray-400">{site.address}</span></div>
                  </li>
                )}
                {site?.phone && (
                  <li className="flex items-start gap-4">
                    <Phone className="w-5 h-5 mt-1 text-[#d4af37] flex-shrink-0" />
                    <div>
                      <strong className="block text-[#f3e5ab] mb-0.5">Telefone / WhatsApp</strong>
                      {whatsappHref
                        ? <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-[#d4af37]">{site.phone}</a>
                        : <span className="text-sm text-gray-400">{site.phone}</span>}
                    </div>
                  </li>
                )}
                {site?.instagram && (
                  <li className="flex items-start gap-4">
                    <span className="text-[#d4af37] font-semibold">@</span>
                    <div><strong className="block text-[#f3e5ab] mb-0.5">Instagram</strong><span className="text-sm text-gray-400">{site.instagram}</span></div>
                  </li>
                )}
                {site?.working_hours && (
                  <li className="flex items-start gap-4">
                    <Clock className="w-5 h-5 mt-1 text-[#d4af37] flex-shrink-0" />
                    <div><strong className="block text-[#f3e5ab] mb-0.5">Horário de Funcionamento</strong><span className="text-sm text-gray-400">{site.working_hours}</span></div>
                  </li>
                )}
              </ul>
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1fb957]">
                  <MessageCircle className="h-5 w-5" />
                  Falar pelo WhatsApp
                </a>
              )}
              {mapUrl && isMapEmbed && (
                <iframe
                  title="Localização da barbearia"
                  src={mapUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-48 mt-6 rounded-xl border border-[#5a371c]"
                />
              )}
              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d4af37] px-4 py-3 text-sm font-bold text-[#d4af37] transition-colors hover:bg-[#d4af37] hover:text-[#1a0f08]">
                  <ExternalLink className="h-4 w-4" />
                  Abrir localização no Google Maps
                </a>
              )}
            </div>
          </div>

          <div className="bg-[#1b100b] border-2 border-[#5a371c] rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-[#d4af37]" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
              Envie uma Mensagem
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-1">Seu Nome</label>
                <input id="contact-name" type="text" value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} required maxLength={120} placeholder="Digite seu nome" className="w-full px-4 py-2.5 rounded-xl bg-[#120a06] border border-[#5a371c] text-[#f3e5ab] focus:border-[#d4af37] outline-none text-sm" />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-1">Seu E-mail</label>
                <input id="contact-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required maxLength={320} placeholder="Digite seu e-mail" className="w-full px-4 py-2.5 rounded-xl bg-[#120a06] border border-[#5a371c] text-[#f3e5ab] focus:border-[#d4af37] outline-none text-sm" />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-1">Mensagem</label>
                <textarea id="contact-message" value={form.mensagem} onChange={(event) => setForm({ ...form, mensagem: event.target.value })} rows="4" required maxLength={5000} placeholder="Escreva sua dúvida ou sugestão" className="w-full px-4 py-2.5 rounded-xl bg-[#120a06] border border-[#5a371c] text-[#f3e5ab] focus:border-[#d4af37] outline-none text-sm resize-none" />
              </div>
              <button type="submit" disabled={sending} className="w-full py-3 rounded-xl bg-gradient-to-b from-[#f5d78e] via-[#d4af37] to-[#9c752b] text-[#1a0f08] font-black uppercase tracking-wider text-xs border border-[#5a371c] shadow-md hover:opacity-90 transition-all disabled:opacity-50">
                {sending ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};
