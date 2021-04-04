import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

import { Kategori } from '../master/master.service';

export class Produk{
	_id: string;
	imgUrl: string[];
	nama: string;
	harga: number;
	kategori: Kategori;
	diskon?: number;
	stok: number;
}

export class Keranjang{
	produk: Produk;
	jumlah: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProdukService {
	private dataProduk: BehaviorSubject<Array<Produk>> = new BehaviorSubject<Array<Produk>>([]);
	dataProduk_ = this.dataProduk.asObservable();

	private dataKeranjang: BehaviorSubject<Array<Keranjang>> = new BehaviorSubject<Array<Keranjang>>([]);
	dataKeranjang_ = this.dataKeranjang.asObservable();

  constructor() { }

  setDataProduk(data: Array<Produk>){ this.dataProduk.next(data) }
  getDataProduk(){ return this.dataProduk_ }
  getValueProduk(){ return this.dataProduk.getValue() };

  setDataKeranjang(data: Array<Keranjang>){ this.dataKeranjang.next(data) }
  getDataKeranjang(){ return this.dataKeranjang_ }
  getValueKeranjang(){ return this.dataKeranjang.getValue() };
}
