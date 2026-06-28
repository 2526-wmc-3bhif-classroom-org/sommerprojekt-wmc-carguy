import { Routes } from '@angular/router';
import {BrandDirectoryComponent} from './brand-directory/brand-directory.component';
import {CommunitiesRepository} from './communities-directory/communities-directory';
import {CommunityDetailComponent} from './community-detail/community-detail';
import {PostDetailComponent} from './post-detail/post-detail';
import {ProfilePage} from './profile-page/profile-page';
import {LoginPage} from './login-page/login-page';
import { GuidesComponent } from './Guides/Guides';
import { CreateCommunityComponent } from './create-community/create-community';
import { SearchResultsComponent } from './search-results/search-results';
import { LeaderboardComponent } from './leaderboard/leaderboard';
import { AdminComponent } from './admin/admin.component';
import { EventsComponent } from './events/events.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: BrandDirectoryComponent },
  { path: 'communities', component: CommunitiesRepository },
  { path: 'community/:id', component: CommunityDetailComponent },
  { path: 'post/:id', component: PostDetailComponent },
  { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
  { path: 'profile/:id', component: ProfilePage },
  { path: 'login', component: LoginPage },
  { path: 'guides', component: GuidesComponent },
  { path: 'create-community', component: CreateCommunityComponent, canActivate: [authGuard] },
  { path: 'search', component: SearchResultsComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: 'events', component: EventsComponent },
  { path: '**', redirectTo: '' }
];
