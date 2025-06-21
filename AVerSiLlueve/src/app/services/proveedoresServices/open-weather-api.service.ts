// src/app/services/weather/open-weather-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Importamos environment para la API Key

@Injectable({
  providedIn: 'root'
})
export class OpenWeatherApiService {

  private apiKey: string = environment.openWeatherApiKey; // Tu clave API
  
  // URLs base para los diferentes endpoints de OpenWeatherMap
  private baseUrlWeather: string = 'https://api.openweathermap.org/data/2.5/weather'; // Clima actual
  private baseUrlForecast: string = 'https://api.openweathermap.org/data/2.5/forecast'; // Pronóstico de 5 días / 3 horas
  private baseUrlGeocoding: string = 'http://api.openweathermap.org/geo/1.0/direct'; // Geocoding

  constructor(private http: HttpClient) {
    console.log('OpenWeatherApiService inicializado correctamente.');
  }

  /**
   * Obtiene el clima actual por latitud y longitud.
   * @param lat Latitud.
   * @param lon Longitud.
   * @returns Un Observable con los datos del clima actual.
   */
  getCurrentWeatherByCoords(lat: number, lon: number): Observable<any> {
    const url = `${this.baseUrlWeather}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&lang=es&units=metric`;
    return this.http.get(url);
  }

  /**
   * Obtiene el clima actual por nombre de ciudad.
   * @param city Nombre de la ciudad.
   * @returns Un Observable con los datos del clima actual.
   */
  getCurrentWeatherByCity(city: string): Observable<any> {
    const url = `${this.baseUrlWeather}?q=${city}&appid=${this.apiKey}&lang=es&units=metric`;
    return this.http.get(url);
  }

  /**
   * Obtiene el pronóstico de 5 días / 3 horas por nombre de ciudad.
   * @param city Nombre de la ciudad.
   * @returns Un Observable con los datos del pronóstico.
   */
  getForecastByCity(city: string): Observable<any> {
    const url = `${this.baseUrlForecast}?q=${city}&appid=${this.apiKey}&lang=es&units=metric`;
    return this.http.get(url);
  }

  /**
   * Obtiene coordenadas (lat/lon) a partir de un nombre de ciudad, código de estado y código de país.
   * @param cityName Nombre de la ciudad.
   * @param stateCode Código de estado (opcional).
   * @param countryCode Código de país (opcional).
   * @param limit Número máximo de resultados (por defecto 1).
   * @returns Un Observable con un array de resultados de geocoding.
   */
  getCoordinatesByCityStateCountry(
    cityName: string,
    stateCode: string = '', 
    countryCode: string = '', 
    limit: number = 1
  ): Observable<any> {
    let query = cityName;
    if (stateCode) query += `,${stateCode}`;
    if (countryCode) query += `,${countryCode}`;

    const url = `${this.baseUrlGeocoding}?q=${query}&limit=${limit}&appid=${this.apiKey}`;
    return this.http.get(url);
  }

  /**
   * (Opcional) Obtiene el pronóstico de 5 días / 3 horas por latitud y longitud.
   * Usar getForecastByCity es generalmente preferible si ya tienes el nombre de la ciudad.
   * @param lat Latitud.
   * @param lon Longitud.
   * @returns Un Observable con los datos del pronóstico.
   */
  getForecastByCoords(lat: string, lon: string): Observable<any> {
    const url = `${this.baseUrlForecast}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&lang=es&units=metric`;
    return this.http.get(url);
  }
}