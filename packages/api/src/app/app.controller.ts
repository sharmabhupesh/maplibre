import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Units } from '@turf/turf';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/getallcities')
  getAllCities() {
    return this.appService.getAllCities();
  }

  @Get('/findcity/:keyword')
  searchCities(@Param('keyword') keyword){
    return this.appService.searchCities(keyword);
  }

  @Get('/getdistancematrix')
  getDistanceMatrix(@Query('cities') cities: string,@Query('units') units: string){
    return this.appService.getDistanceMatrix(cities.split(','),units as Units);
  }

}
