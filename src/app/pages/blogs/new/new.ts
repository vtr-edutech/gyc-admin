import { Component } from '@angular/core';
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { RouterLink } from "@angular/router";
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-new-blog',
  imports: [Button, InputText, RouterLink, EditorModule],
  templateUrl: './new.html',
  styleUrl: './new.css',
})
export class NewBlog {

}
