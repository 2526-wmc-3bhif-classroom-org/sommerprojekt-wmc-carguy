import { Routes } from '@angular/router';
import {BrandDirectoryComponent} from './brand-directory/brand-directory.component';
import {CommunitiesRepository} from './communities-directory/communities-directory';
import {CommunityDetailComponent} from './community-detail/community-detail';
import {PostDetailComponent} from './post-detail/post-detail';
import {ProfilePage} from './profile-page/profile-page';
import {LoginPage} from './login-page/login-page';
import {GuidesComponent} from './Guides/Guides';

export const routes: Routes = [
  { path: '', component: BrandDirectoryComponent },
  { path: 'communities', component: CommunitiesRepository },
  { path: 'community/:id', component: CommunityDetailComponent },
  { path: 'post/:id', component: PostDetailComponent },
  { path: 'profile', component: ProfilePage },
  { path: 'login', component: LoginPage },
  { path: 'guides', component: GuidesComponent },
];
