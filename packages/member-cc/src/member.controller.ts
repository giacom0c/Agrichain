import * as yup from 'yup';

import {
  Controller,
  ConvectorController,
  Invokable,
  Param,
  BaseStorage
} from '@worldsibu/convector-core';

import { Member } from './member.model';
import { ClientIdentity } from 'fabric-shim';

@Controller('member')
export class MemberController extends ConvectorController {
  get fullIdentity(): ClientIdentity {
    const stub = (BaseStorage.current as any).stubHelper;
    return new ClientIdentity(stub.getStub());
  };

  @Invokable()
  public async register(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    name: string,
  ) {
    // Controllo esistenza
    const existing = await Member.getOne(id);

    if (!existing || !existing.id) {
      let member = new Member();
      member.id = id;
      member.name = name || id;
      member.msp = this.fullIdentity.getMSPID();
      // Creazione di una nuova identità
      member.identities = [{
        fingerprint: this.sender,
        status: true
      }];
      await member.save();
    } else {
      throw new Error('Identity exists already, please call changeIdentity fn for updates');
    }
  }
  @Invokable()
  public async changeIdentity(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    newIdentity: string
  ) {
    // Controllo dei permessi
    let isAdmin = this.fullIdentity.getAttributeValue('admin');
    let requesterMSP = this.fullIdentity.getMSPID();

    // Richiamo il controllo esistenza
    const existing = await Member.getOne(id);
    if (!existing || !existing.id) {
      throw new Error('No identity exists with that ID');
    }

    if (existing.msp != requesterMSP) {
      throw new Error('Unathorized. MSPs do not match');
    }

    if (!isAdmin) {
      throw new Error('Unathorized. Requester identity is not an admin');
    }

    // Disabilitazione identità precedenti
    existing.identities = existing.identities.map(identity => {
      identity.status = false;
      return identity;
    });

    // Imposto l'identità aggiunta
    existing.identities.push({
      fingerprint: newIdentity,
      status: true
    });
    await existing.save();
  }
  @Invokable()
  public async get(
    @Param(yup.string())
    id: string
  ) {
    const existing = await Member.getOne(id);
    if (!existing || !existing.id) {
      throw new Error(`No identity exists with that ID ${id}`);
    }
    return existing;
  }
}
