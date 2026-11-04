import { supabase } from './supabaseClient';

export const submitContactMessage = async (message) => {
  const { error } = await supabase
    .from('contact_messages')
    .insert(message);

  if (error) throw error;
};

export const getContactMessages = async () => {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, nome, email, mensagem, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const deleteContactMessage = async (id) => {
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
