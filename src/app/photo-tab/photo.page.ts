import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'photo.page.html',
  styleUrls: ['photo.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent],
})
export class PhotoPage {
  constructor() {}
}
