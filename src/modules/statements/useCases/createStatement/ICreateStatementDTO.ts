import { Statement } from "@modules/statements/entities/Statement";

export type ICreateStatementDTO =
Pick<
  Statement,
  'user_id' |
  'description' |
  'amount' |
  'type'
>
