import { TipoAtendimentoModel } from './tipoatendimento-model';

import { UsuarioModel } from "./usuario-model";

export class ProfissionalModel extends UsuarioModel {
    
    id: number;

    usuario: UsuarioModel;

    credenciamento: string;

    vencimento: string;

    conta: string;

    agencia: string;

    banco: string;

    especialidades: TipoAtendimentoModel[];

    flagDisponivel: number;

}