import { Component, OnDestroy, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { Router } from '@angular/router';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ModalService } from '../../../services/modal/modal.service';
import { ServerService }  from '../../../services/server/server.service';
import { StorageService } from '../../../services/storage/storage.service';
import { UserService, User } from '../../../services/user/user.service';
import { PembelianService, Pembelian } from '../../../services/pembelian/pembelian.service';

import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-beranda',
  templateUrl: 'beranda.page.html',
  styleUrls: ['beranda.page.scss']
})
export class BerandaPage implements OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  dataUser: User;

  dataKirim: Pembelian[] = [];
  kirimLoading = 0;

  constructor(
    private router: Router,
    private modal: ModalService,
    private server: ServerService,
    private storage: StorageService,
    private pembelian: PembelianService,
    private user: UserService) {

    user.getDataUser()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.dataUser = data;
      console.log(data);
      if(data) this.ambilPembelian(data._id)
    })

    pembelian.getDataKirim()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.dataKirim = data;
    })
  }

  ionViewDidEnter(){
    this.storage.getDecodedStorage('user:data').then((data: any) => {
      this.ambilUser(data);
    })
  }

  ambilUser(id){
    this.server.saldoAkun(id).then(async data => {
      if(data.success){
        if(data.saldo != this.user.getValueUser().saldo){
          this.user.getValueUser().saldo = data.saldo;
          this.user.setDataUser(this.user.getValueUser());
        }
      }
    }).catch(err => {
      console.log(err);
    })
  }

  ambilPembelian(id){
    // this.server.pembelian(null, id).then(data => {
    //   // console.log(data);
    // })
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }
}
