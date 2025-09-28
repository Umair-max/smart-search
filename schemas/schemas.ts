import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Must be a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^\S+$/, "Password must not contain spaces")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*[0-9])/, "Password must contain at least one number")
    .regex(
      /(?=.*[!@#$%^&*])/,
      "Password must contain at least one special character"
    )
    .max(20, "Password must not exceed 20 characters"),
});

export const signinSchema = z.object({
  email: z.string().email("Must be a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^\S+$/, "Password must not contain spaces")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*[0-9])/, "Password must contain at least one number")
    .regex(
      /(?=.*[!@#$%^&*])/,
      "Password must contain at least one special character"
    )
    .max(20, "Password must not exceed 20 characters"),
});

export const forgotSchema = z.object({
  email: z.string().email("Must be a valid email"),
});

export const resetPasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^\S+$/, "Password must not contain spaces")
      .regex(
        /(?=.*[a-z])/,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        /(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter"
      )
      .regex(/(?=.*[0-9])/, "Password must contain at least one number")
      .regex(
        /(?=.*[!@#$%^&*])/,
        "Password must contain at least one special character"
      )
      .max(20, "Password must not exceed 20 characters"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^\S+$/, "Password must not contain spaces")
      .regex(
        /(?=.*[a-z])/,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        /(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter"
      )
      .regex(/(?=.*[0-9])/, "Password must contain at least one number")
      .regex(
        /(?=.*[!@#$%^&*])/,
        "Password must contain at least one special character"
      )
      .max(20, "Password must not exceed 20 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^\S+$/, "Password must not contain spaces")
      .regex(
        /(?=.*[a-z])/,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        /(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter"
      )
      .regex(/(?=.*[0-9])/, "Password must contain at least one number")
      .regex(
        /(?=.*[!@#$%^&*])/,
        "Password must contain at least one special character"
      )
      .max(20, "Password must not exceed 20 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password doesn't match",
    path: ["confirmPassword"],
  });

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "OTP must be exactly 6 digits.")
    .regex(/^\d{6}$/, "OTP must only contain numbers."),
});
