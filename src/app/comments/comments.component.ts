import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { DeclutterService } from '../declutter.service';
import { HackerNewsService } from '../hacker-news.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
})
export class CommentsComponent implements OnInit {
  item$?: Observable<any>;
  item: any;
  comments$: any;
  comments: any;
  readable: any;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private declutter: DeclutterService,
    private hn: HackerNewsService
  ) {}

  back() {
    this.location.back();
  }

  ngOnInit(): void {
    this.item$ = this.route.paramMap
      .pipe(map((p) => p.get('id')!))
      .pipe(switchMap((id) => this.hn.getItem(id)));

    this.item$.subscribe((item) => {
      this.item = item;

      this.comments$ = this.hn.getComments(item?.kids ?? []);
      this.comments$.subscribe((comment: any) => {
        if (!this.comments) {
          this.comments = [];
        }
        this.comments.push(comment);
      });

      // pre-cache the readable.
      if (item.url) {
        this.declutter.getItem(item.url).subscribe((r) => (this.readable = r));
      }
    });
  }
}
