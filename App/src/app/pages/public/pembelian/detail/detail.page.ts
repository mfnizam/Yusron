import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage {

  constructor(
  	private navCtrl: NavController) { }

  goBack(){
  	this.navCtrl.back();
  }

}
