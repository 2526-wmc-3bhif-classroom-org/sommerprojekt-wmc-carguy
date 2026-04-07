import { Routes } from '@angular/router';
import {BrandDirectoryComponent} from './brand-directory/brand-directory.component';
import {BrandDetailComponent} from './brand-detail/brand-detail.component';
import {CommunitiesRepository} from './communities-directory/communities-directory';
import {ProfilePage} from './profile-page/profile-page';
import {GuidesComponent} from './Guides/Guides';

export const routes: Routes = [
  { path: '', component: BrandDirectoryComponent },
  { path: 'brand/:name', component: BrandDetailComponent },
  { path: 'communities', component: CommunitiesRepository },
  { path: 'profile', component: ProfilePage },
  { path: 'guides', component: GuidesComponent },
];
