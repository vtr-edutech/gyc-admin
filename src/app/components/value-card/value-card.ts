import { Component, Input } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-value-card',
  imports: [Skeleton],
  templateUrl: './value-card.html',
  styleUrl: './value-card.css',
})
export class ValueCard {
  BG_FG_COLOR_MAP = {
    green: {
      bg: 'bg-green-50',
      fg: 'text-green-500',
      border: 'border-green-500',
    },
    blue: {
      bg: 'bg-blue-50',
      fg: 'text-blue-500',
      border: 'border-blue-500',
    },
    red: {
      bg: 'bg-red-50',
      fg: 'text-red-500',
      border: 'border-red-500',
    },
    orange: {
      bg: 'bg-orange-50',
      fg: 'text-orange-500',
      border: 'border-orange-500',
    },
    pink: {
      bg: 'bg-pink-50',
      fg: 'text-pink-500',
      border: 'border-pink-500',
    },
    gray: {
      bg: 'bg-gray-50',
      fg: 'text-gray-500',
      border: 'border-gray-500',
    },
    yellow: {
      bg: 'bg-yellow-50',
      fg: 'text-yellow-500',
      border: 'border-yellow-500',
    },
    purple: {
      bg: 'bg-purple-50',
      fg: 'text-purple-500',
      border: 'border-purple-500',
    },
    amber: {
      bg: 'bg-amber-50',
      fg: 'text-amber-500',
      border: 'border-amber-500',
    },
    sky: {
      bg: 'bg-sky-50',
      fg: 'text-sky-500',
      border: 'border-sky-500',
    },
  };

  @Input({ required: true }) title!: string;
  @Input({ required: true }) value: string | number | undefined;
  @Input() isLoading: boolean = false;
  @Input({ required: true }) color!: keyof typeof this.BG_FG_COLOR_MAP;
}
