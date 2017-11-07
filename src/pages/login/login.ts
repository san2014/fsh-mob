import { Subscription } from 'rxjs/Subscription';
import { UserProvider } from './../../providers/user/user.provider';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage, LoadingController, Loading } from "ionic-angular";
import { Storage } from '@ionic/storage';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';

import { LoginModel } from './../../model/login.model';
import { UsuarioModel } from './../../model/usuario-model';
import { LoginProvider } from "../../providers/login/login.provider";

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class Login {

  loginModel: LoginModel;
  
  usuarioModel: UsuarioModel;

  formLogin: FormGroup;

  msgError: string[];

  postUser: Subscription;

  loading: Loading;

  constructor(
    public navCtrl: NavController,
    private fb: FormBuilder,
    private loginProvider: LoginProvider,
    private userProvider: UserProvider,
    private storage: Storage,
    public navParams: NavParams,
    public facebook: Facebook,
    private googlePlus: GooglePlus,
    private loadingCtrl: LoadingController,
  ) {

      this.initialize();

  }

  initialize() {

    this.formLogin = this.fb.group(
      {
        'usuario': ['', Validators.required],
        'senha': ['',Validators.required]
      }); 
      
    this.msgError = [];

    this.loginModel = new LoginModel();

    this.usuarioModel = new UsuarioModel();

  }

  pushErroLogin(){

    this.msgError.push('Usuário ou senha inválidos');

  }

  async logar(){

    this.msgError = [];

    let erro: boolean = true;

    await this.loginProvider.login(this.loginModel)
      .then(data => {

        if (data !== null){
          this.usuarioModel = data;
          erro = false;
        }
        
      })

      if (!erro){
        
        await this.storage.set('usuarioLogado', this.usuarioModel)
          .then(() => {
          
            this.navCtrl
              .push('HometabPage',{'usuarioModel': this.usuarioModel}),
              error => (erro = true)
          }) 

      }

      if (erro){
        this.pushErroLogin();
      }

  }

  ionViewWillEnter(){

    if (this.usuarioModel.id != undefined){
      this.navCtrl.push('HometabPage',{'usuarioModel': this.usuarioModel})
    }

  }

  ionViewDidLeave(){

    if (this.postUser != undefined){
      this.postUser.unsubscribe();
    }

  }

  showLoading(msg: string){
    
    this.loading = this.loadingCtrl.create({
      content: msg
    });

    this.loading.present();     

  }

  hideLoading(){
    this.loading.dismiss();
  }

  async importExternalUser(usuario: UsuarioModel){

    if (usuario != null){

      this.postUser = await this.userProvider
        .postData(JSON.stringify(usuario))
          .subscribe(
            data =>{
              this.usuarioModel = data;
            },
            error => (this.usuarioModel = null)
        );

    }

  }

  async setUserSession(usuario: UsuarioModel){

    if (usuario != null){

      this.storage.set('usuarioLogado', usuario)
        .then(() =>{
          this.navCtrl.push('HometabPage',{'usuarioModel': usuario})}
        ).catch((erro) => {
          this.usuarioModel = null;
        });

    }

  }

  loginFace(){
    this.facebook.login(['public_profile', 'user_friends', 'email'])
      .then((res: FacebookLoginResponse) => {
        this.setUserFace(res.authResponse.userID);
      })
      .catch(e => this.msgError.push('Ocorreu um erro na operação'));     
  }

  async setUserFace(userid) {
    this.facebook.api("/"+userid+"/?fields=id,email,name,picture,birthday",["public_profile"])
      .then(profile => {

        this.userProvider.getUserByEmail(profile.email);

        if (this.usuarioModel == null){

          this.usuarioModel = new UsuarioModel();
          this.usuarioModel.nome = profile.name;
          this.usuarioModel.email = profile.email;
          this.usuarioModel.dtNasc = profile.birthday;
          this.usuarioModel.imgPerfil = profile.picture.data.url;
          this.usuarioModel.facebookId = userid;

          this.showLoading('aguarde...');

          this.importExternalUser(this.usuarioModel);

          this.setUserSession(this.usuarioModel);

          this.hideLoading();

          if (this.usuarioModel == null){
            this.msgError.push('Ocorreu um erro na operação');
          }

        }else{
          
          this.setUserSession(this.usuarioModel);

        }

      })
     
  }  

  getDataGoogle(){
    return new Promise((resolve, reject) => { 
      this.googlePlus.login({})
        .then(res => {
   
          resolve(res);
        })
        .catch(() => {
          resolve(null)
        });
    })
  }

  async loginGoogle(){

    const userGoogle: any = await this.getDataGoogle();

    //alert('get daddos google...');

    const userFind = await this.userProvider.getUserByEmail(this.usuarioModel.email);

    alert(userFind);
    
    if (userFind == null){

      this.usuarioModel = new UsuarioModel();
      this.usuarioModel.nome = userGoogle.displayName;
      this.usuarioModel.email = userGoogle.email;
      this.usuarioModel.imgPerfil = userGoogle.imageUrl;  
      this.usuarioModel.tipo = 1;      

      this.showLoading('aguarde...');

      await this.importExternalUser(this.usuarioModel);

      await this.setUserSession(this.usuarioModel);

      this.hideLoading();

      if (this.usuarioModel == null){
        this.msgError.push('Ocorreu um erro na operação');
      }        

    }else{
      //this.setUserSession(this.usuarioModel);
      alert(this.usuarioModel);

    }    

/*     this.googlePlus.login({})
    .then(res => {

      this.getUserByEmail(res.email);

      if (this.usuarioModel == null){

        this.usuarioModel = new UsuarioModel();
        this.usuarioModel.nome = res.displayName;
        this.usuarioModel.email = res.email;
        this.usuarioModel.imgPerfil = res.imageUrl;  
        
        this.showLoading('aguarde...');

        this.importExternalUser(this.usuarioModel);

        this.setUserSession(this.usuarioModel);

        this.hideLoading();

        if (this.usuarioModel == null){
          this.msgError.push('Ocorreu um erro na operação');
        }        

      }else{
        
        //this.setUserSession(this.usuarioModel);
        alert(this.usuarioModel);

      }

    })
    .catch(err => this.msgError.push('Ocorreu um erro na operação')); */

  }

}
