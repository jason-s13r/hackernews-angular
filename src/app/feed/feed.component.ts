import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { HackerNewsService } from '../hacker-news.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit {
  sorting?: 'new' | 'top' | 'best';
  feed$?: Observable<any[]>;
  feed?: any[];
  ids?: string[];

  constructor(private route: ActivatedRoute, private hn: HackerNewsService) {}

  ngOnInit(): void {
    this.feed$ = this.route.paramMap
      .pipe(map((p) => p.get('sorting')))
      .pipe(
        tap((s: any) => {
          this.feed = undefined;
          this.sorting = s;

          this.hn.getFeed(s).subscribe((ids) => (this.ids = ids));
        })
      )
      .pipe(switchMap((sorting) => this.hn.getFeedItems(sorting)));

    this.feed$.subscribe((feed) => {
      if (!this.feed) {
        this.feed = [];

        // pre-load the sorting methods.
        ['new', 'best', 'top']
          .filter((x) => x !== this.sorting)
          .forEach((sorting: any) => this.hn.slowPreload(sorting).subscribe());
      }
      this.feed.push(feed);
    });
  }
}
