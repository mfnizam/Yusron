import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { HTTP } from '@ionic-native/http/ngx';

import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  public serverUrl = 'https://projectkabeh.herokuapp.com/yusron/';
  // public serverUrl = 'http://192.168.8.103:3000/yusron/'; // F4
  // public serverUrl = 'http://192.168.0.101:3000/yusron/';
  // public serverUrl = 'http://10.209.25.230:3000/';
  // public serverUrl = 'http://192.168.1.70:3000/';

  public otherServer = 'https://mfnizam.com/apps/projectkabeh/'

  constructor(
    private http: HTTP,
    private httpClient: HttpClient,
    private transfer: FileTransfer) { }

  getRequest(url){
  	return this.httpClient.get(url);
  }

  postRequest(url, data){
    if(Capacitor.isNative){
      this.http.setDataSerializer('json');
      return this.http.post(url, data, {'Content-Type': 'application/json'})
      .then(res => { return JSON.parse(res.data) })
    }else{
    	return this.httpClient.post(url, data).toPromise().then((data : any) => { return data;})
    }
  }

  async uploadRequest(url, imgUrl, fileName, params){
    if(Capacitor.isNative){
      return this.transfer.create().upload(imgUrl, url, {
        fileKey: 'foto',
        fileName: fileName,
        chunkedMode: false,
        mimeType: "image/jpeg",
        params : params,
        headers: {}
      })
      .then(res => { return JSON.parse(res.response) })
    }else{
      let file = await fetch(imgUrl).then(r => r.blob());
      let formData = new FormData();
      formData.append('foto', file, (fileName? fileName : 'foto-upload.jpeg'));
      for(let k in params){
        if(Array.isArray(params[k])){
          params[k].forEach((v, i) => {
            formData.append(k + '[' + i + ']', v);
          })
        }else{
          formData.append(k, params[k]);
        }
      }
      return this.postRequest(url, formData); 
    }
  }

  async uploadMultipleRequest(url, imgUrl: any[], fileName?: any[], params?){
    Object.keys(params).forEach(key => params[key] === undefined || params[key] === null ? delete params[key] : null);

    let formData = new FormData();
    let file = []
    for(let i = 0; i < imgUrl.length; i++){
      file.push(await fetch(imgUrl[i]).then(r => r.blob()));
      formData.append('foto', file[i], (fileName[i]? fileName[i] : 'foto-upload.jpeg'));
    }
    for(let k in params){
      if(Array.isArray(params[k])){
        params[k].forEach((v, i) => {
          formData.append(k + '[' + i + ']', v);
        })
      }else{
        formData.append(k, params[k]);
      }
    }
    return this.postRequest(url, formData); 
  }



  // auth api
  public predaftar(eAn, nama, pass, isEmail){
  	let url = this.serverUrl + 'auth/predaftar';
  	return this.postRequest(url, { eAn: eAn, namaLengkap: nama, password: pass, isEmail: isEmail });
  }
  public masuk(eAn, password, isEmail){
    let url = this.serverUrl + 'auth/masuk';
    return this.postRequest(url, { eAn: eAn, password: password, isEmail: isEmail });
  }
  public verifyKode(eAn, nama, kode, keperluan){
    let url = this.serverUrl + 'auth/verifykode';
    return this.postRequest(url, {eAn: eAn, namaLengkap: nama, kode: kode, keperluan: keperluan});
  }
  public akunEdit(data){
    let url = this.serverUrl + 'auth/akun/edit';
    return this.postRequest(url, data);
  }
  public akun(idUser){
    let url = this.serverUrl + 'auth/akun';
    return this.postRequest(url, {idUser}); 
  }
  public saldoAkun(idUser){
    let url = this.serverUrl + 'auth/akun/saldo';
    return this.postRequest(url, {idUser});  
  }

  // admin api
  public ambilKurir(){
    let url = this.serverUrl + 'api/admin/kurir';
    return this.postRequest(url, {});
  }
  public tambahKurir(data){
    let url = this.serverUrl + 'api/admin/kurir/tambah';
    return this.postRequest(url, data)
  }
  public hapusKurir(_id){
    let url = this.serverUrl + 'api/admin/kurir/hapus';
    return this.postRequest(url, {_id})
  }
  public editKurir(data){
    let url = this.serverUrl + 'api/admin/kurir/edit';
    return this.postRequest(url, data);
  }

  public ambilPembeli(){
    let url = this.serverUrl + 'api/admin/pembeli';
    return this.postRequest(url, {});
  }
  public tambahPembeli(data){
    let url = this.serverUrl + 'api/admin/pembeli/tambah';
    return this.postRequest(url, data)
  }
  public hapusPembeli(_id){
    let url = this.serverUrl + 'api/admin/pembeli/hapus';
    return this.postRequest(url, {_id})
  }
  public editPembeli(data){
    let url = this.serverUrl + 'api/admin/pembeli/edit';
    return this.postRequest(url, data);
  }

  public ambilKategori(){
    let url = this.serverUrl + 'api/admin/kategori';
    return this.postRequest(url, {});
  }
  public tambahKategori(data){
    let url = this.serverUrl + 'api/admin/kategori/tambah';
    return this.postRequest(url, data)
  }
  public hapusKategori(_id){
    let url = this.serverUrl + 'api/admin/kategori/hapus';
    return this.postRequest(url, {_id});
  }
  public editKategori(data){
    let url = this.serverUrl + 'api/admin/kategori/edit';
    return this.postRequest(url, data);
  }

  public ambilRekening(){
    let url = this.serverUrl + 'api/admin/rekening';
    return this.postRequest(url, {});
  }
  public tambahRekening(data){
    let url = this.serverUrl + 'api/admin/rekening/tambah';
    return this.postRequest(url, data);
  }
  public hapusRekening(_id){
    let url = this.serverUrl + 'api/admin/rekening/hapus';
    return this.postRequest(url, {_id});
  }
  public editRekening(data){
    let url = this.serverUrl + 'api/admin/rekening/edit';
    return this.postRequest(url, data);
  }

  public ambilProduk(){
    let url = this.serverUrl + 'api/admin/produk';
    return this.postRequest(url, {});
  }
  public tambahProduk(data, foto: any[], name?: any[]){
    let url = this.serverUrl + 'api/admin/produk/tambah';
    return this.uploadMultipleRequest(url, foto, name, data);
  }
  public hapusProduk(_id){
    let url = this.serverUrl + 'api/admin/produk/hapus';
    return this.postRequest(url, {_id});
  }
  public editProduk(data, foto: any[], name?: any[]){
    let url = this.serverUrl + 'api/admin/produk/edit';
    // return this.postRequest(url, data);
    return this.uploadMultipleRequest(url, foto, name, data);
  }

  public ambilPembelian(status){
    let url = this.serverUrl + 'api/admin/pembelian';
    return this.postRequest(url, {status});
  }
  public editPembelian(data){
    let url = this.serverUrl + 'api/admin/pembelian/edit';
    return this.postRequest(url, data);
  }
  public buktiVerifikasiPembelian(data){
    let url = this.serverUrl + 'api/admin/pembelian/bukti/verifikasi';
    return this.postRequest(url, data);
  }

  //public api
  public produk(idUser){
    let url = this.serverUrl + 'api/produk';
    return this.postRequest(url, {idUser});
  }

  public keranjang(idUser){
    let url = this.serverUrl + 'api/keranjang';
    return this.postRequest(url, {idUser}); 
  }
  public tambahKeranjang(data){
    let url = this.serverUrl + 'api/keranjang/tambah';
    return this.postRequest(url, data); 
  }
  public hapusKeranjang(data){
    let url = this.serverUrl + 'api/keranjang/hapus';
    return this.postRequest(url, data); 
  }
  public editKeranjang(data){
    let url = this.serverUrl + 'api/keranjang/edit';
    return this.postRequest(url, data); 
  }

  public rekening(){
    let url = this.serverUrl + 'api/rekening';
    return this.postRequest(url, {});
  }

  public topup(data){
    let url = this.serverUrl + 'api/topup/tambah';
    return this.postRequest(url, data); 
  }

  public pembelian(user, kurir = null){
    let url = this.serverUrl + 'api/pembelian';
    return this.postRequest(url, {user, kurir});
  }
  public tambahPembelian(data){
    let url = this.serverUrl + 'api/pembelian/tambah';
    return this.postRequest(url, data);
  }
  public async pembelianBuktiUplaod(imgUrl, fileName, params){
    let url = this.serverUrl + 'api/pembelian/bukti/upload';
    return this.uploadRequest(url, imgUrl, fileName, params);
  }
  public async pengambilanBuktiUpload(imgUrl, fileName, params){
    let url = this.serverUrl + 'api/pengambilan/bukti/upload';
    return this.uploadRequest(url, imgUrl, fileName, params);
  }
  public pembelianVerifikasi(data){
    let url = this.serverUrl + 'api/pembelian/verifikasi';
    return this.postRequest(url, data); 
  }

  // ============================================================================================
}