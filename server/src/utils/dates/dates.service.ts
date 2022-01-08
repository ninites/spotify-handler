import { Injectable } from '@nestjs/common';
import { DateTime, Interval } from 'luxon';
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

  isInRange(testDate: string, range: number): boolean {
    const testDt = DateTime.fromFormat(testDate, 'yyyy-MM-dd');
    const now = DateTime.now();
    const diff = Interval.fromDateTimes(testDt, now);
    const result = diff.length('months') < range;
    // console.log(result);
    return result;
  }
}
