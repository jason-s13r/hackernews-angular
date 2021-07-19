import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  concatMap,
  delay,
  map,
  mergeMap,
  retry,
  retryWhen,
  tap,
  toArray,
} from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import * as localforage from 'localforage';
import { differenceInHours, differenceInSeconds } from 'date-fns';

export const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

@Injectable({
  providedIn: 'root',
})
export class HackerNewsService {
  storage: LocalForage;
  commentStorage: LocalForage;

  constructor(private http: HttpClient) {
    this.storage = localforage.createInstance({
      name: 'hn:stories',
      driver: localforage.INDEXEDDB,
    });
    this.commentStorage = localforage.createInstance({
      name: 'hn:comments',
      driver: localforage.INDEXEDDB,
    });

    this.cleanup();
  }

  cleanup() {
    from(this.commentStorage.keys())
      .pipe(concatMap((l) => l))
      .subscribe(async (key) => {
        const item: any = await this.commentStorage.getItem(key);
        if (!item) {
          return;
        }
        if (differenceInHours(new Date(), item.retrieved) > 6) {
          console.log('removing old comment:', item.id);
          this.commentStorage.removeItem(key);
        }
      });

    from(this.storage.keys())
      .pipe(concatMap((l) => l))
      .subscribe(async (key) => {
        const item: any = await this.storage.getItem(key);
        if (!item) {
          return;
        }
        if (differenceInHours(new Date(), item.retrieved) > 6) {
          console.log('removing old story:', item.id);
          this.storage.removeItem(key);
        }
      });
  }

  getFeed(sorting: 'new' | 'best' | 'top'): Observable<string[]> {
    return this.http
      .get(`${BASE_URL}/${sorting}stories.json`)
      .pipe(retry(5))
      .pipe(map((data: any) => data));
  }

  getFeedItems(sorting: 'new' | 'best' | 'top'): Observable<any[]> {
    return this.getFeed(sorting)
      .pipe(mergeMap((data: string[]) => from(data)))
      .pipe(concatMap((id) => this.getItem(id)));
  }

  _getItem(id: string): Observable<any> {
    return this.http
      .get(`${BASE_URL}/item/${id}.json`)
      .pipe(retry(5))
      .pipe(
        map((item: any) => {
          item.authorLink = `https://news.ycombinator.com/user?id=${item.by}`;
          item.link = `https://news.ycombinator.com/item?id=${item.id}`;
          item.host = new URL(item.url || item.link).host;
          item.retrieved = new Date();
          return item;
        })
      );
  }

  getItem(id: string): Observable<any> {
    return new Observable((subscriber) => {
      this.storage
        .getItem(id.toString())
        .then((value: any) => {
          if (!value) {
            throw new Error('not found in cache');
          }
          if (differenceInSeconds(new Date(), value.retrieved) > 300) {
            this.storage.removeItem(id.toString());
            throw new Error('cached item is too old');
          }
          subscriber.next(value);
          subscriber.complete();
        })
        .catch(() => {
          this._getItem(id).subscribe((value) => {
            subscriber.next(value);
            subscriber.complete();
          });
        });
    }).pipe(tap((i: any) => this.storage.setItem(i.id.toString(), i)));
  }

  slowPreload(sorting: 'new' | 'best' | 'top'): Observable<any[]> {
    return this.getFeed(sorting)
      .pipe(mergeMap((data: string[]) => from(data)))
      .pipe(delay(100))
      .pipe(concatMap((id) => this.getItem(id)));
  }

  getCommentItem(id: string): Observable<any> {
    return new Observable((subscriber) => {
      this.commentStorage
        .getItem(id.toString())
        .then((value: any) => {
          if (!value) {
            throw new Error('not found in cache');
          }
          if (differenceInSeconds(new Date(), value.retrieved) > 300) {
            this.commentStorage.removeItem(id.toString());
            throw new Error('cached item is too old');
          }
          subscriber.next(value);
          subscriber.complete();
        })
        .catch(() => {
          this._getItem(id).subscribe((value) => {
            subscriber.next(value);
            subscriber.complete();
          });
        });
    }).pipe(tap((i: any) => this.commentStorage.setItem(i.id.toString(), i)));
  }

  getComments(ids: string[] = []): Observable<any> {
    return from(ids).pipe(concatMap((id: string) => this.getCommentItem(id)));
  }
}
