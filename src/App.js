import React, { useEffect, useState } from 'react'
import './App.css';
// import {MenuItem,FormControl,Select} from "@mui/material"
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InfoBox from './InfoBox';
import Map from './Map';
import { Card, CardContent } from '@mui/material';
import Table from './Table'
import LineGraph from './LineGraph'
import { sortData , prettyPrintStat } from './util';
import "leaflet/dist/leaflet.css";
import numeral from "numeral";




function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([]);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);



  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response) => response.json())
    .then((data) => {
      setCountryInfo(data);
    })
  },[])






  useEffect(() =>{
      const getCountriesData = async() =>{
        let data = await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
        const countries = data.map((country)=>({
          name:country.country, // United States, United Kingdom
          value:country.countryInfo.iso2 // Uk, USA, FR
        }))




          const sortedData = sortData(data)

        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries)
      })}


      getCountriesData();
  },[])


const onCountryChange = async (event) =>{
  const countryCode = event.target.value;


  



  const url = countryCode === "worldwide" ? "https://disease.sh/v3/covid-19/countries" : `https://disease.sh/v3/covid-19/countries/${countryCode}`

  await fetch(url)
  .then((response) => response.json())
  .then(data => {
    setCountry(countryCode)
      setCountryInfo(data);


      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
  })
}

console.log("COUNTRY INFO >>>", countryInfo)


  return (
    <div className="app">

      <div className = "app__left">
      <div className = 'app__header'>
      <h1>Covid19 tracker</h1>
      <FormControl className = "app_dropdown">

    <Select variant = "outlined" onChange = {onCountryChange} value = {country}>

    
    <MenuItem value = "worldwide" >WorldWide</MenuItem>
      {countries.map((country) =>(
        <MenuItem value = {country.value} >{country.name}</MenuItem>
        ))}

    

    </Select>

      </FormControl>
      </div>

      <div className='app__stats'>
      <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
      </div>
      
      <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />


        </div>


        <Card className = 'app__right'>
        <CardContent>
          <h3>Live Cases by Country </h3>
          <Table countries = {tableData}/>
          <h3>Worldwide New {casesType} </h3>
          <LineGraph casesType='casesType'/>
        </CardContent>

        </Card>
    </div>
  );
}

export default App;
