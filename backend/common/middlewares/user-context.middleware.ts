import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
    constructor(private readonly cls: ClsService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7, authHeader.length);
            try {
                // Tùy thuộc vào JWT Secret của bạn, bạn có thể giải mã để lấy thông tin
                // Lưu ý: Decode không check thời hạn, chỉ để lấy payload nhanh cho việc Log
                const decoded: any = jwt.decode(token);
                if (decoded) {
                    // Cất user vào đường hầm CLS
                    this.cls.set('user', { id: decoded.sub || decoded.id, email: decoded.email });
                }
            } catch (err) {
                // Bỏ qua nếu token lỗi
            }
        }
        next();
    }
}