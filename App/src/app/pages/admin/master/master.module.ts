import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [
  {
    path: '',
    component: MasterPage
  }
];

import { MasterPage } from './master.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
		RouterModule.forChild(routes)
  ],
  declarations: [MasterPage]
})
export class MasterPageModule {}
