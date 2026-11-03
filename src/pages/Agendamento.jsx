import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar/Navbar';
import { SiteFooter } from '../components/SiteFooter';
import { Calendar, Clock, User, Phone, FileText, Send } from 'lucide-react';
import { getReservedAppointmentTimes, submitAppointment } from '../services/appointmentService';
import { usePageContent } from '../hooks/usePageContent';
import toast from 'react-hot-toast';

/**
 * Página de agendamento para a barbearia - Estilo Pirata! 🏴‍☠️
 * Utiliza Tailwind CSS para estilização temática.
 * Campos: nome, telefone, serviço, data e horário.
 */
const Agendamento = () => {
  const navigate = useNavigate();
  const { content: bookingContent } = usePageContent('agendamento');
  const now = new Date();
  const minimumBookingDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [loading, setLoading] = useState(false);
  const [reservedTimes, setReservedTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    servico: '',
    data: '',
    horario: '',
  });

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let minutes = 9 * 60; minutes < 18 * 60; minutes += 30) {
      const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
      const slotMinutes = String(minutes % 60).padStart(2, '0');
      slots.push(`${hours}:${slotMinutes}`);
    }
    return slots;
  }, []);

  const isClosedDay = form.data
    ? [0, 6].includes(new Date(`${form.data}T12:00:00`).getDay())
    : false;

  useEffect(() => {
    let active = true;

    if (!form.data || isClosedDay) {
      setReservedTimes([]);
      setAvailabilityError('');
      setLoadingTimes(false);
      return () => {
        active = false;
      };
    }

    setLoadingTimes(true);
    setAvailabilityError('');
    setReservedTimes([]);
    getReservedAppointmentTimes(form.data)
      .then((times) => {
        if (active) setReservedTimes(times);
      })
      .catch((error) => {
        console.error('Erro ao verificar horários reservados:', error);
        if (active) setAvailabilityError(error.message || 'Não foi possível verificar os horários disponíveis.');
      })
      .finally(() => {
        if (active) setLoadingTimes(false);
      });

    return () => {
      active = false;
    };
  }, [form.data, isClosedDay]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value, ...(name === 'data' ? { horario: '' } : {}) }));
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    let telefone = digits;

    if (digits.length > 0) telefone = `(${digits.slice(0, 2)}`;
    if (digits.length >= 3) telefone += `) ${digits.slice(2, 7)}`;
    if (digits.length >= 8) telefone += `-${digits.slice(7, 11)}`;

    setForm((prev) => ({ ...prev, telefone }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(form.telefone)) {
      toast.error('Informe um telefone com DDD no formato (00) 00000-0000.');
      return;
    }
    if (!form.horario || reservedTimes.includes(form.horario) || availabilityError || loadingTimes) {
      toast.error('Selecione um horário disponível.');
      return;
    }

    setLoading(true);

    try {
      await submitAppointment({
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        servico: form.servico.trim(),
        data: form.data,
        horario: form.horario,
      });

      toast.success('Agendamento realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error(`Erro ao criar agendamento: ${error.message || 'erro inesperado.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0a07] text-[#f3e5ab] relative overflow-hidden">
      <Navbar />

      {/* Grade dourada sutil de fundo */}
      <div className="absolute inset-0 opacity-8 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px]" />

      <main className="relative z-10 pt-10 pb-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Cabeçalho temático pirata */}
          <div className="text-center mb-12">
            <span
              className="text-xs md:text-sm font-semibold tracking-[0.3em] text-[#d4af37] uppercase mb-3 block"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              {bookingContent?.agendamento_badge || 'Tradição & Estilo Clássico'}
            </span>
            <h1
              className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#f9e7b2] via-[#d4af37] to-[#9c752b] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: "'Cinzel Decorative', 'Pirata One', serif" }}
            >
              {bookingContent?.agendamento_title || 'Agende Seu Horário'}
            </h1>
            <p className="text-gray-300 max-w-xl mx-auto text-sm md:text-base">
              {bookingContent?.agendamento_subtitle || 'Cadastre-se na nossa barbearia e garanta seu lugar entre os mestres do estilo. Uma navinha com cara de pirata é a sua recompensa! 🏴‍☠️'}
            </p>
          </div>

          {/* Painel de madeira do formulário */}
          <div className="relative bg-[#1b100b] border-2 border-[#5a371c] rounded-[1.5rem] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.7)]">
            {/* Parafusos metálicos decorativos nos cantos */}
            <div className="absolute -top-1.5 -left-2 w-4 h-4 rounded-full bg-gradient-to-br from-[#f5d78e] via-[#c5a059] to-[#6b4e1e] border border-[#3a220d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.8)] z-10 flex items-center justify-center text-[9px] font-bold text-[#3a220d]">
              ✚
            </div>
            <div className="absolute -bottom-1.5 -left-2 w-4 h-4 rounded-full bg-gradient-to-br from-[#f5d78e] via-[#c5a059] to-[#6b4e1e] border border-[#3a220d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.8)] z-10 flex items-center justify-center text-[9px] font-bold text-[#3a220d]">
              ✚
            </div>
            <div className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-gradient-to-br from-[#f5d78e] via-[#c5a059] to-[#6b4e1e] border border-[#3a220d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.8)] z-10 flex items-center justify-center text-[9px] font-bold text-[#3a220d]">
              ✚
            </div>
            <div className="absolute -bottom-1.5 -right-2 w-4 h-4 rounded-full bg-gradient-to-br from-[#f5d78e] via-[#c5a059] to-[#6b4e1e] border border-[#3a220d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.8)] z-10 flex items-center justify-center text-[9px] font-bold text-[#3a220d]">
              ✚
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <label
                  htmlFor="nome"
                  className="flex items-center gap-2 text-sm font-semibold text-[#d4af37] mb-2"
                  style={{ fontFamily: "'Cinzel Decorative', serif" }}
                >
                  <User className="w-4 h-4 text-[#d4af37]" /> Nome
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  placeholder="Seu nome, capitão"
                  className="w-full px-4 py-3 bg-[#22130c] border-2 border-[#5a371c] rounded-xl text-[#f3e5ab] placeholder-[#a67c52] focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/40 transition-all"
                />
              </div>

              {/* Telefone */}
              <div>
                <label
                  htmlFor="telefone"
                  className="flex items-center gap-2 text-sm font-semibold text-[#d4af37] mb-2"
                  style={{ fontFamily: "'Cinzel Decorative', serif" }}
                >
                  <Phone className="w-4 h-4 text-[#d4af37]" /> Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  inputMode="numeric"
                  maxLength={15}
                  pattern="\(\d{2}\) \d{5}-\d{4}"
                  title="Use o formato (00) 00000-0000 com 11 números."
                  value={form.telefone}
                  onChange={handlePhoneChange}
                  required
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 bg-[#22130c] border-2 border-[#5a371c] rounded-xl text-[#f3e5ab] placeholder-[#a67c52] focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/40 transition-all"
                />
              </div>

              {/* Serviço */}
              <div>
                <label
                  htmlFor="servico"
                  className="flex items-center gap-2 text-sm font-semibold text-[#d4af37] mb-2"
                  style={{ fontFamily: "'Cinzel Decorative', serif" }}
                >
                  <FileText className="w-4 h-4 text-[#d4af37]" /> Serviço
                </label>
                <textarea
                  id="servico"
                  name="servico"
                  value={form.servico}
                  onChange={handleChange}
                  rows="3"
                  required
                  placeholder="Qual serviço deseja agendar?"
                  className="w-full px-4 py-3 bg-[#22130c] border-2 border-[#5a371c] rounded-xl text-[#f3e5ab] placeholder-[#a67c52] focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/40 transition-all resize-none"
                />
              </div>

              {/* Data */}
              <div>
                <label
                  htmlFor="data"
                  className="flex items-center gap-2 text-sm font-semibold text-[#d4af37] mb-2"
                  style={{ fontFamily: "'Cinzel Decorative', serif" }}
                >
                  <Calendar className="w-4 h-4 text-[#d4af37]" /> Data
                </label>
                <input
                  type="date"
                  id="data"
                  name="data"
                  min={minimumBookingDate}
                  value={form.data}
                  onChange={handleChange}
                  required
                  className="booking-date-time w-full px-4 py-3 bg-[#22130c] border-2 border-[#5a371c] rounded-xl text-[#f3e5ab] placeholder-[#a67c52] focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/40 transition-all"
                />
              </div>

              {/* Horário */}
              <div>
                <label
                  htmlFor="horario"
                  className="flex items-center gap-2 text-sm font-semibold text-[#d4af37] mb-2"
                  style={{ fontFamily: "'Cinzel Decorative', serif" }}
                >
                  <Clock className="w-4 h-4 text-[#d4af37]" /> Horário
                </label>
                {!form.data ? (
                  <p className="text-sm text-gray-400">Selecione uma data para ver os horários.</p>
                ) : isClosedDay ? (
                  <p role="status" className="text-sm text-amber-200">Não há atendimento aos sábados e domingos. Escolha um dia útil.</p>
                ) : loadingTimes ? (
                  <p role="status" className="text-sm text-gray-400">Verificando horários disponíveis...</p>
                ) : availabilityError ? (
                  <p role="alert" className="text-sm text-red-300">{availabilityError}</p>
                ) : (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" role="group" aria-label="Horários disponíveis">
                      {timeSlots.map((time) => {
                        const reserved = reservedTimes.includes(time);
                        const selected = form.horario === time;

                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={reserved}
                            aria-pressed={selected}
                            aria-label={reserved ? `${time}, reservado` : time}
                            onClick={() => setForm((prev) => ({ ...prev, horario: time }))}
                            className={`rounded-lg border px-3 py-3 text-sm font-semibold transition-colors ${
                              reserved
                                ? 'cursor-not-allowed border-gray-700 bg-gray-800/70 text-gray-500 line-through'
                                : selected
                                  ? 'border-[#f5d78e] bg-[#d4af37] text-[#1a0f08]'
                                  : 'border-[#5a371c] bg-[#22130c] text-[#f3e5ab] hover:border-[#d4af37]'
                            }`}
                          >
                            {time}{reserved ? ' · Reservado' : ''}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-gray-400">Horários de 30 em 30 minutos. Os horários reservados aparecem apagados.</p>
                  </>
                )}
              </div>

              {/* Botão de envio - estilo dourado pirata */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-b from-[#f5d78e] via-[#d4af37] to-[#9c752b] text-[#1a0f08] font-black uppercase tracking-wider text-base border-2 border-[#5a371c] shadow-[0_6px_20px_rgba(212,175,55,0.3)] hover:from-[#ffe8a3] hover:to-[#b5882e] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className="w-5 h-5 text-[#1a0f08]" />
                {loading ? 'Agendando...' : 'Agendar'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Agendamento;