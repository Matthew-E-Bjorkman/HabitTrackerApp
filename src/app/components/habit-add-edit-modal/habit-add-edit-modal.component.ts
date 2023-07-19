import { CommonModule } from '@angular/common';
import { Component, Input, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Habit } from 'src/app/shared/data-classes/data-objects';
import { HabitFrequencyCategory, HabitType, HabitTypeLabelMap, HabitWeeklyFrequency, HabitMonthlyFrequency } from 'src/app/shared/data-classes/data-enums';
import { IconSelectModalComponent } from '../icon-select-modal/icon-select-modal.component';
import { HabitService } from 'src/app/services/habit/habit.service';
import { Observable } from 'rxjs';


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

  public habitTypeKeys = Object.values(HabitType).filter(x => typeof x === 'number') as number[];
  public habitTypes = HabitType;

  public habitFrequencyCategoryKeys = Object.values(HabitFrequencyCategory).filter(x => typeof x === 'number') as number[];
  public habitFrequencyCategories = HabitFrequencyCategory;

  public habitWeeklyFrequencyKeys = Object.values(HabitWeeklyFrequency).filter(x => typeof x === 'number') as number[];
  public habitWeeklyFrequencies = HabitWeeklyFrequency;

  public habitMonthlyFrequencyKeys = Object.values(HabitMonthlyFrequency).filter(x => typeof x === 'number') as number[];
  public habitMonthlyFrequencies = HabitMonthlyFrequency;

  public habitDaily!: Observable<boolean>;
  public habitWeekly!: Observable<boolean>;
  public habitMonthly!: Observable<boolean>;

  constructor(private habitService: HabitService, private modalController: ModalController) { }

  ngOnInit(): void {
    if (!this.habit) {
      this.habit = this.habitService.getNewHabit();
    }
    else {
      this.habitFrequencyChanged(this.habit.FrequencyCategory);
    }
  }

  public habitFrequencyChanged(newFrequency: HabitFrequencyCategory) {
    switch (newFrequency) {
      case HabitFrequencyCategory.Daily: {
        this.habitDaily = new Observable(obs => obs.next(true));
        this.habitWeekly = new Observable(obs => obs.next(false));
        this.habitMonthly = new Observable(obs => obs.next(false));
        break;
      }
      case HabitFrequencyCategory.Weekly: {
        this.habitDaily = new Observable(obs => obs.next(false));
        this.habitWeekly = new Observable(obs => obs.next(true));
        this.habitMonthly = new Observable(obs => obs.next(false));
        break;
      }
      case HabitFrequencyCategory.Monthly: {
        this.habitDaily = new Observable(obs => obs.next(false));
        this.habitWeekly = new Observable(obs => obs.next(false));
        this.habitMonthly = new Observable(obs => obs.next(true));
        break;
      }
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