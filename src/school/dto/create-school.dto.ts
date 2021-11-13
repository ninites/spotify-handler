import { SchoolAddress } from 'src/schemas/school.schema';

export class CreateSchoolDto {
  name: string;
  address: SchoolAddress;
}
