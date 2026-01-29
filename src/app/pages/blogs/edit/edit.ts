import { Component, effect, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Button } from "primeng/button";
import { BlogService } from '../../../services/blog.service';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LoadingOverlay } from "../../../components/loading-overlay/loading-overlay";
import { InputText } from "primeng/inputtext";
import { Editor } from "primeng/editor";

@Component({
  selector: 'app-blog-edit',
  imports: [Button, FormsModule, LoadingOverlay, InputText, Editor, RouterLink],
  templateUrl: './edit.html',
  styleUrl: './edit.css',
})
export class EditBlog {
  title: string = '';
  content: string = '';
  image: File | null = null;
  thumbnailUrl: string = ''

  public blogService = inject(BlogService);
  private router = inject(Router);
  private messageService = inject(MessageService)

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.image = input.files[0];
    }
  }

  constructor() {
    effect(() => {
      if (this.blogService.blog().data?.data) {
        this.title = this.blogService.blog().data!.data!.title;
        this.content = this.blogService.blog().data!.data!.content;
        this.thumbnailUrl = this.blogService.blog().data!.data!.thumbnailUrl;
      }
    })
  }

  ngOnInit() {
    const blogId = this.router.url.split('/').pop();
    if (!blogId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Blog ID is required' });
      this.router.navigate(['/blogs']);
    }

    this.blogService.fetchBlog(blogId!);
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    if (!this.title?.trim()) {
      form.controls['title'].setErrors({ 'message': 'Title is required' });
      return;
    }

    if (this.title.trim().length < 5) {
      form.controls['title'].setErrors({ 'message': 'Title must be at least 5 characters long' });
      return;
    }

    if (!this.content?.trim()) {
      form.controls['content'].setErrors({ 'message': 'Content is required' });
      return;
    }

    if (this.content.trim().length < 20) {
      form.controls['content'].setErrors({ 'message': 'Content must be at least 20 characters long' });
      return;
    }

    if (this.image) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validImageTypes.includes(this.image.type)) {
        form.controls['image'].setErrors({ 'message': 'Please upload a valid image file (JPEG, PNG, or WebP)' });
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (this.image.size > maxSize) {
        form.controls['image'].setErrors({ 'message': 'Image size must be less than 5MB' });
        return;
      }
    }

    this.updateBlog();
  }

  updateBlog() {
    const formData = new FormData();
    formData.append('title', this.title.trim());
    formData.append('content', this.content.trim());
    if (this.image) {
      formData.append('thumbnail', this.image);
    }

    this.blogService.updateBlog(formData, () => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Saved changes successfully' });
      this.router.navigate(['/blogs']);
    }, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }
}
