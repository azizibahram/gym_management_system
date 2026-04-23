import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { queryKeys } from '../config/queryClient';

const API_URL = 'http://localhost:8000/api';

interface Payment {
  id: number;
  athlete: number;
  amount: number;
  payment_date: string;
  notes?: string;
}

/**
 * Fetch payments for an athlete
 */
const fetchPayments = async (athleteId?: number): Promise<Payment[]> => {
  const token = localStorage.getItem('token');
  const url = athleteId 
    ? `${API_URL}/payments/?athlete=${athleteId}`
    : `${API_URL}/payments/`;
  
  const { data } = await axios.get(url, {
    headers: { Authorization: `Token ${token}` },
  });
  return data;
};

/**
 * Create new payment
 */
const createPayment = async (paymentData: Partial<Payment>): Promise<Payment> => {
  const token = localStorage.getItem('token');
  const { data } = await axios.post(`${API_URL}/payments/`, paymentData, {
    headers: { Authorization: `Token ${token}` },
  });
  return data;
};

/**
 * Hook to fetch payments with caching
 */
export const usePayments = (athleteId?: number) => {
  return useQuery({
    queryKey: queryKeys.payments.list(athleteId),
    queryFn: () => fetchPayments(athleteId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to create payment with cache invalidation
 */
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: (data) => {
      // Invalidate payments list
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
      // Invalidate athlete detail (to update debt)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.athletes.detail(data.athlete) 
      });
      // Invalidate athletes list
      queryClient.invalidateQueries({ queryKey: queryKeys.athletes.lists() });
    },
  });
};
