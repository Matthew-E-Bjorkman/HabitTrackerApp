import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HabitService } from 'src/app/services/habit/habit.service';
import { CommonModule } from '@angular/common';
import { Habit } from 'src/app/shared/data-classes/data-objects';
import { EventQueueService } from 'src/app/services/event-queue/event-queue.service';
import { AppEventType } from 'src/app/shared/events';

@Component({
  selector: 'app-habit-list',
  templateUrl: './habit-list.component.html',
  styleUrls: ['./habit-list.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HabitListComponent implements OnInit {
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
}
