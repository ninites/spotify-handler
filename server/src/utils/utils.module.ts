import { Module } from '@nestjs/common';
import { DatesService } from './dates/dates.service';

@Module({
    imports: [],
    providers: [DatesService],
    exports: [DatesService]
})
export class UtilsModule { }
