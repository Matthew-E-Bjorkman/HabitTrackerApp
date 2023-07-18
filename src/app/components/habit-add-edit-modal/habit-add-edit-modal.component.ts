import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonModal, IonicModule, ModalController } from '@ionic/angular';
import { Habit } from 'src/app/shared/data-classes/data-objects';
import { SysIcon } from 'src/app/shared/system-classes/system-objects';
import { IconSelectModalComponent } from '../icon-select-modal/icon-select-modal.component';
import { HabitService } from 'src/app/services/habit/habit.service';


@Component({
  selector: 'app-habit-add-edit-modal',
  templateUrl: './habit-add-edit-modal.component.html',
  styleUrls: ['./habit-add-edit-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, IconSelectModalComponent]
})
export class HabitAddEditModalComponent  implements OnInit {
  @Input() habit!: Habit;
  @Input() modal!: HTMLIonModalElement;

  constructor(private habitService: HabitService, private modalController: ModalController) { }

  ngOnInit(): void {
    if (!this.habit) {
      this.habit = this.habitService.getNewHabit();
    }
  }

  public cancel() {
    this.modal.dismiss();
  }

  public confirm() {
    this.modal.dismiss(this.habit);
  }

  public async changeIcon() {
    const modal = await this.modalController.create({
      component: IconSelectModalComponent,
      componentProps: { }
    })

    modal.onDidDismiss().then((event) => {
      if (event && event.data) {
        this.habit.Icon = event.data.name;
      }
    });

    return await modal.present();
  }
}
