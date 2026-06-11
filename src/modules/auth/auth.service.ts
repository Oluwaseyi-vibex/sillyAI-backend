import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import type { RegisterInput, LoginInput, ChangePasswordInput } from './auth.validation';
import type { JwtPayload, SafeUser } from './auth.types';

const SALT_ROUNDS = 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strip sensitive fields before returning user data to the client.
 */
function toSafeUser(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

/**
 * Generate a signed JWT containing userId, email, and role.
 */
function generateToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

// ─── Service Methods ──────────────────────────────────────────────────────────

/**
 * Register a new user account.
 * - Validates uniqueness of email
 * - Hashes password with bcrypt
 * - Returns JWT + safe user object
 */
export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      password: hashedPassword,
    },
  });

  const token = generateToken(user);

  return { user: toSafeUser(user), token };
}

/**
 * Authenticate a user with email + password.
 * - Uses constant-time comparison to prevent timing attacks
 * - Returns JWT + safe user object
 */
export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Use the same error message for both "not found" and "wrong password"
  // to prevent user enumeration attacks
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user);

  return { user: toSafeUser(user), token };
}

/**
 * Return the authenticated user's profile (no password).
 */
export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return toSafeUser(user);
}

/**
 * Change the authenticated user's password.
 * - Verifies current password before applying change
 */
export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isCurrentPasswordValid = await bcrypt.compare(input.currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  const hashedNewPassword = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });
}
