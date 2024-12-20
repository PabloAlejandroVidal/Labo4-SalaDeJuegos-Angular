export interface LoginData {
  user: string,
  loginDate: Date | null,
}
export const loginDataInit: LoginData = {
  user: '',
  loginDate: null
}
