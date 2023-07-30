import { CommonModule } from '@angular/common';
import { Component, Input, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Habit } from 'src/app/shared/data-classes/data-objects';
import { HabitFrequencyCategory, HabitType, HabitWeeklyFrequency, HabitMonthlyFrequency } from 'src/app/shared/data-classes/data-enums';
import { IconSelectModalComponent } from '../icon-select-modal/icon-select-modal.component';
import { HabitRepoService } from 'src/app/services/habit-repo/habit-repo.service';
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

  private origHabit! : Habit;

  public habitTypeKeys = Object.values(HabitType).filter(x => typeof x === 'number') as number[];
  public habitTypes = HabitType;

  public habitFrequencyCategoryKeys = Object.values(HabitFrequencyCategory).filter(x => typeof x === 'number') as number[];
  public habitFrequencyCategories = HabitFrequencyCategory;

  public habitWeeklyFrequencyKeys = Object.values(HabitWeeklyFrequency).filter(x => typeof x === 'number') as number[];
  public habitWeeklyFrequencies = HabitWeeklyFrequency;

  public habitMonthlyFrequencyKeys = Object.values(HabitMonthlyFrequency).filter(x => typeof x === 'number') as number[];
  public habitMonthlyFrequencies = HabitMonthlyFrequency;

  public habitDailyOrNone!: Observable<boolean>;
  public habitWeekly!: Observable<boolean>;
  public habitMonthly!: Observable<boolean>;

  constructor(private habitRepoService: HabitRepoService, private modalController: ModalController) { }

  ngOnInit(): void {
    if (!this.habit) {
      this.habit = this.habitRepoService.getNewHabit();
      this.habitDailyOrNone = new Observable(obs => obs.next(true));
    }
    else {
      this.origHabit = {... this.habit};
      this.habitFrequencyChanged(this.habit.FrequencyCategory);
      this.habit = this.origHabit;
    }
  }

  public habitFrequencyChanged(newFrequency: HabitFrequencyCategory) {
    this.habit.FrequencyCategoryValues = [];
    switch (newFrequency) {
      case HabitFrequencyCategory.Weekly: {
        this.habitDailyOrNone = new Observable(obs => obs.next(false));
        this.habitWeekly = new Observable(obs => obs.next(true));
        this.habitMonthly = new Observable(obs => obs.next(false));
        break;
      }
      case HabitFrequencyCategory.Monthly: {
        this.habitDailyOrNone = new Observable(obs => obs.next(false));
        this.habitWeekly = new Observable(obs => obs.next(false));
        this.habitMonthly = new Observable(obs => obs.next(true));
        break;
      }
      case HabitFrequencyCategory.Daily: 
      default: {
        this.habitDailyOrNone = new Observable(obs => obs.next(true));
        this.habitWeekly = new Observable(obs => obs.next(false));
        this.habitMonthly = new Observable(obs => obs.next(false));
        break;
      }
    }
  }

  public cancel() {
    this.habitRepoService.refreshHabitLists();      
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
