import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KurirPage } from './kurir.page';

const routes: Routes = [
  {
    path: '',
    component: KurirPage,
    children: [
      {
        path: 'beranda',
        loadChildren: () => import('./beranda/beranda.module').then(m => m.BerandaPageModule)
      },
      {
        path: 'pengiriman',
        loadChildren: () => import('./pembelian/pembelian.module').then(m => m.PembelianPageModule)
      },
      {
        path: 'akun',
        loadChildren: () => import('./akun/akun.module').then(m => m.AkunPageModule)
      },
      {
        path: '',
        redirectTo: 'pengiriman',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'akun/edit',
    loadChildren: () => import('./akun/edit/edit.module').then( m => m.EditPageModule)
  },
  {
    path: '',
    redirectTo: 'pengiriman',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'pengiriman',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KurirPageRoutingModule {}
