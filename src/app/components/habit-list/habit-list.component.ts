import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HabitService } from 'src/app/services/habit/habit.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HabitDataItem, HabitDataList } from 'src/app/mock-data/mock-data.service';

@Component({
  selector: 'app-habit-list',
  templateUrl: './habit-list.component.html',
  styleUrls: ['./habit-list.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule],
  providers: [HabitService, HttpClient]
})
export class HabitListComponent  implements OnInit {
  habits!: HabitDataItem[];

  constructor(public httpClient: HttpClient, public habitService: HabitService) { }

  ngOnInit() {
    this.habitService.getHabits().then((result) => {
      if (result.habits) {
        this.habits = result.habits;
      }
    });
  }

}
