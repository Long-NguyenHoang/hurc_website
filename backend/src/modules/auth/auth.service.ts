import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "common/entities/users.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { UserRole } from "common/enums";

export type ValidatedUser = Omit<User, 'password'>;

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService
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
}