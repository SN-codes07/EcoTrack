import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const TRANSPORT_MODES = [
  { value: 'WALKING', label: 'Walking', factor: 0.0, fuel: 'NONE', speedKmh: 5, icon: 'Footprints', color: '#10b981' },
  { value: 'CYCLING', label: 'Bicycle', factor: 0.0, fuel: 'NONE', speedKmh: 15, icon: 'Bike', color: '#10b981' },
  { value: 'E_BIKE', label: 'Electric Bike / Scooter', factor: 0.015, fuel: 'ELECTRIC', speedKmh: 22, icon: 'Zap', color: '#14b8a6' },
  { value: 'METRO', label: 'Metro Rail', factor: 0.028, fuel: 'ELECTRIC', speedKmh: 38, icon: 'Train', color: '#06b6d4' },
  { value: 'TRAIN', label: 'Suburban Train', factor: 0.035, fuel: 'ELECTRIC', speedKmh: 50, icon: 'TrainFront', color: '#0ea5e9' },
  { value: 'CAR_EV', label: 'Electric Car (EV)', factor: 0.053, fuel: 'ELECTRIC', speedKmh: 32, icon: 'Car', color: '#2dd4bf' },
  { value: 'TWO_WHEELER', label: 'Two-Wheeler (Petrol)', factor: 0.072, fuel: 'PETROL', speedKmh: 30, icon: 'Bike', color: '#f59e0b' },
  { value: 'BUS', label: 'Public Bus', factor: 0.082, fuel: 'DIESEL', speedKmh: 24, icon: 'Bus', color: '#3b82f6' },
  { value: 'CAR_HYBRID', label: 'Hybrid Car', factor: 0.109, fuel: 'HYBRID', speedKmh: 32, icon: 'Car', color: '#eab308' },
  { value: 'CAR_CNG', label: 'CNG Car', factor: 0.132, fuel: 'CNG', speedKmh: 32, icon: 'Car', color: '#f97316' },
  { value: 'CAR_DIESEL', label: 'Diesel Car', factor: 0.171, fuel: 'DIESEL', speedKmh: 32, icon: 'Car', color: '#ef4444' },
  { value: 'CAR_PETROL', label: 'Petrol Car', factor: 0.192, fuel: 'PETROL', speedKmh: 32, icon: 'Car', color: '#f43f5e' },
  { value: 'FLIGHT', label: 'Domestic Flight', factor: 0.255, fuel: 'PETROL', speedKmh: 500, icon: 'Plane', color: '#dc2626' },
];

export const ACTIVITY_CATALOG = {
  ELECTRICITY: [
    { value: 'GRID_ELECTRICITY_KWH', label: 'Household Grid Electricity', unit: 'kWh', factor: 0.71, sustainable: false },
    { value: 'AC_USAGE_HOURS', label: 'Air Conditioner Usage', unit: 'hours', factor: 1.15, sustainable: false },
    { value: 'SOLAR_ENERGY_KWH', label: 'Rooftop Solar / Renewable Power', unit: 'kWh', factor: 0.04, sustainable: true },
    { value: 'HEATER_HOURS', label: 'Electric Water / Room Heater', unit: 'hours', factor: 1.40, sustainable: false },
  ],
  FOOD: [
    { value: 'VEGAN_MEAL', label: '100% Plant-Based / Vegan Meal', unit: 'meals', factor: 0.42, sustainable: true },
    { value: 'VEGETARIAN_MEAL', label: 'Vegetarian Meal (Lentils/Veggies)', unit: 'meals', factor: 0.65, sustainable: true },
    { value: 'DAIRY_SERVING', label: 'Dairy / Cheese / Paneer Serving', unit: 'servings', factor: 0.55, sustainable: false },
    { value: 'POULTRY_MEAL', label: 'Poultry / Fish Meal', unit: 'meals', factor: 1.25, sustainable: false },
    { value: 'RED_MEAT_MEAL', label: 'Red Meat Meal', unit: 'meals', factor: 3.30, sustainable: false },
  ],
  WASTE: [
    { value: 'COMPOSTED_WASTE_KG', label: 'Home Kitchen Composting', unit: 'kg', factor: 0.05, sustainable: true },
    { value: 'RECYCLED_WASTE_KG', label: 'Segregated Dry Recycling (Paper/Metal)', unit: 'kg', factor: 0.12, sustainable: true },
    { value: 'LANDFILL_WASTE_KG', label: 'Mixed Household Landfill Waste', unit: 'kg', factor: 0.58, sustainable: false },
    { value: 'PLASTIC_WASTE_KG', label: 'Single-Use Plastic Packaging', unit: 'kg', factor: 1.85, sustainable: false },
  ],
  WATER: [
    { value: 'WATER_LITERS', label: 'Daily Household Water Supply', unit: 'liters', factor: 0.0015, sustainable: false },
    { value: 'HOT_SHOWER_MINUTES', label: 'Hot Water Shower Duration', unit: 'mins', factor: 0.18, sustainable: false },
  ],
  LIFESTYLE: [
    { value: 'REUSABLE_BAG_USED', label: 'Used Reusable Bag / Bottle', unit: 'items', factor: 0.01, sustainable: true },
    { value: 'SECOND_HAND_ITEM', label: 'Thrifted / Pre-Loved Purchase', unit: 'items', factor: 0.90, sustainable: true },
    { value: 'FAST_FASHION_ITEM', label: 'New Apparel / Fast Fashion Item', unit: 'items', factor: 8.50, sustainable: false },
    { value: 'ELECTRONICS_PURCHASE', label: 'Small Consumer Gadget / Accessory', unit: 'items', factor: 35.0, sustainable: false },
  ],
};
