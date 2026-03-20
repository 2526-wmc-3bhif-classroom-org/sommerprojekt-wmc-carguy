import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModelsService} from '../services/model-service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './brand-detail.component.html',
})
export class BrandDetailComponent implements OnInit {

  protected brandName: string = "";

  curModels = new Array();

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.brandName = <string>this.route.snapshot.paramMap.get('name');

    this.curModels = ModelsService.getModels().filter(model => model.brand === this.brandName);
  }
}
