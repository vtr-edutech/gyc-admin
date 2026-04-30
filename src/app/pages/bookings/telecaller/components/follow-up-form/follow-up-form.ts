import { Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { FieldError } from '../../../../../components/field-error/field-error';
import { FollowUpFormService } from '../../../../../services/followup-form.service';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-follow-up-form',
  imports: [ReactiveFormsModule, Textarea, InputText, DatePicker, Button, FieldError, Tooltip],
  templateUrl: './follow-up-form.html',
  styleUrl: './follow-up-form.css',
})
export class FollowUpForm {
  followUpFormService = inject(FollowUpFormService);
  followUpFormGroup = this.followUpFormService.followUpFormGroup;
  isAddKeyValuePairDisabled = signal<boolean>(true);

  submitFollowUp() {
    if (this.followUpFormGroup.invalid) return;
    this.followUpFormGroup.controls.extraFields.controls.forEach((pair) => {
      const keyField = pair.controls.key;
      const valueField = pair.controls.value;
      if (keyField.value?.trim() !== '' && !valueField.value) {
        valueField.setErrors({ required: true });
      } else if (valueField.value?.trim() !== '' && !keyField.value) {
        keyField.setErrors({ required: true });
      } else {
        keyField.setErrors(null);
        valueField.setErrors(null);
      }
    });
    console.log(this.followUpFormGroup.value);
  }

  addExtraField() {
    this.followUpFormService.addExtraField();
  }

  removeExtraField(key: string) {
    this.followUpFormService.removeExtraField(key);
  }

  // TODO: use this func soon to implement duplicate key validation
  hasDuplicateKey(index: number): boolean {
    const formArray = this.followUpFormGroup.controls.extraFields;
    const currentKey = formArray.controls[index].value?.key;

    if (!currentKey) return false;

    return formArray.controls.some((pair, i) => i !== index && pair.value?.key === currentKey);
  }

  constructor() {
    this.followUpFormGroup.controls.extraFields.valueChanges.subscribe((pairs) => {
      const someEmpty = pairs.some((pair) => {
        const key = pair?.key?.trim();
        const value = pair?.value?.trim();
        return !key && !value;
      });
      this.isAddKeyValuePairDisabled.set(someEmpty);
    });
  }
}
