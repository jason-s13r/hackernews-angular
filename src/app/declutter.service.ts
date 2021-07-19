import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { differenceInHours } from 'date-fns';
import * as localforage from 'localforage';
import { from, Observable } from 'rxjs';
import { concatMap, map, retry, tap } from 'rxjs/operators';

export const BASE_URL = 'https://declutter.1j.nz';

@Injectable({
  providedIn: 'root',
})
export class DeclutterService {
  storage: LocalForage;

  constructor(private http: HttpClient) {
    this.storage = localforage.createInstance({
      name: 'Declutter',
      driver: localforage.INDEXEDDB,
    });

    this.cleanup();
  }

  cleanup() {
    from(this.storage.keys())
      .pipe(concatMap((l) => l))
      .subscribe(async (key) => {
        const item: any = await this.storage.getItem(key);
        if (!item) {
          return;
        }
        if (differenceInHours(new Date(), item.retrieved) > 6) {
          console.log('removing old readable:', item.id);
          this.storage.removeItem(key);
        }
      });
  }

  _getItem(url: string) {
    return this.http
      .post(`${BASE_URL}/simple/details`, { url })
      .pipe(retry(5))
      .pipe(
        map((readable: any) => {
          readable.retrieved = new Date();
          return readable;
        })
      );
  }

  getItem(url: string): Observable<any> {
    return new Observable((subscriber) => {
      this.storage
        .getItem(url.toString())
        .then((value: any) => {
          if (!value) {
            throw new Error('not found in cache');
          }
          if (differenceInHours(new Date(), value.retrieved) > 6) {
            this.storage.removeItem(url.toString());
            throw new Error('cached item is too old');
          }
          subscriber.next(value);
          subscriber.complete();
        })
        .catch(() => {
          this._getItem(url).subscribe((value) => {
            subscriber.next(value);
            subscriber.complete();
          });
        });
    }).pipe(tap((i: any) => this.storage.setItem(i.url.toString(), i)));
  }
}
