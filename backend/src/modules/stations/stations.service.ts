import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Station } from "common/entities/stations.entity";
import { Repository, ILike } from "typeorm";
import { MediaService } from "../media/media.service";
import { CreateStationDto } from "./dto/create-station.dto";
import { UpdateStationDto } from "./dto/update-station.dto";

@Injectable()
export class StationsService {
    constructor(
        @InjectRepository(Station)
        private readonly stationsRepository: Repository<Station>,
        private readonly mediaService: MediaService,
    ) { }

    async create(createStationDto: CreateStationDto, userId: string, file?: Express.Multer.File) {
        const existingCode = await this.stationsRepository.findOne(
            { where: { code: createStationDto.code } }
        );

        if (existingCode) throw new ConflictException('Mã nhà ga này đã tồn tại');

        let finalImageId = createStationDto.schedule_image_id;

        if (file) {
            const newMedia = await this.mediaService.uploadSingleFile(file, userId);
            finalImageId = newMedia.id
        }

        if (!finalImageId) {
            throw new BadRequestException('Vui lòng cung cấp hình ảnh lịch chạy tàu')
        }

        const newStation = this.stationsRepository.create({
            ...createStationDto,
            schedule_image: { id: finalImageId } as any,
        });

        return await this.stationsRepository.save(newStation);
    }

    async findAllSchedule() {
        return await this.stationsRepository.find({
            order: { display_order: 'ASC' },
            relations: { schedule_image: true },
            select: {
                id: true,
                name: true,
                code: true,
                schedule_image: true
            }
        });
    }

    async findAllContent() {
        return await this.stationsRepository.find({
            order: { display_order: 'ASC' },
            select: {
                id: true,
                name: true,
                code: true,
                content: true
            }
        });
    }

    async findAllAdmin(search?: string) {
        return await this.stationsRepository.find({
            where: search ? [
                { name: ILike(`%${search}%`) },
                { code: ILike(`%${search}%`) }
            ] : undefined,
            order: { display_order: 'ASC' },
            relations: { schedule_image: true },
        });
    }

    async findOne(id: string) {
        const station = await this.stationsRepository.findOne({
            where: { id },
            relations: { schedule_image: true }
        });

        if (!station) throw new NotFoundException('Không tìm thấy nhà ga này');
        return station;
    }

    async update(id: string, updateStationDto: UpdateStationDto, userId: string, file?: Express.Multer.File) {
        const station = await this.findOne(id);

        if (updateStationDto.code && updateStationDto.code !== station.code) {
            const existingCode = await this.stationsRepository.findOne({ where: { code: updateStationDto.code } });
            if (existingCode) throw new ConflictException('Mã nhà ga này đã tồn tại');
        }

        Object.assign(station, updateStationDto);

        if (file) {
            const newMedia = await this.mediaService.uploadSingleFile(file, userId);
            station.schedule_image = { id: newMedia.id } as any;
        } else if (updateStationDto.schedule_image_id) {
            station.schedule_image = { id: updateStationDto.schedule_image_id } as any;
        }

        return await this.stationsRepository.save(station);
    }

    async remove(id: string) {
        const station = await this.findOne(id);
        station.schedule_image = null;
        await this.stationsRepository.save(station);
        await this.stationsRepository.softRemove(station);
        return { message: 'Đã xoá nhà ga thành công' };
    }
}