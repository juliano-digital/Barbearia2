import { hasDemoAccess } from '../lib/demoAccess';
import { supabase } from './supabaseClient';

const DATABASE_NAME = 'barbershop-demo-appointments';
const STORE_NAME = 'appointments';
const DATABASE_VERSION = 1;
const OPENING_TIME = '09:00';
const CLOSING_TIME = '18:00';
const SLOT_INTERVAL_MINUTES = 30;

let databasePromise;

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

const openDemoDatabase = () => {
  if (!globalThis.indexedDB) {
    return Promise.reject(new Error('Este navegador não oferece armazenamento local para o modo demonstração.'));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Não foi possível abrir o armazenamento local de agendamentos.'));
      request.onblocked = () => reject(new Error('O armazenamento local de agendamentos está bloqueado por outra aba.'));
    }).catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
};

const saveDemoAppointment = async (appointment) => {
  const database = await openDemoDatabase();
  if (!isValidAppointmentSlot(appointment)) {
    throw new Error('Selecione um horário disponível entre 09:00 e 18:00, de segunda a sexta-feira.');
  }

  const savedAppointment = {
    ...appointment,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    let transactionError;
    const request = store.getAll();

    request.onsuccess = () => {
      const alreadyBooked = request.result.some(
        (existing) => existing.data === appointment.data && existing.horario.slice(0, 5) === appointment.horario
      );

      if (alreadyBooked) {
        transactionError = new Error('Este horário acabou de ser reservado. Escolha outro horário.');
        transaction.abort();
        return;
      }

      store.add(savedAppointment);
    };
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Não foi possível salvar o agendamento demonstrativo.'));
    transaction.onabort = () => reject(transactionError || transaction.error || new Error('O salvamento do agendamento foi cancelado.'));
  });

  return savedAppointment;
};

const getDemoAppointments = async (dateFilter) => {
  const database = await openDemoDatabase();

  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      const appointments = request.result
        .filter((appointment) => !dateFilter || appointment.data === dateFilter)
        .sort((a, b) => a.data.localeCompare(b.data) || a.horario.localeCompare(b.horario));
      resolve(appointments);
    };
    request.onerror = () => reject(request.error || new Error('Não foi possível carregar os agendamentos demonstrativos.'));
  });
};

const deleteDemoAppointment = async (id) => {
  const database = await openDemoDatabase();

  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Não foi possível excluir o agendamento demonstrativo.'));
    transaction.onabort = () => reject(transaction.error || new Error('A exclusão do agendamento foi cancelada.'));
  });
};

export const submitAppointment = async (appointment) => {
  if (hasDemoAccess()) return saveDemoAppointment(appointment);

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
  if (error) throw error;
};

export const getReservedAppointmentTimes = async (date) => {
  if (!date) return [];
  if (hasDemoAccess()) {
    const appointments = await getDemoAppointments(date);
    return appointments.map((appointment) => appointment.horario.slice(0, 5));
  }

  const { data, error } = await supabase.rpc('get_reserved_appointment_times', {
    p_date: date,
  });
  if (error) throw error;
  return (data || []).map((appointment) => appointment.horario.slice(0, 5));
};

export const getAppointments = async (dateFilter) => {
  if (hasDemoAccess()) return getDemoAppointments(dateFilter);

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
  if (hasDemoAccess()) return deleteDemoAppointment(id);

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
    .select('id')
    .single();

  if (error) throw error;
};
