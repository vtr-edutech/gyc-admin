import { Component, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { FieldError } from '../../../../../components/field-error/field-error';
import { FollowUpFormService } from '../../../../../services/followup-form.service';

@Component({
  selector: 'app-follow-up-form',
  imports: [ReactiveFormsModule, Textarea, InputText, DatePicker, Button, FieldError],
  templateUrl: './follow-up-form.html',
  styleUrl: './follow-up-form.css',
})
export class FollowUpForm {
  followUpFormService = inject(FollowUpFormService);
  followUpFormGroup = this.followUpFormService.followUpFormGroup;

  submitFollowUp() {
    if (this.followUpFormGroup.invalid) return;

    console.log(this.followUpFormGroup.value);
  }

  addExtraField() {
    this.followUpFormService.addExtraField();
  }

  removeExtraField(key: string) {
    this.followUpFormService.removeExtraField(key);
  }
}
