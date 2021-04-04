import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KurirPageRoutingModule } from './kurir-routing.module';

import { KurirPage } from './kurir.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    KurirPageRoutingModule
  ],
  declarations: [KurirPage]
})
export class KurirPageModule {}
