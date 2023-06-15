import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  
  /**
   * Base Url of api services
   */
  BASE_URI:string = 'http://localhost:3000/api/';

  constructor(private http: HttpClient) { }

  /**
   * Get all world cities list
   * @returns | ALl world cities
   */
  getAllCities():Observable<any>{
    return this.http.get(`${this.BASE_URI}getallcities`);
  }

  /**
   * Find the specific city
   * @param keyword | Keyword to search
   * @returns | List of all matched cities
   */
  findCity(keyword:string):Observable<any>{
    return this.http.get(`${this.BASE_URI}findcity/${keyword}`);
  }

  /**
   * Get distance matrix for selected cities
   * @param cities | Selected cities
   * @param units |Distance units
   * @returns | Distance matrix of all selected cities
   */
  getDistanceMatrix(cities:string,units:string):Observable<any>{
    let _url = `${this.BASE_URI}getdistancematrix`;
    let httpParams = new HttpParams()
                          .append('cities',cities)
                          .append('units',units);

    let httpOptions = {
      params:httpParams
    }
    return this.http.get(`${this.BASE_URI}getdistancematrix`,httpOptions);
  }

}
