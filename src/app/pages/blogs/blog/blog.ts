import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Avatar } from "primeng/avatar";
import { Button } from "primeng/button";
import { AuthService } from '../../../services/auth.service';
import { BlogService } from '../../../services/blog.service';

@Component({
  selector: 'app-blog',
  imports: [Button, RouterLink, Avatar],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog {
  authService = inject(AuthService);
  private router = inject(Router);
  blogService = inject(BlogService);
  private messageService = inject(MessageService);

  isBlogLoading = computed(() => this.blogService.blog().isLoading);

  ngOnInit() {
    const blogId = this.router.url.split('/').pop();
    if (!blogId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Blog ID is required' });
      this.router.navigate(['/blogs']);
    }

    this.blogService.fetchBlog(blogId!);
  }
}
