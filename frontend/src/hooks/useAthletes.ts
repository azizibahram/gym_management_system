import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { queryKeys } from '../config/queryClient';

const API_URL = 'http://localhost:8000/api';

interface Athlete {
  id: number;
  name: string;
  phone: string;
  email?: string;
  registration_date: string;
  is_active: boolean;
  debt: number;
  photo?: string;
}

interface AthleteFilters {
  search?: string;
  is_active?: boolean;
  has_debt?: boolean;
}

/**
 * Fetch athletes with optional filters
 */
const fetchAthletes = async (filters?: AthleteFilters): Promise<Athlete[]> => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
  if (filters?.has_debt !== undefined) params.append('has_debt', String(filters.has_debt));

  const { data } = await axios.get(`${API_URL}/athletes/?${params}`, {
    headers: { Authorization: `Token ${token}` },
  });
  return data;
};

/**
 * Fetch single athlete by ID
 */
const fetchAthlete = async (id: number): Promise<Athlete> => {
  const token = localStorage.getItem('token');
  const { data } = await axios.get(`${API_URL}/athletes/${id}/`, {
    headers: { Authorization: `Token ${token}` },
  });
  return data;
};

/**
 * Create new athlete
 */
const createAthlete = async (athleteData: Partial<Athlete>): Promise<Athlete> => {
  const token = localStorage.getItem('token');
  const { data } = await axios.post(`${API_URL}/athletes/`, athleteData, {
    headers: { Authorization: `Token ${token}` },
  });
  return data;
};

/**
 * Update athlete
 */
const updateAthlete = async ({ id, ...athleteData }: Partial<Athlete> & { id: number }): Promise<Athlete> => {
  const token = localStorage.getItem('token');
  const { data } = await axios.patch(`${API_URL}/athletes/${id}/`, athleteData, {
    headers: { Authorization: `Token ${token}` },
  });
  return data;
};

/**
 * Delete athlete
 */
const deleteAthlete = async (id: number): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/athletes/${id}/`, {
    headers: { Authorization: `Token ${token}` },
  });
};

/**
 * Hook to fetch athletes list with caching and background refetch
 */
export const useAthletes = (filters?: AthleteFilters) => {
  return useQuery({
    queryKey: queryKeys.athletes.list(filters),
    queryFn: () => fetchAthletes(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
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
    onMutate: async (updatedAthlete) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.athletes.detail(updatedAthlete.id) 
      });

      // Snapshot previous value
      const previousAthlete = queryClient.getQueryData(
        queryKeys.athletes.detail(updatedAthlete.id)
      );

      // Optimistically update
      queryClient.setQueryData(
        queryKeys.athletes.detail(updatedAthlete.id),
        updatedAthlete
      );

      return { previousAthlete };
    },
    onError: (_err, updatedAthlete, context) => {
      // Rollback on error
      if (context?.previousAthlete) {
        queryClient.setQueryData(
          queryKeys.athletes.detail(updatedAthlete.id),
          context.previousAthlete
        );
      }
    },
    onSettled: (_data, _error, updatedAthlete) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.athletes.detail(updatedAthlete.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.athletes.lists() 
      });
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
