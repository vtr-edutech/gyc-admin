import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-follow-up-form',
  imports: [ReactiveFormsModule],
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
    calledDate: new FormControl<string>(new Date().toISOString(), Validators.required),
    followUpDate: new FormControl<string | null>(null),
    extraFields: new FormControl<Record<string, string>>({}),
  });
}
