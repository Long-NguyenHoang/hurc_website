import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
    constructor(private readonly cls: ClsService) { }

    use(req: Request, res: Response, next: NextFunction) {
        // 1. Ưu tiên lấy token từ Cookie (Cách mới)
        let token = req.cookies?.['access_token'];

        // 2. (Tùy chọn) Dự phòng lấy từ Header 
        // Giữ lại đoạn này rất tốt nếu sau này bạn làm App Mobile (Mobile thường dùng Bearer Token chứ không dùng Cookie)
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7, authHeader.length);
            }
        }

        // 3. Tiến hành giải mã nếu có token
        if (token) {
            try {
                // Tùy thuộc vào JWT Secret của bạn, giải mã để lấy thông tin
                // Lưu ý: Decode không check thời hạn, chỉ để lấy payload nhanh cho việc Log
                const decoded: any = jwt.decode(token);
                if (decoded) {
                    // Cất user vào đường hầm CLS để truyền xuống TypeORM Subscriber
                    this.cls.set('user', { id: decoded.sub || decoded.id, email: decoded.email });
                }
            } catch (err) {
                // Bỏ qua nếu token lỗi
            }
        }

        next();
    }
}