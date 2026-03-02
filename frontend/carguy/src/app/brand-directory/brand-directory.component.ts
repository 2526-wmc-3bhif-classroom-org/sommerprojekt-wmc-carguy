import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModelsService } from '../services/model-service';

interface Brand {
  name: string;
  color: string;
  models: number;
  members: string;
}

@Component({
  selector: 'app-brand-directory',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './brand-directory.component.html',
  styleUrls: ['./brand-directory.component.css']
})
export class BrandDirectoryComponent {
  brands: Brand[] = [
    { name: 'Porsche', color: '#E4002B', models: 0, members: '45,200' },
    { name: 'BMW', color: '#0066B1', models: 0, members: '52,300' },
    { name: 'Mercedes-Benz', color: '#00AEEF', models: 0, members: '48,900' },
    { name: 'Tesla', color: '#E31937', models: 0, members: '67,800' },
    { name: 'Audi', color: '#BB0A30', models: 0, members: '41,200' },
    { name: 'Ferrari', color: '#FF2800', models: 0, members: '28,500' },
    { name: 'Lamborghini', color: '#FFCC00', models: 0, members: '19,200' },
    { name: 'Toyota', color: '#EB0A1E', models: 0, members: '89,400' },
  ];

  ngOnInit(): void {
    this.brands.sort((a, b) => a.name.localeCompare(b.name));

    for (let b of this.brands) {
      b.models = ModelsService.getModels().filter(m => m.brand.toLowerCase() === b.name.toLowerCase()).length;
    }
  }
}
