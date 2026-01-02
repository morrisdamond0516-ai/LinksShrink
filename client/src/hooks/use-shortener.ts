import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useShortenUrl() {
  return useMutation({
    mutationFn: async (url: string) => {
      // Validate input first
      const input = api.shortener.create.input.parse({ originalUrl: url });
      
      const res = await fetch(api.shortener.create.path, {
        method: api.shortener.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const error = await res.json();
        // Parse error with validation schema if it's a 400
        if (res.status === 400) {
          throw new Error(error.message || "Invalid URL");
        }
        throw new Error("Failed to shorten URL");
      }

      // Parse success response
      return api.shortener.create.responses[201].parse(await res.json());
    },
  });
}

export function useUrlStats(shortCode: string) {
  return useQuery({
    queryKey: [api.shortener.get.path, shortCode],
    queryFn: async () => {
      const url = buildUrl(api.shortener.get.path, { shortCode });
      const res = await fetch(url);
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch stats");
      
      return api.shortener.get.responses[200].parse(await res.json());
    },
    enabled: !!shortCode,
  });
}
