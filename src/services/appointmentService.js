import { supabase } from './supabaseClient';

const OPENING_TIME = '09:00';
const CLOSING_TIME = '18:00';
const SLOT_INTERVAL_MINUTES = 30;

const getAvailabilityRpcError = (error) => {
  if (error.code === 'PGRST202') {
    return new Error('A disponibilidade ainda não foi configurada no Supabase. Execute o script supabase_appointment_availability.sql no SQL Editor.');
  }
  return error;
};

const isValidAppointmentSlot = (appointment) => {
  const [hours, minutes] = appointment.horario.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  const [openingHours, openingMinutes] = OPENING_TIME.split(':').map(Number);
  const [closingHours, closingMinutes] = CLOSING_TIME.split(':').map(Number);
  const openingTimeInMinutes = openingHours * 60 + openingMinutes;
  const closingTimeInMinutes = closingHours * 60 + closingMinutes;
  const appointmentDate = new Date(`${appointment.data}T12:00:00`);
  const dayOfWeek = appointmentDate.getDay();

  return (
    Number.isFinite(timeInMinutes) &&
    timeInMinutes >= openingTimeInMinutes &&
    timeInMinutes < closingTimeInMinutes &&
    (timeInMinutes - openingTimeInMinutes) % SLOT_INTERVAL_MINUTES === 0 &&
    dayOfWeek !== 0 &&
    dayOfWeek !== 6
  );
};

export const submitAppointment = async (appointment) => {
  if (!isValidAppointmentSlot(appointment)) {
    throw new Error('Selecione um horário disponível entre 09:00 e 18:00, de segunda a sexta-feira.');
  }

  const { error } = await supabase.rpc('create_public_appointment', {
    p_nome: appointment.nome,
    p_telefone: appointment.telefone,
    p_servico: appointment.servico,
    p_data: appointment.data,
    p_horario: appointment.horario,
  });
  if (error) throw getAvailabilityRpcError(error);
};

export const getReservedAppointmentTimes = async (date) => {
  if (!date) return [];

  const { data, error } = await supabase.rpc('get_reserved_appointment_times', {
    p_date: date,
  });
  if (error) throw getAvailabilityRpcError(error);
  return (data || []).map((appointment) => appointment.horario.slice(0, 5));
};

export const getAppointments = async (dateFilter) => {
  let query = supabase
    .from('appointments')
    .select('id, nome, telefone, servico, data, horario, created_at')
    .order('data', { ascending: true })
    .order('horario', { ascending: true });

  if (dateFilter) query = query.eq('data', dateFilter);
  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const deleteAppointment = async (id) => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
    .select('id')
    .single();

  if (error) throw error;
};
