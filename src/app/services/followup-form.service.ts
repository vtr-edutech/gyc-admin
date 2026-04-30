import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FollowUpFormService {
  followUpFormGroup = new FormGroup({
    college: new FormControl<string>('', [Validators.required]),
    bookingId: new FormArray(
      [new FormControl<string | null>(null, Validators.required)],
      [Validators.required, Validators.minLength(1)],
    ),
    remarks: new FormControl<string>('', [Validators.required]),
    calledDate: new FormControl<Date>(new Date(), [Validators.required]),
    followUpDate: new FormControl<Date | null>(null),
    extraFields: new FormArray<
      FormGroup<{ key: FormControl<string | null>; value: FormControl<string | null> }>
    >([this.getNewKeyValuePair()]),
  });

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
    const bookingIdArray = this.followUpFormGroup.controls.bookingId;
    bookingIdArray.clear();
    ids.forEach((id) => {
      bookingIdArray.push(new FormControl(id, Validators.required));
    });
  }
}
