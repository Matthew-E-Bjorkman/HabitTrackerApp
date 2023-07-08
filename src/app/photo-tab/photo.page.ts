import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'photo.page.html',
  styleUrls: ['photo.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class PhotoPage {
  constructor() {}
}
