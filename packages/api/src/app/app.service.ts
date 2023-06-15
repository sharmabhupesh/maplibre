import { Injectable } from '@nestjs/common';
import * as fs from "fs";
import * as path from "path";
import { parse } from 'csv-parse/sync';
import {Units, distance, point} from '@turf/turf';

export interface IWorldCity{
  name?:string;
  latitude?:number;
  longitude?:number;
}

@Injectable()
export class AppService {

  /**
   * Search specific city into cities list
   * @param keyword | Keyword to search into city names
   * @returns | All cities list starts with given keyword
   */
  searchCities(keyword:string):{message:string,data:IWorldCity[]}{
    const _allCities = this.parseAllCitiesFromCsv('assets/data/worldcities.csv');
    return {
      message:'Success',
      data:_allCities.filter((item) => item.name.toLowerCase().startsWith(keyword.toLowerCase()))
    }
  }

  /**
   * Get all world cities list
   * @returns All world cities list
   */
  getAllCities():{message:string,data:IWorldCity[]}{
    return {
      message:'Success',
      data:this.parseAllCitiesFromCsv('assets/data/worldcities.csv')
    }
  }

  /**
   * Get distance matrix for the selected cities
   * @param cities | Selected cities list
   */
  getDistanceMatrix(cities:string[],unit:Units){
    const _allCities = this.parseAllCitiesFromCsv('assets/data/worldcities.csv');
    const numCities = cities.length;
    const _citiesData = cities.map((item) => {
      const _cityIndex = _allCities.findIndex((x) => x.name.toLowerCase()==item.toLowerCase());
      if(_cityIndex>=0){
        return _allCities[_cityIndex];
      }
      else{
        return {}
      }
    })
    const _distances = [];
    for (let i = 0; i < numCities; i++) {
      _distances[i] = []
      _distances[i][i] = 0
    }
    for (let i = 0; i < numCities; i++) {
      for (let j = 0; j < i; j++) {
        const _fromCoord = point([_citiesData[i].longitude,_citiesData[i].longitude]);
        const _toCoord = point([_citiesData[j].longitude,_citiesData[j].longitude]);
        _distances[i][j] = parseFloat(distance(_fromCoord,_toCoord,{units:unit}).toFixed(3));
        _distances[j][i] = parseFloat(distance(_toCoord,_fromCoord,{units:unit}).toFixed(3));
      }
    }
    return {
      distances:_distances
    };
  }

  /**
   * Parse all cities list from csv file
   * @param filePath | Csv File Path
   * @returns | List of all world cities with coordinates
   */
  parseAllCitiesFromCsv(filePath:string):IWorldCity[]{
    try {
      const csvFilePath = path.resolve(__dirname,filePath);
      const csvContent = fs.readFileSync(csvFilePath,{encoding:'utf-8'});
      const records = parse(csvContent,{skip_empty_lines: true,columns:true});
      const _allCities:IWorldCity[] = records && records.length>0?records.map((item)=>{
        return {
          name:item.city,
          latitude:parseFloat(item.lat),
          longitude:parseFloat(item.lng)
        } as IWorldCity
      }):[];
      return _allCities;  
    } catch (error) {
      console.log('Error:',error);
      return [];
    }
    
  }
}
