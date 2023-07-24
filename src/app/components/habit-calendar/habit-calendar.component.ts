import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EventQueueService } from 'src/app/services/event-queue/event-queue.service';
import { HabitRepoService } from 'src/app/services/habit-repo/habit-repo.service';
import { Habit, HabitStreak } from 'src/app/shared/data-classes/data-objects';
import { AppEventType } from 'src/app/shared/events';

@Component({
  selector: 'app-habit-calendar',
  templateUrl: './habit-calendar.component.html',
  styleUrls: ['./habit-calendar.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HabitCalendarComponent  implements OnInit {
  habits!: Habit[];
  selectedHabit: Habit | undefined;
  habitStreaks: {[habitSid: string]: HabitStreak[]} = {};
  highlightedDates: any = [];

  constructor(private habitRepoService: HabitRepoService, private eventQueueService: EventQueueService) { }

  ngOnInit() {
    this.getHabits();
    this.eventQueueService.on(AppEventType.HabitListUpdated).subscribe(() => this.getHabits());
    this.eventQueueService.on(AppEventType.HabitStreakListUpdated).subscribe(() => this.getHabitStreaks());
  }

  public getHabits() {
    this.habitRepoService.getHabits().then((result) => {
      this.habits = result ?? [];
      this.getHabitStreaks();
    });
  }

  public getHabitStreaks() {
    for (let habit of this.habits) {
      this.habitRepoService.getHabitStreaksByHabit(habit.HabitSID).then((result) => {
        this.habitStreaks[habit.HabitSID] = result;
        if (this.selectedHabit) {
          this.highlightDatesForHabit(this.selectedHabit)
        }
      });
    }
  }

  public highlightDatesForHabit(eventOrString: any) {
    this.highlightedDates = [];
    var habitSID : string;
    if (typeof eventOrString === 'string') {
      habitSID = eventOrString;
    }
    else {
      habitSID = eventOrString.detail.value;
    }

    var habitStreaks = this.habitStreaks[habitSID];
    for (let habitStreak of habitStreaks) {
      var dateToAdd = new Date(habitStreak.StartDate.getFullYear(), habitStreak.StartDate.getMonth(), habitStreak.StartDate.getDate());
      for (let i = 0; i < habitStreak.StreakCount; i++) {
        this.highlightedDates.push({
          date: dateToAdd.toISOString().split('T')[0],
          textColor: '#09721b',
          backgroundColor:'#c8e5d0'
        });
        dateToAdd.setDate(dateToAdd.getDate() + 1);
      }
    }
  }
}
