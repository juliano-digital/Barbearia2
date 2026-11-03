import { supabase } from './supabaseClient';
import { hasDemoAccess } from '../lib/demoAccess';
import { getDemoPageContent, saveDemoPageContent } from './demoContentService';

const emitContentUpdated = (page) => {
  window.dispatchEvent(new CustomEvent('site-content-updated', { detail: { page } }));
};

const getAdminSession = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  const session = sessionData?.session;
  if (!session) return null;

  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle();

  if (userError) throw userError;
  if (userRow?.role !== 'admin') return null;

  return session;
};

export const getPageContent = async (page) => {
  const adminSession = await getAdminSession().catch(() => null);

  if (hasDemoAccess() && !adminSession) {
    const demoContent = await getDemoPageContent(page);
    if (demoContent !== null) return demoContent;
  }

  const { data, error } = await supabase
    .from('site_content')
    .select('content')
    .eq('page', page)
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data?.content ?? null;
};

export const savePageContent = async (page, content) => {
  const adminSession = await getAdminSession().catch(() => null);

  if (hasDemoAccess() && !adminSession) {
    const result = await saveDemoPageContent(page, content);
    emitContentUpdated(page);
    return result;
  }

  if (!adminSession) {
    throw new Error('Para salvar, entre com uma conta administrativa do Supabase.');
  }

  const { data, error } = await supabase
    .from('site_content')
    .upsert(
      { page, content, updated_at: new Date().toISOString() },
      { onConflict: 'page' }
    )
    .select()
    .single();

  if (error) {
    console.error(`[siteContentService] Erro ao salvar conteúdo de "${page}":`, error.message);
    throw error;
  }

  emitContentUpdated(page);
  return data;
};