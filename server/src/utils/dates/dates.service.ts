import { Injectable } from '@nestjs/common';
import { DateTime } from "luxon"
@Injectable()
export class DatesService {

    fromNow(creationDate: Date, unit: string) {
        const creationDateDt = DateTime.fromJSDate(creationDate)
        const diffInMinutes = creationDateDt.toRelative({ unit: unit, style: "narrow" })
        const elapsedTime = parseInt(diffInMinutes) * -1
        return elapsedTime
    }
}
