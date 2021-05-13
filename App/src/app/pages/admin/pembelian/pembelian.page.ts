import { Component, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PembelianService, Pembelian } from '../../../services/pembelian/pembelian.service';
import { ServerService } from '../../../services/server/server.service';
import { ModalService } from '../../../services/modal/modal.service';
import { ModalComponent } from '../../../services/modal/modal/modal.component';
import { MasterService } from '../../../services/master/master.service';

@Component({
	selector: 'app-pembelian',
	templateUrl: './pembelian.page.html',
	styleUrls: ['./pembelian.page.scss'],
})
export class PembelianPage implements OnDestroy {
	private destroy$: Subject<void> = new Subject<void>();

	segmentValue = 'proses';

	dataBelum: Pembelian[] = []
	dataBelumUi: Pembelian[] = [];
	belumLoading = 0;
	
	dataMenunggu: Pembelian[] = [];
	dataMenungguUi: Pembelian[] = [];
	menungguLoading = 0;

	dataProses: Pembelian[] = [];
	dataProsesUi: Pembelian[] = [];
	prosesLoading = 0;

	dataSiap: Pembelian[] = [];
	dataSiapUi: Pembelian[] = [];
	siapLoading = 0;

	dataKirim: Pembelian[] = [];
	dataKirimUi: Pembelian[] = [];
	kirimLoading = 0;

	dataPembelian: Pembelian[] = [];
	dataPembelianUi: Pembelian[] = [];
	pembelianLoading = 0;

	dataBatal: Pembelian[] = [];
	dataBatalUi: Pembelian[] = [];
	batalLoading = 0;

	constructor(
		private pembelian: PembelianService,
		private server: ServerService,
		private modal: ModalService,
		private master: MasterService
		) {

		this.pembelian.getDataBelum()
		.pipe(takeUntil(this.destroy$))
		.subscribe(data => {
			this.dataBelum = data;
			this.dataBelumUi = data;
		})

		this.pembelian.getDataMenuggu()
		.pipe(takeUntil(this.destroy$))
		.subscribe(data => {
			if(this.dataMenunggu.length != data.length && data.length > 0){
				this.segmentValue = 'menunggu';
			}
			this.dataMenunggu = data
			this.dataMenungguUi = data;
		})

		this.pembelian.getDataProses()
		.pipe(takeUntil(this.destroy$))
		.subscribe(data => {
			if(this.dataProses.length != data.length && this.dataMenunggu.length < 1 && data.length > 0){
				this.segmentValue = 'proses';
			}
			this.dataProses = data
			this.dataProsesUi = data;
		})

		this.pembelian.getDataSiap()
		.pipe(takeUntil(this.destroy$))
		.subscribe(data => {
			this.dataSiap = data
			this.dataSiapUi = data;
		})

		this.pembelian.getDataKirim()
		.pipe(takeUntil(this.destroy$))
		.subscribe(data => {
			this.dataKirim = data
			this.dataKirimUi = data;
		})

		this.pembelian.getDataPembelian()
		.pipe(takeUntil(this.destroy$))
		.subscribe(data => {
			this.dataPembelian = data;
			this.dataPembelianUi = data;
		})

		this.pembelian.getDataBatal()
		.pipe(takeUntil(this.destroy$))
		.subscribe(data => {
			this.dataBatal = data;
			this.dataBatalUi = data;
		})
	}

	ionViewDidEnter(){
		this.ambilPembelian([0,1,2,3,4,5,6,7]);
		if(this.master.getValueKurir().length < 1){
			this.server.ambilKurir().then(data => {
				if(data.success) this.master.setDataKurir(data.kurir);
			})
		}
	}

	tabChange(v){
		let p = document.getElementById('pp-segment');
		let pb = p.getBoundingClientRect();
		let c = document.getElementById('pp-' + v);
		let cb = c.getBoundingClientRect();
		p.scrollTo({
			left: pb.left - cb.left < -25 && cb.right - pb.right < -25? p.scrollLeft : (cb.right - pb.right) > 0? (cb.right - pb.right + p.scrollLeft + 25) : (p.scrollLeft + cb.left - pb.left - 25), 
			behavior: 'smooth'
		})

	}

