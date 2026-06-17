import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { UserRole } from "common/enums";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "./auth.service";
import { Request } from 'express';

export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.access_token || null;
                }
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: JwtPayload) {
        const token = req?.cookies?.access_token;

        if (token) {
            const isBlacklisted = await this.authService.isTokenBlacklisted(token);
            if (isBlacklisted) {
                throw new UnauthorizedException('Token này đã đăng xuất. Vui lòng đăng nhập lại!');
            }
        }

        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role
        };
    }
}