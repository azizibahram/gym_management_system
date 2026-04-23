import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { queryKeys } from '../config/queryClient';

const API_URL = 'http://localhost:8000/api';

interface DashboardStats {
  total_athletes: number;
  active_athletes: number;
  inactive_athletes: number;
  total_debt: number;
  athletes_with_debt: number;
  occupied_shelves: number;
  available_shelves: number;
  recent_registrations: Array<{
    id: number;
    name: string;
    registration_date: string;
  }>;
  monthly_revenue?: number;
}

/**
 * Fetch dashboard statistics
 */
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const token = localStorage.getItem('token');
  
  // Fetch athletes
  const { data: athletes } = await axios.get(`${API_URL}/athletes/`, {
    headers: { Authorization: `Token ${token}` },
  });

  // Fetch shelves
  const { data: shelves } = await axios.get(`${API_URL}/shelves/`, {
    headers: { Authorization: `Token ${token}` },
  });

  // Calculate statistics
  const activeAthletes = athletes.filter((a: any) => a.is_active);
  const inactiveAthletes = athletes.filter((a: any) => !a.is_active);
  const athletesWithDebt = athletes.filter((a: any) => a.debt > 0);
  const totalDebt = athletes.reduce((sum: number, a: any) => sum + (a.debt || 0), 0);
  const occupiedShelves = shelves.filter((s: any) => s.is_occupied);
  const availableShelves = shelves.filter((s: any) => !s.is_occupied);

  // Get recent registrations (last 5)
  const recentRegistrations = [...athletes]
    .sort((a: any, b: any) => 
      new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime()
    )
    .slice(0, 5)
    .map((a: any) => ({
      id: a.id,
      name: a.name,
      registration_date: a.registration_date,
    }));

  return {
    total_athletes: athletes.length,
    active_athletes: activeAthletes.length,
    inactive_athletes: inactiveAthletes.length,
    total_debt: totalDebt,
    athletes_with_debt: athletesWithDebt.length,
    occupied_shelves: occupiedShelves.length,
    available_shelves: availableShelves.length,
    recent_registrations: recentRegistrations,
  };
};

/**
 * Hook to fetch dashboard statistics with caching
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
};
