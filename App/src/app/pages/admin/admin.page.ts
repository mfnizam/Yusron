import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ServerService } from '../../services/server/server.service';
import { PembelianService } from '../../services/pembelian/pembelian.service';

import { AnimationController, Animation } from '@ionic/angular';

@Component({
  selector: 'app-admin',
  templateUrl: 'admin.page.html',
  styleUrls: ['admin.page.scss'],
})
export class AdminPage implements OnDestroy{
  private destroy$: Subject<void> = new Subject<void>();

  @ViewChild('pembelianTab', { read: ElementRef }) pembelianTab: ElementRef;
  tabAnimationPembelian: Animation;
  
  jumlahMenunggu = 0;
  jumlahProses = 0;

  constructor(
    private animate: AnimationController,
    private pembelian: PembelianService,
    private server: ServerService) {
    pembelian.getDataMenuggu()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      if(this.tabAnimationPembelian && data.length > 0 && this.jumlahMenunggu != data.length) this.tabAnimationPembelian.play();
      this.jumlahMenunggu = data.length;
    })
    
    pembelian.getDataProses()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      if(this.tabAnimationPembelian && data.length > 0 && this.jumlahProses != data.length) this.tabAnimationPembelian.play();
      this.jumlahProses = data.length;
    })

    this.ambilPembayaran([1,3])
  }

  ngAfterViewInit(){
    this.tabAnimationPembelian = this.animate.create()
    .addElement(this.pembelianTab.nativeElement)
    .duration(500)
    .easing('ease-out')
    .keyframes([
    { offset: 0, transform: 'scale(.6)' },
    { offset: 0.5, transform: 'scale(1.3)' },
    { offset: 0.7, transform: 'scale(.9)' },
    { offset: 1, transform: 'scale(1)' }
    ])
  }

  ambilPembayaran(status: number[]){
    this.server.ambilPembelian(status).then(data => {
      console.log(data);
      if(data.success){
        if(status.includes(1)) this.pembelian.setDataMenuggu(data.pembelian.filter(v => v.status == 1));
        if(status.includes(3)) this.pembelian.setDataProses(data.pembelian.filter(v => v.status == 3));
      }
    }).catch(err => {
      console.log(err)
    })
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

}