	ambilPembelian(status: number[]){
		if(status.includes(0) || status.includes(2)) this.belumLoading = 1;
		if(status.includes(1)) this.menungguLoading = 1;
		if(status.includes(3)) this.prosesLoading = 1;
		if(status.includes(4)) this.siapLoading = 1;
		if(status.includes(5)) this.kirimLoading = 1;
		if(status.includes(6)) this.pembelianLoading = 1;
		if(status.includes(7)) this.batalLoading = 1;

		this.server.ambilPembelian(status).then(data => {
			console.log(data);
			if(data.success){
				if(status.includes(0)) {
					this.belumLoading = 0;
					this.pembelian.setDataBelum(data.pembelian.filter(v => v.status == 0))
				}

				if(status.includes(1) || status.includes(2)) {
					this.menungguLoading = 0;
					this.pembelian.setDataMenuggu(data.pembelian.filter(v => v.status == 1 || v.status == 2));
				}

				if(status.includes(3)) {
					this.prosesLoading = 0;
					this.pembelian.setDataProses(data.pembelian.filter(v => v.status == 3))
				}

				if(status.includes(4)) {
					this.siapLoading = 0;
					this.pembelian.setDataSiap(data.pembelian.filter(v => v.status == 4))
				}

				if(status.includes(5)) {
					this.kirimLoading = 0;
					this.pembelian.setDataKirim(data.pembelian.filter(v => v.status == 5))
				}

				if(status.includes(6)) {
					this.pembelianLoading = 0;
					this.pembelian.setDataPembelian(data.pembelian.filter(v => v.status == 6))
				}

				if(status.includes(7)) {
					this.batalLoading = 0;
					this.pembelian.setDataBatal(data.pembelian.filter(v => v.status == 7))
				}
			}else{
				if(status.includes(0) || status.includes(2)) this.belumLoading = 2;
				if(status.includes(1)) this.menungguLoading = 2;
				if(status.includes(3)) this.prosesLoading = 2;
				if(status.includes(4)) this.siapLoading = 2;
				if(status.includes(5)) this.kirimLoading = 2;
				if(status.includes(6)) this.pembelianLoading = 2;
				if(status.includes(7)) this.batalLoading = 2;
			}
		}).catch(err => {
			console.log(err)
			if(status.includes(0) || status.includes(2)) this.belumLoading = 2;
			if(status.includes(1)) this.menungguLoading = 2;
			if(status.includes(3)) this.prosesLoading = 2;
			if(status.includes(4)) this.siapLoading = 2;
			if(status.includes(5)) this.kirimLoading = 2;
			if(status.includes(6)) this.pembelianLoading = 2;
			if(status.includes(7)) this.batalLoading = 2;
		})
	}

	ngOnDestroy(){
		this.destroy$.next();
		this.destroy$.complete();
	}

	verifikasiBukti(p){
		console.log(p);
		if(!p.buktiPembayaran || p.buktiPembayaran.length < 1) return this.modal.showToast('Tidak dapat melakukan verifikasi, Coba beberapa saat lagi..', 'warning')
			let dataBukti = p.buktiPembayaran[p.buktiPembayaran.length - 1];
		this.modal.showModal({
			jenis: 'photo',
			header: 'Verifikasi Bukti Pembayaran',
			search: false,
			data: [{
				id: 'photo',
				imgUrl: this.server.otherServer + dataBukti.imgUrl
			}],
			button: [{ 
				title: 'Batal', 
				role: 'batal'
			}, {
				title: 'Tolak', 
				role: 'notok'
			},{
				title: 'Verifikasi', 
				submit: true/* role pada submit selalu 'ok'*/
			}]
		}, false).then(mdata => {
			if(mdata.role == 'ok' || mdata.role == 'notok'){
				this.modal.showLoading('Menyimpan data verifikasi');
				this.server.buktiVerifikasiPembelian({idPembelian: p._id, statusBukti: mdata.role == 'ok'? 1 : 2, idBukti: dataBukti._id}).then(data => {
					this.modal.hideLoading();
					console.log(data);
					if(data.success){
						this.modal.showToast('Berhasil menyimpan data verifikasi', 'success', 2000, 'bottom', false, true);
						if(data.pembelian.status == 3){
							this.pembelian.setDataMenuggu(this.pembelian.getValueMenuggu().filter(v => v._id != data.pembelian._id))
							this.pembelian.setDataProses([...this.pembelian.getValueProses(), p]);
						}else if(data.pembelian.status == 5){
							this.pembelian.setDataMenuggu(this.pembelian.getValueMenuggu().filter(v => v._id != data.pembelian._id))
							this.pembelian.setDataPembelian([...this.pembelian.getValuePembelian(), data.pembelian]);
							if(this.pembelian.getValueMenuggu().length < 1){
								this.segmentValue = 'selesai'
							}
						}else if(data.pembelian.status == 2){
							this.pembelian.setDataMenuggu(this.pembelian.getValueMenuggu().map(v => v._id == data._id? v : data.pembelian))
						}else{
							this.ambilPembelian([0,1,2,3,4,5,6]);
						}
					}else{
						this.modal.showToast('Gagal menyimpan data verifikasi', 'danger', 2000, 'bottom', false, true);
					}
				}).catch(err => {
					this.modal.hideLoading();
					this.modal.showToast('Gagal menyimpan data verifikasi', 'danger', 2000, 'bottom', false, true);
					console.log(err);
				})	
			}
		})
	}

