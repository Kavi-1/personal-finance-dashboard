import type { ElementType } from "react";
import CategoryIcon from "@mui/icons-material/Category";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HomeIcon from "@mui/icons-material/Home";
import MovieIcon from "@mui/icons-material/Movie";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SchoolIcon from "@mui/icons-material/School";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentsIcon from "@mui/icons-material/Payments";
import SavingsIcon from "@mui/icons-material/Savings";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// Consistent color palette
export const CATEGORY_BASE = [
    "#6366F1",
    "#35b8f5ff",
    "#f55d0bff",
    "#10b953ff",
    "#F43F5E",
    "#8B5CF6",
    "#14b8b5ff",
    "#84CC16",
    "#3b76f6ff",
    "#FB923C",
];

export function hexToRgba(hex: string, a = 1) {
    const m = hex.replace("#", "");
    const r = parseInt(m.slice(0, 2), 16);
    const g = parseInt(m.slice(2, 4), 16);
    const b = parseInt(m.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function hashLabelToIndex(labelRaw: string, mod: number) {
    const label = (labelRaw || "Uncategorized").trim().toLowerCase();
    let h = 0;
    for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) | 0;
    return Math.abs(h) % mod;
}

// For the pie chart
export function colorsForLabels(labels: string[]) {
    const bg = labels.map((l) => hexToRgba(CATEGORY_BASE[hashLabelToIndex(l, CATEGORY_BASE.length)], 0.88));
    const hover = labels.map((l) => hexToRgba(CATEGORY_BASE[hashLabelToIndex(l, CATEGORY_BASE.length)], 0.7));
    return { bg, hover };
}

// For the list avatars/chips
const ICONS: Record<string, ElementType> = {
    Income: AttachMoneyIcon,
    "Food/Groceries": LocalGroceryStoreIcon,
    Groceries: LocalGroceryStoreIcon,
    Dining: RestaurantIcon,
    Transport: DirectionsCarIcon,
    Rent: HomeIcon,
    Housing: HomeIcon,
    Entertainment: MovieIcon,
    Health: MedicalServicesIcon,
    Fitness: FitnessCenterIcon,
    Education: SchoolIcon,
    Shopping: ShoppingCartIcon,
    Utilities: PaymentsIcon,
    Bills: PaymentsIcon,
    Savings: SavingsIcon,
};

export function getCategoryMeta(categoryRaw: string) {
    const category = (categoryRaw || "Uncategorized").trim();
    const idx = hashLabelToIndex(category, CATEGORY_BASE.length);
    const color = CATEGORY_BASE[idx];
    const bg = hexToRgba(color, 0.14);
    const border = hexToRgba(color, 0.28);
    const Icon = ICONS[category] ?? CategoryIcon;
    return { category, color, bg, border, Icon, idx };
}
