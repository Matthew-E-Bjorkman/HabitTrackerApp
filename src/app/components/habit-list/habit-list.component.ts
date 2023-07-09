import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HabitService } from 'src/app/services/habit/habit.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Habit } from 'src/app/shared/data-classes/data-objects';

@Component({
  selector: 'app-habit-list',
  templateUrl: './habit-list.component.html',
  styleUrls: ['./habit-list.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule],
  providers: [HabitService, HttpClient]
})
export class HabitListComponent {
  habits!: Habit[];

  constructor(public httpClient: HttpClient, public habitService: HabitService) { 
    this.habitService.getHabits((result) => {
      if (result.habits) {
        this.habits = result.habits;
      }
    });
  }
}
