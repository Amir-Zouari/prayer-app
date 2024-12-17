import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrayerTimesComponent } from './prayer-times/prayer-times.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PrayerTimesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Sfax';
}
