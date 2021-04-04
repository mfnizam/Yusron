import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [{ path: '', component: DataPage }];

import { DataPage } from './data.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
		RouterModule.forChild(routes)
  ],
  declarations: [DataPage]
})
export class DataPageModule {}
