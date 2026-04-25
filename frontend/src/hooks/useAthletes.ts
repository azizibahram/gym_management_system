import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { queryKeys } from '../config/queryClient';

const API_URL = 'http://localhost:8000/api';

export interface Payment {
  id: number;
  amount: number;
  payment_date: string;
  payment_type: 'registration' | 'renewal';
  notes: string;
}

export interface Athlete {
  id: number;
  full_name: string;
  father_name: string;
  photo: string | null;
  registration_date: string;
  fee_start_date: string;
  fee_deadline_date: string;
  gym_type: string;
  gym_time: string;
  discount: number;
  debt: number;
  final_fee: number;
  contact_number: string;
  notes: string;
  shelf: number | null;
  shelf_number?: string;
  days_left: number;
  is_active: boolean;
  payments?: Payment[];
}

export interface AthleteFilters {
  search?: string;
  gym_type?: string;
  gym_time?: string;
  fee_status?: string;
  page?: number;
  page_size?: number;
}

/**
 * Fetch athletes with optional filters
 */
const fetchAthletes = async (filters?: AthleteFilters): Promise<Athlete[]> => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.gym_type) params.append('gym_type', filters.gym_type);
  if (filters?.gym_time) params.append('gym_time', filters.gym_time);
  if (filters?.fee_status) params.append('fee_status', filters.fee_status);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.page_size) params.append('page_size', String(filters.page_size));
  
  // Always order by registration date descending
  params.append('ordering', '-registration_date');

  const { data } = await axios.get(`${API_URL}/athletes/?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  // Handle paginated response
  return Array.isArray(data) ? data : (data.results || []);
};

/**
 * Fetch single athlete by ID
 */
const fetchAthlete = async (id: number): Promise<Athlete> => {
  const token = localStorage.getItem('token');
  const { data } = await axios.get(`${API_URL}/athletes/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

/**
 * Create new athlete
 */
const createAthlete = async (athleteData: FormData): Promise<Athlete> => {
  const token = localStorage.getItem('token');
  const { data } = await axios.post(`${API_URL}/athletes/`, athleteData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

/**
 * Update athlete
 */
const updateAthlete = async ({ id, data: athleteData }: { id: number; data: FormData }): Promise<Athlete> => {
  const token = localStorage.getItem('token');
  const { data } = await axios.put(`${API_URL}/athletes/${id}/`, athleteData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

/**
 * Delete athlete
 */
const deleteAthlete = async (id: number): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/athletes/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Toggle athlete status
 */
const toggleAthleteStatus = async (id: number): Promise<Athlete> => {
  const token = localStorage.getItem('token');
  const { data } = await axios.post(`${API_URL}/athletes/${id}/toggle_status/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

/**
 * Renew athlete membership
 */
const renewAthlete = async ({ id, duration }: { id: number; duration: number }): Promise<Athlete> => {
  const token = localStorage.getItem('token');
  const { data } = await axios.post(`${API_URL}/athletes/${id}/renew/`, { duration }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.athlete || data;
};

/**
 * Hook to fetch athletes list with caching and background refetch
 */
export const useAthletes = (filters?: AthleteFilters) => {
  return useQuery({
    queryKey: queryKeys.athletes.list(filters),
    queryFn: () => fetchAthletes(filters),
    staleTime: 1 * 60 * 1000, // 1 minute - shorter for real-time updates
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
  });
};

/**
 * Hook to fetch single athlete with caching
 */
export const useAthlete = (id: number) => {
  return useQuery({
    queryKey: queryKeys.athletes.detail(id),
    queryFn: () => fetchAthlete(id),
    enabled: !!id, // Only fetch if id is provided
  });
};

/**
 * Hook to create athlete with optimistic updates
 */
export const useCreateAthlete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAthlete,
    onSuccess: () => {
      // Invalidate and refetch athletes list
      queryClient.invalidateQueries({ queryKey: queryKeys.athletes.lists() });
    },
  });
};

/**
 * Hook to update athlete with optimistic updates
 */
export const useUpdateAthlete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAthlete,
    onSuccess: () => {
      // Invalidate all athlete queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.athletes.lists() });
    },
  });
};

/**
 * Hook to toggle athlete status
 */
export const useToggleAthleteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleAthleteStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.athletes.lists() });
    },
  });
};

/**
 * Hook to renew athlete membership
 */
export const useRenewAthlete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: renewAthlete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.athletes.lists() });
    },
  });
};

/**
 * Hook to delete athlete
 */
export const useDeleteAthlete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAthlete,
    onSuccess: () => {
      // Invalidate athletes list
      queryClient.invalidateQueries({ queryKey: queryKeys.athletes.lists() });
    },
  });
};

/**
 * Prefetch athletes for better UX
 */
export const prefetchAthletes = (queryClient: ReturnType<typeof useQueryClient>, filters?: AthleteFilters) => {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.athletes.list(filters),
    queryFn: () => fetchAthletes(filters),
  });
};
