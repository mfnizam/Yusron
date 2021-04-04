import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

import { User } from '../user/user.service';

export class Kategori{
	_id: string;
	title: string;
	totProdAktif?: number;
}

export class Rekening{
  _id: string;
  namaBank: string;
  noRek: string;
  atasNama: string;
}

@Injectable({
  providedIn: 'root'
})
export class MasterService {
	private DataKurir: BehaviorSubject<Array<User>> = new BehaviorSubject<Array<User>>([])
  DataKurir_ = this.DataKurir.asObservable();

  private DataPembeli: BehaviorSubject<Array<User>> = new BehaviorSubject<Array<User>>([])
  DataPembeli_ = this.DataPembeli.asObservable();

	private dataKategori: BehaviorSubject<Array<Kategori>> = new BehaviorSubject<Array<Kategori>>([]);
	dataKategori_ = this.dataKategori.asObservable();

  private dataRekening: BehaviorSubject<Array<Rekening>> = new BehaviorSubject<Array<Rekening>>([])
  dataRekening_ = this.dataRekening.asObservable();

  constructor() { }

  setDataKurir(data: Array<User>){ this.DataKurir.next(data) }
  getDataKurir(){ return this.DataKurir_ }
  getValueKurir(){ return this.DataKurir.getValue() };

  setDataPembeli(data: Array<User>){ this.DataPembeli.next(data) }
  getDataPembeli(){ return this.DataPembeli_ }
  getValuePembeli(){ return this.DataPembeli.getValue() };

  setDataKategori(data: Array<Kategori>){ this.dataKategori.next(data) }
  getDataKategori(){ return this.dataKategori_ }
  getValueKategori(){ return this.dataKategori.getValue() };

  setDataRekening(data: Array<Rekening>){ this.dataRekening.next(data) }
  getDataRekening(){ return this.dataRekening_ }
  getValueRekening(){ return this.dataRekening.getValue() };
}
