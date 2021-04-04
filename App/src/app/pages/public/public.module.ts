import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicPageRoutingModule } from './public-routing.module';

import { PublicPage } from './public.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    PublicPageRoutingModule
  ],
  declarations: [PublicPage]
})
export class PublicPageModule {}
