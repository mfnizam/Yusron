import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditPage } from './edit.page';

import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [{ path: '', component: EditPage }];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
		RouterModule.forChild(routes)
  ],
  declarations: [EditPage]
})
export class EditPageModule {}
