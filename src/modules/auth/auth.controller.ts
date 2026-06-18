import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import * as authService from './auth.service';
import { catchAsync } from '../../utils/catchAsync';
import { successResponse } from '../../utils/response';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};


export const register = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { user, token } = await authService.register(
    req.body as Parameters<typeof authService.register>[0],
  );

  res.cookie('token', token, COOKIE_OPTIONS);

  res.status(201).json(
    successResponse({
      message: 'Account created successfully',
      data: { user, token },
    }),
  );
});

// ─── POST /api/v1/auth/login ──────────────────────────────────────────────────

export const login = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { user, token } = await authService.login(
    req.body as Parameters<typeof authService.login>[0],
  );

  res.cookie('token', token, COOKIE_OPTIONS);

  res.status(200).json(
    successResponse({
      message: 'Logged in successfully',
      data: { user, token },
    }),
  );
});

// ─── GET /api/v1/auth/me ──────────────────────────────────────────────────────

export const getMe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  const user = await authService.getMe(userId);

  res.status(200).json(
    successResponse({
      message: 'User retrieved successfully',
      data: { user },
    }),
  );
});

// ─── POST /api/v1/auth/logout ─────────────────────────────────────────────────

export const logout = catchAsync((_req: Request, res: Response, _next: NextFunction) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json(
    successResponse({
      message: 'Logged out successfully',
      data: null,
    }),
  );

  return Promise.resolve();
});

// ─── PATCH /api/v1/auth/change-password ──────────────────────────────────────

export const changePassword = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.userId;
    await authService.changePassword(
      userId,
      req.body as Parameters<typeof authService.changePassword>[1],
    );

    // Invalidate current cookie on password change
    res.clearCookie('token', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json(
      successResponse({
        message: 'Password changed successfully. Please log in again.',
        data: null,
      }),
    );
  },
);
