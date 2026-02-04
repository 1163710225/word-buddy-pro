import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MenuSetting {
  id: string;
  menu_key: string;
  menu_name: string;
  is_visible: boolean;
  sort_order: number;
}

export function useMenuSettings() {
  return useQuery({
    queryKey: ['menuSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_settings')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data as MenuSetting[];
    },
  });
}

export function useUpdateMenuSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from('menu_settings')
        .update({ is_visible })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuSettings'] });
      toast.success('菜单设置已更新');
    },
    onError: (error) => {
      toast.error('更新失败', { description: error.message });
    },
  });
}
