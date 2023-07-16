import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { OnInit } from '@angular/core';
import { SysIcon } from 'src/app/shared/system-classes/system-objects';
import { IonicModule } from '@ionic/angular';
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
  constructor(private systemDataService: SystemDataService) {}

  @Input() sysIcons: SysIcon[] = [];
  @Input() selectedIcon!: SysIcon;
  @Input() title = 'Select Icons';

  @Output() selectionCancel = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<SysIcon>();

  filteredIcons: SysIcon[] = [];

  ngOnInit() {
    this.systemDataService.getIcons((result) => {
      this.sysIcons = result;
      this.filteredIcons = [...this.sysIcons];
    });
  }

  cancelChanges() {
    this.selectionCancel.emit();
  }

  searchbarInput(ev: any) {
    this.filterList(ev.target.value);
  }

  /**
   * Update the rendered view with
   * the provided search query. If no
   * query is provided, all data
   * will be rendered.
   */
  filterList(searchQuery: string | undefined) {
    /**
     * If no search query is defined,
     * return all options.
     */
    if (searchQuery === undefined) {
      this.filteredIcons = [...this.sysIcons];
    } else {
      /**
       * Otherwise, normalize the search
       * query and check to see which items
       * contain the search query as a substring.
       */
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
    this.selectedIcon = sysIcon;
    this.selectionChange.emit(this.selectedIcon);
  }

}
