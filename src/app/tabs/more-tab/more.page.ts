import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HabitManagerComponent } from 'src/app/components/habit-manager/habit-manager.component';
import { ExporterComponent } from 'src/app/components/exporter/exporter.component';

@Component({
  selector: 'app-more',
  templateUrl: 'more.page.html',
  styleUrls: ['more.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HabitManagerComponent, ExporterComponent]
})
export class MorePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
