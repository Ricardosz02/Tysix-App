import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://awdpgheqbzaiysxqlfqu.supabase.co';
const supabaseAnonKey = 'sb_publishable__nztW9Gpw8auXUOuj5PoMw_ZAXweE0d';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});