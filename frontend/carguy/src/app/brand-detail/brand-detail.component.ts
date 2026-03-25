import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  }
}
