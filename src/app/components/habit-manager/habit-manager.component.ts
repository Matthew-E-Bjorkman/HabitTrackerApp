import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { EventQueueService } from 'src/app/services/event-queue/event-queue.service';
import { HabitService } from 'src/app/services/habit/habit.service';
import { Habit } from 'src/app/shared/data-classes/data-objects';
import { AppEventType } from 'src/app/shared/events';

@Component({
  selector: 'app-habit-manager',
  templateUrl: './habit-manager.component.html',
  styleUrls: ['./habit-manager.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HabitManagerComponent implements OnInit {

  habits!: Habit[];

  constructor(public habitService: HabitService, private eventQueueService: EventQueueService) { 
    this.getHabits();
  }

  ngOnInit(): void {
    this.eventQueueService.on(AppEventType.HabitListUpdated).subscribe(event => this.getHabits());
  }

  public getHabits() {
    this.habitService.getHabits((result) => {
      if (result) {
        this.habits = result;
      }
    });
  }

  public createHabit() {
    var habit = new Habit();
    habit.Name = "Habit " + (this.habits.length + 1);
    this.habitService.saveHabit(habit);
  }

  public deleteHabit(habit: Habit) {
    this.habitService.deleteHabit(habit);
  }
}
