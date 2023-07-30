import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonPopover, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-delete-confirmation-modal',
  templateUrl: './delete-confirmation-modal.component.html',
  styleUrls: ['./delete-confirmation-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DeleteConfirmationModalComponent  implements OnInit {
  @Input() object!: any;
  @Input() objectName!: string;
  @Input() popover!: IonPopover;

  constructor() { }

  ngOnInit() {}

  public confirm() {
    this.popover.dismiss(true);
  }

  public cancel() {
    this.popover.dismiss(false);
  }
}
