import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, forwardRef, Input, NgModule, OnInit } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CountryService } from 'app/shared/services/country/country.service';
import { FiltroPipe } from './filtro.pipe';

@Component({
  selector: 'app-selector-pais',
  standalone: true,
  imports: [CommonModule, FormsModule, FiltroPipe],
  templateUrl: './selector-pais.component.html',
  styleUrl: './selector-pais.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorPaisComponent),
      multi: true,
    },
  ]
})
export class SelectorPaisComponent implements OnInit, ControlValueAccessor {
  paises: { nombre: string; codigo: string; url: string }[] = [];
  selectedCountry: string | null = null;
  @Input() continentes: string[] = [];
  busqueda: string | null = null;

  onChange = (codigo: string) => {};
  onTouched = () => {};

  constructor(private paisService: CountryService) {}

  ngOnInit() {
    this.paisService.getAllCountries().subscribe((paises) => {
      if (this.continentes.length === 0) {
        paises.forEach((pais)=>{
          console.log(pais.continent)
          this.paises.push({nombre: pais.name, codigo: pais.code, url: pais.flag})
        })
      }
      else{
        paises.forEach((pais)=>{
          if (this.continentes.includes(pais.continent)) {
            this.paises.push({nombre: pais.name, codigo: pais.code, url: pais.flag})
          }
        })
      }
    });
  }

  writeValue(codigo: string): void {
    this.selectedCountry = codigo;
    this.selectedCountry = null;
  }

  registerOnChange(fn: (codigo: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
  }

  seleccionarPais(name: any) {
    console.log(name)
    this.selectedCountry = name;
    this.onChange(name);
    this.onTouched();
  }
}
