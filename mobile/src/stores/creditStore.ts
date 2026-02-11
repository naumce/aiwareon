import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';

interface CreditState {
    balance: number;
    isLoading: boolean;

    // Actions
    fetchBalance: () => Promise<void>;
}

export const useCreditStore = create<CreditState>((set) => ({
    balance: 0,
    isLoading: false,

    fetchBalance: async () => {
        set({ isLoading: true });

        try {
            const { data, error } = await supabase.rpc('get_credit_balance');

            if (error) {
                set({ balance: 0, isLoading: false });
                return;
            }

            set({ balance: data || 0, isLoading: false });
        } catch {
            set({ balance: 0, isLoading: false });
        }
    },
}));
