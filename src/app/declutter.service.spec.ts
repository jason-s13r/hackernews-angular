import { TestBed } from '@angular/core/testing';

import { DeclutterService } from './declutter.service';

describe('DeclutterService', () => {
  let service: DeclutterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeclutterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
