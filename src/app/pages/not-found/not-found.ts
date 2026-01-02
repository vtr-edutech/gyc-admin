import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from "primeng/button";

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [RouterLink, Button],
    templateUrl: './not-found.html',
    styleUrl: './not-found.css',
})
export class NotFound { }
