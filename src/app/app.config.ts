import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { PrayerTimesComponent } from './prayer-times/prayer-times.component';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideRouter([{ path: '', component: PrayerTimesComponent }])
  ]
};
