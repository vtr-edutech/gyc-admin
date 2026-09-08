import { FieldError } from '@/app/components/field-error/field-error';
import { RequiredAsterisk } from '@/app/components/required-asterisk/required-asterisk';
import { COURSE_INTEREST_LIST } from '@/app/lib/data';
import { TelecallerBookingsPayload } from '@/app/lib/types';
import { FollowUpFormService } from '@/app/services/followup-form.service';
import { TelecallerBookingService } from '@/app/services/telecaller-booking.service';
import { Component, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { MultiSelect, MultiSelectChangeEvent } from 'primeng/multiselect';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';
import { map } from 'rxjs';

@Component({
  selector: 'app-follow-up-form',
  imports: [
    ReactiveFormsModule,
    Textarea,
    InputText,
    DatePicker,
    Button,
    FieldError,
    Tooltip,
    Chip,
    MultiSelect,
    RequiredAsterisk,
  ],
  templateUrl: './follow-up-form.html',
  styleUrl: './follow-up-form.css',
})
export class FollowUpForm {
  followUpFormService = inject(FollowUpFormService);
  messageService = inject(MessageService);
  telecallerBookingsService = inject(TelecallerBookingService);

  closeModal = output<void>();

  followUpFormGroup = this.followUpFormService.followUpFormGroup;
  readonly courseOptions = COURSE_INTEREST_LIST;

  isAddKeyValuePairDisabled = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);

  /**
   * Contains the details name (mobile) to display under modal title
   */
  telecallerBookingDetails = toSignal<TelecallerBookingsPayload[]>(
    this.followUpFormGroup.controls.bookingIds.valueChanges.pipe(
      map(
        (bookingIds) =>
          this.telecallerBookingsService
            .telecallerBookings()
            .data?.data?.filter((booking) => bookingIds.includes(booking._id)) || [],
      ),
    ),
  );

  submitFollowUp() {
    this.followUpFormGroup.markAllAsTouched();
    this.isSubmitting.set(true);
    try {
      if (this.followUpFormGroup.invalid)
        throw new Error('Not all fields have been filled, or filled fields have error');
      this.followUpFormGroup.controls.extraFields.controls.forEach((pair) => {
        const keyField = pair.controls.key;
        const valueField = pair.controls.value;
        const isEmptyKey = keyField.value === null || keyField.value.trim() === '';
        const isEmptyValue = valueField.value === null || valueField.value.trim() === '';
        if (isEmptyKey && isEmptyValue) {
          keyField.setErrors(null);
          valueField.setErrors(null);
        } else if (isEmptyKey && !isEmptyValue) {
          keyField.setErrors({ required: true });
          throw new Error('Validation error caught!');
        } else if (!isEmptyKey && isEmptyValue) {
          valueField.setErrors({ required: true });
          throw new Error('Validation error caught!');
        } else {
          keyField.setErrors(null);
          valueField.setErrors(null);
        }
      });
      this.followUpFormService.submitFollowUp(
        (response) => {
          this.messageService.add({ severity: 'success', summary: response.message });
          // Reset form and close modal ONLY when response is success
          this.closeModal.emit();
          this.followUpFormService.reset();
        },
        (err) => {
          this.messageService.add({ severity: 'error', summary: 'An error occurred', detail: err });
        },
        () => {
          this.isSubmitting.set(false);
        },
      );
    } catch (err) {
      console.log(err);
      this.isSubmitting.set(false);
    }
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
