import { Component, OnInit } from '@angular/core';
import { PrayerTimesService } from '../services/prayer-times-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prayer-times',
  templateUrl: './prayer-times.component.html',
  styleUrls: ['./prayer-times.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class PrayerTimesComponent implements OnInit {
  prayerTimes: { [key: string]: string } = {};
  nextPrayer: string = '';
  remainingTime: string = '';
  countdownInterval: any;
  prayerData: any = {}; // Holds the whole prayer times JSON data
  //today = new Date().toISOString().split('T')[0];
  selectedDay = new Date();
  title = 'Sfax';
  prayerKeys: string[] = [];
  isToday: boolean = true;

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

  convertDateToMM_DD(date: Date): string {
    const dateString = new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
    })
      .format(date)
      .replace('/', '-'); // Get current date in format 'MM-DD'
    return dateString;
  }
 /*  convertDateToYYYY_MM_DD(date: Date): string {
    const year = date.getFullYear();
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);    
    const day = String(date.getDate()).padStart(2, '0'); // Pad day with 0
    return `${year}-${month}-${day}`;
  } */
  convertDateToYYYY_MM_DD(date: Date): string {
    const dateString = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    })
      .format(date)
      .replace('/', '-'); // Get current date in format 'MM-DD'
    return dateString;
  }

  getTodaysPrayerTimes() {
    this.isToday = true;
    const today = new Date();
    //console.log('today', today);
    const dateString = this.convertDateToMM_DD(today);
    if (this.prayerData[dateString]) {
      this.prayerTimes = this.prayerData[dateString];
      this.startNextPrayerCountdown(); // Start the countdown for today's prayers
    } else {
      console.error('Prayer times not found for today.');
    }
  }

  startNextPrayerCountdown() {
    // Clear any existing countdown interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    // Calculate the next prayer time and remaining time in seconds
    const now = new Date();
    //console.log("now",now);
    const nextPrayerTime = this.getNextPrayerTime(now);
    //console.log("nextPrayerTime",nextPrayerTime);
    const remainingSeconds = this.calculateRemainingTime(now, nextPrayerTime);
    //console.log("remainingSeconds",remainingSeconds);
    this.startCountdown(remainingSeconds);
  }

  startCountdown(remainingSeconds: number) {
    // Start a countdown interval
    this.countdownInterval = setInterval(() => {
      if (remainingSeconds <= 0) {
        clearInterval(this.countdownInterval);
        // Once countdown reaches 0, trigger the next prayer time calculation
        this.getTodaysPrayerTimes(); // Reload prayer times for the next day if needed
        this.startNextPrayerCountdown(); // Recalculate the next prayer time
      } else {
        this.updateCountdownUI(remainingSeconds); // Update the countdown display
        remainingSeconds--; // Decrement the countdown
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
    const currentMinutes =
      currentTime.getHours() * 60 + currentTime.getMinutes();
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

  moveToPreviousDate() {
    //console.log('before moving', this.selectedDay);
    this.selectedDay.setDate(this.selectedDay.getDate() - 1);
    //console.log('after moving', this.selectedDay); // Go back one day
    this.getDayPrayerTimes(this.selectedDay);
  }

  moveToNextDate() {
    this.selectedDay.setDate(this.selectedDay.getDate() + 1); // Move forward one day
    this.getDayPrayerTimes(this.selectedDay);
  }

  getDayPrayerTimes(date: Date) {
    this.selectedDay = date; // Get current date
    const dataString = this.convertDateToMM_DD(this.selectedDay); // Format date as 'YYYY-MM-DD'
    if (this.prayerData[dataString]) {
      if (dataString == this.convertDateToMM_DD(new Date())) {
        this.getTodaysPrayerTimes();
      } else {
        this.isToday = false;
        this.prayerTimes = this.prayerData[dataString];
        //console.log('prayer time for ', this.selectedDay, 'are loaded');
      }
    } else {
      console.error('Prayer times not found for today.');
    }
  }
}
