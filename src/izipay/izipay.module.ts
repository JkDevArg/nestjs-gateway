import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Izipay } from './entities/izipay.entity';
import { IzipayController } from './izipay.controller';
import { IzipayService } from './izipay.service';

@Module({
    imports: [TypeOrmModule.forFeature([Izipay])],
    controllers: [IzipayController],
    providers: [IzipayService]
})

export class IzipayModule {}