import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { EventQueueService } from 'src/app/services/event-queue/event-queue.service';
import { HabitService } from 'src/app/services/habit/habit.service';
import { Habit } from 'src/app/shared/data-classes/data-objects';
import { AppEventType } from 'src/app/shared/events';
import { FormsModule } from '@angular/forms';
import { HabitAddEditModalComponent } from '../habit-add-edit-modal/habit-add-edit-modal.component';

@Component({
  selector: 'app-habit-manager',
  templateUrl: './habit-manager.component.html',
  styleUrls: ['./habit-manager.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HabitAddEditModalComponent]
})
export class HabitManagerComponent implements OnInit {
  modal!: HTMLIonModalElement;
  habits!: Habit[];

  constructor(private habitService: HabitService, private eventQueueService: EventQueueService, private modalController: ModalController) { }

  ngOnInit(): void {
    this.getHabits();
    this.eventQueueService.on(AppEventType.HabitListUpdated).subscribe(() => this.getHabits());
  }

  private getHabits() {
    this.habitService.getHabits((result) => {
      if (result) {
        this.habits = result;
      }
    });
  }

  public createHabit(habit: Habit) {
    this.habitService.saveHabit(habit);
  }

  public deleteHabit(habit: Habit) {
    this.habitService.deleteHabit(habit);
  }

  public async addEditHabit(habit: Habit | null) {
    const modal = await this.modalController.create({
      component: HabitAddEditModalComponent,
      componentProps: {
        habit: habit
      }
    })

    modal.onDidDismiss().then((event) => {
      if (event && event.data) {
        this.createHabit(event.data);
      }
    });

    return await modal.present();
  }
}
