import { Component, Input, OnInit } from '@angular/core';
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss'],
})
export class TimeComponent implements OnInit {
  @Input() date!: number;
  time?: string;

  ngOnInit(): void {
    this.time = formatDistance(new Date(this.date), new Date(), {
      addSuffix: true,
    });
  }
}
