import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { BaseRenderer } from 'handsontable/renderers';

export function formatDates(date: string | Date, withTime: boolean = false) {
  return !date || date.toString().trim() === ''
    ? 'N/A'
    : formatDate(date, `EE, MMM dd, y ${withTime ? "'at' h:mm a" : ''}`, 'en', 'Asia/Kolkata');
}

export function getErrorMessage(error: HttpErrorResponse) {
  return error.error?.error || error.message || 'An error occurred';
}

export function generateNumbers(count: number) {
  return Array.from({ length: count }).map((_, index) => index + 1);
}

export const customValidationDropdownRenderer: BaseRenderer = (...args) => {
  const [, td, , , , value] = args;
  // Always reset before re-applying so stale classes don't accumulate on data refresh.
  td.classList.remove(
    'bg-green-200',
    '!text-green-900',
    'bg-red-200',
    '!text-red-900',
    'bg-amber-200',
    '!text-amber-900',
  );
  if (value === 'correct') td.classList.add('!bg-green-200', '!text-green-900');
  if (value === 'incorrect') td.classList.add('!bg-red-200', '!text-red-900');
  if (value === 'partial') td.classList.add('!bg-amber-200', '!text-amber-900');
  td.textContent = value ?? '';
};
