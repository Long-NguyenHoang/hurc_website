import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, Request, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import express from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: express.Response) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }

        const tokenResult = await this.authService.login(user);

        // Để dùng được Cookie trên môi trường thực tế (có HTTPS và sử dụng Sub-domain):
        // 1. Phải bật secure = true
        // 2. Phải set domain để cả Frontend (hurc.vn) và Backend (api.hurc.vn) cùng đọc được Cookie
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieDomain = process.env.COOKIE_DOMAIN || undefined; // Ví dụ trong file .env set: COOKIE_DOMAIN=.hurc.vn

        res.cookie('access_token', tokenResult.access_token, {
            httpOnly: true, // Chống XSS
            secure: isProduction, // Bật true khi lên Server thật
            sameSite: 'lax', // Chống CSRF (Lax hoạt động tốt khi Frontend và Backend chung tên miền gốc)
            domain: isProduction ? cookieDomain : undefined, // Bắt buộc phải có để Middleware của Vercel/Next.js đọc được
            maxAge: 1000 * 60 * 60 * 24,
        });

        return { message: 'Đăng nhập thành công' };
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Request() req, @Res({ passthrough: true }) res: express.Response) {
        const token = req?.cookies?.access_token;

        if (token) {
            // Đẩy token vào bảng Blacklist
            await this.authService.logout(token);
        }
        res.clearCookie('access_token');
        return { message: 'Đăng xuất thành công' };
    }
}