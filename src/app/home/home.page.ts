import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AvatarService } from '../services/avatar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  profile: any = null;

  form!: FormGroup
  constructor(
    private fb: FormBuilder,
    private avatarService: AvatarService,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {

    this.avatarService.getUserProfile().subscribe((data) => {
      this.profile = data;
      console.log(this.profile.name)
      this.form = this.fb.group({
        name: [this.profile.name, [Validators.required]],
      });
    });
  }
  ngOnInit() {


  }
  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  async changeImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos // Camera, Photos or Prompt!
    });

    if (image) {
      const loading = await this.loadingController.create();
      await loading.present();

      const result = await this.avatarService.uploadImage(image, this.profile.name);
      loading.dismiss();

      if (!result) {
        const alert = await this.alertController.create({
          header: 'Upload failed',
          message: 'There was a problem uploading your avatar.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  async save() {
    console.log("salvando profile")
    console.log("name:", this.form.value.name)
    this.profile.name = this.form.value.name
    const loading = await this.loadingController.create();
    await loading.present();
    const result = await this.avatarService.saveProfile(this.profile);
    loading.dismiss();

    if (!result) {
      const alert = await this.alertController.create({
        header: 'Upload failed',
        message: 'There was a problem uploading your avatar.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}