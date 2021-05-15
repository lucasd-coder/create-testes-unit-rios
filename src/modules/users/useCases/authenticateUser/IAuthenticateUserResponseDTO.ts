import { User } from "@modules/users/entities/User";

export interface IAuthenticateUserResponseDTO {
  token: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
}
