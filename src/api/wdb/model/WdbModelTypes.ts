export enum WdbModelTypeEnum {
  PROJECT = 'project',
  DOM_DRIVER = 'dom-driver',
}

export type WdbModelType<Type extends WdbModelTypeEnum, T extends object> = {
  wdbType: Type;
} & T;

export type TagInfo = {
  type?: string;
  value: string;
};
