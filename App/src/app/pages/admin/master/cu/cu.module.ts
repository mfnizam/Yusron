import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [{ path: '', component: CuPage }];

import { CuPage } from './cu.page';
import { ModalModule } from '../../../../services/modal/modal/modal.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
		RouterModule.forChild(routes),
		ModalModule
  ],
  declarations: [CuPage]
})
export class CuPageModule {}
