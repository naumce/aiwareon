/**
 * In-App Purchase Service
 * Handles StoreKit 2 purchases for credit packs via expo-iap
 * 
 * NOTE: expo-iap requires a development build. It won't work in Expo Go.
 * In Expo Go, this service operates in "mock mode" for UI testing.
 */
import { Alert, Platform } from 'react-native';
import { supabase } from './supabaseClient';

// Product IDs - must match App Store Connect
export const PRODUCT_IDS = {
    STARTER: 'com.aiwear.credits.starter',      // 10 credits - $0.99
    PLUS: 'com.aiwear.credits.plus',            // 50 credits - $3.99
    PRO: 'com.aiwear.credits.pro',              // 150 credits - $9.99
    ULTIMATE: 'com.aiwear.credits.ultimate',    // 500 credits - $24.99
} as const;

export const CREDIT_PACKS = [
    {
        id: PRODUCT_IDS.STARTER,
        name: 'Starter',
        credits: 10,
        price: '$0.99',
        priceNumber: 0.99,
    },
    {
        id: PRODUCT_IDS.PLUS,
        name: 'Plus',
        credits: 50,
        price: '$3.99',
        priceNumber: 3.99,
        badge: 'Popular',
    },
    {
        id: PRODUCT_IDS.PRO,
        name: 'Pro',
        credits: 150,
        price: '$9.99',
        priceNumber: 9.99,
        badge: 'Best Value',
    },
    {
        id: PRODUCT_IDS.ULTIMATE,
        name: 'Ultimate',
        credits: 500,
        price: '$24.99',
        priceNumber: 24.99,
    },
];

export type CreditPack = typeof CREDIT_PACKS[number];

class IAPService {
    private isInitialized = false;
    private products: any[] = [];
    private IAP: any = null;
    private isNativeAvailable = false;

    constructor() {
        // Lazy load the module to avoid bundler issues
        this.checkNativeAvailability();
    }

    private async checkNativeAvailability(): Promise<void> {
        try {
            // Only try to use IAP in development builds, not Expo Go
            const ExpoIAP = await import('expo-iap').catch(() => null);
            if (ExpoIAP && typeof ExpoIAP.initConnection === 'function') {
                this.IAP = ExpoIAP;
                this.isNativeAvailable = true;
            }
        } catch (error) {
            console.warn('[IAP] Native module not available');
            this.isNativeAvailable = false;
        }
    }

    /**
     * Check if running in mock mode (Expo Go)
     */
    isMockMode(): boolean {
        return !this.isNativeAvailable;
    }

    /**
     * Initialize IAP connection
     */
    async initialize(): Promise<boolean> {
        // Re-check availability
        if (!this.IAP) {
            await this.checkNativeAvailability();
        }

        if (!this.isNativeAvailable || !this.IAP) {
            console.log('[IAP] Running in mock mode - no native module');
            return false;
        }

        if (this.isInitialized) return true;

        try {
            await this.IAP.initConnection();
            this.isInitialized = true;
            console.log('[IAP] Connection initialized');
            return true;
        } catch (error) {
            console.error('[IAP] Failed to initialize:', error);
            return false;
        }
    }

    /**
     * Fetch products from App Store
     */
    async fetchProducts(): Promise<any[]> {
        if (!this.isNativeAvailable || !this.IAP) {
            console.log('[IAP] Mock mode - using default prices');
            return [];
        }

        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const productIds = Object.values(PRODUCT_IDS);
            this.products = await this.IAP.getProducts(productIds);
            console.log('[IAP] Products fetched:', this.products.length);
            return this.products;
        } catch (error) {
            console.error('[IAP] Failed to fetch products:', error);
            return [];
        }
    }

    /**
     * Get real price from App Store (with currency)
     */
    getProductPrice(productId: string): string | undefined {
        const product = this.products.find((p: any) => p.productId === productId);
        return product?.localizedPrice;
    }

    /**
     * Purchase a credit pack
     */
    async purchase(productId: string): Promise<{ success: boolean; error?: string }> {
        // Mock mode - show message
        if (!this.isNativeAvailable || !this.IAP) {
            Alert.alert(
                'Development Mode',
                'In-App Purchases require a development build.\n\nTo test purchases:\n1. Run: npx expo run:ios\n2. Use a sandbox Apple ID',
                [{ text: 'OK' }]
            );
            return { success: false, error: 'IAP not available in Expo Go' };
        }

        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            console.log('[IAP] Starting purchase:', productId);

            // Request purchase
            const purchase = await this.IAP.requestPurchase({ sku: productId });

            if (purchase) {
                // Finish the transaction
                await this.IAP.finishTransaction({ purchase, isConsumable: true });

                // Add credits to user account
                const pack = CREDIT_PACKS.find(p => p.id === productId);
                if (pack) {
                    await this.addCreditsToAccount(pack.credits, productId);
                }

                console.log('[IAP] Purchase successful:', productId);
                return { success: true };
            }

            return { success: false, error: 'Purchase cancelled' };
        } catch (error: any) {
            console.error('[IAP] Purchase failed:', error);
            return {
                success: false,
                error: error?.message || 'Purchase failed'
            };
        }
    }

    /**
     * Add purchased credits to user account
     */
    private async addCreditsToAccount(credits: number, productId: string): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Insert into credit_ledger
            const { error } = await supabase
                .from('credit_ledger')
                .insert({
                    user_id: user.id,
                    delta: credits,
                    reason: `Purchase: ${productId}`,
                });

            if (error) throw error;
            console.log('[IAP] Credits added:', credits);
        } catch (error) {
            console.error('[IAP] Failed to add credits:', error);
            throw error;
        }
    }

    /**
     * Restore previous purchases (for non-consumables/subscriptions)
     * Note: Consumable purchases cannot be restored
     */
    async restorePurchases(): Promise<void> {
        if (!this.isNativeAvailable || !this.IAP) {
            console.log('[IAP] Mock mode - restore not available');
            return;
        }

        try {
            await this.IAP.getAvailablePurchases();
            console.log('[IAP] Restore completed');
        } catch (error) {
            console.error('[IAP] Restore failed:', error);
        }
    }

    /**
     * Clean up IAP connection
     */
    async disconnect(): Promise<void> {
        if (!this.isNativeAvailable || !this.IAP) return;

        if (this.isInitialized) {
            await this.IAP.endConnection();
            this.isInitialized = false;
            console.log('[IAP] Connection closed');
        }
    }
}

export const iapService = new IAPService();
