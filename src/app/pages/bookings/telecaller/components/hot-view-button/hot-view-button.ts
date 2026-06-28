import { Component } from '@angular/core';
import { HotCellRendererComponent } from '@handsontable/angular-wrapper';
import { Events } from 'handsontable';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-hot-view-button',
  imports: [Button],
  templateUrl: './hot-view-button.html',
  styleUrl: './hot-view-button.css',
})
export class HotViewButton extends HotCellRendererComponent {
  onClick(event: PointerEvent) {
    const bookingId = this.value;
    const props = this.getProps();
    props.action(bookingId);
  }
}
