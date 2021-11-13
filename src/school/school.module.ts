import { Module } from '@nestjs/common';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { School, SchoolSchema } from 'src/schemas/school.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: School.name, schema: SchoolSchema }]),
  ],
  controllers: [SchoolController],
  providers: [SchoolService],
})
export class SchoolModule {}
