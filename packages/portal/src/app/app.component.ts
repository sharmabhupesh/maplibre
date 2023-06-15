import { Component,OnInit } from '@angular/core';
import { AppService } from './app.service';
import { GeoJSONSource, Map, Marker } from 'maplibre-gl';
import { Units,lineString } from '@turf/turf';

export interface IWorldCity{
  name?:string;
  latitude?:number;
  longitude?:number;
}

export interface IUnits{
  unitSystem?:string;
  units?:Units[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{
  
  map:Map;

  cities:IWorldCity[] = [];
  selectedCities:IWorldCity[];

  searchCitiesList:IWorldCity[] = [];
  selectedSearchCity:IWorldCity;
  keyword:string = 'name';
  minQueryLength = 3;
  isLoading:boolean = false;
  searchLocationMarker:any;

  selectedUnitSystem:number = 1;

  selectedUnits:Units = 'kilometers';

  distanceUnits:IUnits[] = [
    {
      unitSystem:'imperial',
      units:["inches","feet","miles"]
    },
    {
      unitSystem:'imperial',
      units:["centimeters","meters","kilometers"]
    }
  ]

  linesGeojson:any;

  constructor(private appService:AppService){}

  ngOnInit(): void {
    //Get all cities from server
    this.appService.getAllCities().subscribe({
      next: (result) => {
        this.cities = result?.data?result.data:[];
      },
      error: (e: any) => {
        console.log('Error:',e);
      }
    });
  }

  /**
   * Fire event whenever user choose city from dropdown
   * @param item | Selected Item
   */
  onSeacrhInputSelectEvent(item:IWorldCity) {
    if(this.map){
      if(this.searchLocationMarker) this.searchLocationMarker.remove();
      this.searchLocationMarker = new Marker().setLngLat([item.longitude, item.latitude]).addTo(this.map);
      this.map.flyTo({
        center: [item.longitude,item.latitude],
        zoom: 14,
        essential:true
        });
    }
  }

  /**
   * Fire event whenever users type into search box
   * @param val | Changes Value
   */
  onChangeSearch(val: string) {
    this.isLoading = true;
    this.clearSearchMarker();
    this.appService.findCity(val).subscribe({
      next: (result) => {
        this.searchCitiesList = result?.data?result.data:[];
        this.isLoading = false;
      },
      error: (e: any) => {
        console.log('Error:',e);
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Fire event whenever input search box got focus
   * @param e | Event
   */
  onSearchInputFocused(e:any){
    this.searchCitiesList = [];
    this.selectedSearchCity = undefined;
  }

  /**
   * Fire event on input search box clear
   * @param e | Event
   */
  onSearchInputClear(e:any){
    this.searchCitiesList = [];
    this.selectedSearchCity = undefined;
    this.clearSearchMarker();
  }

  /**
   * Remove all map layers or source whenever remove or add new city
   */
  resetValues(){
    if(this.map.getLayer('distancebetweencities')){
      this.map.removeLayer('distancebetweencities');
    }
    if(this.map.getLayer('distancebetweencities-label')){
      this.map.removeLayer('distancebetweencities-label');
    }
    if(this.map.getSource('distancebetweencities')) this.map.removeSource('distancebetweencities')
    this.linesGeojson = undefined;
  }

  /**
   * On Imperial or metric radio button change
   * @param event | Value on radio change
   */
  onChangeRadioButtons(event:any){
    this.selectedUnits = event;
    this.changeSource();
  }

  /**
   * On Select Units
   */
  onSelectUnits(){
    this.changeSource();
  }

  /**
   * Change sourec whenever unit system or unit changed
   * it will work only if layer already exist on the map
   * @returns void
   */
  changeSource(){
    if(this.map && this.linesGeojson && this.map.getSource('distancebetweencities')){
      
      let _selectedCities = this.selectedCities.map((item) => {
        return item.name
      });

      try {
        this.appService.getDistanceMatrix(_selectedCities.join(','),this.selectedUnits).subscribe(
          {
            next: (result) => {
              this.linesGeojson = this.generateGeoJsonFromDistanceMatrix(result);
              if(this.linesGeojson && this.linesGeojson.features && this.linesGeojson.features.length>0){
                (this.map.getSource('distancebetweencities') as GeoJSONSource).setData(this.linesGeojson);
              }
              else{
                alert('Unable to change convert unit,Please try again');
                return;
              }
            },
            error: (e: any) => {
              console.log('Error:',e);
              alert('Unable to change convert unit,Please try again');
              return;
            }
          }
        );
      } catch (error) {
        alert('Unable to change convert unit,Please try again');
        return;
      }
    }
  }

  /**
   * Clear search marker from the map
   */
  clearSearchMarker(){
    if(this.map){
      if(this.searchLocationMarker) this.searchLocationMarker.remove();
    }
  }

  /**
   * Calculate Distance Between Selected Cities
   */
  calculateDistance(){
    if(!this.selectedCities){ 
      alert("Please select cities!!!") 
      return
    }

    if(this.selectedCities && this.selectedCities.length<2){
      alert("Please select at least 2 cities!!!") 
      return
    }

    let _selectedCities = this.selectedCities.map((item) => {
      return item.name
    });

    try {
      
      this.appService.getDistanceMatrix(_selectedCities.join(','),this.selectedUnits).subscribe(
        {
          next: (result) => {
            this.linesGeojson = this.generateGeoJsonFromDistanceMatrix(result);
            if(this.linesGeojson && this.linesGeojson.features && this.linesGeojson.features.length>0){
              if(this.map.getSource('distancebetweencities')) this.map.removeSource('distancebetweencities');        
              this.map.addSource('distancebetweencities', {
                type:'geojson',
                data:this.linesGeojson
              });
              if(this.map.getLayer('distancebetweencities')){
                this.map.removeLayer('distancebetweencities');
              }
              if(this.map.getLayer('distancebetweencities-label')){
                this.map.removeLayer('distancebetweencities-label');
              }

              this.map.addLayer({
                id:'distancebetweencities',
                source:'distancebetweencities',
                type:'line',
                layout:{
                  "line-cap":'round'
                },
                paint:{
                  'line-color': ['get','color'],
                  'line-width': 5
                }
              });

              this.map.addLayer({
                'id': 'distancebetweencities-label',
                'type': 'symbol',
                'source': 'distancebetweencities',
                'layout': {
                  'symbol-placement': 'line-center',
                  'text-field': `{distance}_{units}`
                },
                'paint':{
                  'text-color':'#0D1818',
                  'text-halo-color':'#33FFF0',
                  'text-halo-width':2
                }
              });
            }
            else{
              alert('Unable to calculate distance between selected cities,Please try again');
              return;
            }
          },
          error: (e: any) => {
            this.linesGeojson = undefined;
            console.log('Error:',e);
            alert('Unable to calculate distance between selected cities,Please try again');
            return;
          }
        }
      );

    } catch (error) {
      this.linesGeojson = undefined;
      alert('Unable to calculate distance between selected cities,Please try again');
      return;
    }

  }

  /**
   * Generate geojson from matrix data
   * @param data | Matrix Data
   * @returns | Geojson
   */
  generateGeoJsonFromDistanceMatrix(data:any){
    let geojson:any = {
      'type': 'FeatureCollection',
      'features':[]
    };
    try {
      const _citiesDistanceMatrix:any[] = data.distances?data.distances:[];
      if((_citiesDistanceMatrix.length == this.selectedCities.length)){
        _citiesDistanceMatrix.forEach((item:any[],index:number)=>{
          item.forEach((subItem,subIndex)=>{
            if(subIndex!=index){
              var _latlngs = [
                [this.selectedCities[index].longitude, this.selectedCities[index].latitude],
                [this.selectedCities[subIndex].longitude, this.selectedCities[subIndex].latitude]
              ];
              let randomColor = Math.floor(Math.random()*16777215).toString(16);
              let _lineString = lineString(_latlngs,{color:`#${randomColor}`,distance:subItem,from_city:this.selectedCities[index].name,to_city:this.selectedCities[subIndex].name,units:this.selectedUnits.toString()});
              geojson.features.push(_lineString);
            }
          });
        });
        return geojson;
      }
      else{
        return geojson;
      }

    } catch (error) {
      console.log('Error:',error);
     return geojson; 
    }
  }
}
