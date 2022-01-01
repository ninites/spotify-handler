import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DatesService } from './dates/dates.service';
import { MailService } from './mail/mail.service';

@Module({
  imports: [HttpModule],
  providers: [DatesService, MailService],
  exports: [DatesService, MailService],
})
export class UtilsModule {}
