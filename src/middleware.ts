import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Protege todas as rotas de app exceto as públicas abaixo
    "/((?!_next|.*.[w-]+$|api/webhooks|sign-in|sign-up).*)",
  ],
};
