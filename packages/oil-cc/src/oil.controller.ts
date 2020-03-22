import * as yup from 'yup';
import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from '@worldsibu/convector-core';
import { Member } from 'member-cc';

import { Oil, Attribute } from './oil.model';

@Controller('oil')
export class OilController extends ConvectorController<ChaincodeTx> {
  @Invokable()
  public async create(
    @Param(Oil)
    oil: Oil
  ) {
    let exists = await Oil.getOne(oil.id);
    if (!!exists && exists.id) {
      throw new Error('There is a oil registered with that Id already');
    }
    let gov = await Member.getOne('gov');

    if (!gov || !gov.identities) {
      throw new Error('No government identity has been registered yet');
    }
    const govActiveIdentity = gov.identities.filter(identity => identity.status === true)[0];

    if (this.sender !== govActiveIdentity.fingerprint) {
      throw new Error(`Just the government - ID=gov - can create people - requesting organization was ${this.sender}`);
    }

    await oil.save();
  }
  @Invokable()
  public async addAttribute(
    @Param(yup.string())
    oilId: string,
    @Param(Attribute.schema())
    attribute: Attribute
  ) {
    // Check if the "stated" member as certifier of the attribute is actually the one making the request
    let member = await Member.getOne(attribute.certifierID);

    if (!member || !member.identities) {
      throw new Error(`No member found with id ${attribute.certifierID}`);
    }

    const memberActiveIdentity = member.identities.filter(
      identity => identity.status === true)[0];

    if (this.sender !== memberActiveIdentity.fingerprint) {
      throw new Error(`Requester identity cannot sign with the current certificate ${this.sender}. This means that the user requesting the tx and the user set in the param certifierId do not match`);
    }

    let oil = await Oil.getOne(oilId);

    if (!oil || !oil.id) {
      throw new Error(`No oil found with id ${oilId}`);
    }

    if (!oil.attributes) {
      oil.attributes = [];
    }

    let exists = oil.attributes.find(attr => attr.id === attribute.id);

    if (!!exists) {
      let attributeOwner = await Member.getOne(exists.certifierID);
      let attributeOwnerActiveIdentity = attributeOwner.identities.filter(
        identity => identity.status === true)[0];

      // Already has one, let's see if the requester has permissions to update it
      if (this.sender !== attributeOwnerActiveIdentity.fingerprint) {
        throw new Error(`User already has an attribute for ${attribute.id} but current identity cannot update it`);
      }
      // update as is the right attribute certifier
      attribute = exists;
    } else {
      oil.attributes.push(attribute);
    }

    await oil.save();
  }

  @Invokable()
  public async get(
    @Param(yup.string())
    id: string
  ) {
    const existing = await Oil.getOne(id);
    if (!existing || !existing.id) {
      throw new Error(`No oil exists with that ID ${id}`);
    }
    return existing;
  }
}
