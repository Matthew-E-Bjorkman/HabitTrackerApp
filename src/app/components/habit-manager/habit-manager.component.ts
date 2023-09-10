import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';
import { EventQueueService } from 'src/app/services/event-queue/event-queue.service';
import { HabitRepoService } from 'src/app/services/habit-repo/habit-repo.service';
import { Habit } from 'src/app/shared/data-classes/data-objects';
import { AppEventType } from 'src/app/shared/events';
import { FormsModule } from '@angular/forms';
import { HabitAddEditModalComponent } from '../habit-add-edit-modal/habit-add-edit-modal.component';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';
import { HabitLogicService } from 'src/app/services/habit-logic/habit-logic.service';

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

  constructor(private habitRepoService: HabitRepoService, private habitLogicService: HabitLogicService, private eventQueueService: EventQueueService, private modalController: ModalController, private popoverController: PopoverController) { }

  ngOnInit(): void {
    this.getHabits();
    this.eventQueueService.on(AppEventType.HabitListUpdated).subscribe(() => this.getHabits());
  }

  private getHabits() {
    this.habitRepoService.getHabits().then((result) => {
      this.habits = result ?? [];
      this.habitLogicService.checkAndScheduleReminders(this.habits);
    });
  }

  public createHabit(habit: Habit) {
    this.habitRepoService.saveHabit(habit);
  }

  public async deleteHabit(habit: Habit) {
    const popover = await this.popoverController.create({
      component: DeleteConfirmationModalComponent,
      componentProps: {
        objectName: habit.Name,
        object: habit
      }
    });

    popover.onDidDismiss().then((event) => {
      if (event && event.data) {
        for (let reminder of habit.Reminders) {
          this.habitLogicService.cancelReminder(reminder);
        }
        this.habitRepoService.deleteHabit(habit);
      }
    });

    return await popover.present();
  }

  public async addEditHabit(habit: Habit | null) {
    const modal = await this.modalController.create({
      component: HabitAddEditModalComponent,
      componentProps: {
        habit: habit
      },
      showBackdrop: false
    });

    modal.onDidDismiss().then((event) => {
      if (event && event.data) {
        this.createHabit(event.data);
      }
    });

    return await modal.present();
  }
}
