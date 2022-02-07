export interface IDepositInfo {
  name: string,
  index: number,
  address: string,
  count: number,
  sum: number,
  userDetail: Array<IUserDetail>
}

interface IUserDetail {
  name: string,
  index: number
}

export interface IWithoutReference {
  count: number,
  sum: number,
}
