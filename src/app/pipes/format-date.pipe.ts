import { Pipe, PipeTransform } from '@angular/core';
import { formatDates } from '../lib/utils';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  /**
   * Pipe that transforms server timestamp to local datetime, easy to read
   * @param date The main date as string or Date or number
   * @param withTime Optionally display with time @default false
   * @param args Unused
   * @returns string
   */
  transform(
    date: string | Date | null | undefined,
    withTime: boolean = false,
    ...args: unknown[]
  ): string {
    return formatDates(date, withTime);
  }
}
