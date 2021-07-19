import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HackerNewsService } from '../hacker-news.service';

@Component({
  selector: 'app-feed-item',
  templateUrl: './feed-item.component.html',
  styleUrls: ['./feed-item.component.scss'],
})
export class FeedItemComponent implements OnInit {
  @Input() id!: string;
  item?: any;
  item$?: Observable<any>;

  constructor(private hn: HackerNewsService) {}

  ngOnInit(): void {
    this.item$ = this.hn.getItem(this.id);
    this.item$.subscribe((item) => (this.item = item));
  }
}
