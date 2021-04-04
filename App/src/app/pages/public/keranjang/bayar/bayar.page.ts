import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
	selector: 'app-bayar',
	templateUrl: './bayar.page.html',
	styleUrls: ['./bayar.page.scss'],
})
export class BayarPage {

	constructor(
		private navCtrl: NavController
		) { }

	goBack(){
		this.navCtrl.back();
	}
}
