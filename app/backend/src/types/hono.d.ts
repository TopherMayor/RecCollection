import { Context } from "hono";
import { z } from "zod";
import {
  urlSchema,
  recipeInputSchema,
  registerInputSchema,
  loginInputSchema,
  profileUpdateSchema,
  commentInputSchema,
  aiNameInputSchema,
  aiDescriptionInputSchema,
} from "../schemas/validation";

declare module "hono" {
  interface ContextVariableMap {
    user: {
      id: string;
    };
    validated: {
      body?:
        | z.infer<typeof urlSchema>
        | z.infer<typeof recipeInputSchema>
        | z.infer<typeof registerInputSchema>
        | z.infer<typeof loginInputSchema>
        | z.infer<typeof profileUpdateSchema>
        | z.infer<typeof commentInputSchema>
        | z.infer<typeof aiNameInputSchema>
        | z.infer<typeof aiDescriptionInputSchema>;
      query?: any;
      params?: any;
    };
    validatedQuery: any;
    requestId: string;
  }
}

export type CustomContext = Context<{
  Variables: {
    user: {
      id: string;
    };
    validated: {
      body?:
        | z.infer<typeof urlSchema>
        | z.infer<typeof recipeInputSchema>
        | z.infer<typeof registerInputSchema>
        | z.infer<typeof loginInputSchema>
        | z.infer<typeof profileUpdateSchema>
        | z.infer<typeof commentInputSchema>
        | z.infer<typeof aiNameInputSchema>
        | z.infer<typeof aiDescriptionInputSchema>;
      query?: any;
      params?: any;
    };
    validatedQuery: any;
    requestId: string;
  };
}>;
