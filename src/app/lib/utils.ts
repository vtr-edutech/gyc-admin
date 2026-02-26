import { formatDate } from "@angular/common"
import { HttpErrorResponse } from "@angular/common/http";

export function formatDates(date: string | Date, withTime: boolean = false) {
    return (!date || date.toString().trim() === '') ? 'Invalid Date' : formatDate(date, `EE, MMM dd, y ${withTime ? "'at' h:mm a" : ''}`, "en", "Asia/Kolkata")
}

export function getErrorMessage(error: HttpErrorResponse) {
    return error.error?.error || error.message || 'An error occurred';
}

export function generateNumbers(count: number) {
    return Array.from({ length: count }).map((_, index) => index + 1);
}