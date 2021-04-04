import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [{ path: '', component: BerandaPage }];

import { BerandaPage } from './beranda.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [BerandaPage]
})
export class BerandaPageModule {}
