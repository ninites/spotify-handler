import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
@Injectable()
export class DatesService {
  fromNow(creationDate: Date, unit: string) {
    const creationDateDt = DateTime.fromJSDate(creationDate);
    const diff = creationDateDt.toRelative({
      unit: unit,
      style: 'narrow',
    });
    const numberPattern = /\d+/g;
    const elapsedTime = parseInt(diff.match(numberPattern).join(''));

    return elapsedTime;
  }
}
