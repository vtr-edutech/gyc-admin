import { Component, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from "primeng/button";
import { Table, TableLazyLoadEvent, TableModule } from "primeng/table";
import { BlogService } from '../../services/blog.service';
import { MessageService } from 'primeng/api';
import { Skeleton } from "primeng/skeleton";

@Component({
  selector: 'app-blogs',
  imports: [Button, RouterLink, TableModule, Skeleton],
  templateUrl: './blogs.html',
  styleUrl: './blogs.css',
})
export class Blogs {
  blogService = inject(BlogService);
  messageService = inject(MessageService);

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

  isSearchActive(): boolean {
    return this.blogService.blogs().data?.totalDocsForFilter !== this.blogService.blogs().data?.totalDocs;
  }
}
