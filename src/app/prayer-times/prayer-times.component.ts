import { Component, OnInit } from '@angular/core';
import { PrayerTimesService } from '../services/prayer-times-service';

@Component({
  selector: 'app-prayer-times',
  templateUrl: './prayer-times.component.html',
  styleUrls: ['./prayer-times.component.css'],
  standalone: true
})
export class PrayerTimesComponent implements OnInit {
  prayerTimes: { [key: string]: string } = {};
  nextPrayer: string = '';
  remainingTime: string = '';
  countdownInterval: any;
  prayerData: any = {}; // Holds the whole prayer times JSON data
  today = new Date().toISOString().split('T')[0];
  title = 'Sfax';
  prayerKeys: string[] = [];

  constructor(private prayerTimesService: PrayerTimesService) {}

  ngOnInit() {
    this.loadPrayerTimes();
    this.startNextPrayerCountdown();
  }

  // Load prayer times from the local JSON file
  loadPrayerTimes() {
    // Fetch the prayer times data from the local JSON file
    this.prayerTimesService.loadPrayerTimes().subscribe(
      (data) => {
        this.prayerData = data;
        this.prayerTimesService.getTodaysPrayerTimes();
      },
      (error) => {
        console.error('Error loading prayer times:', error);
      }
    );
  }

  getTodaysPrayerTimes() {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0].slice(5); // Get current date in format 'MM-DD'
    if (this.prayerData[dateString]) {
      this.prayerTimes = this.prayerData[dateString];
      this.startNextPrayerCountdown(); // Start the countdown for today's prayers
    } else {
      console.error('Prayer times not found for today.');
    }
  }

  startNextPrayerCountdown() {
    const now = new Date();
    //console.log("now",now);
    const nextPrayerTime = this.getNextPrayerTime(now);
    //console.log("nextPrayerTime",nextPrayerTime);
    const remainingSeconds = this.calculateRemainingTime(now, nextPrayerTime);
    //console.log("remainingSeconds",remainingSeconds);
    this.startCountdown(remainingSeconds);
  }

  startCountdown(remainingSeconds: number) {
    let remaining = remainingSeconds;
    //console.log("remaining",remaining);
    // Clear any existing countdown interval to avoid multiple intervals
    /* if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    } */

    this.countdownInterval = setInterval(() => {
      if (remaining <= 0) {
        // Once countdown reaches 0, trigger the next prayer time calculation
        this.getTodaysPrayerTimes(); // Reload prayer times for the next day if needed
        this.startNextPrayerCountdown(); // Recalculate the next prayer time
        clearInterval(this.countdownInterval);
      } else {
        this.updateCountdownUI(remaining);
        remaining--;
      }
    }, 1000);
  }

  updateCountdownUI(remainingSeconds: number) {
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    this.remainingTime = `${hours}h ${minutes}m ${seconds}s`;
  }

  getNextPrayerTime(currentTime: Date): Date {
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    let nextPrayerTime: Date = new Date(currentTime);
    
    for (const [prayer, time] of Object.entries(this.prayerTimes)) {
      const [hours, minutes] = time.split(':').map(Number);
      const prayerTimeInMinutes = hours * 60 + minutes;

      if (prayerTimeInMinutes > currentMinutes) {
        nextPrayerTime.setHours(hours, minutes, 0, 0);
        break;
      }
    }

    return nextPrayerTime;
  }

  calculateRemainingTime(currentTime: Date, nextPrayerTime: Date): number {
    const timeDifference = nextPrayerTime.getTime() - currentTime.getTime();
    return Math.floor(timeDifference / 1000); // Return remaining time in seconds
  }
}
