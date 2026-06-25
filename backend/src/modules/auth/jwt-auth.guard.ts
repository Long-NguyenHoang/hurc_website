import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    handleRequest(err, user, info, context?: ExecutionContext) {
        if (err || !user) {
            if (context) {
                const response = context.switchToHttp().getResponse();
                if (response && typeof response.clearCookie === 'function') {
                    response.clearCookie('access_token');
                }
            }
            throw err || new UnauthorizedException('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
        }
        return user;
    }
}