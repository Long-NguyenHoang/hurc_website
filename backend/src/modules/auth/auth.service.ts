import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "common/entities/users.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { BlacklistedToken } from "common/entities/blacklisted_token.entity";

export type ValidatedUser = Omit<User, 'password'>;

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        @InjectRepository(BlacklistedToken)
        private readonly blacklistRepository: Repository<BlacklistedToken>,
    ) { }

    async validateUser(email: string, password: string): Promise<ValidatedUser | null> {
        const user = await this.userRepository.findOne({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: ValidatedUser) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role
        };

        return {
            access_token: this.jwtService.sign(payload),
            user_info: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        };
    }

    async logout(token: string) {
        try {
            // Giải mã token để lấy thời gian hết hạn gốc
            const decoded = this.jwtService.decode(token) as any;

            if (decoded && decoded.exp) {
                // Chuyển đổi exp (dạng timestamp giây) thành đối tượng Date của JS
                const expiresAt = new Date(decoded.exp * 1000);

                // Lưu token này vào danh sách đen
                const blacklisted = this.blacklistRepository.create({
                    token: token,
                    expires_at: expiresAt,
                });
                await this.blacklistRepository.save(blacklisted);
            }

            return { message: 'Đăng xuất thành công' }
        } catch (error) {
            throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
        }
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const found = await this.blacklistRepository.findOne({ where: { token } });
        return !!found;
    }
}