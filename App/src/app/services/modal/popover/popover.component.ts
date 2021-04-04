import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent{
	@Input() header: string;

  constructor(private popover: PopoverController) {

  }

  close(role, data: any = null){
  	this.popover.dismiss(data, role)
  }
}
