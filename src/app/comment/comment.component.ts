import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { HackerNewsService } from '../hacker-news.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {
  @Input() id!: string;
  @Input() depth!: number;
  item$?: Observable<any>;
  item: any;
  comments: any;
  comments$: any;
  loadingComments: boolean = false;
  showComments: boolean = true;

  constructor(private hn: HackerNewsService) {}

  ngOnInit(): void {
    this.item$ = this.hn.getCommentItem(this.id);

    this.item$.subscribe((item: any) => {
      this.item = item;

      if (this.depth < 2 && (item.kids?.length ?? 0 > 0)) {
        this.loadComments();
      }
    });
  }

  loadComments() {
    this.loadingComments = true;
    this.comments$ = this.hn.getComments(this.item?.kids ?? []);
    this.comments$.subscribe((comment: any) => {
      if (!this.comments) {
        this.comments = [];
      }
      this.comments.push(comment);
    });
  }

  toggleComments() {
    this.showComments = !this.showComments;
  }
}
