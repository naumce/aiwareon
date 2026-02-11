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
        this.checkNativeAvailability();
    }

    private async checkNativeAvailability(): Promise<void> {
        // expo-iap removed - only works in development builds, not Expo Go
        // To re-enable: npm install expo-iap and uncomment below
        /*
        try {
            const ExpoIAP = await import('expo-iap').catch(() => null);
            if (ExpoIAP && typeof ExpoIAP.initConnection === 'function') {
                this.IAP = ExpoIAP;
                this.isNativeAvailable = true;
            }
        } catch {
            this.isNativeAvailable = false;
        }
        */
        this.isNativeAvailable = false;
    }

    isMockMode(): boolean {
        return !this.isNativeAvailable;
    }

    async initialize(): Promise<boolean> {
        if (!this.IAP) {
            await this.checkNativeAvailability();
        }

        if (!this.isNativeAvailable || !this.IAP) {
            return false;
        }

        if (this.isInitialized) return true;

        try {
            await this.IAP.initConnection();
            this.isInitialized = true;
            return true;
        } catch {
            return false;
        }
    }

    async fetchProducts(): Promise<any[]> {
        if (!this.isNativeAvailable || !this.IAP) {
            return [];
        }

        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const productIds = Object.values(PRODUCT_IDS);
            this.products = await this.IAP.getProducts(productIds);
            return this.products;
        } catch {
            return [];
        }
    }

    getProductPrice(productId: string): string | undefined {
        const product = this.products.find((p: any) => p.productId === productId);
        return product?.localizedPrice;
    }

    async purchase(productId: string): Promise<{ success: boolean; error?: string }> {
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
            const purchase = await this.IAP.requestPurchase({ sku: productId });

            if (purchase) {
                await this.IAP.finishTransaction({ purchase, isConsumable: true });

                const pack = CREDIT_PACKS.find(p => p.id === productId);
                if (pack) {
                    await this.addCreditsToAccount(pack.credits, productId);
                }

                return { success: true };
            }

            return { success: false, error: 'Purchase cancelled' };
        } catch (error: any) {
            return {
                success: false,
                error: error?.message || 'Purchase failed'
            };
        }
    }

    private async addCreditsToAccount(credits: number, productId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('credit_ledger')
            .insert({
                user_id: user.id,
                delta: credits,
                reason: `Purchase: ${productId}`,
            });

        if (error) throw error;
    }

    async restorePurchases(): Promise<void> {
        if (!this.isNativeAvailable || !this.IAP) {
            return;
        }

        try {
            await this.IAP.getAvailablePurchases();
        } catch {
            // Restore failed silently
        }
    }

    async disconnect(): Promise<void> {
        if (!this.isNativeAvailable || !this.IAP) return;

        if (this.isInitialized) {
            await this.IAP.endConnection();
            this.isInitialized = false;
        }
    }
}

export const iapService = new IAPService();
