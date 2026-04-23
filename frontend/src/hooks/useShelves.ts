import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { queryKeys } from '../config/queryClient';

const API_URL = 'http://localhost:8000/api';

interface Shelf {
  id: number;
  locker_number: string;
  athlete?: number;
  athlete_name?: string;
  is_occupied: boolean;
  start_date?: string;
  end_date?: string;
  duration_months?: number;
  price?: number;
}

interface ShelfFilters {
  is_occupied?: boolean;
  search?: string;
}

/**
 * Fetch shelves with optional filters
 */
const fetchShelves = async (filters?: ShelfFilters): Promise<Shelf[]> => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  
  if (filters?.is_occupied !== undefined) {
    params.append('is_occupied', String(filters.is_occupied));
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }

  const { data } = await axios.get(`${API_URL}/shelves/?${params}`, {
    headers: { Authorization: `Token ${token}` },
  });
  return data;
};

/**
 * Assign shelf to athlete
 */
const assignShelf = async (shelfData: {
  id: number;
  athlete: number;
  duration_months: number;
  price: number;
}): Promise<Shelf> => {
  const token = localStorage.getItem('token');
  const { id, ...data } = shelfData;
  const { data: response } = await axios.patch(`${API_URL}/shelves/${id}/`, data, {
    headers: { Authorization: `Token ${token}` },
  });
  return response;
};

/**
 * Release shelf
 */
const releaseShelf = async (id: number): Promise<Shelf> => {
  const token = localStorage.getItem('token');
  const { data } = await axios.patch(
    `${API_URL}/shelves/${id}/`,
    { athlete: null, duration_months: null, price: null },
    { headers: { Authorization: `Token ${token}` } }
  );
  return data;
};

/**
 * Hook to fetch shelves with caching
 */
export const useShelves = (filters?: ShelfFilters) => {
  return useQuery({
    queryKey: queryKeys.shelves.list(filters),
    queryFn: () => fetchShelves(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

/**
 * Hook to assign shelf with optimistic updates
 */
export const useAssignShelf = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignShelf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shelves.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.athletes.lists() });
    },
  });
};

/**
 * Hook to release shelf
 */
export const useReleaseShelf = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: releaseShelf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shelves.lists() });
    },
  });
};
