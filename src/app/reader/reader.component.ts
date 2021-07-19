import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { DeclutterService } from '../declutter.service';
import { HackerNewsService } from '../hacker-news.service';

@Component({
  selector: 'app-reader',
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.scss'],
})
export class ReaderComponent implements OnInit {
  item$?: Observable<any>;
  readable$?: Observable<any>;
  item?: any;
  readable?: any;

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
      this.readable$ = this.declutter.getItem(item.url);
      this.readable$.subscribe((readable) => (this.readable = readable));
      this.hn.getComments(item.kids ?? []).subscribe();
    });
  }
}
