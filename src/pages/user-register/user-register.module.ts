import { TipoAtendimentoProvider } from './../../providers/tipo-atendimento/tipo-atendimento.provider';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { BrMaskerModule } from 'brmasker-ionic-3';

import { UserRegister } from './user-register';
import { SharedModule } from '../../shared/shared.module';
import { UserProvider } from '../../providers/user/user.provider';
import { FshUtils } from '../../utils/fsh-util';
import { CepProvider } from '../../providers/cep/cep.provider';

@NgModule({
  declarations: [
    UserRegister
  ],
  imports: [
    IonicPageModule.forChild(UserRegister),
    SharedModule,
    BrMaskerModule
  ],
  providers: [
    UserProvider,
    FshUtils,
    CepProvider,
    TipoAtendimentoProvider
  ]
})
export class UserRegisterModule {}
