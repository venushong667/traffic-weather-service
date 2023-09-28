import { Injectable, Logger } from '@nestjs/common';
import { Camera, Prisma } from '@prisma/client';

import { PrismaService } from '../primsa.service';

@Injectable()
export class TrafficService {
    private readonly logger = new Logger(TrafficService.name);

    constructor(
        private prisma: PrismaService
    ) {}

    async createCamera(data: Prisma.CameraCreateInput | Prisma.CameraCreateInput[]) {
        if (Array.isArray(data)) {
            return this.prisma.camera.createMany({
                data: data,
                skipDuplicates: true
            }); 
        } else {
            return this.prisma.camera.create({
                data,
            });
        }
    }

    async getCameras(params?: {
        skip?: number;
        take?: number;
        cursor?: Prisma.CameraWhereUniqueInput;
        where?: Prisma.CameraWhereInput;
        orderBy?: Prisma.CameraOrderByWithRelationInput;
    }): Promise<Camera[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.camera.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async getCamera(
        userWhereUniqueInput: Prisma.CameraWhereUniqueInput,
    ): Promise<Camera | null> {
        return this.prisma.camera.findUnique({
            where: userWhereUniqueInput,
        });
    }

    async updateCamera(params: {
        where: Prisma.CameraWhereUniqueInput;
        data: Prisma.CameraUpdateInput;
    }): Promise<Camera> {
        const { where, data } = params;
        return this.prisma.camera.update({
            data,
            where,
        });
    }

    async deleteCamera(where: Prisma.CameraWhereUniqueInput): Promise<Camera> {
        return this.prisma.camera.delete({
            where,
        });
    }
}
