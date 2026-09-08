import { titleCase } from '@/app/lib/utils';
import { Component, input } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-field-error',
  imports: [],
  templateUrl: './field-error.html',
  styleUrl: './field-error.css',
})
export class FieldError {
  control = input.required<FormControl | FormArray>();
  fieldName = input<string>();

  get errorMessage() {
    const control = this.control();
    if (!control.touched || !control.invalid) {
      return '';
    }
    const fieldName = this.fieldName() || titleCase(this.getControlName(control) || 'field');

    if (control instanceof FormArray) {
      const errors = control.controls.map((ctrl) => this.buildErrorMessage(ctrl, fieldName) ?? '');
      return errors.join(', ');
    }

    const standardError = this.buildErrorMessage(control, fieldName);
    if (standardError) return standardError;

    // Return first custom error or empty error
    return control.errors ? (control.errors[Object.keys(control.errors)[0]] ?? '') : '';
  }

  private buildErrorMessage(control: AbstractControl, fieldName: string) {
    if (control.hasError('required')) {
      return `${fieldName} is required`;
    } else if (control.hasError('minlength')) {
      return `${fieldName} is too short`;
    } else if (control.hasError('maxlength')) {
      return `${fieldName} is too long`;
    } else if (control.hasError('pattern')) {
      return `${fieldName} is invalid`;
    } else {
      return null;
    }
  }

  getControlName(control: AbstractControl): string | null {
    const parent = control.parent;
    if (!parent || !(parent instanceof FormGroup)) {
      return null;
    }

    // Find the key in the parent's controls object that matches this control
    return Object.keys(parent.controls).find((name) => parent.controls[name] === control) || null;
  }
}
