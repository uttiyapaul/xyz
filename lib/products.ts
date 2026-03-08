import { supabase } from './supabase';

export interface Product {
  id: string;
  label: string;
  cn: string;
  worldDefault: number;
  bmgB: number;
  indiaF: number;
  route: string;
  unit: string;
}

export interface SectorData {
  label: string;
  color: string;
  icon: string;
  items: Product[];
}

export async function fetchProducts(): Promise<Record<string, SectorData>> {
  const { data: sectors } = await supabase.from('sectors').select('*');
  const { data: products } = await supabase.from('products').select('*');

  if (!sectors || !products) return {};

  const result: Record<string, SectorData> = {};
  
  sectors.forEach(sector => {
    result[sector.id] = {
      label: sector.label,
      color: sector.color,
      icon: sector.icon,
      items: products
        .filter(p => p.sector_id === sector.id)
        .map(p => ({
          id: p.id,
          label: p.label,
          cn: p.cn,
          worldDefault: p.world_default,
          bmgB: p.bmg_b,
          indiaF: p.india_f,
          route: p.route,
          unit: p.unit
        }))
    };
  });

  return result;
}

export const CBAM_YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034];
export const CBAM_FACTORS = [0.025, 0.05, 0.10, 0.225, 0.485, 0.61, 0.735, 0.86, 1.0];
export const CSCF = 0.87;
