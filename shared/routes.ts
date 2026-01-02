import { z } from "zod";
import { insertUrlSchema, urls } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  shortener: {
    create: {
      method: 'POST' as const,
      path: '/api/shorten',
      input: z.object({
        originalUrl: z.string().url("Please enter a valid URL"),
      }),
      responses: {
        201: z.object({
          shortCode: z.string(),
          shortUrl: z.string(),
        }),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/urls/:shortCode',
      responses: {
        200: z.object({
           originalUrl: z.string(),
           visitCount: z.number(),
        }),
        404: errorSchemas.notFound,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
