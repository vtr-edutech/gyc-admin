import { formatDate } from "@angular/common"

export function formatDates(date: string | Date) {
    return formatDate(date, "EE, MMM dd, yyyy", "en", "Asia/Kolkata")
}