import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrayerTimesService {
  private prayerData: any;

  constructor(private http: HttpClient) {}

  loadPrayerTimes(): Observable<any> {
    return this.http.get<any>('../../assets/data/annual_prayer_times_new_format.json');
  }

  // You can call this method to fetch today's prayer times
  getTodaysPrayerTimes() {
    // Logic to process the loaded prayer times data
    console.log(this.prayerData);
  }
}
