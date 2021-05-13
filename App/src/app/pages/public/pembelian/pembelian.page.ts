import { Component, OnDestroy, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ServerService } from '../../../services/server/server.service';
import { CameraService } from '../../../services/camera/camera.service';
import { ModalService } from '../../../services/modal/modal.service';
import { UserService, User } from '../../../services/user/user.service';
import { PembelianService, Pembelian } from '../../../services/pembelian/pembelian.service';

@Component({
	selector: 'app-pembelian',
	templateUrl: 'pembelian.page.html',
	styleUrls: ['pembelian.page.scss']
})
export class PembelianPage implements OnDestroy{
	private destroy$: Subject<void> = new Subject<void>();

	dataUser: User;

	@ViewChild('kategoriSlides') kategoriSlides: IonSlides;

	status = 'semua';
	jenis = 'semua';
	tanggal = 'semua';

	dataPembelian: Pembelian[] = [];
	dataPembelianUi: Pembelian[] = [];
	pembelianLoading = 0;

	constructor(
		private server: ServerService,
		private user: UserService,
		public pembelian: PembelianService,
		private camera: CameraService,
		private modal: ModalService
		) {
		user.getDataUser()
		.pipe(takeUntil(this.destroy$))
		.subscribe(data => {
			this.dataUser = data;
			if(data) this.ambilPembelian(data._id)
		})

		pembelian.getDataPembelian()
		.pipe(takeUntil(this.destroy$))
		.subscribe(data => {
			this.dataPembelian = data.sort((a, c) => a.status - c.status || new Date(c.waktuPembelian).getTime() - new Date(a.waktuPembelian).getTime());
			this.dataPembelianUi = this.dataPembelian
		})
	}

	ionViewDidEnter(){
		if(this.dataUser) this.ambilPembelian(this.dataUser._id);	
	}

	ambilPembelian(user){
		if(!user) return;
		this.pembelianLoading = 1;
		this.server.pembelian(user).then(data => {
			console.log(data)
			if(data.success){
				this.pembelianLoading = 0;
				this.pembelian.setDataPembelian(data.pembelian)
			}else{
				this.pembelianLoading = 2;
			}
		}).catch(err => {
			this.pembelianLoading = 2;
			console.log(err)
		})
	}

	ngOnDestroy(){
		this.destroy$.next();
		this.destroy$.complete();
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
							this.modal.hideLoading();
							this.modal.showToast('Gagal Verifikasi Pembelian', 'danger', 2000, 'bottom', false, true)
						})
					}else{
						this.modal.showToast('Gagal Scan QR Code, Mohon coba beberapa saat lagi', 'danger', 2000, 'bottom', false, true);
					}
				}).catch(err => {
					console.log(err);
					this.modal.showToast('Gagal Scan QR Code, Mohon coba beberapa saat lagi', 'danger', 2000, 'bottom', false, true);
				})
			}
		})
	}

	get jenisIcon(){
		return this.pembelian.jenisIcon;
	}
	get jenisTitle(){
		return this.pembelian.jenisTitle;
	}
	get statusColor(){
		return this.pembelian.statusColor
	}
	get statusTitle(){
		return this.pembelian.statusTitle;
	}

	get otherServer(){
		return this.server.otherServer
	}
}
