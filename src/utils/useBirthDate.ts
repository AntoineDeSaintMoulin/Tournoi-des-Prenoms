import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useBirthDate() {
  const [birthDate, setBirthDateState] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'birth_date')
        .maybeSingle();
      if (active) setBirthDateState(data?.value ?? null);
    };
    load();
    const channel = supabase
      .channel('settings-birth-' + Math.random().toString(36).slice(2))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, load)
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const setBirthDate = useCallback(async (value: string): Promise<boolean> => {
    const { error } = await supabase.from('settings').upsert({ key: 'birth_date', value });
    if (!error) setBirthDateState(value);
    return !error;
  }, []);

  let daysLeft: number | null = null;
  if (birthDate) {
    const [y, m, d] = birthDate.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    daysLeft = Math.round((target.getTime() - today.getTime()) / 86400000);
  }

  return { birthDate, daysLeft, setBirthDate };
}
