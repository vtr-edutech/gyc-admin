import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-follow-up-form',
  imports: [ReactiveFormsModule, Textarea, InputText, DatePicker],
  templateUrl: './follow-up-form.html',
  styleUrl: './follow-up-form.css',
})
export class FollowUpForm {
  followUpFormGroup = new FormGroup({
    college: new FormControl<string>(''),
    bookingId: new FormArray(
      [new FormControl<string>('', Validators.required)],
      [Validators.required, Validators.minLength(1)],
    ),
    remarks: new FormControl<string>('', Validators.required),
    calledDate: new FormControl<Date>(new Date(), Validators.required),
    followUpDate: new FormControl<Date | null>(null),
    extraFields: new FormControl<Record<string, string>>({}),
  });

  constructor() {
    this.followUpFormGroup.valueChanges.subscribe((value) => {
      console.log(value);
    });
  }
}
