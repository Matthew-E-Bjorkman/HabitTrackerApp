import { Component } from '@angular/core';
import type { OnInit } from '@angular/core';
import { SysIcon } from 'src/app/shared/system-classes/system-objects';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SystemDataService } from 'src/app/services/system-data/system-data.service';

@Component({
  selector: 'app-icon-select-modal',
  templateUrl: './icon-select-modal.component.html',
  styleUrls: ['./icon-select-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class IconSelectModalComponent implements OnInit {
  constructor(private systemDataService: SystemDataService, private modalController: ModalController) {}

  sysIcons!: SysIcon[];
  filteredIcons!: SysIcon[];

  ngOnInit() {
    this.systemDataService.getIcons((result) => {
      this.sysIcons = result;
      this.filteredIcons = [...this.sysIcons];
    });
  }

  cancelChanges() {
    this.modalController.dismiss();
  }

  searchbarInput(ev: any) {
    this.filterList(ev.target.value);
  }

  filterList(searchQuery: string | undefined) {
    if (searchQuery === undefined) {
      this.filteredIcons = [...this.sysIcons];
    } else {
      const normalizedQuery = searchQuery.toLowerCase();
      this.filteredIcons = this.sysIcons.filter((sysIcon) => {
        var match = false;
        sysIcon.tags.forEach(tag => {
          if (tag.toLowerCase().includes(normalizedQuery)) {
            match = true;
          }
        });

        return match || sysIcon.name.toLowerCase().includes(normalizedQuery);
      });
    }
  }

  selected(sysIcon: SysIcon) {
    this.modalController.dismiss(sysIcon);
  }

}
