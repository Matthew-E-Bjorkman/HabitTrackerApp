import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, IonicModule } from '@ionic/angular';
import { EventQueueService } from 'src/app/services/event-queue/event-queue.service';
import { HabitService } from 'src/app/services/habit/habit.service';
import { Habit } from 'src/app/shared/data-classes/data-objects';
import { AppEventType } from 'src/app/shared/events';
import { OverlayEventDetail } from '@ionic/core/components';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-habit-manager',
  templateUrl: './habit-manager.component.html',
  styleUrls: ['./habit-manager.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HabitManagerComponent implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  habits!: Habit[];
  habit: Habit = new Habit();

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
    this.habitService.saveHabit(this.habit);
  }

  public deleteHabit(habit: Habit) {
    this.habitService.deleteHabit(habit);
  }

  public cancel() {
    this.modal.dismiss('false', 'cancel');
  }

  public confirm() {
    this.modal.dismiss('true', 'confirm');
  }

  onWillDismiss(event: Event) {
    if ((event as CustomEvent<OverlayEventDetail<string>>).detail.data === 'true') {
      this.createHabit();
    }
  }
}
