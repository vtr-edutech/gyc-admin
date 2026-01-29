import { Component } from '@angular/core';
import { ProgressSpinner } from "primeng/progressspinner";

@Component({
  selector: 'app-loading-overlay',
  imports: [ProgressSpinner],
  templateUrl: './loading-overlay.html',
  styleUrl: './loading-overlay.css',
})
export class LoadingOverlay {

}
