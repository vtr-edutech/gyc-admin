import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { FieldError } from '../../../../../components/field-error/field-error';

@Component({
  selector: 'app-follow-up-form',
  imports: [ReactiveFormsModule, Textarea, InputText, DatePicker, Button, FieldError],
  templateUrl: './follow-up-form.html',
  styleUrl: './follow-up-form.css',
})
export class FollowUpForm {
  followUpFormGroup = new FormGroup({
    college: new FormControl<string>('', [Validators.required]),
    bookingId: new FormArray(
      [new FormControl<string | null>(null, Validators.required)],
      [Validators.required, Validators.minLength(1)],
    ),
    remarks: new FormControl<string>('', [Validators.required]),
    calledDate: new FormControl<Date>(new Date(), [Validators.required]),
    followUpDate: new FormControl<Date | null>(null),
    extraFields: new FormArray<FormGroup<{ key: FormControl<string>; value: FormControl<string> }>>(
      [
        new FormGroup({
          key: new FormControl<string>('', {
            nonNullable: true,
            validators: Validators.required,
          }),
          value: new FormControl<string>('', {
            nonNullable: true,
            validators: Validators.required,
          }),
        }),
      ],
    ),
  });

  constructor() {
    this.followUpFormGroup.valueChanges.subscribe((value) => {
      console.log(value);
    });
  }

  submitFollowUp() {
    console.log(this.followUpFormGroup.value);
  }

  addExtraField() {
    const extraFields = this.followUpFormGroup.controls.extraFields;
    const newExtraField = new FormGroup({
      key: new FormControl<string>('', {
        nonNullable: true,
        validators: Validators.required,
      }),
      value: new FormControl<string>('', {
        nonNullable: true,
        validators: Validators.required,
      }),
    });
    extraFields.push(newExtraField);
  }

  removeExtraField(key: string) {
    const extraFields = this.followUpFormGroup.controls.extraFields;
    extraFields.removeAt(extraFields.value.findIndex((field) => field.key === key));
  }
}
