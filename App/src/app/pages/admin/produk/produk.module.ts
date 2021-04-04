import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [{ path: '', component: ProdukPage }];

import { ProdukPage } from './produk.page';

import { ModalModule } from '../../../services/modal/modal/modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
		ModalModule
  ],
  declarations: [ProdukPage]
})
export class ProdukPageModule {}
