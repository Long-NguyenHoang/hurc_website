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

        // Render tự động set biến môi trường RENDER=true. Ta dùng nó để phát hiện Cloud.
        const isCloud = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
        res.cookie('access_token', tokenResult.access_token, {
            httpOnly: true, // Chống XSS (không cho JavaScript đọc)
            secure: isCloud, // Phải là true khi chạy trên Render/Vercel (HTTPS)
            sameSite: isCloud ? 'none' : 'lax', // Khác domain (Render API vs Vercel Frontend) bắt buộc dùng 'none'
            maxAge: 1000 * 60 * 60 * 24, // Sống được 1 ngày (1000ms * 60s * 60m * 24h)
        });

        return { 
            message: 'Đăng nhập thành công',
            access_token: tokenResult.access_token 
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Request() req, @Res({ passthrough: true }) res: express.Response) {
        const authHeader = req.headers.authorization;
        const headerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        const token = headerToken || req?.cookies?.access_token;

        if (token) {
            // Đẩy token vào bảng Blacklist
            await this.authService.logout(token);
        }
        res.clearCookie('access_token');
        return { message: 'Đăng xuất thành công' };
    }
}