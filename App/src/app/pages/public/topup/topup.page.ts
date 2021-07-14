import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ServerService } from '../../../services/server/server.service';
import { StorageService } from '../../../services/storage/storage.service';
import { ModalService } from '../../../services/modal/modal.service';
import { UserService, User } from '../../../services/user/user.service';
import { MasterService, Rekening } from '../../../services/master/master.service';
import { PembelianService } from '../../../services/pembelian/pembelian.service';

@Component({
  selector: 'app-topup',
  templateUrl: './topup.page.html',
  styleUrls: ['./topup.page.scss'],
})
export class TopupPage implements OnDestroy{
  private destroy$: Subject<void> = new Subject<void>();

  dataUser: User;
  dataRekening: Rekening[];

	form: FormGroup = new FormGroup({
		user: new FormControl(null, [Validators.required]),
		rekening: new FormControl(null, [Validators.required]),
		jumlah: new FormControl(null, [Validators.required])
	})

  constructor(
  	private router: Router,
  	private navCtrl: NavController,
  	private server: ServerService,
  	private storage: StorageService,
  	private modal: ModalService,
  	private user: UserService,
  	private master: MasterService,
  	private pembelian: PembelianService) {
  	user.getDataUser()
  	.pipe(takeUntil(this.destroy$))
  	.subscribe(data => {
  		this.dataUser = data;
  		if(data) this.form.controls.user.setValue(data._id);
  	})

  	master.getDataRekening()
  	.pipe(takeUntil(this.destroy$))
  	.subscribe(data => {
  		this.dataRekening = data;
  	})

  	if(!this.user.getValueUser()){
  		this.storage.getDecodedStorage('user:data').then((data: any) => {
  			this.user.setDataUser(data)
  		})
  	}

  	if(this.master.getValueRekening().length < 1){
  		this.server.rekening().then(data => {
  			console.log(data)
  			if(data.success){
  				this.master.setDataRekening(data.rekening);
  			}
  		}).catch(err => {
  			console.log(err)
  		})
  	}
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(){
  	this.navCtrl.back();
  }

  simpan(){
  	this.modal.showLoading('Mengirim Data Topup...');
  	this.server.topup(this.form.value).then(data => {
  		console.log(data)
  		this.modal.hideLoading();
  		if(data.success){
  			this.pembelian.setDataPembelian([...this.pembelian.getValuePembelian(), data.pembelian]);
  			setTimeout(_ => {
  				this.router.navigate(['/public/pembelian/detail', {idPembelian: data.pembelian._id}], { replaceUrl: true })
  			}, 500)
  		}else{
  			this.modal.showToast('Gagal Melakukan Topup', 'danger')
  		}
  	}).catch(err => {
  		this.modal.hideLoading();
  		console.log(err)
  		this.modal.showToast('Gagal Melakukan Topup', 'danger')
  	})
  }
}
