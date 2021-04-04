import { Component, OnDestroy } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { MasterService, Kategori, Rekening } from '../../../services/master/master.service';
import { User } from '../../../services/user/user.service';
import { ServerService } from '../../../services/server/server.service';
import { ModalService } from '../../../services/modal/modal.service';

@Component({
  selector: 'app-master',
  templateUrl: './master.page.html',
  styleUrls: ['./master.page.scss'],
})
export class MasterPage implements OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  dataKurir: User[] = [];
  kurirLoading = 0; // 0 done; 1 loading; 2 error
  dataPembeli: User[] = [];
  pembeliLoading = 0;
  dataKategori: Kategori[] = [];
  kategoriLoading = 0;
  dataRekening: Rekening[] = [];
  rekeningLoading = 0;

  constructor(
    private master: MasterService,
    private server: ServerService,
    private modal: ModalService) {
    master.getDataKurir()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.dataKurir = data;
    })

    master.getDataPembeli()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.dataPembeli = data;
    })

    master.getDataKategori()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.dataKategori = data;
    })

    master.getDataRekening()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.dataRekening = data;
    })
  }

  ionViewDidEnter(){
    this.ambilKurir();
    this.ambilPembeli();
    this.ambilKategori();
    this.ambilRekening();
  }

  ambilKurir(){
    this.kurirLoading = 1;
    this.server.ambilKurir().then(data => {
      console.log(data)
      if(data.success){
        this.kurirLoading = 0;
        this.dataKurir = data.kurir;
        this.master.setDataKurir(data.kurir);
      }else{
        this.kurirLoading = 2
      }
    }).catch(err => {
      this.kurirLoading = 2;
      console.log(err);
    })
  }

  ambilPembeli(){
    this.pembeliLoading = 1;
    this.server.ambilPembeli().then(data => {
      console.log(data)
      if(data.success){
        this.pembeliLoading = 0;
        this.dataPembeli = data.pembeli;
        this.master.setDataPembeli(data.pembeli);
      }else{
        this.pembeliLoading = 2
      }
    }).catch(err => {
      this.pembeliLoading = 2;
      console.log(err);
    })
  }
  ambilKategori(){
    this.kategoriLoading = 1;
    this.server.ambilKategori().then(data => {
      console.log(data)
      if(data.success){
        this.kategoriLoading = 0;
        this.dataKategori = data.kategori;
        this.master.setDataKategori(data.kategori);
      }else{
        this.kategoriLoading = 2
      }
    }).catch(err => {
      this.kategoriLoading = 2;
      console.log(err, 'ambil Kategori')
    })
  }
  ambilRekening(){
    this.rekeningLoading = 1;
    this.server.ambilRekening().then(data => {
      console.log(data)
      if(data.success){
        this.rekeningLoading = 0;
        this.dataRekening = data.rekening;
        this.master.setDataRekening(data.rekening);
      }else{
        this.rekeningLoading = 2
      }
    }).catch(err => {
      this.rekeningLoading = 2;
      console.log(err, 'ambil Rekening')
    })
  }

  tambah(jenis){
    let input = []
    if(jenis == 'kategori') {
      input = [{
        name: 'title',
        type: 'text',
        placeholder: 'Isikan nama ' + jenis
      }]
    }else if(jenis == 'rekening'){
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

    this.modal.showPrompt('Tambah Data ' + jenis, null, input, ['Batal', 'Simpan']).then((data: any) => {
      if(data.data && data.data.values && data.role == 'ok'){
        this.modal.showLoading('Menambahkan Data');

        if(jenis == 'kategori'){
          this.server.tambahKategori(data.data.values).then(data => {
            console.log(data)
            this.modal.hideLoading();

            if(data.success){
              this.modal.showToast('Berhasil Menambahkan Data Kategori', 'success');
              this.master.setDataKategori([...this.master.getValueKategori(), data.kategori]);
            }else{
              this.modal.showToast('Gagal Menambahkan Data Kategori', 'danger');
            }
          }).catch(err => {
            this.modal.hideLoading();
            this.modal.showToast('Gagal Menambahkan Data Kategori', 'danger');
            console.log(err)
          })
        }else if(jenis == 'rekening'){
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

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }
}
