import { FormatDatePipe } from '@/app/pipes/format-date.pipe';
import { AuthService } from '@/app/services/auth.service';
import { BlogService } from '@/app/services/blog.service';
import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-blog',
  imports: [Button, RouterLink, Avatar, FormatDatePipe],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);
  blogService = inject(BlogService);
  private messageService = inject(MessageService);

  isBlogLoading = computed(() => this.blogService.blog().isLoading);

  blog = computed(() => this.blogService.blog().data?.data);

  ngOnInit() {
    const blogId = this.router.url.split('/').pop();
    if (!blogId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Blog ID is required',
      });
      this.router.navigate(['/blogs']);
      return;
    }

    this.blogService.fetchBlog(blogId!);
  }
}