	batalPembelian(p){
		this.modal.showConfirm('Membatalkan Pembelian', 'Apakah anda yakin membatalkan pembelian <b>'+ p.produkBackup[0].produk.nama + ' Dan ' + (p.produkBackup.length - 1) + ' Produk Lainnya</b>', ['Tidak', 'Iya']).then(data => {
			if(data){
				this.modal.showLoading('Membatalkan Pembelian...');
				this.server.editPembelian({idPembelian: p._id, status: 7}).then(data => {
					console.log(data);
					this.modal.hideLoading();
					if(data.success){
						this.modal.showToast('Pembelian berhasil di batalkan', 'success', 2000, 'bottom', false, true);
						this.pembelian.setDataProses(this.pembelian.getValueProses().filter(v => v._id != data.pembelian._id));
						this.pembelian.setDataBatal([...this.pembelian.getValueBatal(), data.pembelian]);
					}else{
						this.modal.showToast('Pembelian gagal di batalkan', 'danger', 2000, 'bottom', false, true)
					}
				}).catch(err => {
					console.log(err);
					this.modal.showToast('Pembelian gagal di batalkan', 'danger', 2000, 'bottom', false, true)
				})
			}
		})
	}

	siapPembelian(p){
		this.modal.showModal({
			jenis: 'select',
			header: 'Pilih Kurir Pengirim',
			data: this.master.getValueKurir().map(v => {return {id: v._id, imgUrl: true, title: v.namaLengkap, subTitle: v.noTlp}}),
			multiple: false,
			required: true
		}).then(data => {
			console.log(data)
			if(data.role == 'ok' && data.data && data.data.nonmultiple){
				this.modal.showLoading('Mengantrikan pembelian ke pengiriman...');
				this.server.editPembelian({idPembelian: p._id, status: 4, idKurir: data.data.nonmultiple}).then(data => {
					console.log(data)
					this.modal.hideLoading();
					if(data.success){
						this.pembelian.setDataProses(this.pembelian.getValueProses().filter(v => v._id != data.pembelian._id));
						this.pembelian.setDataSiap([...this.pembelian.getValueSiap(), data.pembelian]);
						this.modal.showToast('Berhasil mengantikan pembelian ke pengiriman', 'success', 2000, 'bottom', false, true);
						this.segmentValue = 'siap';
					}else{
						this.modal.showToast('Gagal mengantikan pembelian ke pengiriman', 'danger', 2000, 'bottom', false, true);
					}
				}).catch(err => {
					console.log(err)
					this.modal.showToast('Gagal mengantikan pembelian ke pengiriman', 'danger', 2000, 'bottom', false, true);
				})
			}else if(!data.data || !data.data.nonmultiple){
				this.modal.showToast('Mohom pilih kurir untuk melanjutkan proses pembelian', null, 2000, 'bottom', false, true);
			}
		})
		// this.modal.showPrompt('Pilih Kurir Pengirim', 'Pilih kurir untuk mengirimkan pembelian ke customer', 
		// 	this.master.getValueKurir().map(v => { return { name: v._id, type: 'radio', label: v.namaLengkap, value: v._id }})
		// ).then(data => {
		// 	console.log(data)
		// })
	}

	lihatBukti(p){
		console.log(p);
		if(!p.buktiPembayaran || p.buktiPembayaran.length < 1) return this.modal.showToast('Tidak dapat melakukan verifikasi, Coba beberapa saat lagi..', 'warning')
			let dataBukti = p.buktiPembayaran[p.buktiPembayaran.length - 1];
		this.modal.showModal({
			jenis: 'photo',
			header: 'Verifikasi Bukti Pembayaran',
			search: false,
			data: [{
				id: 'photo',
				imgUrl: this.server.otherServer + dataBukti.imgUrl
			}],
			button: [{ 
				title: 'Tutup', 
				role: 'batal'
			}]
		})
	}

	get jenisIcon(){
		return this.pembelian.jenisIcon;
	}
	get jenisTitle(){
		return this.pembelian.jenisTitle;
	}
	get otherServer(){
		return this.server.otherServer;
	}
}
