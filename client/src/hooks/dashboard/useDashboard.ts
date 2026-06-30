import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '../../services/dashboard/DashboardService';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: DashboardService.getMetrics
  });
}

export function useActivityFeed() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: DashboardService.getActivityFeed
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: ['dashboard', 'recommendations'],
    queryFn: DashboardService.getRecommendations
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ['dashboard', 'collections'],
    queryFn: DashboardService.getCollections
  });
}

export function useDownloads() {
  return useQuery({
    queryKey: ['dashboard', 'downloads'],
    queryFn: DashboardService.getDownloads
  });
}

export function useUploads() {
  return useQuery({
    queryKey: ['dashboard', 'uploads'],
    queryFn: DashboardService.getUploads
  });
}
