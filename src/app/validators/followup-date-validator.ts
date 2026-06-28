import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const FollowUpDateValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  // Use .get() to pull references directly from the group
  const calledControl = control.get('calledDate');
  const followUpControl = control.get('followUpDate');

  const calledDateValue = calledControl?.value;
  const followUpDateValue = followUpControl?.value;

  // 1. Let individual controls handle their own emptiness (via Validators.required)
  if (!calledDateValue || !followUpDateValue) {
    return null;
  }

  const calledDate = new Date(calledDateValue);
  const followUpDate = new Date(followUpDateValue);

  // 2. Format validation safety checks
  const isCalledInvalid = isNaN(calledDate.getTime());
  const isFollowUpInvalid = isNaN(followUpDate.getTime());

  if (isCalledInvalid || isFollowUpInvalid) {
    return { invalidDateFormat: 'Follow up date or called date is invalid' };
  }

  // 3. Evaluate your business rules (Chronological sequence logic)
  if (followUpDate.getTime() < calledDate.getTime()) {
    // Optional: Only set an error down on the control if you explicitly want to turn the field red
    followUpControl.setErrors({
      ...followUpControl.errors,
      illogicalDateError: 'Follow up date cannot be before called date',
    });

    // Return a structured key object directly back to the parent FormGroup
    return { followUpPrecedesCalled: true };
  }

  // 4. Clean up the error on the child control if the state is now valid
  if (followUpControl.hasError('illogicalDateError')) {
    const remainingErrors = { ...followUpControl.errors };
    delete remainingErrors['illogicalDateError'];
    followUpControl.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
  }

  return null; // Entire group is fully valid!
};
