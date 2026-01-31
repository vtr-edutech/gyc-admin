import { Component, inject } from '@angular/core';
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { Router, RouterLink } from "@angular/router";
import { EditorModule } from 'primeng/editor';
import { FormsModule, NgForm } from '@angular/forms';
import { BlogService } from '../../../services/blog.service';
import { HttpClient } from '@angular/common/http';
import { API } from '../../../lib/constants';
import { GenericResponse } from '../../../lib/types';
import { getErrorMessage } from '../../../lib/utils';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-new-blog',
  imports: [Button, InputText, FormsModule, RouterLink, EditorModule],
  templateUrl: './new.html',
  styleUrl: './new.css',
})
export class NewBlog {
  title: string = '';
  content: string = '';
  image: File | null = null;
  thumbnailUrl: string | null = null;

  public blogService = inject(BlogService);
  private router = inject(Router);
  private messageService = inject(MessageService)

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.image = input.files[0];
      this.thumbnailUrl = URL.createObjectURL(this.image);
    }
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


    this.createBlog();
  }

  createBlog() {
    const formData = new FormData();
    formData.append('title', this.title.trim());
    formData.append('content', this.content.trim());
    if (this.image) {
      formData.append('thumbnail', this.image);
    }

    this.blogService.createBlog(formData, () => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Blog created successfully' });
      this.router.navigate(['/blogs']);
    }, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }
}
