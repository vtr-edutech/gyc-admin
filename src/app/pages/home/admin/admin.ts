import { ValueCard } from '@/app/components/value-card/value-card';
import { hoverLinePlugin } from '@/app/lib/ui';
import { HomeService } from '@/app/services/home.service';
import { Component, computed, inject } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { UIChart } from 'primeng/chart';

@Component({
  selector: 'app-home-admin',
  imports: [ValueCard, UIChart],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class HomeAdmin {
  homeService = inject(HomeService);
  isLoading = computed(() => this.homeService.homeData()?.isLoading);

  ngOnInit() {
    this.homeService.getHomeData();
  }

  readonly chartOptions: ChartOptions = {
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  readonly plugins = [hoverLinePlugin];
}
