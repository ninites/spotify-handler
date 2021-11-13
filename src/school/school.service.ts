import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { errorMessages } from 'src/error-messages';
import { School, SchoolDocument } from 'src/schemas/school.schema';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolService {
  constructor(
    @InjectModel(School.name)
    private readonly schoolModel: Model<SchoolDocument>,
  ) {}

  async create(createSchoolDto: CreateSchoolDto) {
    const newSchoolName = createSchoolDto.name;
    const alreadyExistingSchools = await this.schoolModel.find({
      name: newSchoolName,
    });

    if (alreadyExistingSchools.length !== 0) {
      throw new HttpException(
        errorMessages.school.duplicate,
        HttpStatus.FORBIDDEN,
      );
    }

    const createdSchool = await this.schoolModel.create(createSchoolDto);
    return createdSchool;
  }

  async findAll() {
    const allSchools = await this.schoolModel.find();

    if (allSchools.length === 0) {
      this.notFound();
    }

    return allSchools;
  }

  async findOne(id: string) {
    const lookedSchool = await this.schoolModel.findById(id);
    if (!lookedSchool) {
      this.notFound();
    }
    return lookedSchool;
  }

  update(id: number, updateSchoolDto: UpdateSchoolDto) {
    return `This action updates a #${id} school`;
  }

  async remove(id: string) {
    const schoolToRemove = await this.schoolModel.findById(id);
    if (!schoolToRemove) {
      this.notFound();
    }
    return await schoolToRemove.deleteOne();
  }

  private notFound() {
    throw new HttpException(
      errorMessages.school.notFound,
      HttpStatus.NOT_FOUND,
    );
  }
}
