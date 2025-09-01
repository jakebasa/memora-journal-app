import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});

export const signupSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long')
});

export const aiChatSchema = z.object({
    message: z.string().min(1, 'Message is required').max(1000, 'Message too long')
});
