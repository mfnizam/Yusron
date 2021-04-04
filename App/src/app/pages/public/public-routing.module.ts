import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicPage } from './public.page';

const routes: Routes = [
  {
    path: '',
    component: PublicPage,
    children: [
      {
        path: 'beranda',
        loadChildren: () => import('./beranda/beranda.module').then(m => m.BerandaPageModule)
      },
      {
        path: 'keranjang',
        loadChildren: () => import('./keranjang/keranjang.module').then( m => m.KeranjangPageModule)
      },
      {
        path: 'pembelian',
        loadChildren: () => import('./pembelian/pembelian.module').then(m => m.PembelianPageModule)
      },
      {
        path: 'akun',
        loadChildren: () => import('./akun/akun.module').then(m => m.AkunPageModule)
      },
      {
        path: '',
        redirectTo: 'beranda',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'beranda/detail',
    loadChildren: () => import('./beranda/detail/detail.module').then( m => m.DetailPageModule)
  },
  {
    path: 'topup',
    loadChildren: () => import('./topup/topup.module').then( m => m.TopupPageModule)
  },
  {
    path: 'pembelian/detail',
    loadChildren: () => import('./pembelian/detail/detail.module').then( m => m.DetailPageModule)
  },
  {
    path: 'bayar',
    loadChildren: () => import('./keranjang/bayar/bayar.module').then( m => m.BayarPageModule)
  },
  {
    path: 'akun/edit',
    loadChildren: () => import('./akun/edit/edit.module').then( m => m.EditPageModule)
  },
  {
    path: '',
    redirectTo: 'beranda',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'beranda',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicPageRoutingModule {}
