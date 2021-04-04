import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminPage } from './admin.page';

import { AdminGuardService } from '../../services/guard/admin-guard.service';

const routes: Routes = [
  {
    path: '',
    component: AdminPage,
    children: [
      {
        path: 'beranda',
        loadChildren: () => import('./beranda/beranda.module').then(m => m.BerandaPageModule),
        canActivate: [AdminGuardService]
      },
      {
        path: 'produk',
        loadChildren: () => import('./produk/produk.module').then( m => m.ProdukPageModule)
      },
      {
        path: 'pembelian',
        loadChildren: () => import('./pembelian/pembelian.module').then( m => m.PembelianPageModule)
      },
      {
        path: 'master',
        loadChildren: () => import('./master/master.module').then( m => m.MasterPageModule),
        canActivate: [AdminGuardService]
      },
      {
        path: 'akun',
        loadChildren: () => import('./akun/akun.module').then(m => m.AkunPageModule),
        canActivate: [AdminGuardService]
      },
      {
        path: '',
        redirectTo: 'produk',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'produk/cu',
    loadChildren: () => import('./produk/cu/cu.module').then( m => m.CuPageModule)
  },
  {
    path: 'produk/detail',
    loadChildren: () => import('./produk/detail/detail.module').then( m => m.DetailPageModule)
  },
  {
    path: 'master/data',
    loadChildren: () => import('./master/data/data.module').then( m => m.DataPageModule)
  },
  {
    path: 'master/cu',
    loadChildren: () => import('./master/cu/cu.module').then( m => m.CuPageModule)
  },
  {
    path: 'master/detail',
    loadChildren: () => import('./master/detail/detail.module').then( m => m.DetailPageModule)
  },
  {
    path: 'akun/edit',
    loadChildren: () => import('./akun/edit/edit.module').then( m => m.EditPageModule)
  },
  {
    path: '',
    redirectTo: 'produk',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'produk',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
