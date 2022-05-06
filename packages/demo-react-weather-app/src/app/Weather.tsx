import React, { useState } from 'react';
import { Box, Tabs, Tab, Stack, Divider, Typography, TextField, Button } from '@mui/material';

// import {useBooleanFeatureFlag} from '../lib/feature-flags'

interface Weather {
  temp: number,
  conditions: string
}

const FAKE_WEATHER:Record<string,Weather> = {
  "San Francisco": {
    temp: 62,
    conditions: 'foggy',
  },
  "Boston": {
    temp: 33,
    conditions: 'clear',
  },
  "Seattle": {
    temp: 52,
    conditions: 'drizzle',
  },
}

export default function Weather() {
  const locationNames = Object.keys(FAKE_WEATHER)
  const [selectedLocation,setSelectedLocation] = useState(locationNames[0])

  const locationWeather = FAKE_WEATHER[selectedLocation]

  return (
    <Box sx={{
      my: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    }}>
      <LocationTabs locationNames={locationNames} selected={selectedLocation} onChange={setSelectedLocation}/>
      <WeatherDetails weather={locationWeather}/>
    </Box>
  )
}

type WeatherDetailsProps = {
  weather:Weather
}
function WeatherDetails({weather}:WeatherDetailsProps) {
  const includeConditions = true// useBooleanFeatureFlag('include-conditions-in-weather-display',false)
  return (
    <Box sx={{
      my: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    }}>
      <Typography alignSelf="center" variant="h1" component="h3">
        {weather.temp}&deg;F
      </Typography>
      {includeConditions && 
        <Typography alignSelf="center" variant="h4" component="h3">
          {weather.conditions}
        </Typography>
      }
    </Box>
  )
}

type LocationTabsProps = {
  locationNames:string[],
  selected:string,
  onChange:(v:string)=>void,
}
function LocationTabs({ locationNames, selected, onChange }:LocationTabsProps) {
  function handleChange(e:React.SyntheticEvent,value:any){
    onChange(value)
  }
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs centered value={selected} onChange={handleChange}>
        {locationNames.map((locationName)=>{
          return <Tab label={locationName} value={locationName} key={locationName} />
        })}
      </Tabs>
    </Box>
  )
}
