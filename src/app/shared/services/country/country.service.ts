import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface Country {
  name: string;
  flag: string;
  continent: string;
  code: string
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private apiUrl = 'https://restcountries.com/v3.1/all';

  constructor(private http: HttpClient) {}

  getAllCountries(): Observable<Country[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((countries: any[]) => countries.map(country => ({
        name: country.translations.spa.common,
        flag: country.flags.png,
        continent: country.continents[0],
        code: country.cca3,
      })
    ))
    );
  }

  getShuffledCountries(quantity: number = 0): Observable<Country[]> {
    return this.getAllCountries().pipe(
      map((countries: Country[]) => {
        const maxQuantity = (quantity > countries.length || quantity <= 0) ? countries.length : quantity;
        const shorterCountriesArray = countries.slice(0, maxQuantity);
        return this.shuffleArray(shorterCountriesArray);
      })
    )
  }

  shuffleArray(array: Country[]): Country[] {
    return array.sort(() => Math.random() - 0.5);
  }

}
