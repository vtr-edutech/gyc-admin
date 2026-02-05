import { Component, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from "primeng/button";
import { Table, TableLazyLoadEvent, TableModule } from "primeng/table";
import { BlogService } from '../../services/blog.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Skeleton } from "primeng/skeleton";
import { ConfirmPopupModule } from 'primeng/confirmpopup';

@Component({
  selector: 'app-blogs',
  imports: [Button, RouterLink, TableModule, Skeleton, ConfirmPopupModule],
  templateUrl: './blogs.html',
  styleUrl: './blogs.css',
  providers: [ConfirmationService]
})
export class Blogs {
  blogService = inject(BlogService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  @ViewChild('dt') dt!: Table;

  searchModel = {
    title: '',
    date: null
  };

  loadBlogs(event: TableLazyLoadEvent): void {
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const limit = event.rows || 10;

    this.blogService.fetchBlogs(page, limit, this.searchModel, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }

  search(): void {
    this.dt.reset();
  }

  deleteBlog(id: string): void {
    this.blogService.deleteBlog(id, () => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Blog deleted successfully' });
      this.dt.reset();
    }, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }

  isSearchActive(): boolean {
    return this.blogService.blogs().data?.totalDocsForFilter !== this.blogService.blogs().data?.totalDocs;
  }

  confirmDelete(event: Event, id: string): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Do you want to delete this blog? It cannot be restored.',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Delete blog',
        severity: 'danger'
      },
      accept: () => {
        this.deleteBlog(id);
      },
      reject: () => {
      }
    });
  }
}
