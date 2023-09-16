import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IconSelectModalComponent } from '../icon-select-modal/icon-select-modal.component';
import { HabitLogicService } from 'src/app/services/habit-logic/habit-logic.service';
import { HabitRepoService } from 'src/app/services/habit-repo/habit-repo.service';
import { AppEventType } from 'src/app/shared/events';
import { EventQueueService } from 'src/app/services/event-queue/event-queue.service';
import { Habit, HabitStreak } from 'src/app/shared/data-classes/data-objects';

@Component({
  selector: 'app-exporter',
  templateUrl: './exporter.component.html',
  styleUrls: ['./exporter.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, IconSelectModalComponent]
})
export class ExporterComponent  implements OnInit {
  constructor(private habitLogicService : HabitLogicService, private habitRepoService: HabitRepoService, private eventQueueService: EventQueueService) { }

  habits!: Habit[];
  habitStreaks: {[habitSid: string]: HabitStreak[]} = {};

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
      });
    }
  }

  public exportHabitStreaks() {
    var habitStreaks: HabitStreak[] = [];
    for (let habit of this.habits) {
      habitStreaks = habitStreaks.concat(this.habitStreaks[habit.HabitSID]);
    }
    this.habitLogicService.exportHabitStreaksToCSV(habitStreaks);
  }
   
  public exportHabits() {
    this.habitLogicService.exportHabitsToCSV(this.habits);
  }
}
