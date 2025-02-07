/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { generateKey, splitSecret } from '@ironfish/rust-nodejs'
import * as yup from 'yup'
import { ApiNamespace } from '../../namespaces'
import { routes } from '../../router'

export type CreateTrustedDealerKeyPackageRequest = {
  minSigners: number
  participants: Array<{
    identity: string
  }>
}
export type CreateTrustedDealerKeyPackageResponse = {
  verifyingKey: string
  proofAuthorizingKey: string
  viewKey: string
  incomingViewKey: string
  outgoingViewKey: string
  publicAddress: string
  keyPackages: Array<{ identity: string; keyPackage: string }>
  publicKeyPackage: string
}
export const CreateTrustedDealerKeyPackageRequestSchema: yup.ObjectSchema<CreateTrustedDealerKeyPackageRequest> =
  yup
    .object({
      minSigners: yup.number().defined(),
      participants: yup
        .array()
        .of(
          yup
            .object({
              identity: yup.string().defined(),
            })
            .defined(),
        )
        .defined(),
    })
    .defined()

export const CreateTrustedDealerKeyPackageResponseSchema: yup.ObjectSchema<CreateTrustedDealerKeyPackageResponse> =
  yup
    .object({
      verifyingKey: yup.string().defined(),
      proofAuthorizingKey: yup.string().defined(),
      viewKey: yup.string().defined(),
      incomingViewKey: yup.string().defined(),
      outgoingViewKey: yup.string().defined(),
      publicAddress: yup.string().defined(),
      keyPackages: yup
        .array(
          yup
            .object({
              identity: yup.string().defined(),
              keyPackage: yup.string().defined(),
            })
            .defined(),
        )
        .defined(),
      publicKeyPackage: yup.string().defined(),
    })
    .defined()

routes.register<
  typeof CreateTrustedDealerKeyPackageRequestSchema,
  CreateTrustedDealerKeyPackageResponse
>(
  `${ApiNamespace.wallet}/multisig/createTrustedDealerKeyPackage`,
  CreateTrustedDealerKeyPackageRequestSchema,
  (request, _context): void => {
    const key = generateKey()
    const { minSigners, participants } = request.data
    const identities = participants.map((p) => p.identity)
    const trustedDealerPackage = splitSecret(key.spendingKey, minSigners, identities)

    request.end(trustedDealerPackage)
  },
)
