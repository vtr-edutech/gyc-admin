import { Pipe, PipeTransform } from '@angular/core';
import { COLLEGE_COURSE_GROUPS } from '../lib/constants';

@Pipe({
  name: 'courseCodeName',
})
export class CourseCodeNamePipe implements PipeTransform {
  transform(value: string[] | undefined): string[] {
    if (!value) return [];

    const courseName = value
      .map(
        (val) =>
          Object.values(COLLEGE_COURSE_GROUPS)
            .flat()
            .find((course) => course['Branch Code'] === val)?.['Branch Name'],
      )
      .filter((course) => !!course) as string[];
    return courseName;
  }
}
