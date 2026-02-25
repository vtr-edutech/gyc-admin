import { Component, computed, inject } from '@angular/core';
import { ValueCard } from "../../../components/value-card/value-card";
import { HomeService } from '../../../services/home.service';
import { UIChart } from "primeng/chart"

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
}
