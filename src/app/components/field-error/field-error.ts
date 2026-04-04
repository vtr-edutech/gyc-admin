import { Component, input } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { titleCase } from '../../lib/utils';

@Component({
  selector: 'app-field-error',
  imports: [],
  templateUrl: './field-error.html',
  styleUrl: './field-error.css',
})
export class FieldError {
  control = input.required<FormControl>();
  fieldName = input<string>();

  get errorMessage() {
    const control = this.control();
    if (!control.touched || !control.invalid) {
      return '';
    }
    const fieldName = this.fieldName() || titleCase(this.getControlName(control) || 'field');

    if (control.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control.hasError('minlength')) {
      return `${fieldName} is too short`;
    }
    if (control.hasError('maxlength')) {
      return `${fieldName} is too long`;
    }
    if (control.hasError('pattern')) {
      return `${fieldName} is invalid`;
    }
    return '';
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
