import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class InvoicesService {
    async lookupInvoice(code: string) {
        if (!code) {
            throw new BadRequestException('Mã hoá đơn không được để trống');
        }

        try {
            // NestJS đóng vai trò làm Proxy, gọi sang server thứ 3 bằng fetch mặc định của Node.js
            const response = await fetch(
                'https://integration.metrohcm.ttgt.vn/api/lookup/orders',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Ở Backend, chúng ta thoải mái "fake" 2 header này mà không bị chặn
                        'Origin': 'https://hurc.vn',
                        'Referer': 'https://hurc.vn',
                    },
                    body: JSON.stringify({
                        code: code
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API đối tác trả về lỗi ${response.status}:`, errorText);
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Dữ liệu từ API đối tác:', data);
            // Nhận được data, trả thẳng về cho Frontend của mình
            return data;

        } catch (error) {
            console.error('Lỗi khi tra cứu hoá đơn từ đối tác:', error);
            // Quăng lỗi để Frontend hiển thị popup cho user
            throw new BadRequestException(error.message || 'Không thể tra cứu hoá đơn lúc này hoặc mã không hợp lệ.');
        }
    }
}