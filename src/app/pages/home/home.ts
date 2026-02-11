import { Component, computed, inject } from '@angular/core';
import { ValueCard } from "../../components/value-card/value-card";
import { HomeService } from '../../services/home.service';
import { UIChart } from 'primeng/chart';

@Component({
  selector: 'app-home',
  imports: [ValueCard, UIChart],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  homeService = inject(HomeService);
  isLoading = computed(() => this.homeService.homeData()?.isLoading);

  ngOnInit() {
    this.homeService.getHomeData();
  }
}
