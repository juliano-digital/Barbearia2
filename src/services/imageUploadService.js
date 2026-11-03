import { supabase } from './supabaseClient';
import { hasDemoAccess } from '../lib/demoAccess';

const BUCKET = 'site-images';

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Não foi possível ler a imagem selecionada.'));
    reader.readAsDataURL(file);
  });

export async function uploadImage(file, folder = 'geral') {
  if (!file) return null;
  if (hasDemoAccess()) return readAsDataUrl(file);

  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function deleteImage(url) {
  if (!url) return;
  if (url.startsWith('data:')) return;

  const path = url.split(`/${BUCKET}/`)[1];
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}