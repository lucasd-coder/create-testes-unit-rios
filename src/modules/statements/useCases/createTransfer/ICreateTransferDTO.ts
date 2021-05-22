import { Transfer } from "@modules/statements/entities/Transfer";

 export type ICreateTransferDTO =
  Pick<
  Transfer,
  'id' |
  'sender_id' |
  'description' |
  'amount'
>

