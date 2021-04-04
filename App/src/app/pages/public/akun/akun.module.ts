import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [{ path: '', component: AkunPage }];

import { AkunPage } from './akun.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AkunPage]
})
export class AkunPageModule {}
