import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtro',
  standalone: true
})
export class FiltroPipe implements PipeTransform {

  transform(paises: any[], buscar: string): any[] {
    return paises.filter(pais => pais['nombre'].toLowerCase().includes(buscar.toLowerCase()));
  }

}
