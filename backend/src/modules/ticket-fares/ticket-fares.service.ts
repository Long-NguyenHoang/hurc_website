import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TicketFare } from "common/entities/ticket_fare.entity";
import { Repository } from "typeorm";
import { MediaService } from "../media/media.service";
import { CreateTicketFareDto } from "./dto/create-ticket-fare.dto";
import { UpdateTicketFareDto } from "./dto/update-ticket-fare.dto";

@Injectable()
export class TicketFaresService {
    constructor(
        @InjectRepository(TicketFare)
        private readonly ticketFaresRepository: Repository<TicketFare>,
        private readonly mediaService: MediaService,
    ) { }

    async create(createTicketFareDto: CreateTicketFareDto, userId: string, file?: Express.Multer.File) {
        let finalImageId = createTicketFareDto.image_id;

        if (file) {
            const newMedia = await this.mediaService.uploadSingleFile(file, userId);
            finalImageId = newMedia.id;
        }

        if (!finalImageId) {
            throw new BadRequestException('Vui lòng cung cấp hình ảnh bảng giá vé');
        }

        const newTicketFare = this.ticketFaresRepository.create({
            ...createTicketFareDto,
            image: { id: finalImageId } as any,
        });

        return await this.ticketFaresRepository.save(newTicketFare);
    }

    async findAllPublic() {
        return await this.ticketFaresRepository.find({
            where: { is_active: true },
            order: { display_order: 'ASC', created_at: 'DESC' },
            relations: { image: true },
            select: {
                id: true,
                title: true,
                image: { id: true, url: true }
            }
        });
    }

    async findAllAdmin() {
        return await this.ticketFaresRepository.find({
            order: { display_order: 'ASC', created_at: 'DESC' },
            relations: { image: true },
        });
    }

    async findOne(id: string) {
        const ticketFare = await this.ticketFaresRepository.findOne({
            where: { id },
            relations: { image: true }
        });

        if (!ticketFare) throw new NotFoundException('Không tìm thấy bảng giá này');
        return ticketFare;
    }

    async update(id: string, updateTicketFareDto: UpdateTicketFareDto, userId: string, file?: Express.Multer.File) {
        const ticketFare = await this.findOne(id);

        Object.assign(ticketFare, updateTicketFareDto);

        if (file) {
            const newMedia = await this.mediaService.uploadSingleFile(file, userId);
            ticketFare.image = { id: newMedia.id } as any;
        } else if (updateTicketFareDto.image_id) {
            ticketFare.image = { id: updateTicketFareDto.image_id } as any;
        }

        return await this.ticketFaresRepository.save(ticketFare);
    }

    async remove(id: string) {
        const ticketFare = await this.findOne(id);
        await this.ticketFaresRepository.softRemove(ticketFare);
        return { message: 'Đã xoá bảng giá thành công' };
    }
}