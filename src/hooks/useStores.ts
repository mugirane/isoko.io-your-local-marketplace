import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Store, Product } from "@/lib/types";

export const useStores = () => {
  return useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data: stores, error } = await supabase
        .from("stores")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch follower counts for each store
      const storesWithFollowers = await Promise.all(
        (stores || []).map(async (store) => {
          const { count } = await supabase
            .from("store_followers")
            .select("*", { count: "exact", head: true })
            .eq("store_id", store.id);

          return {
            ...store,
            followers_count: count || 0,
          } as Store;
        })
      );

      return storesWithFollowers;
    },
  });
};

export const useStore = (id: string | undefined) => {
  return useQuery({
    queryKey: ["store", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Store;
    },
    enabled: !!id,
  });
};

export const useStoreProducts = (storeId: string | undefined) => {
  return useQuery({
    queryKey: ["store-products", storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!storeId,
  });
};

export const useProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
};
