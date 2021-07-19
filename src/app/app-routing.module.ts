import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommentsComponent } from './comments/comments.component';
import { FeedComponent } from './feed/feed.component';
import { ReaderComponent } from './reader/reader.component';

const routes: Routes = [
  { path: 'feed/:sorting', component: FeedComponent },
  { path: 'comments/:id', component: CommentsComponent },
  { path: 'reader/:id', component: ReaderComponent },
  { path: '', redirectTo: '/feed/top', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
