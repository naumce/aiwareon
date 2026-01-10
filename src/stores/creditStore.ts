import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface CreditState {
    balance: number;
    isLoading: boolean;

    // Actions
    fetchBalance: () => Promise<void>;
    deduct: (amount: number, reason?: string, referenceId?: string) => Promise<{ success: boolean; error?: string }>;
    refund: (amount: number, referenceId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
}

export const useCreditStore = create<CreditState>()((set) => ({
    balance: 0,
    isLoading: false,

    fetchBalance: async () => {
        if (!isSupabaseConfigured() || !supabase) return;

        set({ isLoading: true });

        const { data, error } = await supabase.rpc('get_credit_balance');

        if (error) {
            console.error('Error fetching balance:', error);
            set({ isLoading: false });
            return;
        }

        set({ balance: data ?? 0, isLoading: false });
    },

    deduct: async (amount: number, reason = 'generation', referenceId?: string) => {
        if (!supabase) return { success: false, error: 'Supabase not configured' };

        const { data, error } = await supabase.rpc('deduct_credits', {
            p_amount: amount,
            p_reason: reason,
            p_reference_id: referenceId || null,
        });

        if (error) {
            console.error('Error deducting credits:', error);
            return { success: false, error: error.message };
        }

        const result = data as { success: boolean; balance?: number; error?: string };

        if (result.success && result.balance !== undefined) {
            set({ balance: result.balance });
        }

        return {
            success: result.success,
            error: result.error
        };
    },

    refund: async (amount: number, referenceId: string, reason = 'generation_failed') => {
        if (!supabase) return { success: false, error: 'Supabase not configured' };

        const { data, error } = await supabase.rpc('refund_credits', {
            p_amount: amount,
            p_reason: reason,
            p_reference_id: referenceId,
        });

        if (error) {
            console.error('Error refunding credits:', error);
            return { success: false, error: error.message };
        }

        const result = data as { success: boolean; balance?: number; error?: string };

        if (result.success && result.balance !== undefined) {
            set({ balance: result.balance });
        }

        return {
            success: result.success,
            error: result.error
        };
    },
}));
