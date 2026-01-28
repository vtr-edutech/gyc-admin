import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from "primeng/button";

@Component({
  selector: 'app-blogs',
  imports: [Button, RouterLink],
  templateUrl: './blogs.html',
  styleUrl: './blogs.css',
})
export class Blogs {

}
