/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { createSignatureShare } from '@ironfish/rust-nodejs'
import * as yup from 'yup'
import { AssertMultisigSigner } from '../../../../wallet'
import { ApiNamespace } from '../../namespaces'
import { routes } from '../../router'
import { AssertHasRpcContext } from '../../rpcContext'
import { getAccount } from '../utils'

export type CreateSignatureShareRequest = {
  account?: string
  signingPackage: string
}

export type CreateSignatureShareResponse = {
  signatureShare: string
}

export const CreateSignatureShareRequestSchema: yup.ObjectSchema<CreateSignatureShareRequest> =
  yup
    .object({
      account: yup.string().optional(),
      signingPackage: yup.string().defined(),
    })
    .defined()

export const CreateSignatureShareResponseSchema: yup.ObjectSchema<CreateSignatureShareResponse> =
  yup
    .object({
      signatureShare: yup.string().defined(),
    })
    .defined()

routes.register<typeof CreateSignatureShareRequestSchema, CreateSignatureShareResponse>(
  `${ApiNamespace.wallet}/multisig/createSignatureShare`,
  CreateSignatureShareRequestSchema,
  (request, node): void => {
    AssertHasRpcContext(request, node, 'wallet')

    const account = getAccount(node.wallet, request.data.account)
    AssertMultisigSigner(account)

    const signatureShare = createSignatureShare(
      account.multisigKeys.identity,
      account.multisigKeys.keyPackage,
      request.data.signingPackage,
    )

    request.end({ signatureShare })
  },
)
