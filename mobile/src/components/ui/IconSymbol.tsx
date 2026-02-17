import React from 'react';
import {
    Sparkles,
    Shirt,
    Images,
    User,
    Download,
    Share,
    Trash2,
    Camera,
    Upload,
    X,
    ChevronRight,
    ChevronLeft,
    Check,
    Plus,
    Heart,
    FolderOpen,
    Mail,
    FileText,
    LogOut,
    ShoppingBag,
    Settings,
    Coins,
    AlertCircle,
    Eye,
    EyeOff,
    HelpCircle,
    Moon,
    RotateCcw,
    Zap,
} from 'lucide-react-native';
import { colors } from '../../theme';

// Map of icon names to components
const iconMap = {
    Sparkles,
    Shirt,
    Images,
    User,
    Download,
    Share,
    Trash2,
    Camera,
    Upload,
    X,
    ChevronRight,
    ChevronLeft,
    Check,
    Plus,
    Heart,
    FolderOpen,
    Mail,
    FileText,
    LogOut,
    ShoppingBag,
    Settings,
    Coins,
    AlertCircle,
    Eye,
    EyeOff,
    HelpCircle,
    Moon,
    RotateCcw,
    Zap,
} as const;

export type IconName = keyof typeof iconMap;

interface IconSymbolProps {
    name: IconName;
    size?: number;
    color?: string;
    strokeWidth?: number;
}

/**
 * A standardized wrapper for Lucide icons.
 * Ensures consistent sizing and coloring across the app.
 */
export function IconSymbol({
    name,
    size = 24,
    color = colors.text.primary,
    strokeWidth = 1.5,
}: IconSymbolProps) {
    const Icon = iconMap[name];

    if (!Icon) {
        console.warn(`IconSymbol: Icon "${name}" not found.`);
        return null;
    }

    return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}
