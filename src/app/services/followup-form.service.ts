import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { API } from '@/app/lib/constants';
import { ErrorFnCallback, GenericResponse } from '../lib/types';
import { FollowUpDateValidator } from '@/app/validators/followup-date-validator';
import { getErrorMessage } from '../lib/utils';

@Injectable({
  providedIn: 'root',
})
export class FollowUpFormService {
  private http = inject(HttpClient);

  followUpFormGroup = new FormGroup(
    {
      college: new FormControl<string>('', [Validators.required]),
      bookingIds: new FormArray(
        [new FormControl<string | null>(null, Validators.required)],
        [Validators.required, Validators.minLength(1)],
      ),
      remarks: new FormControl<string>('', [Validators.required]),
      calledDate: new FormControl<Date>(new Date(), [Validators.required]),
      followUpDate: new FormControl<Date | null>(null),
      extraFields: new FormArray<
        FormGroup<{ key: FormControl<string | null>; value: FormControl<string | null> }>
      >([this.getNewKeyValuePair()]),
    },
    [FollowUpDateValidator],
  );

  getNewKeyValuePair(): FormGroup<{
    key: FormControl<string | null>;
    value: FormControl<string | null>;
  }> {
    return new FormGroup({
      key: new FormControl<string | null>(null),
      value: new FormControl<string | null>(null),
    });
  }

  addExtraField() {
    const extraFields = this.followUpFormGroup.controls.extraFields;
    extraFields.push(this.getNewKeyValuePair());
  }

  removeExtraField(key: string) {
    const extraFields = this.followUpFormGroup.controls.extraFields;
    extraFields.removeAt(extraFields.value.findIndex((field) => field.key === key));
  }

  setBookingIds(ids: string[]) {
    const bookingIdArray = this.followUpFormGroup.controls.bookingIds;
    bookingIdArray.clear();
    ids.forEach((id) => {
      bookingIdArray.push(new FormControl(id, Validators.required));
    });
  }

  submitFollowUp(
    onSuccess?: (response: GenericResponse<string>) => void,
    onError?: ErrorFnCallback,
    onComplete?: Function,
  ) {
    this.http
      .post<GenericResponse<string>>(API.CREATE_FOLLOW_UP, this.followUpFormGroup.value)
      .subscribe({
        next(value) {
          onSuccess?.(value);
        },
        error: (err: HttpErrorResponse) => {
          onError?.(getErrorMessage(err));
        },
        complete() {
          onComplete?.();
        },
      });
  }
}
