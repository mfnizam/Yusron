import { Component, OnInit, OnDestroy, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { MasterService, Kategori, Rekening } from '../../../../services/master/master.service';
import { User } from '../../../../services/user/user.service';
import { ModalService } from '../../../../services/modal/modal.service';
import { ServerService } from '../../../../services/server/server.service';

import { AnimationController } from '@ionic/angular';

@Component({
	selector: 'app-data',
	templateUrl: './data.page.html',
	styleUrls: ['./data.page.scss'],
})
export class DataPage implements OnInit, OnDestroy{
	private destroy$: Subject<void> = new Subject<void>();
	jenis;
	dataUser: User[];
	userLoading = 0;

	dataKategori: Array<Kategori> = [];
	masterLoading = 0;

	dataRekening: Rekening[];
	rekeningLoading = 0;

	@ViewChildren('masterList', { read: ElementRef }) masterList: QueryList<ElementRef>;

	constructor(
		private router: Router,
		private active: ActivatedRoute,
		private navCtrl: NavController,
		private master: MasterService,
		private modal: ModalService,
		private animate: AnimationController,
		private server: ServerService) {
		active.params
		.pipe(takeUntil(this.destroy$))
		.subscribe(data => {
			this.jenis = data['data'];

			if(this.jenis == 'kurir'){
				master.getDataKurir()
				.pipe(takeUntil(this.destroy$))
				.subscribe(data => {
					this.dataUser = data;
				})
			}else if(this.jenis == 'pembeli'){
				master.getDataPembeli()
				.pipe(takeUntil(this.destroy$))
				.subscribe(data => {
					this.dataUser = data;
				})
			}else if(this.jenis == 'kategori'){
				master.getDataKategori()
				.pipe(takeUntil(this.destroy$))
				.subscribe(data => {
					this.dataKategori = data;
				})
			}else if(this.jenis == 'rekening'){
				master.getDataRekening()
				.pipe(takeUntil(this.destroy$))
				.subscribe(data => {
					this.dataRekening = data;
				})
			}
		})
	}

	ngOnInit(){
		if(this.jenis == 'kurir' && this.dataUser.length < 1){
			this.ambilKurir();
		}else if(this.jenis == 'pembeli' && this.dataUser.length < 1){
			this.ambilPembeli();
		}else if(this.jenis == 'kategori' && this.dataKategori.length < 1){
			this.ambilKategori();
		}else if(this.jenis == 'rekening' && this.dataRekening.length < 1){
			this.ambilRekening();
		}
	}

	ambil(){
		if(this.jenis == 'kurir'){
			this.ambilKurir();
		}else{
			this.ambilPembeli()
		}
	}
	ambilKurir(){
		this.userLoading = 1;
		this.server.ambilKurir().then(data => {
			console.log(data);
			this.userLoading = 0;
			if(data.success){
				this.dataUser = data.kurir;
				this.master.setDataKurir(data.kurir);
			}else{
				this.userLoading = 2;
			}
		}).catch(err => {
			console.log(err);
			this.userLoading = 2;
		})
	}
	ambilPembeli(){
		this.userLoading = 1;
		this.server.ambilPembeli().then(data => {
			console.log(data);
			this.userLoading = 0;
			if(data.success){
				this.dataUser = data.pembeli;
				this.master.setDataPembeli(data.pembeli);
			}else{
				this.userLoading = 2;
			}
		}).catch(err => {
			console.log(err);
			this.userLoading = 2;
		})
	}
	ambilKategori(){
		this.masterLoading = 1;
		this.server.ambilKategori().then(data => {
			this.masterLoading = 0;
			if(data.success){
				this.dataKategori = data.kategori;
				this.master.setDataKategori(data.kategori);
			}else{
				this.masterLoading = 2;
			}
		}).catch(err => {
			this.masterLoading = 2;
			console.log(err);
		})
	}
	ambilRekening(){
		this.rekeningLoading = 1;
		this.server.ambilRekening().then(data => {
			this.rekeningLoading = 0;
			if(data.success){
				this.dataRekening = data.rekening;
				this.master.setDataRekening(data.rekening);
			}else{
				this.rekeningLoading = 2;
			}
		}).catch(err => {
			this.rekeningLoading = 2;
			console.log(err);
		})
	}

	ngOnDestroy(){
		this.destroy$.next();
		this.destroy$.complete();
	}

	goBack(){
		this.navCtrl.back();
	}

	tambah(){
		if(this.jenis == 'kurir' || this.jenis == 'pembeli'){
			return this.router.navigate(['/admin/master/cu', { jenis: this.jenis }]);
		} 

		let input = []
		if(this.jenis == 'kategori') {
			input = [{
				name: 'title',
				type: 'text',
				placeholder: 'Isikan nama ' + this.jenis
			}]
		}else if(this.jenis == 'rekening'){
			input = [{
				name: 'namaBank',
				type: 'text',
				placeholder: 'Isikan Nama Bank, Contoh: BRI, BNI, BCA'
			}, {
				name: 'noRek',
				type: 'text',
				placeholder: 'Isikan nomer rekening'
			}, {
				name: 'atasNama',
				type: 'text',
				placeholder: 'Isikan atas nama rekening'
			}]
		}

		this.modal.showPrompt('Tambah Data ' + this.jenis, null, input, ['Batal', 'Simpan']).then((data: any) => {
			if(data.data && data.data.values && data.role == 'ok'){
				this.modal.showLoading('Menambahkan Data');

				if(this.jenis == 'kategori'){
					this.server.tambahKategori(data.data.values).then(data => {
						console.log(data)
						this.modal.hideLoading();

						if(data.success){
							this.modal.showToast('Berhasil Menambahkan Data Kategori', 'success');
							this.dataKategori.push(data.kategori);
							this.master.setDataKategori(this.dataKategori);
						}else{
							this.modal.showToast('Gagal Menambahkan Data Kategori', 'danger');
						}
					}).catch(err => {
						this.modal.hideLoading();
						this.modal.showToast('Gagal Menambahkan Data Kategori', 'danger');
						console.log(err)
					})
				}else if(this.jenis == 'rekening'){
					this.server.tambahRekening(data.data.values).then(data => {
						console.log(data)
						this.modal.hideLoading();

						if(data.success){
							this.modal.showToast('Berhasil Menambahkan Data Rekening', 'success');
							this.dataRekening.push(data.rekening);
							this.master.setDataRekening(this.dataRekening);
						}else{
							this.modal.showToast('Gagal Menambahkan Data Rekening', 'danger');
						}
					}).catch(err => {
						this.modal.hideLoading();
						this.modal.showToast('Gagal Menambahkan Data Rekening', 'danger');
						console.log(err)
					})
				}
			}
		})
	}

	edit(id, i){
		if(this.jenis == 'kurir' || this.jenis == 'pembeli') {
			return this.router.navigate(['/admin/master/cu', { jenis: this.jenis, update: true, id: this.dataUser[i]._id }]);
		}

		let input = [];
		if(this.jenis == 'kategori'){
			input = [{
				name: 'title',
				type: 'text',
				value: this.dataKategori[i].title,
				placeholder: 'Isikan nama ' + this.jenis
			}]
		}else if(this.jenis == 'rekening'){
			input = [{
				name: 'namaBank',
				type: 'text',
				placeholder: 'Isikan Nama Bank, Contoh: BRI, BNI, BCA',
				value: this.dataRekening[i].namaBank,
			}, {
				name: 'noRek',
				type: 'text',
				placeholder: 'Isikan nomer rekening',
				value: this.dataRekening[i].noRek,
			}, {
				name: 'atasNama',
				type: 'text',
				placeholder: 'Isikan atas nama rekening',
				value: this.dataRekening[i].atasNama,
			}]
		}

		this.modal.showPrompt('Edit Data ' + this.jenis, null, input, ['Batal', 'Simpan']).then((data: any) => {
			if(data.data && data.data.values && data.role == 'ok'){
				this.modal.showLoading('Menyimpan Perubahan');
				data.data.values['_id'] = id;

				if(this.jenis == 'kategori'){
					this.server.editKategori(data.data.values).then(data => {
						this.modal.hideLoading();
						console.log(data);
						if(data.success){
							this.dataKategori[i] = data.kategori;
							this.master.setDataKategori(this.master.getValueKategori().map(v => v._id == id? data.kategori : v));
							this.modal.showToast('Berhasil Menyimpan "' + this.dataKategori[i].title, 'success');
						}else{
							this.modal.showToast('Gagal Menyimpan "' + this.dataKategori[i].title, 'danger');
						}
					}).catch(err => {
						console.log(err);
						this.modal.hideLoading();
						this.modal.showToast('Gagal Menyimpan "' + this.dataKategori[i].title, 'danger');
					})
				}else if(this.jenis == 'rekening'){
					this.server.editRekening(data.data.values).then(data => {
						this.modal.hideLoading();
						console.log(data);
						if(data.success){
							this.dataRekening[i] = data.rekening;
							this.master.setDataRekening(this.master.getValueRekening().map(v => v._id == id? data.rekening : v));
							this.modal.showToast('Berhasil Menyimpan Data Rekening', 'success');
						}else{
							this.modal.showToast('Gagal Menyimpan Data Rekening', 'danger');
						}
					}).catch(err => {
						console.log(err);
						this.modal.hideLoading();
						this.modal.showToast('Gagal Menyimpan Data Rekening', 'danger');
					})
				}
			}
		})
	}

	hapus(id, i){
		let dataHapus = this.jenis == 'kurir' || this.jenis == 'pembeli'? this.dataUser[i].namaLengkap : this.jenis == 'rekening'? this.dataRekening[i].noRek : this.dataKategori[i].title;		
		this.modal.showConfirm('Hapus Data ' + this.jenis, 'Apakah anda ingin menghapus data ' + this.jenis + ' <b class="ion-text-capitalize">"' + dataHapus + '"</b>', ['Batal', 'Hapus']).then(e => {
			if(e){
				this.modal.showLoading('Menghapus Data "' + dataHapus + '"');
				const deleteAnimation = this.animate.create()
				.addElement(this.masterList.toArray()[i].nativeElement)
				.duration(200)
				.easing('ease-out')
				.fromTo('opacity', '1', '0')
				.fromTo('transform', 'translateX(0)', 'translateX(-100%)');
				if(this.jenis == 'kurir'){
					this.server.hapusKurir(id).then(data => {
						console.log(data);
						this.modal.hideLoading();
						if(data.success){
							deleteAnimation.play();
							setTimeout(_ => {
								this.master.setDataKurir(this.dataUser.filter(v => v._id != id));
								this.modal.showToast('Berhasil Menghapus Data', 'success')
							}, 500)
						}else{
							this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
						}
					}).catch(err => {
						this.modal.hideLoading();
						this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
						console.log(err);
					})
				}else if(this.jenis == 'pembeli'){
					this.server.hapusPembeli(id).then(data => {
						console.log(data);
						this.modal.hideLoading();
						if(data.success){
							deleteAnimation.play();
							setTimeout(_ => {
								this.master.setDataPembeli(this.dataUser.filter(v => v._id != id));
								this.modal.showToast('Berhasil Menghapus Data', 'success')
							}, 500)
						}else{
							this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
						}
					}).catch(err => {
						this.modal.hideLoading();
						this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
						console.log(err);
					})
				}else if(this.jenis == 'kategori'){
					this.server.hapusKategori(id).then(data => {
						console.log(data);
						this.modal.hideLoading();
						if(data.success){
							deleteAnimation.play();
							setTimeout(_ => {
								this.master.setDataKategori(this.dataKategori.filter(v => v._id != id));
								this.modal.showToast('Berhasil Menghapus Data', 'success')
							}, 500)
						}else{
							this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
						}
					}).catch(err => {
						this.modal.hideLoading();
						this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
						console.log(err)
					})
				}else if(this.jenis == 'rekening'){
					this.server.hapusRekening(id).then(data => {
						console.log(data);
						this.modal.hideLoading();
						if(data.success){
							deleteAnimation.play();
							setTimeout(_ => {
								this.master.setDataRekening(this.dataRekening.filter(v => v._id != id));
								this.modal.showToast('Berhasil Menghapus Data', 'success');
							}, 500)
						}else{
							this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
						}
					}).catch(err => {
						this.modal.hideLoading();
						this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
						console.log(err)
					})
				}
			}
		})
	}
}
