import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MasterService } from '../../../../services/master/master.service';
import { User } from '../../../../services/user/user.service';
import { ServerService } from '../../../../services/server/server.service';
import { ModalService } from '../../../../services/modal/modal.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnDestroy{
	private destroy$: Subject<void> = new Subject<void>();

	jenis;
	dataMaster;
  tagihanLoading = 0;

  constructor(
  	private navCtrl: NavController,
    private router: Router,
    private active: ActivatedRoute,
    private master: MasterService,
    private server: ServerService,
    private modal: ModalService
    ) {
  	active.params
  	.pipe(takeUntil(this.destroy$))
  	.subscribe(data => {
  		this.jenis = data['jenis'];
      if(this.jenis == 'kurir'){
        this.dataMaster = this.master.getValueKurir().find(v => v._id == data['id']);
      }/*else if(this.jenis == 'siswa'){
        if(this.master.getValueKelas().length < 1){
          this.server.ambilSiswa().then(sdata => {
            if(sdata.success){
              this.master.setDataSiswa(sdata.siswa);
              this.dataMaster = this.master.getValueSiswa().find(v => v._id == data['id']);
            }
          })
        }else{
          this.dataMaster = this.master.getValueSiswa().find(v => v._id == data['id']);
        }
      }else if(this.jenis == 'kelas'){
        this.dataMaster = this.master.getValueKelas().find(v => v._id == data['id']);
        // tambahkan tagihan pada detail kelas maupun kategori
      }else if(this.jenis == 'kategori'){
        this.dataMaster = this.master.getValueKategori().find(v => v._id == data['id']);
      }else if(this.jenis == 'rekening'){
        this.dataMaster = this.master.getValueRekening().find(v => v._id == data['id']);
      }*/
    })
  }

  ngOnDestroy(){
  	this.destroy$.next();
  	this.destroy$.complete();
  }

  goBack(){
    this.navCtrl.back();
  }

  edit(){
    if(!this.dataMaster || !this.dataMaster._id) return console.log('tidak ada id');
    if(this.jenis == 'kurir' || this.jenis == 'siswa'){
      this.router.navigate(['/admin/master/cu', {jenis: this.jenis, update: true, id: this.dataMaster._id}]);
    }/*else if(this.jenis == 'kelas' || this.jenis == 'kategori' || this.jenis == 'rekening'){
      let input = [];
      if(this.jenis == 'kelas' || this.jenis == 'kategori'){
        input = [{
          name: 'title',
          type: 'text',
          value: this.dataMaster.title,
          placeholder: 'Isikan nama ' + this.jenis
        }]
      }else if(this.jenis == 'rekening'){
        input = [{
          name: 'namaBank',
          type: 'text',
          placeholder: 'Isikan Nama Bank, Contoh: BRI, BNI, BCA',
          value: this.dataMaster.namaBank,
        }, {
          name: 'noRek',
          type: 'text',
          placeholder: 'Isikan nomer rekening',
          value: this.dataMaster.noRek,
        }, {
          name: 'atasNama',
          type: 'text',
          placeholder: 'Isikan atas nama rekening',
          value: this.dataMaster.atasNama,
        }]
      }

      this.modal.showPrompt('Edit Data ' + this.jenis, null, input).then((data: any) => {
        if(data.data && data.data.values && data.role == 'ok'){
          this.modal.showLoading('Menyimpan Perubahan');
          data.data.values['_id'] = this.dataMaster._id;

          if(this.jenis == 'kategori'){
            this.server.editKategori(data.data.values).then(data => {
              this.modal.hideLoading();
              console.log(data);
              if(data.success){
                this.dataMaster = data.kategori;
                this.master.setDataKategori(this.master.getValueKategori().map(v => v._id == this.dataMaster._id? this.dataMaster : v));
                this.modal.showToast('Berhasil Menyimpan "' + this.dataMaster.title, 'success');
              }else{
                this.modal.showToast('Gagal Menyimpan "' + this.dataMaster.title, 'danger');
              }
            }).catch(err => {
              console.log(err);
              this.modal.hideLoading();
              this.modal.showToast('Gagal Menyimpan "' + this.dataMaster.title, 'danger');
            })
          }else if(this.jenis == 'kelas'){
            this.server.editKelas(data.data.values).then(data => {
              this.modal.hideLoading();
              console.log(data);
              if(data.success){
                this.dataMaster = data.kelas;
                this.master.setDataKelas(this.master.getValueKelas().map(v => v._id == this.dataMaster._id? this.dataMaster : v));
                this.modal.showToast('Berhasil Menyimpan "' + this.dataMaster.title, 'success');
              }else{
                this.modal.showToast('Gagal Menyimpan "' + this.dataMaster.title, 'danger');
              }
            }).catch(err => {
              console.log(err);
              this.modal.hideLoading();
              this.modal.showToast('Gagal Menyimpan "' + this.dataMaster.title, 'danger');
            })
          }else if(this.jenis == 'rekening'){
            this.server.editRekening(data.data.values).then(data => {
              this.modal.hideLoading();
              console.log(data);
              if(data.success){
                this.dataMaster = data.rekening;
                this.master.setDataRekening(this.master.getValueRekening().map(v => v._id == this.dataMaster._id? this.dataMaster : v));
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
    }*/
  }
  hapus(){
    if(!this.dataMaster || !this.dataMaster._id) return;
    let dataHapus = this.jenis == 'kurir' || this.jenis == 'siswa'? this.dataMaster.namaLengkap : this.jenis == 'rekening'? this.dataMaster.noRek : this.dataMaster.title;
    this.modal.showConfirm('Hapus Data ' + this.jenis, 'Apakah anda ingin menghapus data ' + this.jenis + ' <b>"' + dataHapus + '"</b>', ['Batal', 'Hapus']).then(e => {
      if(e){
        if(this.jenis == 'kurir'){
          this.server.hapusKurir(this.dataMaster._id).then(data => {
            this.modal.hideLoading();
            if(data.success){
              this.master.setDataKurir(this.master.getValueKurir().filter(v => v._id != this.dataMaster._id));
              this.modal.showToast('Berhasil Menghapus Data', 'success');
              setTimeout(_ => {
                this.goBack()
              }, 300)
            }else{
              this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
            }
          }).catch(err => {
            this.modal.hideLoading();
            this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
            console.log(err);
          })
        }

        // if(this.jenis == 'kategori'){
        //   this.server.hapusKategori(this.dataMaster._id).then(data => {
        //     console.log(data);
        //     this.modal.hideLoading();
        //     if(data.success){
        //       this.master.setDataKategori(this.master.getValueKategori().filter(v => v._id != this.dataMaster._id));
        //       this.modal.showToast('Berhasil Menghapus Data', 'success')
        //       setTimeout(_ => {
        //         this.goBack();
        //       }, 300)
        //     }else{
        //       this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
        //     }
        //   }).catch(err => {
        //     this.modal.hideLoading();
        //     this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
        //     console.log(err)
        //   })
        // }else if(this.jenis == 'kelas'){
        //   this.server.hapusKelas(this.dataMaster._id).then(data => {
        //     console.log(data);
        //     this.modal.hideLoading();
        //     if(data.success){
        //       this.master.setDataKelas(this.master.getValueKelas().filter(v => v._id != this.dataMaster._id));
        //       this.modal.showToast('Berhasil Menghapus Data', 'success');
        //       setTimeout(_ => {
        //         this.goBack();
        //       }, 300)
        //     }else{
        //       this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
        //     }
        //   }).catch(err => {
        //     this.modal.hideLoading();
        //     this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
        //     console.log(err)
        //   })
        // }else if(this.jenis == 'siswa'){
        //   this.server.hapusSiswa(this.dataMaster._id).then(data => {
        //     console.log(data);
        //     this.modal.hideLoading();
        //     if(data.success){
        //       this.master.setDataSiswa(this.master.getValueSiswa().filter(v => v._id != this.dataMaster._id));
        //       this.modal.showToast('Berhasil Menghapus Data', 'success')
        //       setTimeout(_ => {
        //         this.goBack()
        //       }, 300)
        //     }else{
        //       this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
        //     }
        //   }).catch(err => {
        //     this.modal.hideLoading();
        //     this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
        //     console.log(err)
        //   })
        // }else if(this.jenis == 'rekening'){
        //   this.server.hapusRekening(this.dataMaster._id).then(data => {
        //     console.log(data);
        //     this.modal.hideLoading();
        //     if(data.success){
        //       this.master.setDataRekening(this.master.getValueRekening().filter(v => v._id != this.dataMaster._id));
        //       this.modal.showToast('Berhasil Menghapus Data', 'success');
        //       setTimeout(_ => {
        //         this.goBack();
        //       }, 300)
        //     }else{
        //       this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
        //     }
        //   }).catch(err => {
        //     this.modal.hideLoading();
        //     this.modal.showToast('Gagal Menghapus Data ' + dataHapus, 'danger')
        //     console.log(err)
        //   })
        // }
      }
    })
  }

}
