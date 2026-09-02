import { Component, computed, inject } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { Button } from 'primeng/button';
import { InfoTile } from '@/app/components/info-tile/info-tile';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Skeleton } from 'primeng/skeleton';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { Tooltip } from 'primeng/tooltip';
import { FormatDatePipe } from '@/app/pipes/format-date.pipe';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ReviewService } from '@/app/services/reviews.service';
import { isObjectEntriesEmpty } from '@/app/lib/utils';
import { InputText } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';

@Component({
  selector: 'app-reviews',
  imports: [
    DatePicker,
    Button,
    InfoTile,
    TableModule,
    Skeleton,
    ConfirmPopup,
    Tooltip,
    FormatDatePipe,
    FormsModule,
    InputText,
    RatingModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class Reviews {
  messageService = inject(MessageService);
  reviewService = inject(ReviewService);
  confirmationService = inject(ConfirmationService);
  reviewsData = computed(() => this.reviewService.reviews().data);
  isReviewsLoading = computed(() => this.reviewService.reviews().isLoading);

  isObjectEmpty = isObjectEntriesEmpty;

  viewDateRange: [Date?, Date?] = [];
  search: string = '';

  get totalRecords() {
    const data = this.reviewService.reviews().data;
    if (!data || !data.totalDocsForFilter) return 0;
    return data.totalDocsForFilter === data.totalDocs ? data.totalDocs : data.totalDocsForFilter;
  }

  loadReviews(event?: TableLazyLoadEvent): void {
    const page = event ? (event.first || 0) / (event.rows || 10) + 1 : 1;
    const limit = event ? event.rows || 10 : 10;

    this.reviewService.fetchReviews(page, limit, this.search, this.viewDateRange, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }

  showPublishPopup(event: Event, reviewId: string, canPublish: boolean) {
    const review = this.reviewsData()?.data?.find((review) => review._id === reviewId);
    if (!review) return;
    const message = `Are you sure you want to ${canPublish ? 'publish' : 'unpublish'} review from ${review.name}?`;
    this.confirmationService.confirm({
      target: event.target || undefined,
      message,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: canPublish ? 'Publish' : 'Unpublish',
        severity: canPublish ? 'success' : 'danger',
      },
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      accept: () => {
        this.reviewService.togglePublish(
          reviewId,
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: canPublish
                ? 'Review was published succesfully! It can be seen in home page'
                : 'Review was removed from public view',
            });
            this.loadReviews();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error,
            });
            this.loadReviews();
          },
        );
      },
    });
  }
}
