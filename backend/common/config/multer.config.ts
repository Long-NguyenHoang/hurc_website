import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname } from "path";


export const multerOptions = {
    storage: diskStorage({
        // Chỉ định nơi lưu file (thư mục gốc /uploads)
        destination: './uploads',
        filename: (req, file, cb) => {
            // Tạo chuỗi ngẫu nhiên từ thời gian hiện tại
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            // Lấy đuôi file gốc (vd: .jpg, .png)
            const ext = extname(file.originalname);
            // Ghép lại thành tên mới (vd: image-1689...123.jpg)
            cb(null, `image-${uniqueSuffix}${ext}`);
        },
    }),

    // Chỉ cho upload file ảnh
    fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|pdf)$/)) {
            cb(null, true);
        } else {
            cb(new BadRequestException('Chỉ gửi file có định dạng sau (jpg/jpeg/png/gif/webp/pdf)'), false);
        }
    },

    // Giới hạn dung lượng 5MB
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
};