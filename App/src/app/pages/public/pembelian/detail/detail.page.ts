import { Component, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router'

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ServerService } from '../../../../services/server/server.service';
import { StorageService } from '../../../../services/storage/storage.service';
import { ModalService } from '../../../../services/modal/modal.service';
import { CameraService } from '../../../../services/camera/camera.service';
import { UserService, User } from '../../../../services/user/user.service';
import { PembelianService, Pembelian } from '../../../../services/pembelian/pembelian.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnDestroy{
	private destroy$: Subject<void> = new Subject<void>();

	dataUser: User;
	dataPembelian: Pembelian;
	idPembelian;

  constructor(
  	private navCtrl: NavController,
  	private active: ActivatedRoute,
  	private server: ServerService,
  	private storage: StorageService,
  	private modal: ModalService,
  	private camera: CameraService,
  	private user: UserService,
  	private pembelian: PembelianService,) {
  	active.params
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.dataPembelian = pembelian.getValuePembelian().find(v => v._id == data['idPembelian']);
    	this.idPembelian = data['idPembelian'];
    	console.log(this.dataPembelian);
    })

    pembelian.getDataPembelian()
		.pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.dataPembelian = pembelian.getValuePembelian().find(v => v._id == this.idPembelian);
    })    

  }

  goBack(){
  	this.navCtrl.back();
  }

  ionViewDidEnter(){
  	if(this.dataUser){
	    if(this.pembelian.getValuePembelian().length < 1){
	      this.ambilPembelian(this.dataUser);
	    }
  	}else if(!this.dataPembelian){
  		this.storage.getDecodedStorage('user:data').then((data: any) => {
  			this.user.setDataUser(data);
  			this.ambilPembelian(data._id)
  		})
  	}
  }

  ambilPembelian(user){
    this.modal.showLoading('Memuat data produk...');
    this.server.pembelian(user).then(data => {
      this.modal.hideLoading();
      if(data.success){
        this.pembelian.setDataPembelian(data.pembelian)
        this.dataPembelian = data.pembelian.find(v => v._id == this.idPembelian);
        console.log(this.dataPembelian);
      }
    }).catch(err => {
      this.modal.hideLoading();
      console.log(err)
    })
  }

  unggahBuktiPembayaran(p){
		this.camera.camera('camera').then(async data => {
			console.log(data, 'data from camera')

			this.modal.showModal({
				jenis: 'photo',
				header: 'Unggah Bukti Pembayaran',
				search: false,
				data: [{
					id: 'photo',
					imgUrl: data.webPath
				}],
				button: [{ 
					title: 'Batal', 
					role: 'batal'
				}, {
					title: 'Unggah', 
					submit: true/* rele pada submit selalu 'ok'*/
				}]
			}, false).then(mdata => {
				if(mdata.role == 'ok'){
					this.modal.showLoading('Menyimpan Bukti Pembayaran..', false, 60000)
					this.server.pembelianBuktiUplaod(data.path? data.path : data.webPath, 'bp'+ p._id, {
						idUser: p.user,
						idPembelian: p._id,
					}).then(data => {
						console.log(data);
						this.modal.hideLoading();
						if(data.success){
							this.modal.showToast('Berhasil Menyimpan Bukti Pembayaran', 'success', 2000, 'bottom', false, true);
							this.pembelian.setDataPembelian(this.pembelian.getValuePembelian().map(v => v._id == data.pembelian._id? data.pembelian : v))
						}else{
							this.modal.showToast('Gagal, Coba Beberapa Saat Lagi..', 'danger', 2000, 'bottom', false, true)	
						}
					}).catch(err => {
						console.log(err, 'err upload bukti bayar')
						this.modal.hideLoading();
						this.modal.showToast('Gagal, Coba Beberapa Saat Lagi..', 'danger', 2000, 'bottom', false, true)
					})
				}
			})
		})
	}

	verifikasiPembelian(p){
		this.modal.showConfirm('Verifikasi Pembelian', 'Mohon periksa pembelian anda sebelum melakukan verifikasi dengan QR Code', ['Batal', 'Scan QR Code']).then(data => {
			if(data){
				this.camera.scanbarcode().then(data => {
					console.log(data);
					if(!data.cancelled){
						this.modal.showLoading('Verifikasi Pembelian Anda...', false, 60000);
						this.server.pembelianVerifikasi({idPembelian: data.text, idUser: this.dataUser._id}).then(data => {
							console.log(data)
							this.modal.hideLoading();
							if(data.success){
								this.pembelian.setDataPembelian(this.pembelian.getValuePembelian().map(v => v._id == data.pembelian._id? data.pembelian : v));
								this.modal.showToast('Berhasil Verifikasi Pembelian', 'success', 2000, 'bottom', false, true)
							}else{
								this.modal.showToast('Gagal Verifikasi Pembelian', 'danger', 2000, 'bottom', false, true)
							}
						}).catch(err => {
							console.log(err)
							setTimeout(_ => {
								this.modal.hideLoading();
							}, 500)
							this.modal.showToast('Gagal Verifikasi Pembelian', 'danger', 2000, 'bottom', false, true)
						})
					}else{
						this.modal.showToast('Gagal Scan QR Code, Mohon coba beberapa saat lagi', 'danger', 2000, 'bottom', false, true);
					}
				}).catch(err => {
					console.log(err);
					setTimeout(_ => {
						this.modal.hideLoading();
					}, 500)
					this.modal.showToast('Gagal Scan QR Code, Mohon coba beberapa saat lagi', 'danger', 2000, 'bottom', false, true);
				})
			}
		})
	}

  ngOnDestroy() {
  	this.destroy$.next();
    this.destroy$.complete();
  }

  get statusTitle(){
  	return this.pembelian.statusTitle;
  }
	get jenisTitle(){
		return this.pembelian.jenisTitle;
	}
  get statusColor(){
  	return this.pembelian.statusColor;
  }

  get otherServer(){
		return this.server.otherServer
	}

}
