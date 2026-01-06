import { formatDate } from "@angular/common"
import { HttpErrorResponse } from "@angular/common/http";

export function formatDates(date: string | Date) {
    return formatDate(date, "EE, MMM dd, yyyy", "en", "Asia/Kolkata")
}

export function getErrorMessage(error: HttpErrorResponse) {
    return error.error?.error || error.message || 'An error occurred';
}