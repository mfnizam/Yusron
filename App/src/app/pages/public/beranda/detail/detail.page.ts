import { Component, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ServerService } from '../../../../services/server/server.service';
import { ModalService } from '../../../../services/modal/modal.service';
import { ProdukService, Produk } from '../../../../services/produk/produk.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnDestroy{
	private destroy$: Subject<void> = new Subject<void>();

	idProduk;
  dataProduk: Produk;

  constructor(
  	private navCtrl: NavController,
  	private active: ActivatedRoute,
    private server: ServerService,
    private modal: ModalService,
    private produk: ProdukService) {
  	active.params
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.dataProduk = produk.getValueProduk().find(v => v._id == data['idProduk']);
    	this.idProduk = data['idProduk'];
    })
  }

  goBack(){
  	this.navCtrl.back();
  }

  ionViewDidEnter(){
    if(this.produk.getValueProduk().length < 1){
      this.ambilProduk();
    }
  }

  ambilProduk(){
    this.modal.showLoading('Memuat data produk...');
    this.server.produk(null).then(data => {
      this.modal.hideLoading();
      console.log(data);
      if(data.success){
        this.produk.setDataProduk(data.produk);
        this.dataProduk = data.produk.find(v => v._id == this.idProduk);
      }
    }).catch(err => {
      this.modal.hideLoading();
      console.log(err)
    })
  }

  get otherServer(){
    return this.server.otherServer;
  }

  ngOnDestroy() {
  	this.destroy$.next();
    this.destroy$.complete();
  }

}
