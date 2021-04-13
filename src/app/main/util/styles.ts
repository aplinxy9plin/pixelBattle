export class Styles{
  coloPickerStyle: string = "";
}

export class PickerData {
  r = 0;
  g = 0;
  b = 0;
  get(): string{
    return `${this.normalize(this.r)},${this.normalize(this.g)},${this.normalize(this.b)}`
  }
  private normalize(n: number): number{
    if(n< 0){
      return 0;
    }
    if (n > 255){
      return 255
    }
    return n
  }
}
