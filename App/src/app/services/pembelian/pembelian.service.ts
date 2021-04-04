import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

import { Kategori, Rekening } from '../master/master.service';
import { Produk, Keranjang } from '../produk/produk.service';
import { User } from '../user/user.service';

export class Pembelian{
	_id: string;
	jenis: number;
	invoice: string;
	status: number;
	jumlah: number = 0;
	user: User | string;
	rekening?: Rekening;
	rekeningBackup?: {
		namaBank: string,
		noRek: string,
		atasNama: string
	};
	produk?: Keranjang[];
	produkBackup?: {
		produk: {
			imgUrl: string[],
			nama: string,
			harga: number,
			kategori: {
				title: string
			},
			diskon: number,
		},
		jumlah: number
	}[];
	buktiPembayaran: {
		verify: boolean,
		imgUrl: string
	}[];
	waktuPelunasan: Date;
	waktuPembelian: Date;
	waktuPenyelesaian: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PembelianService {

	private dataMenuggu: BehaviorSubject<Array<Pembelian>> = new BehaviorSubject<Array<Pembelian>>([]);
	dataMenuggu_ = this.dataMenuggu.asObservable();

	private dataBelum: BehaviorSubject<Array<Pembelian>> = new BehaviorSubject<Array<Pembelian>>([]);
	dataBelum_ = this.dataBelum.asObservable();

	private dataProses: BehaviorSubject<Array<Pembelian>> = new BehaviorSubject<Array<Pembelian>>([]);
	dataProses_ = this.dataProses.asObservable();

	private dataSiap: BehaviorSubject<Array<Pembelian>> = new BehaviorSubject<Array<Pembelian>>([]);
	dataSiap_ = this.dataSiap.asObservable();

	private dataKirim: BehaviorSubject<Array<Pembelian>> = new BehaviorSubject<Array<Pembelian>>([]);
	dataKirim_ = this.dataKirim.asObservable();

	private dataPembelian: BehaviorSubject<Array<Pembelian>> = new BehaviorSubject<Array<Pembelian>>([]);
	dataPembelian_ = this.dataPembelian.asObservable();

	private dataBatal: BehaviorSubject<Array<Pembelian>> = new BehaviorSubject<Array<Pembelian>>([]);
	dataBatal_ = this.dataBatal.asObservable();

	public statusTitle = ['Menunggu Pembayaran', 'Menunggu Verifikasi', 'Upload Ulang Bukti', 'Pesanan Diproses', 'Siap Dikirim', 'Sedang Dikirim', 'Selesai', 'Gagal']
	public statusColor = ['warning', 'medium', 'warning', 'primary', 'primary', 'primary', 'success', 'danger']
	public jenisTitle = ['', 'Belanja', 'Topup'];
	public jenisIcon = ['', 'bag-outline', 'cash-outline'];

  constructor() {}

  setDataMenuggu(data: Array<Pembelian>){ this.dataMenuggu.next(data) }
  getDataMenuggu(){ return this.dataMenuggu_ }
  getValueMenuggu(){ return this.dataMenuggu.getValue() };

  setDataBelum(data: Array<Pembelian>){ this.dataBelum.next(data) }
  getDataBelum(){ return this.dataBelum_ }
  getValueBelum(){ return this.dataBelum.getValue() };

  setDataProses(data: Array<Pembelian>){ this.dataProses.next(data) }
  getDataProses(){ return this.dataProses_ }
  getValueProses(){ return this.dataProses.getValue() };

  setDataSiap(data: Array<Pembelian>){ this.dataSiap.next(data) }
  getDataSiap(){ return this.dataSiap_ }
  getValueSiap(){ return this.dataSiap.getValue() };

  setDataKirim(data: Array<Pembelian>){ this.dataKirim.next(data) }
  getDataKirim(){ return this.dataKirim_ }
  getValueKirim(){ return this.dataKirim.getValue() };

  setDataPembelian(data: Array<Pembelian>){ this.dataPembelian.next(data) }
  getDataPembelian(){ return this.dataPembelian_ }
  getValuePembelian(){ return this.dataPembelian.getValue() };

  setDataBatal(data: Array<Pembelian>){ this.dataBatal.next(data) }
  getDataBatal(){ return this.dataBatal_ }
  getValueBatal(){ return this.dataBatal.getValue() };

  setDataAll(data: Array<Pembelian>){
  	this.dataMenuggu.next(data)
  	this.dataBelum.next(data)
  	this.dataProses.next(data)
  	this.dataKirim.next(data)
  	this.dataPembelian.next(data)
  	this.dataBatal.next(data)
  }
}
