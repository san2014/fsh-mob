
import { NavController, IonicPage } from 'ionic-angular';
import { Component} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

import { LoginProvider } from './../../providers/login/login.provider';
import { UserProvider } from './../../providers/user/user.provider';
import { FshUtils } from './../../utils/fsh-util';
import { CepProvider } from './../../providers/cep/cep.provider';

import { UsuarioModel } from './../../model/usuario-model';

@IonicPage()
@Component({
  selector: 'page-user-register',
  templateUrl: 'user-register.html',
})
export class UserRegister {

  usuario: UsuarioModel;

  tipoUsuario: string;

  formUser: FormGroup;

  constructor(
    private navCtrl: NavController,
    private fb: FormBuilder,
    private userProvider: UserProvider,
    private loginProvider: LoginProvider,
    private fshUtils: FshUtils,
    private cepProvider: CepProvider) {

      this.initialize();

  }

  initialize() {

    this.formUser = this.fb.group({
      'cpf': ['', Validators.required],
      'rg': ['', Validators.required],
      'nome': ['',Validators.required],
      'sexo': ['',Validators.required],
      'senha': ['',Validators.compose
        (
          [
            Validators.required, 
            Validators.minLength(6),
            Validators.maxLength(8)
          ]
        )
      ],
      'email': ['',Validators.compose([Validators.required, Validators.email])],
      'dt_nasc': ['',Validators.required],
      'cep': ['',Validators.compose
        (
          [
            Validators.required,
            Validators.pattern(/[0-9]{8}/)
          ]
        )
      ],
      'logradouro': ['',Validators.required],
      'bairro': ['',Validators.required],
      'numero_local': ['',Validators.required],
      'flag_ativo' : ['']
    });

    this.usuario = new UsuarioModel();

    this.usuario.flag_ativo = true;
    
    this.getUsuarioLogado();

  }

  async getUsuarioLogado(){
    this.usuario = await this.loginProvider.getUsuarioLogado();
    if (this.usuario == null){
      this.usuario = new UsuarioModel();
    }
  } 

  aplicaCssErro(campo: string) {
    return {
      'box-register-error': this.hasError(campo),
      'box-register': this.hasSuccess(campo) || this.notUsed(campo)
    };
  }  

  notUsed(campo){
    return this.formUser.get(campo).pristine;
  }

  hasSuccess(campo): boolean{
     return this.formUser.get(campo).valid;
   }  
  
  hasError(campo): boolean{
    return (
      !this.formUser.get(campo).valid &&
      (this.formUser.get(campo).touched || this.formUser.get(campo).dirty)
    );
  }

  getAddresByCep(){

    let cep = this.formUser.get('cep');

    if (!cep.valid){
      return false;
    }    

    this.fshUtils.showLoading('obtendo informações....');

    this.cepProvider.getAddressByCep(cep.value)
      .then((address) =>{
        this.fshUtils.hideLoading();
        this.usuario.logradouro = address.logradouro;
        this.usuario.bairro = address.bairro;
      })
      .catch((erro) => {
        this.fshUtils.hideLoading();
        this.fshUtils.showAlert('Desculpe', 'Ocorreu um erro ao obter informações do CEP informado.');
      });

  }

  incluir(){

    this.formUser.value.flag_ativo = "1";

    this.fshUtils.showLoading('aguarde...');
    
    this.userProvider.postData(this.formUser.value)
      .then((res) => {

        this.fshUtils.hideLoading();
        
        this.navCtrl.push('WelcomePage',{'usuarioModel': this.usuario})

      })
      .catch((error) => {

        this.fshUtils.hideLoading();
        
        const titulo = 'Desculpe';
        
        const msg = `Ocorreu um erro ao registrar as informações. \n Tente novamente mais tarde....` ;
        
        this.fshUtils.showAlert(titulo, msg);  

      });

  }

}
