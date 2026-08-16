import { makeRateLimit } from "./rate-limit.factory.js";

export const registerRateLimit = makeRateLimit(5);
export const loginRateLimit = makeRateLimit(50);
export const refreshRateLimit = makeRateLimit(60);
export const verifyEmailRateLimit = makeRateLimit(20);
export const resendVerificationRateLimit = makeRateLimit(5);
export const forgotPasswordRateLimit = makeRateLimit(5);
export const resetPasswordRateLimit = makeRateLimit(10);
